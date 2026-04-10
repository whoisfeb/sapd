exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405 };
  
  const WEBHOOK_URL = process.env.WARNING_WEBHOOK;
  const MESSAGE_ID = process.env.WARNING_MESSAGE_ID; // ID pesan yang akan diedit
  const body = JSON.parse(event.body);

  try {
    // 1. Kirim Log Peringatan (Pesan Baru)
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body.payload)
    });

    // 2. Jika ada data untuk update daftar (Total Warning List)
    if (body.updateList) {
        // Kita gunakan PATCH untuk mengedit pesan yang sudah ada
        // Catatan: Webhook hanya bisa edit pesan yang dibuat oleh dirinya sendiri
        await fetch(`${WEBHOOK_URL}/messages/${MESSAGE_ID}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: body.updateList })
        });
    }

    return { statusCode: 200, body: JSON.stringify({ status: "Success" }) };
  } catch (err) {
    return { statusCode: 500, body: err.toString() };
  }
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405 };
  
  const WEBHOOK_URL = process.env.WARNING_WEBHOOK;
  const MESSAGE_ID = process.env.WARNING_MESSAGE_ID; 
  const body = JSON.parse(event.body);

  try {
    // 1. KIRIM LOG KE CHANNEL SUSPEND-DISCHARGE (Pesan Baru)
    // Ini untuk mencatat riwayat siapa yang kena SP
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body.payload)
    });

    // 2. UPDATE/KIRIM DAFTAR KE CHANNEL TOTAL-WARNINGS
    if (body.updateList) {
        let response;
        
        // JIKA MESSAGE_ID SUDAH ADA -> EDIT PESAN LAMA
        if (MESSAGE_ID && MESSAGE_ID.trim() !== "") {
            response = await fetch(`${WEBHOOK_URL}/messages/${MESSAGE_ID}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: body.updateList })
            });
        } 
        
        // JIKA MESSAGE_ID KOSONG ATAU EDIT GAGAL (Pesan dihapus) -> KIRIM PESAN BARU
        if (!MESSAGE_ID || !response.ok) {
            await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: body.updateList })
            });
        }
    }

    return { 
        statusCode: 200, 
        body: JSON.stringify({ message: "Berhasil dikirim!" }) 
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405 };
  
  // Ambil dua URL Webhook yang berbeda dari Netlify
  const LOG_WEBHOOK = process.env.WARNING_WEBHOOK;       // Untuk channel Warning Log
  const TOTAL_WEBHOOK = process.env.TOTAL_WARNING_WEBHOOK; // Untuk channel Total Warning
  const MESSAGE_ID = process.env.WARNING_MESSAGE_ID; 
  
  const body = JSON.parse(event.body);

  try {
    // 1. Kirim Log Warning ke channel Warning (Log)
    await fetch(LOG_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body.payload)
    });

    // 2. Update atau Kirim Daftar ke channel Total Warning
    if (body.updateList) {
        let response;
        
        // Coba Edit jika MESSAGE_ID ada
        if (MESSAGE_ID && MESSAGE_ID.trim() !== "") {
            response = await fetch(`${TOTAL_WEBHOOK}/messages/${MESSAGE_ID}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: body.updateList })
            });
        } 
        
        // Jika belum ada ID atau Edit gagal, kirim pesan baru ke channel Total Warning
        if (!MESSAGE_ID || (response && !response.ok)) {
            const newRes = await fetch(`${TOTAL_WEBHOOK}?wait=true`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: body.updateList })
            });
            
            // Opsional: Log pesan ini di Netlify console untuk ambil ID secara manual jika perlu
            const data = await newRes.json();
            console.log("Pesan baru terkirim, ID-nya adalah:", data.id);
        }
    }

    return { statusCode: 200, body: JSON.stringify({ message: "Berhasil dipisah!" }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};

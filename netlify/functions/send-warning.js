exports.handler = async (event) => {
  // Hanya izinkan metode POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  
  // Ambil variabel environment
  const LOG_WEBHOOK = process.env.WARNING_WEBHOOK;
  const TOTAL_WEBHOOK = process.env.TOTAL_WARNING_WEBHOOK;
  const MESSAGE_ID = process.env.WARNING_MESSAGE_ID; 
  
  // Pastikan URL Webhook tersedia
  if (!LOG_WEBHOOK || !TOTAL_WEBHOOK) {
    console.error("Konfigurasi Webhook hilang di Netlify!");
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "Webhook URL belum diatur di Netlify Environment Variables." }) 
    };
  }

  const body = JSON.parse(event.body);

  try {
    // 1. Kirim Log ke Channel Warning
    const logRes = await fetch(LOG_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body.payload)
    });

    if (!logRes.ok) throw new Error(`Log Webhook gagal: ${logRes.statusText}`);

    // 2. Update/Kirim Daftar ke Channel Total Warning
    if (body.updateList) {
        let updateRes;
        
        // Coba edit jika ID ada
        if (MESSAGE_ID && MESSAGE_ID.trim() !== "") {
            updateRes = await fetch(`${TOTAL_WEBHOOK}/messages/${MESSAGE_ID}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: body.updateList })
            });
        } 
        
        // Jika ID kosong atau pesan lama sudah dihapus (404), kirim pesan baru
        if (!MESSAGE_ID || (updateRes && !updateRes.ok)) {
            await fetch(TOTAL_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: body.updateList })
            });
        }
    }

    return { 
      statusCode: 200, 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true }) 
    };

  } catch (err) {
    console.error("Detail Error:", err.message);
    return { 
      statusCode: 500, 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message }) 
    };
  }
};

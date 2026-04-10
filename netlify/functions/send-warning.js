// HAPUS baris require('node-fetch') di paling atas

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405 };
  
  // Mengambil variable dari Netlify Environment
  const WEBHOOK_URL = process.env.WARNING_WEBHOOK;
  const MESSAGE_ID = process.env.WARNING_MESSAGE_ID; 
  const body = JSON.parse(event.body);

  try {
    // 1. Kirim Log Warning (Pesan Baru)
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body.payload)
    });

    // 2. Update Daftar Total (Edit Pesan yang sudah ada)
    if (body.updateList && MESSAGE_ID) {
        // Format URL untuk edit pesan: [WEBHOOK_URL]/messages/[MESSAGE_ID]
        const editUrl = `${WEBHOOK_URL}/messages/${MESSAGE_ID}`;
        
        await fetch(editUrl, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                content: body.updateList 
            })
        });
    }

    return { 
        statusCode: 200, 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Berhasil update Discord!" }) 
    };
  } catch (err) {
    console.error("Error Webhook:", err);
    return { 
        statusCode: 500, 
        body: JSON.stringify({ error: err.message }) 
    };
  }
};

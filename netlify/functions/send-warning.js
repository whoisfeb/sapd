const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405 };
  
  const WEBHOOK_URL = process.env.WARNING_WEBHOOK;
  const MESSAGE_ID = process.env.WARNING_MESSAGE_ID; 
  const body = JSON.parse(event.body);

  try {
    // 1. Kirim Log (Pesan Baru di channel log)
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body.payload)
    });

    // 2. Update Daftar (Edit Pesan di channel total-warning)
    if (body.updateList && MESSAGE_ID) {
        // URL khusus untuk EDIT pesan: [WEBHOOK_URL]/messages/[MESSAGE_ID]
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
        body: JSON.stringify({ message: "Semua terupdate!" }) 
    };
  } catch (err) {
    return { statusCode: 500, body: err.toString() };
  }
};

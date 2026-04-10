exports.handler = async (event) => {
  const LOG_WEBHOOK = process.env.WARNING_WEBHOOK;
  const TOTAL_WEBHOOK = process.env.TOTAL_WARNING_WEBHOOK;
  const MESSAGE_ID = process.env.WARNING_MESSAGE_ID; 

  // LOG INI AKAN MUNCUL DI HALAMAN HITAM NETLIFY TADI
  console.log("--- DEBUG INFO ---");
  console.log("ID Pesan:", MESSAGE_ID);
  console.log("URL Webhook Log:", LOG_WEBHOOK ? "Tersedia" : "KOSONG!");
  console.log("URL Webhook Total:", TOTAL_WEBHOOK ? "Tersedia" : "KOSONG!");
  
  const body = JSON.parse(event.body);

  try {
    // Jalankan pengiriman
    const logRes = await fetch(LOG_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body.payload)
    });

    if (body.updateList && MESSAGE_ID) {
        console.log("Mencoba mengedit pesan ID:", MESSAGE_ID);
        const editRes = await fetch(`${TOTAL_WEBHOOK}/messages/${MESSAGE_ID}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: body.updateList })
        });
        console.log("Status Edit:", editRes.status, editRes.statusText);
    }

    return { statusCode: 200, body: "Check logs!" };
  } catch (err) {
    console.error("ERROR TERJADI:", err.message);
    return { statusCode: 500, body: err.message };
  }
};

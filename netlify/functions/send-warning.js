exports.handler = async (event, context) => {
  // Hanya izinkan metode POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const payload = JSON.parse(event.body);
    const WEBHOOK_URL = process.env.WARNING_WEBHOOK; // Mengambil dari Env Netlify

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      return { statusCode: 200, body: JSON.stringify({ message: "Sent to Discord!" }) };
    } else {
      return { statusCode: 500, body: "Failed to send to Discord" };
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};

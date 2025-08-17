// netlify/functions/submission-created.js

export async function handler(event, context) {
  try {
    const payload = JSON.parse(event.body);

    // Récupère l'email soumis
    const email = payload.payload.data.email;

    // Envoie l’email à ton formulaire ConvertKit
    const response = await fetch("https://api.convertkit.com/v3/forms/YOUR_FORM_ID/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: process.env.CONVERTKIT_API_KEY,
        email: email,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur ConvertKit: ${response.status}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}

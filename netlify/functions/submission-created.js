// netlify/functions/submission-created.js
const { EMAIL_TOKEN, FORM_ID } = process.env;
// Si tu préfères, utilise le fetch natif (Node 18+). Sinon importe node-fetch v3 :
// import fetch from "node-fetch";  // décommente si nécessaire

exports.handler = async (event) => {
  try {
    // Le tuto lit l'email ainsi :
    const email = JSON.parse(event.body).payload.email;  // <-- important
    console.log(`Received a submission: ${email}`);

    // === ConvertKit / Kit API V3 (exactement comme dans l’article) ===
const endpoint = `https://api.kit.com/v4/forms/${FORM_ID}/subscribers`;
const resp = await fetch(endpoint, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${EMAIL_TOKEN}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email_address: email,  // <= nouveau nom de champ en V4
  }),
});

    const text = await resp.text();
    console.log("ConvertKit response:", resp.status, text);

    // Redirige vers une page de confirmation
    return {
      statusCode: 302,
      headers: { Location: "/confirmation/" },
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Server error" };
  }
};

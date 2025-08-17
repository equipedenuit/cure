// netlify/functions/submission-created.js
export async function handler(event) {
  try {
    const { payload } = JSON.parse(event.body);
    const email = payload.data.email;

    const KIT_API_KEY = process.env.KIT_API_KEY;
    const FORM_ID = process.env.KIT_FORM_ID; // tu définis ça dans Netlify env vars

    console.log("[submission-created] email:", email);

    // 1. Créer le subscriber en "inactive"
    const createRes = await fetch("https://api.kit.com/v4/subscribers", {
      method: "POST",
      headers: {
        "X-Kit-Api-Key": KIT_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
        state: "inactive", // <= clé pour l'incentive email
      }),
    });

    const createData = await createRes.json();
    console.log("[kit] create subscriber", createRes.status, createData);

    if (!createRes.ok) {
      throw new Error("Failed to create subscriber");
    }

    const subId = createData.id;
    if (!subId) {
      throw new Error("No subscriber ID returned");
    }

    // 2. Ajouter le subscriber au form
    const addRes = await fetch(
      `https://api.kit.com/v4/forms/${FORM_ID}/subscribers/${subId}`,
      {
        method: "POST",
        headers: {
          "X-Kit-Api-Key": KIT_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          referrer: "https://curerecs.net",
        }),
      }
    );

    const addData = await addRes.json();
    console.log("[kit] add-to-form", addRes.status, addData);

    if (!addRes.ok) {
      throw new Error("Failed to add subscriber to form");
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error("Error in submission-created:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}

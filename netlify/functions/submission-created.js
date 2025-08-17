// netlify/functions/submission-created.js
// Node 18+ : fetch global
const { KIT_API_KEY, KIT_FORM_ID } = process.env;

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const email =
      body?.payload?.data?.email ||
      body?.payload?.email ||
      body?.data?.email ||
      body?.email;

    if (!email) {
      console.error("[kit] Missing email in payload:", body);
      return { statusCode: 400, body: "Missing email" };
    }

    // 1) Créer (ou upsert) le subscriber (V4, X-Kit-Api-Key + email_address)
    const subRes = await fetch("https://api.kit.com/v4/subscribers", {
      method: "POST",
      headers: {
        "X-Kit-Api-Key": KIT_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email_address: email }),
    });
    const subJson = await subRes.json();
    console.log("[kit] create subscriber:", subRes.status, subJson);

    if (!subRes.ok) {
      return { statusCode: 500, body: "Error creating subscriber" };
    }

    const subscriberId = subJson?.data?.id;
    if (!subscriberId) {
      console.error("[kit] No subscriber ID returned:", subJson);
      return { statusCode: 500, body: "No subscriber ID" };
    }

    // 2) Abonner au form (V4)
    // Option A: par ID (chemin /subscribers/{id})
    let formRes = await fetch(
      `https://api.kit.com/v4/forms/${KIT_FORM_ID}/subscribers/${subscriberId}`,
      {
        method: "POST",
        headers: {
          "X-Kit-Api-Key": KIT_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}), // corps vide accepté
      }
    );

    // si l'implémentation préfère par email_address, fallback Option B:
    if (!formRes.ok) {
      const tryByEmail = await fetch(
        `https://api.kit.com/v4/forms/${KIT_FORM_ID}/subscribers`,
        {
          method: "POST",
          headers: {
            "X-Kit-Api-Key": KIT_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email_address: email }),
        }
      );
      const tryByEmailJson = await tryByEmail.json();
      console.log("[kit] add to form (by email):", tryByEmail.status, tryByEmailJson);
      if (!tryByEmail.ok) {
        return { statusCode: 500, body: "Error subscribing to form" };
      }
    } else {
      const formJson = await formRes.json();
      console.log("[kit] add to form (by id):", formRes.status, formJson);
    }

    // Réponse OK (ta redirection utilisateur est gérée par l’attribut action du <form>)
    return { statusCode: 200, body: "OK" };
  } catch (e) {
    console.error("[submission-created] unhandled error:", e);
    return { statusCode: 500, body: "Server error" };
  }
};

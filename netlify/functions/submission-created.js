// netlify/functions/submission-created.js
// Node 18+: fetch global
const { KIT_API_KEY, KIT_FORM_ID } = process.env;

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);

    // Netlify Forms envoie souvent ici:
    // body.payload.data = { email: "..." }
    const email =
      body?.payload?.data?.email ||
      body?.payload?.email ||
      body?.data?.email ||
      body?.email;

    console.log("[submission-created] incoming payload:", JSON.stringify(body));
    console.log("[submission-created] parsed email:", email);

    if (!email) {
      return { statusCode: 400, body: "Missing email" };
    }

    // 1) Créer (ou récupérer) le subscriber
    const subRes = await fetch("https://api.kit.com/v4/subscribers", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KIT_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email_address: email }),
    });
    const subJson = await subRes.json();
    console.log("[kit] create subscriber status:", subRes.status, subJson);

    if (!subRes.ok) {
      // Si déjà existant, Kit peut renvoyer une 409/422 selon les cas
      return { statusCode: 500, body: "Error creating subscriber" };
    }

    const subscriberId = subJson?.data?.id;
    if (!subscriberId) {
      console.error("[kit] no subscriber id", subJson);
      return { statusCode: 500, body: "No subscriber ID" };
    }

    // 2) Abonner ce subscriber AU BON ENDPOINT V4 :
    //    /v4/forms/{form_id}/subscribers   (et non /subscriptions)
    const formRes = await fetch(
      `https://api.kit.com/v4/forms/${KIT_FORM_ID}/subscribers`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${KIT_API_KEY}`,
          "Content-Type": "application/json",
        },
        // Deux options possibles côté V4 :
        //  - passer l'ID
        //  - ou repasser l'email_address
        body: JSON.stringify({ subscriber_id: subscriberId }),
      }
    );
    const formJson = await formRes.json();
    console.log("[kit] add to form status:", formRes.status, formJson);

    if (!formRes.ok) {
      // Fallback : tenter par email_address
      const retry = await fetch(
        `https://api.kit.com/v4/forms/${KIT_FORM_ID}/subscribers`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${KIT_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email_address: email }),
        }
      );
      const retryJson = await retry.json();
      console.log("[kit] add to form (retry by email) status:", retry.status, retryJson);

      if (!retry.ok) {
        return { statusCode: 500, body: "Error subscribing to form" };
      }
    }

    // Succès (la redirection finale est gérée par ton <form action="/confirmation/">)
    return { statusCode: 200, body: "OK" };
  } catch (e) {
    console.error("[submission-created] unhandled error:", e);
    return { statusCode: 500, body: "Server error" };
  }
};

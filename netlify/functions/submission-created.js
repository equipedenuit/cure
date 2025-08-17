// netlify/functions/submission-created.js
const { KIT_API_KEY, KIT_FORM_ID } = process.env;

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const email =
      body?.payload?.data?.email ||
      body?.payload?.email ||
      body?.data?.email ||
      body?.email;

    if (!email) return { statusCode: 400, body: "Missing email" };

    // 1) Créer le subscriber en INACTIVE (double opt-in)
    const create = await fetch("https://api.kit.com/v4/subscribers", {
      method: "POST",
      headers: {
        "X-Kit-Api-Key": KIT_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email_address: email, state: "inactive" }),
    });
    const created = await create.json();
    console.log("[kit] create subscriber:", create.status, created);
    if (!create.ok) return { statusCode: 500, body: "Error creating subscriber" };

    const id = created?.data?.id;
    if (!id) return { statusCode: 500, body: "No subscriber ID" };

    // 2) L’attacher au FORM (déclenche l’incentive du form)
    const attach = await fetch(
      `https://api.kit.com/v4/forms/${KIT_FORM_ID}/subscribers/${id}`,
      {
        method: "POST",
        headers: {
          "X-Kit-Api-Key": KIT_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }
    );
    const attached = await attach.json();
    console.log("[kit] add to form:", attach.status, attached);
    if (!attach.ok) {
      // Fallback: par email (si jamais l’endpoint /{id} échoue)
      const byEmail = await fetch(
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
      const byEmailJson = await byEmail.json();
      console.log("[kit] add to form (by email):", byEmail.status, byEmailJson);
      if (!byEmail.ok) return { statusCode: 500, body: "Error subscribing to form" };
    }

    return { statusCode: 200, body: "OK" };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: "Server error" };
  }
};

// Netlify Functions (Node 18+): fetch est global, pas besoin de node-fetch
const { KIT_API_KEY, KIT_FORM_ID } = process.env;

exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body);
    const email =
      data?.payload?.email || // Netlify Forms (event trigger)
      data?.data?.email ||    // autre forme possible
      data?.email;

    if (!email) {
      console.error("No email in submission payload:", data);
      return { statusCode: 400, body: "Missing email" };
    }

    // 1) Créer le subscriber (Kit v4)
    const subRes = await fetch("https://api.kit.com/v4/subscribers", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KIT_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email_address: email }),
    });
    const subJson = await subRes.json();
    if (!subRes.ok) {
      console.error("Create subscriber failed:", subRes.status, subJson);
      return { statusCode: 500, body: "Error creating subscriber" };
    }
    const subscriberId = subJson?.data?.id;
    if (!subscriberId) {
      console.error("No subscriber ID returned:", subJson);
      return { statusCode: 500, body: "No subscriber ID" };
    }

    // 2) L’abonner au form
    const formRes = await fetch(
      `https://api.kit.com/v4/forms/${KIT_FORM_ID}/subscriptions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${KIT_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subscriber_id: subscriberId }),
      }
    );
    const formJson = await formRes.json();
    if (!formRes.ok) {
      console.error("Subscribe to form failed:", formRes.status, formJson);
      return { statusCode: 500, body: "Error subscribing to form" };
    }

    // OK → redirige vers /confirmation/
    return {
      statusCode: 302,
      headers: { Location: "/confirmation/" },
    };
  } catch (e) {
    console.error("Unhandled error:", e);
    return { statusCode: 500, body: "Server error" };
  }
};

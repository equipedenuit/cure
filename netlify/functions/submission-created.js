import fetch from "node-fetch";

const { KIT_API_KEY, KIT_FORM_ID } = process.env;

export const handler = async (event) => {
  try {
    const payload = JSON.parse(event.body);
    const email = payload?.payload?.email || payload?.data?.email;

    if (!email) {
      console.error("No email in submission");
      return { statusCode: 400, body: "Missing email" };
    }

    // Étape 1 — créer le subscriber
    const subRes = await fetch("https://api.kit.com/v4/subscribers", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${KIT_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
      }),
    });

    const subData = await subRes.json();
    if (!subRes.ok) {
      console.error("Error creating subscriber:", subData);
      return { statusCode: 500, body: "Error creating subscriber" };
    }

    const subscriberId = subData?.data?.id;
    if (!subscriberId) {
      console.error("Subscriber ID missing:", subData);
      return { statusCode: 500, body: "No subscriber ID returned" };
    }

    // Étape 2 — l’abonner au form
    const formRes = await fetch(`https://api.kit.com/v4/forms/${KIT_FORM_ID}/subscriptions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${KIT_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscriber_id: subscriberId,
      }),
    });

    const formData = await formRes.json();
    if (!formRes.ok) {
      console.error("Error subscribing to form:", formData);
      return { statusCode: 500, body: "Error subscribing to form" };
    }

    // Succès → redirection vers /confirmation/
    return {
      statusCode: 302,
      headers: { Location: "/confirmation/" },
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Server error" };
  }
};

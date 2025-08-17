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

    const res = await fetch(`https://api.kit.com/v4/forms/{KIT_FORM_ID}/subscribers`, {
      method: "POST",
      headers: {
        "X-Kit-Api-Key": KIT_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email_address: email })
    });

    const json = await res.json();
    console.log("[kit] add-to-form:", res.status, json);

    if (!res.ok) return { statusCode: 500, body: "Error subscribing to form" };
    return { statusCode: 200, body: "OK" };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: "Server error" };
  }
};

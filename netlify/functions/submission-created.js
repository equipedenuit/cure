// netlify/functions/submission-created.js
const { KIT_API_KEY } = process.env;

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const email =
      body?.payload?.data?.email ||
      body?.payload?.email ||
      body?.data?.email ||
      body?.email;

    if (!email) {
      return { statusCode: 400, body: "Missing email" };
    }

    const res = await fetch("https://api.kit.com/v4/subscribers", {
      method: "POST",
      headers: {
        "X-Kit-Api-Key": KIT_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
        state: "inactive", // <-- force double opt-in
      }),
    });

    const json = await res.json();
    console.log("[kit] create subscriber:", res.status, json);

    if (!res.ok) {
      return { statusCode: 500, body: "Error creating subscriber" };
    }

    return { statusCode: 200, body: "OK" };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Server error" };
  }
};

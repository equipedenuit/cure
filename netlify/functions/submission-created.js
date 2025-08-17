// netlify/functions/submission-created.js
export async function handler(event) {
  try {
    const payload = JSON.parse(event.body).payload;
    const email = payload.data.email;
    if (!email) throw new Error("No email in submission payload");

    console.log("[kit] new submission:", email);

    const res = await fetch(
      `https://api.kit.com/v4/forms/${process.env.KIT_FORM_ID}/subscribers`,
      {
        method: "POST",
        headers: {
          "X-Kit-Api-Key": process.env.KIT_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_address: email,
          state: "inactive", // ✅ force confirmation email
          referrer: payload.site_url || "https://curerecs.net",
        }),
      }
    );

    const data = await res.json();
    console.log("[kit] response:", res.status, data);

    if (!res.ok) throw new Error(data.errors?.join(", ") || "Kit API error");

    return { statusCode: 200, body: "OK" };
  } catch (err) {
    console.error("Error in submission-created:", err);
    return { statusCode: 500, body: err.message };
  }
}

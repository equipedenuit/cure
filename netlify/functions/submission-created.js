const { KIT_API_KEY } = process.env;

exports.handler = async (event, context) => {
  const { email } = JSON.parse(event.body).payload;
  console.log(`Received a submission: ${email}`);

  const response = await fetch(
    'https://api.kit.com/v4/forms/8446033/subscribers',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Kit-Api-Key': KIT_API_KEY,
      },
      body: JSON.stringify({
        email_address: email,   // ⚠️ c’est bien email_address attendu par Kit

      }),
    }
  );

  const responseText = await response.text();
  console.log('response:', responseText);

  return {
    statusCode: 302,
    headers: {
      Location: '/confirmation/',
    },
  };
};

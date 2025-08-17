const { KIT_API_KEY } = process.env;

exports.handler = async (event, context) => {
  try {
    const { email } = JSON.parse(event.body).payload;
    console.log(`Received a submission: ${email}`);

    // Étape 1 → Créer le subscriber
    const createRes = await fetch('https://api.kit.com/v4/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Kit-Api-Key': KIT_API_KEY,
      },
      body: JSON.stringify({
        email_address: email,
        state: 'inactive', // important pour trigger le mail de confirmation
      }),
    });

    const createData = await createRes.json();
    console.log('[kit] create subscriber response:', createData);

    if (!createRes.ok) {
      throw new Error(`Create subscriber failed: ${createRes.status}`);
    }

    // Étape 2 → Ajouter le subscriber au form (si nécessaire)
    const formId = '8446033';
    const addRes = await fetch(
      `https://api.kit.com/v4/forms/${formId}/subscribers`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Kit-Api-Key': KIT_API_KEY,
        },
        body: JSON.stringify({
          email_address: email,
        }),
      }
    );

    const addData = await addRes.json();
    console.log('[kit] add to form response:', addData);

    if (!addRes.ok) {
      throw new Error(`Add to form failed: ${addRes.status}`);
    }

    // Succès → rediriger vers page confirmation
    return {
      statusCode: 302,
      headers: {
        Location: '/confirmation/',
      },
    };
  } catch (err) {
    console.error('Error in submission-created:', err);
    return { statusCode: 500, body: 'Internal Server Error' };
  }
};

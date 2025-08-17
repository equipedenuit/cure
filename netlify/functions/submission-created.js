const { KIT_API_KEY } = process.env;
import fetch from 'node-fetch';

exports.handler = async (event, context) => {
    const email = JSON.parse(event.body).payload.email
    console.log(`Received a submission: ${email}`)

    const response = await fetch (
        'https://api.kit.com/v4/forms/8446033/subscribers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                api_key: KIT_API_KEY,
                email: email
             }),
        }
    );
    let responseText = await response.text();
    console.log('response:', responseText);
    return {
        statusCode: 302,
        headers: {
            'Location': '/confirmation/',
        },
    }
}

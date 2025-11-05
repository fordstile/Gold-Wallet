const fetch = require('node-fetch');

async function testAdminLogin() {
  try {
    const response = await fetch('http://localhost:3002/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@goldwallet.com',
        password: 'Admin123!'
      })
    });

    const data = await response.json();
    console.log('Login Response:', JSON.stringify(data, null, 2));

    if (data.token) {
      // Decode JWT to see payload
      const payload = JSON.parse(Buffer.from(data.token.split('.')[1], 'base64').toString());
      console.log('\nJWT Payload:', JSON.stringify(payload, null, 2));
      console.log('\n✓ isAdmin flag present:', payload.isAdmin === true);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAdminLogin();


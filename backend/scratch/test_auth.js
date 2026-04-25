const axios = require('axios');

const API_URL = 'http://localhost:5000/api/auth';

async function testAuth() {
  try {
    console.log('--- Testing Registration ---');
    const regRes = await axios.post(`${API_URL}/register`, {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'password123'
    });
    console.log('Registration Success:', regRes.data.username);
    const token = regRes.data.token;

    console.log('\n--- Testing Login ---');
    const loginRes = await axios.post(`${API_URL}/login`, {
      email: regRes.data.email,
      password: 'password123'
    });
    console.log('Login Success:', loginRes.data.token ? 'Token Received ✅' : 'No Token ❌');

    console.log('\n--- Testing Protected Route (/me) ---');
    const meRes = await axios.get(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Profile Fetch Success:', meRes.data.username);

  } catch (error) {
    console.error('Test Failed:', error.response?.data?.message || error.message);
  }
}

testAuth();

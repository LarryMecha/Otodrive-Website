// Test connection between frontend and backend
const fetch = require('node-fetch');

async function testConnection() {
  console.log('Testing backend connection...');
  
  try {
    const response = await fetch('http://localhost:8080/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        phone: '123456789',
        vehicle: 'Toyota',
        date: '2024-01-15',
        time: '09:00',
        service: 'Service'
      })
    });
    
    const result = await response.json();
    console.log('✅ Backend response:', result);
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection(); 
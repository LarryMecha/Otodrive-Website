// Using built-in fetch (Node.js 18+)

async function testBookingAPI() {
  console.log('Testing Booking API...');
  
  const testData = {
    name: "Test User",
    phone: "1234567890",
    vehicle: "Toyota Camry",
    date: "2024-01-15",
    time: "09:00",
    service: "LPG Conversion"
  };

  try {
    const response = await fetch('http://localhost:8080/api/book', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    console.log('Response Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Booking API is working!');
      if (result.calendarUrl) {
        console.log('📅 Calendar URL generated:', result.calendarUrl);
      }
    } else {
      console.log('❌ Booking failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Error testing booking API:', error.message);
  }
}

testBookingAPI(); 
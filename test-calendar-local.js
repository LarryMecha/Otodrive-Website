const { google } = require('googleapis');
const path = require('path');

// Test Google Calendar API connection
async function testCalendarConnection() {
  console.log('Testing Google Calendar API connection...');
  
  let auth;
  const CALENDAR_ID = '6697b6fb8a393f617caa6df75bba201189b4e19f45434403ce7f3ebd3d5bf0dc@group.calendar.google.com';
  
  try {
    // Try to load service account from file
    const KEYFILEPATH = path.join(__dirname, 'service-account.json');
    auth = new google.auth.GoogleAuth({
      keyFile: KEYFILEPATH,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });
    
    console.log('✅ Service account loaded from file');
    
    const authClient = await auth.getClient();
    const calendar = google.calendar({ version: 'v3', auth: authClient });
    
    // Test by listing calendars
    const response = await calendar.calendarList.list();
    console.log('✅ Successfully connected to Google Calendar API');
    console.log('Available calendars:', response.data.items.map(cal => cal.summary));
    
    // Test creating a simple event
    const testEvent = {
      summary: 'Test Booking - Otodrive',
      description: 'This is a test booking to verify API connection',
      start: {
        dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        timeZone: 'Africa/Nairobi',
      },
      end: {
        dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // Tomorrow + 1 hour
        timeZone: 'Africa/Nairobi',
      },
    };
    
    const eventResponse = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      resource: testEvent,
    });
    
    console.log('✅ Successfully created test event in calendar');
    console.log('Event ID:', eventResponse.data.id);
    
    // Clean up - delete the test event
    await calendar.events.delete({
      calendarId: CALENDAR_ID,
      eventId: eventResponse.data.id,
    });
    
    console.log('✅ Test event cleaned up');
    console.log('\n🎉 Calendar API is working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing calendar connection:', error.message);
    
    if (error.message.includes('ENOENT')) {
      console.log('\n📝 To fix this:');
      console.log('1. Download your service account JSON from Google Cloud Console');
      console.log('2. Save it as "service-account.json" in this directory');
      console.log('3. Make sure the calendar ID is correct and shared with your service account');
    }
  }
}

// Run the test
testCalendarConnection(); 
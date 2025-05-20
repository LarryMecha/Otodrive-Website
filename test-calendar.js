const { google } = require('googleapis');
const path = require('path');

// Path to your service account key file
const KEYFILEPATH = path.join(__dirname, 'service-account.json');

// Your Google Calendar ID (usually your company Gmail address or the calendar's ID)
const CALENDAR_ID = '6697b6fb8a393f617caa6df75bba201189b4e19f45434403ce7f3ebd3d5bf0dc@group.calendar.google.com'; // <-- CHANGE THIS

// Load the service account key
const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: ['https://www.googleapis.com/auth/calendar'],
});

async function testCalendarInsert() {
  const authClient = await auth.getClient();
  const calendar = google.calendar({ version: 'v3', auth: authClient });

  // Create a test event
  const event = {
    summary: 'Test Booking Event',
    description: 'This is a test event created by the service account.',
    start: {
      dateTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      timeZone: 'Africa/Nairobi',
    },
    end: {
      dateTime: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
      timeZone: 'Africa/Nairobi',
    },
  };

  try {
    const response = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      resource: event,
    });
    console.log('Event created: %s', response.data.htmlLink);
  } catch (err) {
    console.error('Error creating event:', err.errors || err);
  }
}

testCalendarInsert();
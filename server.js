const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;

// Enable CORS for your frontend domain
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://127.0.0.1:5501',
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(bodyParser.json());

// For local testing: Use environment variables or fallback to service-account.json
let auth;
let calendarEnabled = false;
const CALENDAR_ID = process.env.CALENDAR_ID || '6697b6fb8a393f617caa6df75bba201189b4e19f45434403ce7f3ebd3d5bf0dc@group.calendar.google.com';

if (process.env.GOOGLE_CREDENTIALS) {
  // Use environment variable (for Render deployment)
  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
  auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
  calendarEnabled = true;
  console.log('✅ Calendar API enabled with environment credentials');
} else {
  // Use local file (for local development)
  const KEYFILEPATH = path.join(__dirname, 'service-account.json');
  try {
    const fs = require('fs');
    if (fs.existsSync(KEYFILEPATH)) {
      auth = new google.auth.GoogleAuth({
        keyFile: KEYFILEPATH,
        scopes: ['https://www.googleapis.com/auth/calendar'],
      });
      calendarEnabled = true;
      console.log('✅ Calendar API enabled with service account');
    } else {
      throw new Error('Service account file not found');
    }
  } catch (error) {
    console.log('⚠️  Calendar API disabled: service-account.json not found');
    console.log('📝 To enable calendar: Download service account JSON from Google Cloud Console');
    console.log('📝 For now, bookings will work but won\'t be added to calendar');
    calendarEnabled = false;
    auth = null;
  }
}

function isValidBooking(dateStr, timeStr) {
  const date = new Date(`${dateStr}T${timeStr}:00`);
  const day = date.getDay(); // 0=Sun, 6=Sat
  const hour = date.getHours();
  if (day === 0) return false; // Sunday
  if (day === 6 && hour >= 12) return false; // Saturday after 12pm
  if (day === 1 && hour < 8) return false; // Monday before 8am
  return true;
}

function toGoogleCalendarDateString(date) {
  // Returns YYYYMMDDTHHmmssZ (UTC)
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
}

app.post('/api/book', async (req, res) => {
  const { name, phone, vehicle, date, time, service } = req.body;
  if (!name || !phone || !vehicle || !date || !time || !service) {
    return res.json({ success: false, error: 'Missing required fields.' });
  }
  if (!isValidBooking(date, time)) {
    return res.json({ success: false, error: 'Selected time is outside business hours.' });
  }

  const startDateTime = new Date(`${date}T${time}:00`);
  const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hour slot

  const event = {
    summary: `Otodrive Booking: ${service}`,
    description: `Name: ${name}\nPhone: ${phone}\nVehicle: ${vehicle}\nService: ${service}\nDate: ${date}\nTime: ${time}`,
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: 'Africa/Nairobi',
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: 'Africa/Nairobi',
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 2 * 24 * 60 }, // 2 days before
        { method: 'email', minutes: 1 * 24 * 60 }, // 1 day before
      ]
    }
  };

  // Do NOT add attendees (service accounts can't invite external emails)

  // Generate Add to Google Calendar link for the client
  const gcalStart = toGoogleCalendarDateString(startDateTime);
  const gcalEnd = toGoogleCalendarDateString(endDateTime);
  const details = `Name: ${name}\nPhone: ${phone}\nVehicle: ${vehicle}\nService: ${service}\nDate: ${date}\nTime: ${time}`;
  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Otodrive Booking: ' + service)}&dates=${gcalStart}/${gcalEnd}&details=${encodeURIComponent(details)}&location=Otodrive%20Autogas%20fueling%20and%20conversion%20Center%20Mavoko&ctz=Africa/Nairobi`;

  try {
    if (!calendarEnabled) {
      // Calendar disabled - just return success without adding to calendar
      console.log('📝 Booking received (calendar disabled):', { name, phone, vehicle, date, time, service });
      res.json({ 
        success: true, 
        calendarUrl: null,
        message: 'Booking received! Calendar integration is currently disabled for testing.'
      });
      return;
    }
    
    if (!auth) {
      return res.json({ success: false, error: 'Google Calendar authentication not configured. Please check your service account setup.' });
    }
    
    const authClient = await auth.getClient();
    const calendar = google.calendar({ version: 'v3', auth: authClient });
    await calendar.events.insert({
      calendarId: CALENDAR_ID,
      resource: event,
    });
    res.json({ success: true, calendarUrl });
  } catch (err) {
    console.error('Calendar API Error:', err);
    res.json({ success: false, error: err.message });
  }
});

// Serve static files for local testing
app.use(express.static(__dirname));

// Catch-all route to serve index.html for any unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, 'localhost', () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Booking page: http://localhost:${port}/booking.html`);
});
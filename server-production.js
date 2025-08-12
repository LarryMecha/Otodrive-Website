const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for production domain
app.use(cors({
  origin: ['https://otodriveafrica.com', 'https://www.otodriveafrica.com', 'http://localhost:5501'],
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(bodyParser.json());

// Google Calendar setup for production
let auth;
let calendarEnabled = false;
const CALENDAR_ID = process.env.CALENDAR_ID || '6697b6fb8a393f617caa6df75bba201189b4e19f45434403ce7f3ebd3d5bf0dc@group.calendar.google.com';

if (process.env.GOOGLE_CREDENTIALS) {
  // Use environment variable (for production deployment)
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
    console.log('📝 To enable calendar: Set GOOGLE_CREDENTIALS environment variable');
    calendarEnabled = false;
    auth = null;
  }
}

function isValidBooking(dateStr, timeStr) {
  // Create date in Africa/Nairobi timezone for proper hour calculation
  const date = new Date(`${dateStr}T${timeStr}:00+03:00`);
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

  // Create date in Africa/Nairobi timezone
  const startDateTime = new Date(`${date}T${time}:00+03:00`); // +03:00 for EAT (East Africa Time)
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
        message: 'Booking received! Calendar integration is currently disabled.'
      });
      return;
    }
    
    if (!auth) {
      return res.json({ success: false, error: 'Google Calendar authentication not configured.' });
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

// Serve static files for production
app.use(express.static(__dirname));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    calendarEnabled: calendarEnabled,
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`🚀 Production server running on port ${port}`);
  console.log(`📅 Calendar API: ${calendarEnabled ? 'Enabled' : 'Disabled'}`);
  console.log(`🌐 Booking page: https://otodrive.co.ke/booking.html`);
}); 
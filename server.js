const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for your frontend domain
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(bodyParser.json());

// Google Calendar setup
const CALENDAR_ID = process.env.CALENDAR_ID;

// Create auth client from credentials
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
  scopes: ['https://www.googleapis.com/auth/calendar'],
});

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
    const authClient = await auth.getClient();
    const calendar = google.calendar({ version: 'v3', auth: authClient });
    await calendar.events.insert({
      calendarId: CALENDAR_ID,
      resource: event,
    });
    res.json({ success: true, calendarUrl });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Remove static file serving and catch-all route since frontend will be on cPanel
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
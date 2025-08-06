# Google Calendar Integration Setup Guide

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

## Step 2: Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the details:
   - Service account name: `otodrive-calendar`
   - Service account ID: `otodrive-calendar`
   - Description: `Service account for Otodrive booking calendar`
4. Click "Create and Continue"
5. Skip the optional steps and click "Done"

## Step 3: Generate Service Account Key

1. Click on your newly created service account
2. Go to the "Keys" tab
3. Click "Add Key" > "Create new key"
4. Select "JSON" format
5. Click "Create"
6. The JSON file will download automatically

## Step 4: Set Up Calendar Permissions

1. Rename the downloaded file to `service-account.json`
2. Place it in your project root directory
3. Get the service account email (found in the JSON file under `client_email`)
4. Go to your Google Calendar settings
5. Share your calendar with the service account email
6. Give it "Make changes to events" permission

## Step 5: Update Calendar ID

1. Go to your Google Calendar settings
2. Find your calendar ID (it's in the URL when you're viewing the calendar)
3. Update the `CALENDAR_ID` in `server.js` if needed

## Step 6: Test the Integration

1. Restart your server: `node server.js`
2. You should see: "✅ Calendar API enabled with service account"
3. Test a booking - it should now create calendar events!

## Troubleshooting

- Make sure the service account has access to the calendar
- Check that the calendar ID is correct
- Ensure the Google Calendar API is enabled
- Verify the JSON file is in the correct location

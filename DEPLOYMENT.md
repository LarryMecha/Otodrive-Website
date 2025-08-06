# Otodrive Booking System - Deployment Guide

## 🚀 Deployment to cPanel

### Prerequisites

- cPanel hosting with Node.js support
- Domain: otodrive.co.ke
- Google Cloud Console access (for calendar integration)

### Step 1: Prepare Your Repository

1. **Push to GitHub** (you'll do this)
2. **Ensure all files are included**:
   - `booking.html` - Booking page
   - `js/booking.js` - Booking functionality
   - `server-production.js` - Production server
   - `service-account.json` - Google Calendar credentials
   - `package.json` - Dependencies

### Step 2: cPanel Setup

#### Option A: Using cPanel Node.js App Manager

1. **Login to cPanel**
2. **Go to "Node.js Apps"**
3. **Create New App**:

   - **Node.js version**: 18.x or higher
   - **Application mode**: Production
   - **Application root**: `/home/username/otodrive-booking`
   - **Application URL**: `https://otodrive.co.ke`
   - **Application startup file**: `server-production.js`
   - **Passenger port**: 3000

4. **Set Environment Variables**:
   - `GOOGLE_CREDENTIALS`: (Copy content of service-account.json)
   - `CALENDAR_ID`: `6697b6fb8a393f617caa6df75bba201189b4e19f45434403ce7f3ebd3d5bf0dc@group.calendar.google.com`

#### Option B: Using SSH/File Manager

1. **Upload files** to your hosting directory
2. **Install dependencies**: `npm install`
3. **Set up PM2** (if available):
   ```bash
   npm install -g pm2
   pm2 start server-production.js --name "otodrive-booking"
   pm2 startup
   pm2 save
   ```

### Step 3: Domain Configuration

1. **Create subdomain or use main domain**:

   - Option 1: `booking.otodrive.co.ke`
   - Option 2: `otodrive.co.ke/booking.html`

2. **Set up reverse proxy** (if needed):
   ```nginx
   location /api/ {
       proxy_pass http://localhost:3000;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
   }
   ```

### Step 4: SSL Certificate

1. **Enable SSL** for your domain
2. **Force HTTPS** redirects
3. **Update CORS** settings if needed

### Step 5: Test the Deployment

1. **Health Check**: Visit `https://otodrive.co.ke/api/health`
2. **Booking Page**: Visit `https://otodrive.co.ke/booking.html`
3. **Test Booking**: Submit a test booking
4. **Check Calendar**: Verify events are created in Google Calendar

## 🔧 Environment Variables

Set these in your cPanel environment:

```bash
GOOGLE_CREDENTIALS={"type":"service_account",...}
CALENDAR_ID=6697b6fb8a393f617caa6df75bba201189b4e19f45434403ce7f3ebd3d5bf0dc@group.calendar.google.com
NODE_ENV=production
PORT=3000
```

## 📁 File Structure for Production

```
otodrive-booking/
├── booking.html              # Booking page
├── js/
│   └── booking.js           # Booking functionality
├── css/
│   └── style.css            # Styles
├── server-production.js      # Production server
├── service-account.json      # Google Calendar credentials
├── package.json              # Dependencies
└── DEPLOYMENT.md            # This file
```

## 🐛 Troubleshooting

### Common Issues:

1. **CORS Errors**:

   - Check domain in CORS settings
   - Ensure HTTPS is used

2. **Calendar API Errors**:

   - Verify service account permissions
   - Check calendar sharing settings

3. **Port Issues**:

   - Ensure port 3000 is available
   - Check firewall settings

4. **SSL Issues**:
   - Force HTTPS redirects
   - Update API endpoint URLs

## 📞 Support

If you encounter issues:

1. Check server logs in cPanel
2. Test API endpoints manually
3. Verify Google Calendar permissions
4. Contact hosting provider for Node.js support

## 🔄 Updates

To update the booking system:

1. Push changes to GitHub
2. Pull changes on server
3. Restart the Node.js application
4. Test functionality

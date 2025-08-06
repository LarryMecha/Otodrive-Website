# Otodrive Booking System - cPanel Deployment (No Node.js)

## 🚀 Deployment Strategy

Since your cPanel doesn't support Node.js, we'll use a **hybrid approach**:

- **Frontend**: Hosted on your cPanel (HTML/CSS/JS)
- **Backend API**: Hosted on Render (Free)

## 📋 Prerequisites

1. **cPanel hosting** (for frontend files)
2. **GitHub account** (for code repository)
3. **Render account** (free, for API hosting)
4. **Google Cloud Console** (for calendar integration)

## 🔧 Step-by-Step Deployment

### Step 1: Deploy API to Render

1. **Sign up for Render** (https://render.com) - Free account
2. **Connect your GitHub repository**
3. **Create a new Web Service**:

   - **Repository**: Your GitHub repo
   - **Name**: `otodrive-booking-api`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server-production.js`
   - **Plan**: Free

4. **Set Environment Variables** in Render:

   - `GOOGLE_CREDENTIALS`: (Copy entire content of service-account.json)
   - `CALENDAR_ID`: `6697b6fb8a393f617caa6df75bba201189b4e19f45434403ce7f3ebd3d5bf0dc@group.calendar.google.com`
   - `NODE_ENV`: `production`

5. **Deploy** - Render will give you a URL like: `https://otodrive-booking-api.onrender.com`

### Step 2: Update Frontend API URL

1. **Update the API URL** in `js/booking.js`:

   ```javascript
   const API_URL = "https://your-render-url.onrender.com";
   ```

2. **Test locally** to ensure it works

### Step 3: Deploy Frontend to cPanel

1. **Upload these files** to your cPanel public_html directory:

   - `booking.html`
   - `js/booking.js`
   - `css/style.css` (if not already there)
   - All other website files

2. **File structure on cPanel**:
   ```
   public_html/
   ├── booking.html
   ├── js/
   │   └── booking.js
   ├── css/
   │   └── style.css
   └── ... (other website files)
   ```

### Step 4: Test the Deployment

1. **Visit**: `https://otodrive.co.ke/booking.html`
2. **Test booking**: Submit a test appointment
3. **Check API**: Visit `https://your-render-url.onrender.com/api/health`
4. **Verify calendar**: Check Google Calendar for new events

## 🔧 Configuration Files

### Files to Upload to cPanel:

- ✅ `booking.html` - Booking page
- ✅ `js/booking.js` - Booking functionality (with updated API URL)
- ✅ `css/style.css` - Styles
- ✅ All other website files

### Files for Render (API):

- ✅ `server-production.js` - Production server
- ✅ `package.json` - Dependencies
- ✅ `service-account.json` - Google Calendar credentials

## 🌐 URLs After Deployment

- **Booking Page**: `https://otodrive.co.ke/booking.html`
- **API Health Check**: `https://your-render-url.onrender.com/api/health`
- **API Endpoint**: `https://your-render-url.onrender.com/api/book`

## 🔄 Updates

### To update the booking system:

1. **Frontend changes**:

   - Update files locally
   - Upload to cPanel via File Manager

2. **API changes**:
   - Push to GitHub
   - Render will auto-deploy

## 💰 Cost

- **Render**: Free tier (750 hours/month)
- **cPanel**: Your existing hosting
- **Google Calendar API**: Free (within limits)

## 🐛 Troubleshooting

### Common Issues:

1. **CORS Errors**:

   - Check if API URL is correct in booking.js
   - Verify CORS settings in server-production.js

2. **API Not Responding**:

   - Check Render dashboard for deployment status
   - Verify environment variables are set

3. **Calendar Not Working**:
   - Check Google Calendar API credentials
   - Verify calendar sharing permissions

## 📞 Support

If you encounter issues:

1. Check Render logs in dashboard
2. Test API endpoint manually
3. Verify cPanel file uploads
4. Check browser console for errors

## 🎯 Benefits of This Approach

✅ **No Node.js required** on cPanel
✅ **Free API hosting** on Render
✅ **Automatic deployments** from GitHub
✅ **Scalable** - can upgrade Render plan if needed
✅ **Separate concerns** - frontend and backend independent

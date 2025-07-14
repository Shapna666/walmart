# Walmart Aisle Report App with AI Image Verification

A comprehensive web application for reporting empty shelves and messy products in Walmart stores, featuring AI-powered image verification using Google Cloud Vision API.

## 🚀 Features

- **Customer Interface**: Report aisle issues with detailed information
- **Employee Dashboard**: Filter, sort, and resolve reports efficiently
- **AI Image Verification**: Automatically verify if uploaded images are shelf-related
- **Points System**: Earn points for reports with bonus points for high-priority issues
- **Responsive Design**: Works on desktop and mobile devices
- **Walmart Branding**: Professional UI matching Walmart's design system

## 📋 Prerequisites

- Node.js (v14 or higher)
- Google Cloud account
- Modern web browser

## 🛠️ Setup Instructions

### 1. Google Cloud Vision API Setup

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Vision API**
   - Go to **APIs & Services** > **Library**
   - Search for "Cloud Vision API"
   - Click **Enable**

3. **Create Service Account**
   - Go to **APIs & Services** > **Credentials**
   - Click **Create Credentials** > **Service Account**
   - Name: `walmart-vision-api`
   - Role: **Cloud Vision API User**
   - Click **Done**

4. **Download Credentials**
   - Click on the created service account
   - Go to **Keys** tab
   - Click **Add Key** > **Create New Key** > **JSON**
   - Download the JSON file

### 2. Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd walmart/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up credentials**
   - Copy your downloaded Google Cloud credentials JSON file to `walmart/backend/`
   - Rename it to `google-credentials.json`
   - Or create a `.env` file and set:
     ```
     GOOGLE_APPLICATION_CREDENTIALS=./your-credentials-file.json
     ```

4. **Start the backend server**
   ```bash
   npm start
   ```
   The server will run on `http://localhost:3000`

### 3. Frontend Setup

1. **Open the app**
   - Navigate to `walmart/walmart/`
   - Open `index.html` in your browser
   - Or visit `http://localhost:3000` (if backend is running)

## 🎯 How to Use

### For Customers:
1. Click **Customer Login**
2. Enter any username to sign in
3. Fill out the detailed report form:
   - **Location**: Aisle number and section
   - **Issue Details**: Type, severity, product name
   - **Photo**: Upload image (AI will verify it's shelf-related)
   - **Description**: Detailed explanation
4. Submit report and earn points

### For Employees:
1. Click **Employee Login**
2. Enter any employee ID to sign in
3. Use filters to find specific issues:
   - Filter by severity, issue type, or section
   - Sort by newest, oldest, or severity
4. Mark issues as solved individually or in bulk

## 🔧 AI Image Verification

The app uses Google Cloud Vision API to:
- **Detect objects** in uploaded images
- **Analyze text** (OCR) for product names or labels
- **Classify content** to determine if it's shelf-related
- **Provide confidence scores** for verification accuracy

### Verification Process:
1. User uploads image
2. Image is sent to Google Cloud Vision API
3. AI analyzes image for shelf-related content
4. Results are displayed with confidence level
5. User can proceed or upload a different image

## 📁 Project Structure

```
walmart/
├── backend/                 # Node.js server with AI integration
│   ├── server.js           # Main server file
│   ├── package.json        # Dependencies
│   └── env.example         # Environment variables template
├── walmart/                # Frontend application
│   ├── index.html          # Home page
│   ├── user_login.html     # Customer login
│   ├── employee_login.html # Employee login
│   ├── user_app.html       # Customer report form
│   ├── employee_app.html   # Employee dashboard
│   ├── user_reports.html   # Customer's report history
│   ├── style.css           # Styling
│   └── app.js              # Frontend logic
└── README.md               # This file
```

## 🎨 Features Overview

### Enhanced Form Fields:
- **Aisle Number**: Specific location identification
- **Section/Area**: Store department selection
- **Issue Type**: Categorized problems (empty, messy, wrong price, etc.)
- **Severity Level**: Priority classification with bonus points
- **Product Name**: Optional specific product identification

### Employee Dashboard Features:
- **Advanced Filtering**: By severity, issue type, and section
- **Smart Sorting**: By date or severity priority
- **Visual Indicators**: Color-coded severity badges
- **Bulk Actions**: Mark multiple reports as solved
- **Detailed Reports**: Complete information display

### AI Integration Benefits:
- **Automatic Verification**: Ensures uploaded images are relevant
- **Content Analysis**: Detects shelf-related objects and text
- **Confidence Scoring**: Provides accuracy metrics
- **Fallback Handling**: Graceful degradation if AI is unavailable

## 🔒 Security & Privacy

- Images are processed securely through Google Cloud Vision API
- No images are permanently stored on the server
- All data is stored locally in the browser (localStorage)
- No personal information is collected

## 🚀 Deployment

### Local Development:
```bash
# Backend
cd walmart/backend
npm install
npm start

# Frontend
# Open walmart/walmart/index.html in browser
# Or visit http://localhost:3000
```

### Production Deployment:
1. Set up a production server (Heroku, AWS, etc.)
2. Configure environment variables
3. Set up Google Cloud Vision API credentials
4. Deploy backend and frontend files

## 🐛 Troubleshooting

### Common Issues:

1. **"Verification unavailable" message**
   - Check if backend server is running
   - Verify Google Cloud credentials are set up correctly
   - Check browser console for error messages

2. **"Failed to analyze image" error**
   - Ensure Google Cloud Vision API is enabled
   - Check API quota and billing
   - Verify credentials file path

3. **CORS errors**
   - Backend includes CORS configuration
   - Ensure frontend is accessing correct backend URL

### Debug Mode:
Set `NODE_ENV=development` in your `.env` file for detailed logging.

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify all setup steps are completed
3. Check browser console and server logs for error messages

## 🔄 Future Enhancements

Potential improvements:
- Real-time notifications
- GPS location tracking
- Advanced AI training for specific store layouts
- Integration with inventory management systems
- Mobile app development
- Multi-store support

---

**Built with ❤️ for better store organization** 
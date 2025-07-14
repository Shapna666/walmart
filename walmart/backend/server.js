const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../walmart')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// API endpoint for image verification
app.post('/api/verify-image', upload.single('image'), async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Image verification is currently disabled. Google Cloud Vision API has been removed.'
  });
});

// API endpoint for submitting shelf reports
app.post('/api/report-shelf', upload.single('shelfPhoto'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    const { location, shelfStatus } = req.body;
    if (!location || !shelfStatus) {
      return res.status(400).json({ error: 'Location and shelf status are required' });
    }
    // Save image to uploads directory
    const id = uuidv4();
    const ext = path.extname(req.file.originalname) || '.jpg';
    const imagePath = path.join(__dirname, 'uploads', `${id}${ext}`);
    fs.writeFileSync(imagePath, req.file.buffer);
    // Save report data to reports directory
    const report = {
      id,
      image: `/uploads/${id}${ext}`,
      location,
      shelfStatus,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    fs.writeFileSync(path.join(__dirname, 'reports', `${id}.json`), JSON.stringify(report, null, 2));
    res.json({ success: true, message: 'Report submitted successfully', report });
  } catch (error) {
    console.error('Error saving report:', error);
    res.status(500).json({ error: 'Failed to save report', details: error.message });
  }
});

// API endpoint to list all reports (for admin review)
app.get('/api/reports', (req, res) => {
  try {
    const files = fs.readdirSync(path.join(__dirname, 'reports'));
    const reports = files.filter(f => f.endsWith('.json')).map(f => {
      const data = fs.readFileSync(path.join(__dirname, 'reports', f));
      return JSON.parse(data);
    });
    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load reports', details: error.message });
  }
});

// API endpoint to approve a report
app.patch('/api/reports/:id/approve', (req, res) => {
  try {
    const id = req.params.id;
    const reportPath = path.join(__dirname, 'reports', `${id}.json`);
    if (!fs.existsSync(reportPath)) {
      return res.status(404).json({ error: 'Report not found' });
    }
    const report = JSON.parse(fs.readFileSync(reportPath));
    report.status = 'approved';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    res.json({ success: true, message: 'Report approved', report });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve report', details: error.message });
  }
});

// Assign a report to an employee
app.patch('/api/reports/:id/assign', (req, res) => {
  try {
    const id = req.params.id;
    const { employee } = req.body;
    if (!employee) {
      return res.status(400).json({ error: 'Employee name or ID required' });
    }
    const reportPath = path.join(__dirname, 'reports', `${id}.json`);
    if (!fs.existsSync(reportPath)) {
      return res.status(404).json({ error: 'Report not found' });
    }
    const report = JSON.parse(fs.readFileSync(reportPath));
    if (report.status === 'completed') {
      return res.status(400).json({ error: 'Report already completed' });
    }
    report.assignedTo = employee;
    report.status = 'in_progress';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    res.json({ success: true, message: 'Report assigned', report });
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign report', details: error.message });
  }
});

// Mark a report as completed
app.patch('/api/reports/:id/complete', (req, res) => {
  try {
    const id = req.params.id;
    const reportPath = path.join(__dirname, 'reports', `${id}.json`);
    if (!fs.existsSync(reportPath)) {
      return res.status(404).json({ error: 'Report not found' });
    }
    const report = JSON.parse(fs.readFileSync(reportPath));
    if (report.status !== 'in_progress') {
      return res.status(400).json({ error: 'Report must be in progress to complete' });
    }
    report.status = 'completed';
    report.completedAt = new Date().toISOString();
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    res.json({ success: true, message: 'Report marked as completed', report });
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete report', details: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Walmart Aisle Report Backend is running' 
  });
});

// Serve the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../walmart/index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📸 Image verification API available at http://localhost:${PORT}/api/verify-image`);
}); 
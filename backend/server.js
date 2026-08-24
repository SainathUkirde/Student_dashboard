require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const studentRoutes = require('./routes/student');
const coursesRoutes = require('./routes/courses');
const attendanceRoutes = require('./routes/attendance');
const resultsRoutes = require('./routes/results');
const teachersRoutes = require('./routes/teachers');
const timetableRoutes = require('./routes/timetable');
const settingsRoutes = require('./routes/settings');
const searchRoutes = require('./routes/search');
const quizRoutes = require('./routes/quiz');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/student', studentRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/teachers', teachersRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/quizzes', quizRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Student Dashboard API is running', timestamp: new Date().toISOString() });
});

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`\n🎓 Student Dashboard API running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: ${process.env.DB_PATH || './database/student_dashboard.db'}\n`);
});

module.exports = app;

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const boqRoutes = require('./routes/boqRoutes');
const masterKomponenRoutes = require('./routes/masterKomponenRoutes');
const authRoutes = require('./routes/authRoutes');
const milestoneRoutes = require('./routes/milestoneRoutes');
const scurveRoutes = require('./routes/scurveRoutes');
const refRoutes = require('./routes/refRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002'
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/boq', boqRoutes);
app.use('/api/master-komponen', masterKomponenRoutes);
app.use('/api/ref', refRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/s-curve', scurveRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date(), message: 'Backend server is running' });
});

// API Info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'PM-BOQ Enterprise Backend',
    version: '1.0.0',
    endpoints: {
      projects: '/api/projects',
      tasks: '/api/tasks',
      boq: '/api/boq',
      masterKomponen: '/api/master-komponen',
      auth: '/api/auth',
      milestones: '/api/milestones',
      sCurve: '/api/s-curve'
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 PM-BOQ Enterprise Backend Server is running on port ${PORT}`);
  console.log(`📍 Health Check: http://localhost:${PORT}/health`);
  console.log(`📍 API Info: http://localhost:${PORT}/api/info`);
  console.log(`📍 Frontend: http://localhost:3000\n`);
});

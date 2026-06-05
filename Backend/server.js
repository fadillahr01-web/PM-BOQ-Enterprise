const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
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
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: '*', // Izinkan semua domain untuk tes.
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
const apiRouter = express.Router();
apiRouter.use('/projects', projectRoutes);
apiRouter.use('/tasks', taskRoutes);
apiRouter.use('/boq', boqRoutes);
apiRouter.use('/master-komponen', masterKomponenRoutes);
apiRouter.use('/ref', refRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/milestones', milestoneRoutes);
apiRouter.use('/s-curve', scurveRoutes);

// Mount API router on both /api and / to handle Vercel serverless path rewriting
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date(), message: 'Backend server is running' });
});

app.get('/api/health', (req, res) => {
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
  res.status(404).json({ error: 'Endpoint not found', path: req.path });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🚀 PM-BOQ Enterprise Backend Server is running on port ${PORT}`);
    console.log(`📍 Health Check: http://localhost:${PORT}/health`);
    console.log(`📍 API Info: http://localhost:${PORT}/api/info`);
    console.log(`📍 Frontend: http://localhost:3000\n`);
  });
}

module.exports = app;

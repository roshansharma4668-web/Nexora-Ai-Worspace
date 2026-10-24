const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const env = require('./config/env');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const commentRoutes = require('./routes/commentRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// 1. Trust Proxy for Render/Cloud Deployment
app.set('trust proxy', 1);

// 2. Security Headers
app.use(helmet({
  crossOriginResourcePolicy: false // Allow cross-origin requests from Vercel
}));

// 3. Strict CORS Configuration
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'https://nexora-ai-worspace.vercel.app', // Explicitly allow Vercel URL
        process.env.CLIENT_URL
      ];

      if (
        allowedOrigins.includes(origin) ||
        /^http:\/\/\d+\.\d+\.\d+\.\d+:\d+$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// 4. Global API Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});
app.use('/api', apiLimiter);

// 5. Body & Cookie Parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

app.use((req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token && token !== 'undefined' && token !== 'null') {
      req.cookies = req.cookies || {};
      req.cookies.token = token;
    }
  }
  next();
});

// 6. Health-Check Endpoint
app.get('/api/health', (req, res) => {
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.status(200).json({
    success: true,
    service: 'Nexora Backend API',
    status: 'operational',
    environment: env.NODE_ENV,
    database: dbStates[mongoose.connection.readyState] || 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// 7. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/workspaces/:workspaceId/projects', projectRoutes);
app.use('/api/workspaces/:workspaceId/projects/:projectId/tasks', taskRoutes);
app.use('/api/workspaces/:workspaceId/tasks/:taskId/comments', commentRoutes);
app.use('/api/workspaces/:workspaceId/analytics', analyticsRoutes);
app.use('/api/workspaces/:workspaceId/ai', aiRoutes);
app.use(notFoundHandler);
app.use(globalErrorHandler);
module.exports = app;
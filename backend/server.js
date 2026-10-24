const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');

// Connect to MongoDB
connectDB();

const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
});

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log(`⚡ New client connected: ${socket.id}`);

  // Join a specific project collaboration room
  socket.on('join-project', (projectId) => {
    socket.join(`project_${projectId}`);
    console.log(`Client ${socket.id} joined project room: project_${projectId}`);
  });

  // Leave project room
  socket.on('leave-project', (projectId) => {
    socket.leave(`project_${projectId}`);
  });

  // Broadcast task update to all clients in the project room
  socket.on('task-update', ({ projectId, task }) => {
    socket.to(`project_${projectId}`).emit('task-updated', task);
  });

  // Broadcast new task creation
  socket.on('new-task-created', ({ projectId, task }) => {
    socket.to(`project_${projectId}`).emit('task-added', task);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Make `io` accessible globally if needed
app.set('io', io);

const PORT = env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Nexora Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});
// Load environment variables
require('dotenv').config();

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const Database = require('./database/db');
const MonitorService = require('./services/monitorService');
const DiscordBot = require('./services/discordBot');
const authRoutes = require('./routes/auth');
const { initializeAuth } = require('./routes/auth');
const monitorRoutes = require('./routes/monitors');
const statusRoutes = require('./routes/status');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';
const DOMAIN = process.env.DOMAIN || `http://localhost:${PORT}`;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize database and services
const db = new Database();
const monitorService = new MonitorService(db, io);
const discordBot = new DiscordBot();

// Inject dependencies into app locals
app.locals.db = db;
app.locals.monitorService = monitorService;
app.locals.discordBot = discordBot;

// Async initialization function
async function initializeApp() {
  try {
    await db.init();
    console.log('✅ Database initialized successfully');
    
    // Initialize authentication (create default admin user if needed)
    await initializeAuth();
    console.log('✅ Authentication initialized successfully');
    
    // Start Discord bot
    await discordBot.start();
    console.log('✅ Discord bot initialized successfully');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize application:', error.message);
    return false;
  }
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/monitors', monitorRoutes);
app.use('/api/status', statusRoutes);

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send current monitor statuses
  monitorService.sendCurrentStatuses(socket);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
  
  socket.on('addMonitor', (monitorData) => {
    monitorService.addMonitor(monitorData);
  });
  
  socket.on('removeMonitor', (monitorId) => {
    monitorService.removeMonitor(monitorId);
  });
  
  socket.on('pauseMonitor', (monitorId) => {
    monitorService.pauseMonitor(monitorId);
  });
  
  socket.on('resumeMonitor', (monitorId) => {
    monitorService.resumeMonitor(monitorId);
  });
});

// Start server after database initialization
initializeApp().then((success) => {
  if (success) {
    server.listen(PORT, HOST, () => {
      console.log(`🚀 Penguin Status is running on ${DOMAIN}`);
      console.log('📊 Dashboard available at the above URL');
      
      // Start monitoring service
      monitorService.start();
    });
  } else {
    console.error('❌ Server startup failed due to database initialization error');
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n🔄 Received SIGTERM, shutting down gracefully...');
  
  // Stop monitoring
  monitorService.stop();
  
  // Stop Discord bot
  await discordBot.stop();
  
  // Close database connection
  db.close();
  
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n🔄 Received SIGINT, shutting down gracefully...');
  
  // Stop monitoring
  monitorService.stop();
  
  // Stop Discord bot
  await discordBot.stop();
  
  // Close database connection
  db.close();
  
  process.exit(0);
});

module.exports = { app, server, io };
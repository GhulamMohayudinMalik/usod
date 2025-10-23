import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectMongoDB } from './config/database.js';
import dataRoutes from './routes/dataRoutes.js';
import logRoutes from './routes/logRoutes.js';
import ingestRoutes from './routes/ingestRoutes.js';
import streamRoutes from './routes/streamRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userManagementRoutes from './routes/userManagementRoutes.js';
import backupRoutes from './routes/backupRoutes.js';
import networkRoutes from './routes/networkRoutes.js';
import blockchainRoutes from './routes/blockchainRoutes.js';
import apiDocsRoutes from './routes/apiDocsRoutes.js';
import { startSessionCleanup } from './services/sessionService.js';

// Load env
dotenv.config();

// ============================================================
// SUPPRESS FABRIC SDK LOGS COMPLETELY (Nuclear approach)
// ============================================================

// Helper to check if message should be suppressed
const shouldSuppressFabricLog = (message) => {
  if (typeof message !== 'string') {
    message = String(message);
  }
  
  // NEVER suppress BlockchainService errors - we need to see them!
  if (message.includes('[BlockchainService]') || message.includes('Error in logThreat')) {
    return false;
  }
  
  return (
    message.includes('[ServiceEndpoint]') ||
    message.includes('[NetworkConfig]') ||
    message.includes('Failed to connect before the deadline') ||
    message.includes('waitForReady') ||
    message.includes('orderer.usod.com') ||
    message.includes('grpc://orderer') ||
    message.includes('checkState') ||
    message.includes('_onTimeout') ||
    message.includes('connectFailed')
  );
};

// Intercept stderr
const originalStderr = process.stderr.write;
process.stderr.write = function(chunk, encoding, callback) {
  const message = chunk.toString();
  if (shouldSuppressFabricLog(message)) {
    if (typeof callback === 'function') callback();
    return true;
  }
  return originalStderr.apply(process.stderr, arguments);
};

// Intercept stdout (some Fabric logs go here too)
const originalStdout = process.stdout.write;
process.stdout.write = function(chunk, encoding, callback) {
  const message = chunk.toString();
  if (shouldSuppressFabricLog(message)) {
    if (typeof callback === 'function') callback();
    return true;
  }
  return originalStdout.apply(process.stdout, arguments);
};

// Override console methods
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;
const originalConsoleInfo = console.info;

console.error = function(...args) {
  const message = args.join(' ');
  if (!shouldSuppressFabricLog(message)) {
    originalConsoleError.apply(console, args);
  }
};

console.warn = function(...args) {
  const message = args.join(' ');
  if (!shouldSuppressFabricLog(message)) {
    originalConsoleWarn.apply(console, args);
  }
};

console.log = function(...args) {
  const message = args.join(' ');
  if (!shouldSuppressFabricLog(message)) {
    originalConsoleLog.apply(console, args);
  }
};

console.info = function(...args) {
  const message = args.join(' ');
  if (!shouldSuppressFabricLog(message)) {
    originalConsoleInfo.apply(console, args);
  }
};
// ============================================================

const app = express();
const port = process.env.PORT || 5000;

// Trust proxy for accurate IP addresses and headers
app.set('trust proxy', true);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000', // Web app
      'http://localhost:3001', // Desktop app (Electron)
      'http://localhost:19006', // Expo development server
      'exp://localhost:19000', // Expo development
      'exp://192.168.1.100:19000', // Expo on local network
      'exp://192.168.100.113:19000', // Expo on your network
      'exp://192.168.100.113:8081', // Expo alternative port
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'X-API-Key', 'X-Platform'],
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/ingest', ingestRoutes);
app.use('/api/stream', streamRoutes);
app.use('/api/users', userManagementRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/network', networkRoutes);
app.use('/api/blockchain', blockchainRoutes);

// API Documentation Routes - Must be registered before the old homepage route
app.use('/', apiDocsRoutes);

// Legacy HTML homepage (kept for backward compatibility)
app.get('/legacy', (req, res) => {
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>USOD API Server</title>
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a1929; color: #fff; margin: 0; padding: 0; display: flex; flex-direction: column; align-items: center; min-height: 100vh; }
      header { background-color: #1a365d; width: 100%; padding: 20px 0; text-align: center; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
      h1 { margin: 0; font-size: 28px; font-weight: 600; }
      .container { max-width: 800px; width: 90%; margin: 40px auto; padding: 30px; background-color: #112240; border-radius: 8px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2); }
      .status { display: flex; align-items: center; margin-bottom: 20px; }
      .status-dot { width: 12px; height: 12px; border-radius: 50%; background-color: #10B981; margin-right: 10px; }
      .status-text { font-size: 18px; font-weight: 500; }
      .info-card { background-color: #1e3a5f; border-radius: 6px; padding: 15px; margin-bottom: 15px; }
      .info-card h3 { margin-top: 0; color: #90CDF4; font-size: 18px; font-weight: 500; }
      .endpoint { background-color: #2d3748; padding: 10px 15px; border-radius: 4px; font-family: monospace; margin: 5px 0; }
      .footer { text-align: center; margin-top: auto; padding: 20px; font-size: 14px; color: #a0aec0; }
    </style>
  </head>
  <body>
    <header>
      <h1>Unified Security Operations Dashboard API</h1>
    </header>
    <div class="container">
      <div class="status">
        <div class="status-dot"></div>
        <div class="status-text">API Server Online</div>
      </div>
      <div class="info-card">
        <h3>Server Information</h3>
        <p>Environment: ${process.env.NODE_ENV || 'development'}</p>
        <p>Server Time: ${new Date().toLocaleString()}</p>
        <p>MongoDB Connection: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}</p>
      </div>
      <div class="info-card">
        <h3>Available API Endpoints</h3>
        <div class="endpoint">GET /api/data/dashboard-stats</div>
        <div class="endpoint">GET /api/data/security-events</div>
        <div class="endpoint">GET /api/data/login-attempts</div>
        <div class="endpoint">GET /api/data/all</div>
        <div class="endpoint">POST /api/network/start-monitoring</div>
        <div class="endpoint">POST /api/network/stop-monitoring</div>
        <div class="endpoint">GET /api/network/threats</div>
        <div class="endpoint">GET /api/network/statistics</div>
        <div class="endpoint">GET /api/network/status</div>
      </div>
      <div class="info-card">
        <h3>Health Status</h3>
        <div class="endpoint">GET /health</div>
        <p>Check the server health status anytime using the endpoint above.</p>
      </div>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} | Unified Security Operations Dashboard | Version 1.0
    </div>
  </body>
  </html>`;
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// Health check endpoint
app.get('/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>USOD API Health</title>
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a1929; color: #fff; margin: 0; padding: 0; display: flex; flex-direction: column; align-items: center; min-height: 100vh; }
      header { background-color: #1a365d; width: 100%; padding: 20px 0; text-align: center; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
      h1 { margin: 0; font-size: 28px; font-weight: 600; }
      .container { max-width: 800px; width: 90%; margin: 40px auto; padding: 30px; background-color: #112240; border-radius: 8px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2); }
      .status { display: flex; align-items: center; margin-bottom: 20px; }
      .status-dot { width: 12px; height: 12px; border-radius: 50%; }
      .status-text { font-size: 18px; font-weight: 500; }
      .info-card { background-color: #1e3a5f; border-radius: 6px; padding: 15px; margin-bottom: 15px; }
      .info-card h3 { margin-top: 0; color: #90CDF4; font-size: 18px; font-weight: 500; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      th, td { text-align: left; padding: 12px; border-bottom: 1px solid #2d3748; }
      th { background-color: #1a365d; color: #90CDF4; }
      .health-good { color: #10B981; font-weight: 500; }
      .health-bad { color: #EF4444; font-weight: 500; }
      .footer { text-align: center; margin-top: auto; padding: 20px; font-size: 14px; color: #a0aec0; }
      .back-link { display: inline-block; margin-top: 20px; color: #90CDF4; text-decoration: none; }
      .back-link:hover { text-decoration: underline; }
    </style>
  </head>
  <body>
    <header>
      <h1>USOD API Health Status</h1>
    </header>
    <div class="container">
      <div class="status">
        <div class="status-dot" style="background-color: ${mongoStatus === 'Connected' ? '#10B981' : '#EF4444'};"></div>
        <div class="status-text">System Status: ${mongoStatus === 'Connected' ? 'Healthy' : 'Issues Detected'}</div>
      </div>
      <div class="info-card">
        <h3>Component Health</h3>
        <table>
          <tr><td>API Server</td><td class="health-good">Online</td><td>Running on port ${port}</td></tr>
          <tr><td>MongoDB</td><td class="${mongoStatus === 'Connected' ? 'health-good' : 'health-bad'}">${mongoStatus}</td><td>${mongoose.connection.name || 'No database name'}</td></tr>
          <tr><td>Memory Usage</td><td class="health-good">Normal</td><td>${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB / ${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB</td></tr>
        </table>
      </div>
      <div class="info-card">
        <h3>System Information</h3>
        <table>
          <tr><td>Environment</td><td>${process.env.NODE_ENV || 'development'}</td></tr>
          <tr><td>Node.js Version</td><td>${process.version}</td></tr>
          <tr><td>Server Time</td><td>${new Date().toLocaleString()}</td></tr>
          <tr><td>Uptime</td><td>${Math.floor(process.uptime())} seconds</td></tr>
        </table>
      </div>
      <a href="/" class="back-link">← Back to Dashboard</a>
    </div>
    <div class="footer">&copy; ${new Date().getFullYear()} | Unified Security Operations Dashboard | Version 1.0</div>
  </body>
  </html>`;
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      res.json({ message: 'MongoDB connection successful', time: new Date().toISOString() });
    } else {
      throw new Error('MongoDB disconnected');
    }
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

// Start server
const startServer = async () => {
  try {
    await connectMongoDB();
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server is running on port ${port}`);
      console.log(`Server accessible at:`);
      console.log(`  - http://localhost:${port}`);
      console.log(`  - http://192.168.100.113:${port}`);
      console.log(`CORS enabled for: ${corsOptions.origin}`);
// Start session cleanup service
startSessionCleanup();

      // Live generator disabled to use real logs
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

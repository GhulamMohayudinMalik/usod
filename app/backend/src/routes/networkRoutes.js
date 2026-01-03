import express from 'express';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import networkAIService from '../services/networkAIService.js';
import { authenticateToken as auth } from '../middleware/auth.js';
import { logActions } from '../services/loggingService.js';
import { eventBus, emitNetworkThreat, emitMonitoringEvent, NETWORK_EVENTS } from '../services/eventBus.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for PCAP file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'pcap-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.pcap', '.pcapng'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only .pcap and .pcapng files are allowed.'));
    }
  }
});

/**
 * @route POST /api/network/start-monitoring
 * @desc Start network monitoring via Python AI service
 * @access Private (Admin only)
 */
router.post('/start-monitoring', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { interface: networkInterface = 'auto', duration = 300 } = req.body;

    // Validate input
    if (duration < 60 || duration > 3600) {
      return res.status(400).json({
        success: false,
        message: 'Duration must be between 60 and 3600 seconds'
      });
    }

    // Start monitoring
    const result = await networkAIService.startNetworkMonitoring(networkInterface, duration);

    if (result.success) {
      // Log the action
      try {
        await logActions.networkMonitoringStarted(req.user.id, 'started', req, {
          interface: networkInterface,
          duration,
          monitoringId: result.data?.monitoring_id || 'unknown'
        });
      } catch (logError) {
        console.error('⚠️ Failed to log monitoring start:', logError);
        // Continue anyway - don't fail the request
      }

      // Emit real-time event
      emitMonitoringEvent(NETWORK_EVENTS.MONITORING_STARTED, {
        interface: networkInterface,
        duration,
        monitoringId: result.data?.monitoring_id,
        startedBy: req.user.username || 'system'
      });

      res.json({
        success: true,
        message: 'Network monitoring started successfully',
        data: {
          interface: networkInterface,
          duration,
          monitoringId: result.data?.monitoring_id,
          status: 'active'
        }
      });
    } else {
      console.error('❌ Network monitoring failed:', result.error);
      res.status(500).json({
        success: false,
        message: 'Failed to start network monitoring',
        error: result.error || 'Unknown error'
      });
    }
  } catch (error) {
    console.error('❌ Error starting network monitoring:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start network monitoring',
      error: error.message || error.toString()
    });
  }
});

/**
 * @route POST /api/network/stop-monitoring
 * @desc Stop network monitoring via Python AI service
 * @access Private (Admin only)
 */
router.post('/stop-monitoring', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Stop monitoring
    const result = await networkAIService.stopNetworkMonitoring();

    if (result.success) {
      // Log the action
      try {
        await logActions.networkMonitoringStopped(req.user.id, 'stopped', req, {
          monitoringId: result.data?.monitoring_id || 'unknown'
        });
      } catch (logError) {
        console.error('⚠️ Failed to log monitoring stop:', logError);
        // Continue anyway - don't fail the request
      }

      res.json({
        success: true,
        message: 'Network monitoring stopped successfully',
        data: {
          status: 'stopped'
        }
      });
    } else {
      console.error('❌ Failed to stop monitoring:', result.error);
      res.status(500).json({
        success: false,
        message: 'Failed to stop network monitoring',
        error: result.error || 'Unknown error'
      });
    }
  } catch (error) {
    console.error('❌ Error stopping network monitoring:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stop network monitoring',
      error: error.message || error.toString()
    });
  }
});

/**
 * @route GET /api/network/threats
 * @desc Get detected network threats
 * @access Private
 */
router.get('/threats', auth, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    // Validate parameters
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);

    if (limitNum < 1 || limitNum > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be between 1 and 1000'
      });
    }

    if (offsetNum < 0) {
      return res.status(400).json({
        success: false,
        message: 'Offset must be non-negative'
      });
    }

    // Get threats from Python AI service
    const result = await networkAIService.getNetworkThreats(limitNum);

    if (result.success) {
      // Log each threat to MongoDB for persistence and emit real-time events
      if (result.threats && result.threats.length > 0) {
        for (const threat of result.threats) {
          try {
            // Log to MongoDB
            await logActions.networkThreat(threat, req, {
              modelUsed: 'ai_ml_models',
              retrievedBy: req.user.username || 'system'
            });

            // Emit real-time event
            emitNetworkThreat(threat);
          } catch (logError) {
            console.error('Failed to log network threat:', logError);
            // Continue processing even if logging fails
          }
        }
      }

      res.json({
        success: true,
        threats: result.threats,
        count: result.count,
        pagination: {
          limit: limitNum,
          offset: offsetNum,
          total: result.count
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve network threats',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error getting network threats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route GET /api/network/statistics
 * @desc Get network monitoring statistics and model performance
 * @access Private
 */
router.get('/statistics', auth, async (req, res) => {
  try {
    // Get model statistics from Python AI service
    const modelStats = await networkAIService.getModelStatistics();
    const monitoringStatus = networkAIService.getMonitoringStatus();

    if (modelStats.success) {
      res.json({
        success: true,
        statistics: {
          models: modelStats.statistics,
          monitoring: monitoringStatus,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve network statistics',
        error: modelStats.error
      });
    }
  } catch (error) {
    console.error('Error getting network statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route POST /api/network/upload-pcap
 * @desc Upload and analyze PCAP file
 * @access Private (Admin only)
 */
router.post('/upload-pcap', auth, upload.single('pcap'), async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      // Clean up uploaded file if not admin
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const batchSize = parseInt(req.body.batchSize) || 5000;

    console.log(`📁 PCAP file uploaded: ${fileName} (${req.file.size} bytes)`);
    console.log(`📂 File saved to: ${filePath}`);
    console.log(`📊 Batch size for breakdown: ${batchSize}`);

    // Analyze PCAP file with batch size
    const result = await networkAIService.analyzePCAPFile(filePath, batchSize);

    // Clean up uploaded file after analysis
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️  Cleaned up temporary file: ${filePath}`);
      }
    } catch (cleanupError) {
      console.error('Error cleaning up file:', cleanupError);
    }

    if (result.success) {
      const threats = result.data?.threats || [];

      // Log the PCAP analysis action
      try {
        await logActions.pcapFileAnalyzed(req.user.id, 'analyzed', req, {
          fileName,
          fileSize: req.file.size,
          threatsDetected: threats.length,
          flowsAnalyzed: result.data?.flowsAnalyzed || 0
        });
      } catch (logError) {
        console.error('Failed to log PCAP analysis:', logError);
      }

      // IMPORTANT: Persist each detected threat to MongoDB for dashboard display
      if (threats.length > 0) {
        console.log(`💾 Persisting ${threats.length} threats from PCAP analysis to MongoDB...`);
        let savedCount = 0;

        for (const threat of threats) {
          try {
            // Log each threat to MongoDB
            await logActions.networkThreat(threat, req, {
              source: 'pcap_analysis',
              fileName: fileName,
              analyzedBy: req.user.username || 'system'
            });

            // Emit real-time event for SSE subscribers
            emitNetworkThreat(threat);
            savedCount++;
          } catch (threatLogError) {
            console.error('Failed to log individual threat:', threatLogError);
          }
        }
        console.log(`✅ Persisted ${savedCount}/${threats.length} threats to MongoDB`);
      }

      res.json({
        success: true,
        message: 'PCAP file analyzed successfully',
        threats: threats,
        flowsAnalyzed: result.data?.flowsAnalyzed || 0,
        fileName: fileName,
        analysisTimestamp: result.data?.analysis_timestamp,
        summary: result.data?.summary || {},
        processingTime: result.data?.processing_time || 0
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to analyze PCAP file',
        error: result.error
      });
    }
  } catch (error) {
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file on error:', cleanupError);
      }
    }

    console.error('Error analyzing PCAP file:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route GET /api/network/status
 * @desc Get current network monitoring status
 * @access Private
 */
router.get('/status', auth, async (req, res) => {
  try {
    const monitoringStatus = networkAIService.getMonitoringStatus();
    const healthCheck = await networkAIService.checkServiceHealth();

    res.json({
      success: true,
      status: {
        monitoring: monitoringStatus,
        service: healthCheck,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting network status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route GET /api/network/health
 * @desc Check Python AI service health
 * @access Private
 */
router.get('/health', auth, async (req, res) => {
  try {
    const healthCheck = await networkAIService.checkServiceHealth();

    if (healthCheck.success) {
      res.json({
        success: true,
        healthy: true,
        service: 'Python AI Service',
        status: healthCheck.status,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        success: false,
        healthy: false,
        service: 'Python AI Service',
        error: healthCheck.error,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error checking network service health:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route POST /api/network/test-connection
 * @desc Test connection to Python AI service
 * @access Private (Admin only)
 */
router.post('/test-connection', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const result = await networkAIService.testConnection();

    if (result.success) {
      res.json({
        success: true,
        message: 'Connection test successful',
        data: result
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Connection test failed',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error testing connection:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route GET /api/network/threats/history
 * @desc Get network threats from MongoDB (persisted threats)
 * @access Private
 */
router.get('/threats/history', auth, async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const limitNum = Math.min(parseInt(limit) || 50, 100);

    // Query SecurityLog for network threat actions
    const { SecurityLog } = await import('../models/securityLog.js');

    const threats = await SecurityLog.find({
      action: 'network_threat_detected'
    })
      .sort({ timestamp: -1 })
      .limit(limitNum)
      .lean();

    // Extract threat data from details field
    const threatData = threats.map(log => log.details?.threatData || log.details).filter(Boolean);

    console.log(`📊 Retrieved ${threatData.length} threats from MongoDB`);

    res.json({
      success: true,
      threats: threatData,
      count: threatData.length
    });

  } catch (error) {
    console.error('❌ Error fetching threat history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve threat history',
      error: error.message
    });
  }
});

/**
 * @route POST /api/network/webhook
 * @desc Webhook endpoint to receive threats from Python AI service
 * @access Public (internal service communication)
 */
router.post('/webhook', async (req, res) => {
  try {
    console.log('='.repeat(80));
    console.log('🔗 WEBHOOK RECEIVED from Python AI service');
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
    console.log('='.repeat(80));

    const threatData = req.body;

    // Validate threat data structure
    if (!threatData.threat_id || !threatData.threat_type) {
      console.error('❌ WEBHOOK: Invalid threat data structure - missing threat_id or threat_type');
      return res.status(400).json({
        success: false,
        message: 'Invalid threat data structure'
      });
    }

    // Log threat to MongoDB for persistence
    try {
      await logActions.networkThreat(threatData, req, {
        source: 'python_ai_service',
        detectedBy: 'ml_models'
      });
      console.log(`💾 WEBHOOK: Threat saved to MongoDB: ${threatData.threat_id}`);
    } catch (dbError) {
      console.error(`❌ WEBHOOK: Failed to save to MongoDB:`, dbError);
      // Continue anyway - don't fail the webhook
    }

    // Emit threat event via EventBus for SSE broadcasting
    console.log(`📡 WEBHOOK: Emitting threat event via EventBus...`);
    emitNetworkThreat(threatData);
    console.log(`✅ WEBHOOK: Threat event emitted successfully`);

    // Log the threat (optional - for audit trail)
    console.log(`🚨 WEBHOOK: Threat processed: ${threatData.threat_type} (${threatData.threat_id})`);
    console.log('='.repeat(80));

    res.json({
      success: true,
      message: 'Threat received and broadcasted',
      threat_id: threatData.threat_id
    });

  } catch (error) {
    console.error('❌ WEBHOOK ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
      error: error.message
    });
  }
});

/**
 * @route POST /api/network/clear-threats
 * @desc Clear all network threats from AI service and database
 * @access Private
 */
router.post('/clear-threats', auth, async (req, res) => {
  try {
    console.log('🧹 Clearing all network threats...');

    // Clear threats from AI service
    try {
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
      const response = await fetch(`${aiServiceUrl}/api/clear-threats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ AI service threats cleared:', result.message);
      } else {
        console.warn('⚠️ Failed to clear AI service threats:', response.statusText);
      }
    } catch (aiError) {
      console.error('❌ Error clearing AI service threats:', aiError.message);
    }

    // Clear threats from MongoDB
    try {
      const { SecurityLog } = await import('../models/securityLog.js');

      const deleteResult = await SecurityLog.deleteMany({
        action: 'network_threat_detected'
      });

      console.log(`✅ Cleared ${deleteResult.deletedCount} threats from MongoDB`);
    } catch (dbError) {
      console.error('❌ Error clearing MongoDB threats:', dbError.message);
    }

    res.json({
      success: true,
      message: 'All network threats cleared successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error clearing threats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear threats',
      error: error.message
    });
  }
});

/**
 * @route GET /api/network/stream
 * @desc Server-Sent Events endpoint for real-time threat streaming
 * @access Private
 */
router.get('/stream', (req, res) => {
  // Handle token authentication via query parameter for SSE
  const token = req.query.token;
  if (!token) {
    return res.status(401).json({ error: 'Token required' });
  }

  // Verify token manually since SSE doesn't work well with middleware
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    req.user = decoded;
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
  console.log(`📡 SSE connection established for user: ${req.user.username}`);

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Send initial connection event
  res.write(`data: ${JSON.stringify({
    type: 'connection',
    message: 'Connected to real-time threat stream',
    timestamp: new Date().toISOString(),
    user: req.user.username
  })}\n\n`);

  // Create event handlers for different network events
  const handleNetworkThreat = (eventData) => {
    console.log(`🚨 SSE: Broadcasting threat to client...`);
    console.log(`📊 SSE: Event data:`, JSON.stringify(eventData, null, 2));

    // eventData is already wrapped by emitNetworkThreat with {type, data, timestamp}
    // Extract the actual threat data
    const actualThreatData = eventData.data || eventData;

    res.write(`data: ${JSON.stringify({
      type: 'threat_detected',
      data: actualThreatData,
      timestamp: eventData.timestamp || new Date().toISOString()
    })}\n\n`);
    console.log(`✅ SSE: Threat broadcasted to client - ${actualThreatData.threat_id}`);
  };

  const handleMonitoringEvent = (eventData) => {
    console.log(`📊 Broadcasting monitoring event: ${eventData.type}`);
    res.write(`data: ${JSON.stringify({
      type: 'monitoring_event',
      data: eventData,
      timestamp: new Date().toISOString()
    })}\n\n`);
  };

  const handleModelStats = (statsData) => {
    console.log(`📈 Broadcasting model stats update`);
    res.write(`data: ${JSON.stringify({
      type: 'model_stats',
      data: statsData,
      timestamp: new Date().toISOString()
    })}\n\n`);
  };

  // Register event listeners
  eventBus.on(NETWORK_EVENTS.THREAT_DETECTED, handleNetworkThreat);
  eventBus.on(NETWORK_EVENTS.MONITORING_STARTED, handleMonitoringEvent);
  eventBus.on(NETWORK_EVENTS.MONITORING_STOPPED, handleMonitoringEvent);
  eventBus.on(NETWORK_EVENTS.MODEL_STATS_UPDATED, handleModelStats);

  // Handle client disconnect
  req.on('close', () => {
    console.log(`📡 SSE connection closed for user: ${req.user.username}`);

    // Remove event listeners to prevent memory leaks
    eventBus.removeListener(NETWORK_EVENTS.THREAT_DETECTED, handleNetworkThreat);
    eventBus.removeListener(NETWORK_EVENTS.MONITORING_STARTED, handleMonitoringEvent);
    eventBus.removeListener(NETWORK_EVENTS.MONITORING_STOPPED, handleMonitoringEvent);
    eventBus.removeListener(NETWORK_EVENTS.MODEL_STATS_UPDATED, handleModelStats);
  });

  // Send periodic heartbeat to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(`data: ${JSON.stringify({
      type: 'heartbeat',
      timestamp: new Date().toISOString()
    })}\n\n`);
  }, 30000); // Every 30 seconds

  // Clean up heartbeat on disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
  });
});

export default router;

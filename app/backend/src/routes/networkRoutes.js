import express from 'express';
import networkAIService from '../services/networkAIService.js';
import { authenticateToken as auth } from '../middleware/auth.js';
import { logActions } from '../services/loggingService.js';
import { eventBus, emitNetworkThreat, emitMonitoringEvent, NETWORK_EVENTS } from '../services/eventBus.js';

const router = express.Router();

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
      await logActions.networkMonitoringStarted(req, {
        interface: networkInterface,
        duration,
        monitoringId: result.data?.monitoring_id || 'unknown'
      });

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
      res.status(500).json({
        success: false,
        message: 'Failed to start network monitoring',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error starting network monitoring:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
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
      await logActions.networkMonitoringStopped(req, {
        monitoringId: result.data?.monitoring_id || 'unknown'
      });

      res.json({
        success: true,
        message: 'Network monitoring stopped successfully',
        data: {
          status: 'stopped'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to stop network monitoring',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error stopping network monitoring:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
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
router.post('/upload-pcap', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { filePath } = req.body;

    if (!filePath) {
      return res.status(400).json({
        success: false,
        message: 'File path is required'
      });
    }

    // Analyze PCAP file
    const result = await networkAIService.analyzePCAPFile(filePath);

    if (result.success) {
      // Log the action
      await logActions.pcapFileAnalyzed(req, {
        filePath,
        analysisId: result.data?.analysis_id || 'unknown'
      });

      res.json({
        success: true,
        message: 'PCAP file analyzed successfully',
        analysis: result.analysis
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to analyze PCAP file',
        error: result.error
      });
    }
  } catch (error) {
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
 * @route POST /api/network/webhook
 * @desc Webhook endpoint to receive threats from Python AI service
 * @access Public (internal service communication)
 */
router.post('/webhook', async (req, res) => {
  try {
    console.log('🔗 Webhook received from Python AI service:', req.body);
    
    const threatData = req.body;
    
    // Validate threat data structure
    if (!threatData.threat_id || !threatData.threat_type) {
      return res.status(400).json({
        success: false,
        message: 'Invalid threat data structure'
      });
    }
    
    // Emit threat event via EventBus for SSE broadcasting
    emitNetworkThreat(threatData);
    
    // Log the threat (optional - for audit trail)
    console.log(`🚨 Threat received via webhook: ${threatData.threat_type} (${threatData.threat_id})`);
    
    res.json({
      success: true,
      message: 'Threat received and broadcasted',
      threat_id: threatData.threat_id
    });
    
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
      error: error.message
    });
  }
});

/**
 * @route GET /api/network/stream
 * @desc Server-Sent Events endpoint for real-time threat streaming
 * @access Private
 */
router.get('/stream', auth, (req, res) => {
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
  const handleNetworkThreat = (threatData) => {
    console.log(`🚨 Broadcasting threat: ${threatData.threat_type}`);
    res.write(`data: ${JSON.stringify({
      type: 'threat_detected',
      data: threatData,
      timestamp: new Date().toISOString()
    })}\n\n`);
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

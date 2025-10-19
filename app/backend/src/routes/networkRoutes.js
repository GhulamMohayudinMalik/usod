import express from 'express';
import networkAIService from '../services/networkAIService.js';
import { authenticateToken as auth } from '../middleware/auth.js';
import { logActions } from '../services/loggingService.js';

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

export default router;

/*
 * Blockchain API Routes
 * Provides endpoints for real Hyperledger Fabric blockchain interaction
 */

import express from 'express';
import blockchainService from '../services/blockchainService.js';
import { authenticateToken as auth } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/blockchain/health
 * Check blockchain service health
 */
router.get('/health', async (req, res) => {
  try {
    const isAvailable = await blockchainService.isAvailable();
    res.json({
      status: isAvailable ? 'connected' : 'disconnected',
      network: 'Hyperledger Fabric',
      channel: blockchainService.channelName,
      chaincode: blockchainService.chaincodeName,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      error: error.message 
    });
  }
});

/**
 * GET /api/blockchain/statistics
 * Get blockchain statistics
 */
router.get('/statistics', auth, async (req, res) => {
  try {
    const result = await blockchainService.getStats();
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/blockchain/threats
 * Query all threats from blockchain
 */
router.get('/threats', auth, async (req, res) => {
  try {
    const result = await blockchainService.getAllThreats();
    
    if (result.success) {
      // Sort by timestamp (newest first)
      const sortedData = result.data.sort((a, b) => {
        const dateA = new Date(a.timestamp || a.blockTimestamp);
        const dateB = new Date(b.timestamp || b.blockTimestamp);
        return dateB - dateA; // Descending order (newest first)
      });
      res.json(sortedData);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/blockchain/threats/:logId
 * Get specific threat log from blockchain
 */
router.get('/threats/:logId', auth, async (req, res) => {
  try {
    const result = await blockchainService.getThreatLog(req.params.logId);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(404).json({ error: result.error || 'Threat log not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/blockchain/threats/:logId/verify
 * Verify threat log integrity
 */
router.post('/threats/:logId/verify', auth, async (req, res) => {
  try {
    const { currentData } = req.body;
    
    if (!currentData) {
      return res.status(400).json({ error: 'currentData is required for verification' });
    }
    
    const result = await blockchainService.verifyThreatLog(req.params.logId, currentData);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/blockchain/threats
 * Create threat log manually (for testing)
 */
router.post('/threats', auth, async (req, res) => {
  try {
    const threatData = {
      _id: req.body.logId || `MANUAL_${Date.now()}`,
      action: req.body.logType || 'manual_threat',
      severity: req.body.severity || 'medium',
      details: req.body.threatDetails || {},
      timestamp: new Date()
    };
    
    const result = await blockchainService.logThreat(threatData);
    
    if (result.success) {
      res.status(201).json(result.blockchainData);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

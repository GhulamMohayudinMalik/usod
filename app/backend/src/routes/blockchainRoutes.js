/*
 * Blockchain API Routes
 * Provides endpoints for real Hyperledger Fabric blockchain interaction
 */

import express from 'express';
import blockchainService from '../services/blockchainService.js';
import { authenticateToken as auth } from '../middleware/auth.js';
import { SecurityLog } from '../models/securityLog.js';
import { determineSeverity } from '../services/loggingService.js';

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
 * Verify threat log integrity by comparing MongoDB data with blockchain hash
 * 
 * This is the TAMPER DETECTION mechanism:
 * 1. Fetch the original log from MongoDB
 * 2. Calculate hash from MongoDB data
 * 3. Compare with hash stored in Hyperledger
 * 4. If hashes don't match = MongoDB was TAMPERED
 */
router.post('/threats/:logId/verify', auth, async (req, res) => {
  try {
    const logId = req.params.logId;
    
    // Validate that logId is a valid MongoDB ObjectId format
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(logId);
    if (!isValidObjectId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid log ID format. Only logs created through the system can be verified.',
        tamperStatus: 'invalid_id',
        hint: 'This log may have been created directly in blockchain for testing.'
      });
    }
    
    // Step 1: Fetch the log from MongoDB (the "source of truth" we want to verify)
    const mongoLog = await SecurityLog.findById(logId);
    
    if (!mongoLog) {
      return res.status(404).json({ 
        success: false, 
        error: 'Log not found in MongoDB',
        tamperStatus: 'unknown'
      });
    }
    
    // Step 2: Reconstruct the data structure that was originally hashed
    // This must match EXACTLY how it was hashed when stored in blockchain
    // Severity is calculated the same way as when the log was created
    const calculatedSeverity = determineSeverity(mongoLog.action, mongoLog.status);
    
    const mongoDataForHash = {
      type: mongoLog.action || 'unknown',
      severity: calculatedSeverity,
      sourceIP: mongoLog.ipAddress || 'unknown',
      destinationIP: 'system',  // Always 'system' for security logs
      timestamp: mongoLog.timestamp?.toISOString() || 'unknown'
    };
    
    // Step 3: Calculate hash from MongoDB data
    const mongoHash = blockchainService.calculateHash(mongoDataForHash);
    
    // Step 4: Get the stored hash from blockchain
    const blockchainResult = await blockchainService.getThreatLog(logId);
    
    if (!blockchainResult.success) {
      return res.status(404).json({ 
        success: false, 
        error: 'Log not found in blockchain',
        tamperStatus: 'not_in_blockchain'
      });
    }
    
    const blockchainHash = blockchainResult.data.hash;
    
    // Step 5: Compare hashes
    const isValid = mongoHash === blockchainHash;
    
    res.json({
      success: true,
      valid: isValid,
      tamperStatus: isValid ? 'VERIFIED' : 'TAMPERED',
      mongoHash: mongoHash,
      blockchainHash: blockchainHash,
      logId: logId,
      mongoData: {
        action: mongoLog.action,
        timestamp: mongoLog.timestamp,
        ipAddress: mongoLog.ipAddress,
        severity: mongoLog.details?.severity
      },
      message: isValid 
        ? 'MongoDB data matches blockchain record - integrity verified'
        : 'WARNING: MongoDB data has been modified! Hash mismatch detected.'
    });
    
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      tamperStatus: 'error'
    });
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

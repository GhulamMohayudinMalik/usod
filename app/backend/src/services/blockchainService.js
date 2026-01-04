/**
 * Blockchain Service
 * 
 * Handles all interactions with the Hyperledger Fabric blockchain network
 * for immutable threat logging and verification
 */

import { Gateway, Wallets } from 'fabric-network';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BlockchainService {
  constructor() {
    this.channelName = 'usod-channel';
    this.chaincodeName = 'threat-logger';
    this.walletPath = path.join(__dirname, '../../../../blockchain/wallets');
    this.connectionProfilePath = path.join(__dirname, '../config/connection-profile.json');
    this.identity = 'admin';

    console.log('🔗 Blockchain Service initialized');
    console.log(`   Channel: ${this.channelName}`);
    console.log(`   Chaincode: ${this.chaincodeName}`);
    console.log(`   Wallet: ${this.walletPath}`);
    console.log(`   Connection Profile: ${this.connectionProfilePath}`);
  }

  /**
   * Connect to the blockchain network
   */
  async connect() {
    try {
      // Load connection profile
      const connectionProfile = JSON.parse(
        fs.readFileSync(this.connectionProfilePath, 'utf8')
      );

      // Create wallet instance
      const wallet = await Wallets.newFileSystemWallet(this.walletPath);

      // Check if identity exists in wallet
      const identity = await wallet.get(this.identity);
      if (!identity) {
        throw new Error(`Identity ${this.identity} not found in wallet. Run enrollment first.`);
      }

      // Create gateway instance
      const gateway = new Gateway();

      // Connect to gateway (disable discovery to prevent orderer connection spam)
      await gateway.connect(connectionProfile, {
        wallet,
        identity: this.identity,
        discovery: { enabled: false, asLocalhost: false }
      });

      return gateway;
    } catch (error) {
      console.error('❌ Failed to connect to blockchain:', error.message);
      throw error;
    }
  }

  /**
   * Get the smart contract instance
   */
  async getContract() {
    try {
      const gateway = await this.connect();
      const network = await gateway.getNetwork(this.channelName);
      const contract = network.getContract(this.chaincodeName);

      return { gateway, contract };
    } catch (error) {
      console.error('❌ Failed to get contract:', error.message);
      throw error;
    }
  }

  /**
   * Calculate SHA256 hash of threat data
   * Uses only the 5 core fields for consistent hashing regardless of extra data
   */
  calculateHash(threatData) {
    // Extract only the 5 core fields that are used for hashing
    const coreData = {
      type: threatData.type || threatData.action || 'unknown',
      severity: threatData.severity || 'medium',
      sourceIP: threatData.sourceIP || threatData.details?.sourceIP || 'unknown',
      destinationIP: threatData.destinationIP || threatData.details?.destinationIP || 'unknown',
      timestamp: threatData.timestamp || threatData.details?.timestamp || new Date().toISOString()
    };

    // Create JSON string with only these 5 fields
    const dataString = JSON.stringify(coreData);
    return crypto.createHash('sha256').update(dataString).digest('hex');
  }

  /**
   * Log a threat to the blockchain
   * 
   * @param {Object} threat - Threat object from MongoDB
   * @returns {Promise<Object>} Result of blockchain transaction
   */
  async logThreat(threat) {
    let gateway;

    try {
      // Logging threat to blockchain: ${threat._id}

      // Get contract
      const result = await this.getContract();
      gateway = result.gateway;
      const contract = result.contract;

      // Prepare threat details
      const threatDetails = {
        type: threat.action || threat.threat_type || 'unknown',
        severity: threat.severity || 'medium',
        sourceIP: threat.details?.sourceIP || threat.details?.source_ip || 'unknown',
        destinationIP: threat.details?.destinationIP || threat.details?.destination_ip || 'unknown',
        timestamp: threat.timestamp?.toISOString() || new Date().toISOString(), // ADD TIMESTAMP TO THREATDETAILS
        sourcePort: threat.details?.sourcePort || threat.details?.source_port || 0,
        destinationPort: threat.details?.destinationPort || threat.details?.destination_port || 0,
        protocol: threat.details?.protocol || 'UNKNOWN',
        confidence: threat.details?.confidence || 0,
        aiModel: threat.details?.aiModel || 'unknown',
        description: threat.details?.description || ''
      };

      // Calculate hash
      const hash = this.calculateHash(threatDetails);

      // Submit transaction to blockchain
      const logType = threat.logType || 'network_threat'; // Use provided logType or default
      const detector = threat.detector || 'network_ai_service';

      // Submit transaction - Fabric SDK throws errors even on success
      try {
        await contract.submitTransaction(
          'CreateThreatLog',
          threat._id.toString(),
          logType,
          JSON.stringify(threatDetails),
          hash,
          threat.timestamp?.toISOString() || new Date().toISOString(),
          detector
        );
      } catch (submitError) {
        // Fabric SDK quirk: empty errors array means it actually worked
        if (!submitError.responses || !submitError.errors || submitError.errors.length > 0) {
          throw submitError; // Real error
        }
        // Otherwise, ignore the error and continue
      }

      // Wait 1 second for blockchain to commit
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify the log was actually stored
      const verifyResponse = await contract.evaluateTransaction('ReadThreatLog', threat._id.toString());
      const result_data = JSON.parse(verifyResponse.toString());

      return {
        success: true,
        txId: result_data.logId,
        hash: hash,
        blockchainData: result_data
      };

    } catch (error) {
      // Use process.stderr.write to BYPASS ALL suppression
      process.stderr.write(`\n❌❌❌ [CRITICAL BlockchainService ERROR] ❌❌❌\n`);
      process.stderr.write(`   → Error type: ${error.constructor.name}\n`);
      process.stderr.write(`   → Error message: ${error.message || 'NO MESSAGE'}\n`);

      // Fabric SDK errors have responses and errors arrays
      if (error.responses) {
        process.stderr.write(`   → Responses: ${JSON.stringify(error.responses, null, 2)}\n`);
      }
      if (error.errors) {
        process.stderr.write(`   → Errors array: ${JSON.stringify(error.errors, null, 2)}\n`);
      }

      process.stderr.write(`   → Error string: ${error.toString()}\n`);
      process.stderr.write(`   → Error stack:\n${error.stack || 'NO STACK'}\n`);
      process.stderr.write(`❌❌❌ END ERROR ❌❌❌\n\n`);

      return {
        success: false,
        error: error.message
      };
    } finally {
      if (gateway) {
        gateway.disconnect();
      }
    }
  }

  /**
   * Retrieve a threat log from blockchain
   * 
   * @param {string} logId - MongoDB ObjectId of the threat
   * @returns {Promise<Object>} Threat log from blockchain
   */
  async getThreatLog(logId) {
    let gateway;

    try {
      // Retrieving threat from blockchain: ${logId}

      const result = await this.getContract();
      gateway = result.gateway;
      const contract = result.contract;

      const response = await contract.evaluateTransaction('ReadThreatLog', logId);
      const threatLog = JSON.parse(response.toString());

      // Threat retrieved from blockchain: ${logId}

      return {
        success: true,
        data: threatLog
      };

    } catch (error) {
      console.error('❌ Failed to retrieve threat from blockchain:', error.message);

      return {
        success: false,
        error: error.message
      };
    } finally {
      if (gateway) {
        gateway.disconnect();
      }
    }
  }

  /**
   * Verify the integrity of a threat log
   * 
   * @param {string} logId - MongoDB ObjectId
   * @param {Object} currentThreatData - Current threat data from MongoDB
   * @returns {Promise<Object>} Verification result
   */
  async verifyThreatLog(logId, currentThreatData) {
    let gateway;

    try {
      console.log(`🔍 Verifying threat integrity: ${logId}`);
      console.log(`📊 Raw input data:`, JSON.stringify(currentThreatData, null, 2));

      const result = await this.getContract();
      gateway = result.gateway;
      const contract = result.contract;

      // Reconstruct the threat data structure that was originally stored on blockchain
      // This ensures we're comparing the same data structure
      const reconstructedThreatData = this.reconstructThreatDataForVerification(currentThreatData);

      console.log(`📊 Reconstructed data:`, JSON.stringify(reconstructedThreatData, null, 2));

      // Calculate current hash using the reconstructed data
      const currentHash = this.calculateHash(reconstructedThreatData);

      console.log(`📊 Verification data:`, {
        logId,
        reconstructedData: reconstructedThreatData,
        calculatedHash: currentHash
      });

      // Verify on blockchain
      const response = await contract.evaluateTransaction(
        'VerifyThreatLog',
        logId,
        currentHash
      );

      const verification = JSON.parse(response.toString());

      console.log(`🔍 Threat verification: ${logId} - ${verification.valid ? 'VALID' : 'TAMPERED'}`);
      console.log(`📊 Blockchain response:`, verification);

      // Map chaincode response to frontend-expected format
      return {
        success: true,
        valid: verification.valid,
        originalHash: verification.storedHash,     // Blockchain hash
        currentHash: verification.providedHash,    // Recalculated hash
        logId: verification.logId,
        timestamp: verification.timestamp,
        reconstructedData: reconstructedThreatData // For debugging
      };

    } catch (error) {
      console.error('❌ Failed to verify threat:', error.message);

      return {
        success: false,
        error: error.message
      };
    } finally {
      if (gateway) {
        gateway.disconnect();
      }
    }
  }

  /**
   * Reconstruct threat data for verification to match the original blockchain storage format
   * The frontend now sends the full threat object, so we can access both threatDetails and timestamp
   */
  reconstructThreatDataForVerification(threatObject) {
    // Extract the threatDetails and timestamp from the full threat object
    const threatDetails = threatObject.threatDetails || threatObject;
    const timestamp = threatObject.timestamp || threatDetails.timestamp || 'unknown';

    return {
      type: threatDetails.type || 'unknown',
      severity: threatDetails.severity || 'medium',
      sourceIP: threatDetails.sourceIP || 'unknown',
      destinationIP: threatDetails.destinationIP || 'unknown',
      timestamp: timestamp
    };
  }

  /**
   * Get all threats from blockchain
   */
  async getAllThreats() {
    let gateway;

    try {
      // Fetching all threats from blockchain

      const result = await this.getContract();
      gateway = result.gateway;
      const contract = result.contract;

      const response = await contract.evaluateTransaction('GetAllThreats');
      const threats = JSON.parse(response.toString());

      // Retrieved ${threats.length} threats from blockchain

      return {
        success: true,
        data: threats
      };

    } catch (error) {
      console.error('❌ Failed to get threats from blockchain:', error.message);

      return {
        success: false,
        error: error.message
      };
    } finally {
      if (gateway) {
        gateway.disconnect();
      }
    }
  }

  /**
   * Get blockchain statistics
   */
  async getStats() {
    let gateway;

    try {
      // Fetching blockchain statistics

      const result = await this.getContract();
      gateway = result.gateway;
      const contract = result.contract;

      const response = await contract.evaluateTransaction('GetThreatStats');
      const stats = JSON.parse(response.toString());

      // Retrieved blockchain stats

      return {
        success: true,
        data: stats
      };

    } catch (error) {
      console.error('❌ Failed to get blockchain stats:', error.message);

      return {
        success: false,
        error: error.message
      };
    } finally {
      if (gateway) {
        gateway.disconnect();
      }
    }
  }

  /**
   * Check if blockchain service is available
   */
  async isAvailable() {
    try {
      const gateway = await this.connect();
      gateway.disconnect();
      return true;
    } catch (error) {
      console.warn('⚠️  Blockchain service not available:', error.message);
      return false;
    }
  }
}

// Export singleton instance
const blockchainService = new BlockchainService();
export default blockchainService;


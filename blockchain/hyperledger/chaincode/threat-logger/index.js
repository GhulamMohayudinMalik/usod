/*
 * USOD Threat Logger Chaincode
 * 
 * This chaincode provides immutable logging of security threats
 * detected by the USOD AI-powered network threat detection system.
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class ThreatLoggerContract extends Contract {

    /**
     * Initialize the ledger with sample data (optional)
     */
    async InitLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        
        const threats = [
            {
                logId: 'THREAT001',
                logType: 'network_threat',
                threatDetails: {
                    type: 'port_scan',
                    severity: 'high',
                    sourceIP: '192.168.1.100',
                    destinationIP: '192.168.1.1',
                    sourcePort: 0,
                    destinationPort: 22,
                    protocol: 'TCP',
                    confidence: 0.95,
                    aiModel: 'RandomForest_v1.0'
                },
                hash: 'a1b2c3d4e5f6...',
                timestamp: '2025-10-21T23:00:00Z',
                detector: 'network_ai_service'
            }
        ];

        for (const threat of threats) {
            await ctx.stub.putState(threat.logId, Buffer.from(JSON.stringify(threat)));
            console.info(`Added threat log: ${threat.logId}`);
        }

        console.info('============= END : Initialize Ledger ===========');
    }

    /**
     * Create a new threat log on the blockchain
     * 
     * @param {Context} ctx - Transaction context
     * @param {string} logId - Unique identifier for the log
     * @param {string} logType - Type of log (network_threat, application_attack)
     * @param {string} threatDetailsJSON - JSON string of threat details
     * @param {string} hash - SHA256 hash of threat details for verification
     * @param {string} timestamp - ISO timestamp of when threat was detected
     * @param {string} detector - Name of the service that detected the threat
     */
    async CreateThreatLog(ctx, logId, logType, threatDetailsJSON, hash, timestamp, detector) {
        console.info('============= START : Create Threat Log ===========');

        // Check if log already exists
        const exists = await this.ThreatLogExists(ctx, logId);
        if (exists) {
            throw new Error(`Threat log ${logId} already exists`);
        }

        // Parse threat details
        let threatDetails;
        try {
            threatDetails = JSON.parse(threatDetailsJSON);
        } catch (error) {
            throw new Error(`Invalid threat details JSON: ${error.message}`);
        }

        // Create threat log object
        const threatLog = {
            logId,
            logType,
            threatDetails,
            hash,
            timestamp,
            detector,
            blockTimestamp: new Date().toISOString(), // When it was added to blockchain
            docType: 'threatLog' // For rich queries
        };

        // Store on blockchain
        await ctx.stub.putState(logId, Buffer.from(JSON.stringify(threatLog)));

        // Emit event
        ctx.stub.setEvent('ThreatLogCreated', Buffer.from(JSON.stringify({
            logId,
            logType,
            severity: threatDetails.severity,
            timestamp
        })));

        console.info(`============= END : Create Threat Log ${logId} ===========`);
        return JSON.stringify(threatLog);
    }

    /**
     * Read a threat log from the blockchain
     * 
     * @param {Context} ctx - Transaction context
     * @param {string} logId - Log ID to retrieve
     */
    async ReadThreatLog(ctx, logId) {
        const threatLogJSON = await ctx.stub.getState(logId);
        
        if (!threatLogJSON || threatLogJSON.length === 0) {
            throw new Error(`Threat log ${logId} does not exist`);
        }

        return threatLogJSON.toString();
    }

    /**
     * Check if a threat log exists
     * 
     * @param {Context} ctx - Transaction context
     * @param {string} logId - Log ID to check
     */
    async ThreatLogExists(ctx, logId) {
        const threatLogJSON = await ctx.stub.getState(logId);
        return threatLogJSON && threatLogJSON.length > 0;
    }

    /**
     * Verify the integrity of a threat log
     * 
     * @param {Context} ctx - Transaction context
     * @param {string} logId - Log ID to verify
     * @param {string} expectedHash - Expected hash value
     */
    async VerifyThreatLog(ctx, logId, expectedHash) {
        const threatLogJSON = await ctx.stub.getState(logId);
        
        if (!threatLogJSON || threatLogJSON.length === 0) {
            throw new Error(`Threat log ${logId} does not exist`);
        }

        const threatLog = JSON.parse(threatLogJSON.toString());
        const storedHash = threatLog.hash;
        
        const verification = {
            logId,
            valid: storedHash === expectedHash,
            storedHash,
            providedHash: expectedHash,
            timestamp: new Date().toISOString()
        };

        return JSON.stringify(verification);
    }

    /**
     * Get all threat logs (for small datasets only)
     * For production, use pagination
     */
    async GetAllThreats(ctx) {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        
        let result = await iterator.next();
        
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            
            try {
                record = JSON.parse(strValue);
                // Only include threat logs
                if (record.docType === 'threatLog' || record.logType) {
                    allResults.push(record);
                }
            } catch (err) {
                console.log(err);
            }
            
            result = await iterator.next();
        }
        
        return JSON.stringify(allResults);
    }

    /**
     * Query threats by type
     * 
     * @param {Context} ctx - Transaction context
     * @param {string} threatType - Type of threat (port_scan, dos_attack, etc.)
     */
    async GetThreatsByType(ctx, threatType) {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        
        let result = await iterator.next();
        
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            
            try {
                record = JSON.parse(strValue);
                
                // Filter by threat type
                if (record.threatDetails && record.threatDetails.type === threatType) {
                    allResults.push(record);
                }
            } catch (err) {
                console.log(err);
            }
            
            result = await iterator.next();
        }
        
        return JSON.stringify(allResults);
    }

    /**
     * Query threats by severity
     * 
     * @param {Context} ctx - Transaction context
     * @param {string} severity - Severity level (low, medium, high, critical)
     */
    async GetThreatsBySeverity(ctx, severity) {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        
        let result = await iterator.next();
        
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            
            try {
                record = JSON.parse(strValue);
                
                // Filter by severity
                if (record.threatDetails && record.threatDetails.severity === severity) {
                    allResults.push(record);
                }
            } catch (err) {
                console.log(err);
            }
            
            result = await iterator.next();
        }
        
        return JSON.stringify(allResults);
    }

    /**
     * Query threats by source IP
     * 
     * @param {Context} ctx - Transaction context
     * @param {string} sourceIP - Source IP address
     */
    async GetThreatsBySourceIP(ctx, sourceIP) {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        
        let result = await iterator.next();
        
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            
            try {
                record = JSON.parse(strValue);
                
                // Filter by source IP
                if (record.threatDetails && record.threatDetails.sourceIP === sourceIP) {
                    allResults.push(record);
                }
            } catch (err) {
                console.log(err);
            }
            
            result = await iterator.next();
        }
        
        return JSON.stringify(allResults);
    }

    /**
     * Get threat statistics
     */
    async GetThreatStats(ctx) {
        const allThreats = JSON.parse(await this.GetAllThreats(ctx));
        
        const stats = {
            total: allThreats.length,
            byType: {},
            bySeverity: {},
            byDetector: {},
            timestamp: new Date().toISOString()
        };

        allThreats.forEach(threat => {
            // Count by type
            const type = threat.threatDetails?.type || 'unknown';
            stats.byType[type] = (stats.byType[type] || 0) + 1;

            // Count by severity
            const severity = threat.threatDetails?.severity || 'unknown';
            stats.bySeverity[severity] = (stats.bySeverity[severity] || 0) + 1;

            // Count by detector
            const detector = threat.detector || 'unknown';
            stats.byDetector[detector] = (stats.byDetector[detector] || 0) + 1;
        });

        return JSON.stringify(stats);
    }

    /**
     * Delete a threat log (admin only - use with caution)
     * In production, you typically don't delete from blockchain
     */
    async DeleteThreatLog(ctx, logId) {
        const exists = await this.ThreatLogExists(ctx, logId);
        if (!exists) {
            throw new Error(`Threat log ${logId} does not exist`);
        }

        await ctx.stub.deleteState(logId);
        
        console.info(`Threat log ${logId} deleted`);
        return `Threat log ${logId} deleted successfully`;
    }
}

module.exports = ThreatLoggerContract;


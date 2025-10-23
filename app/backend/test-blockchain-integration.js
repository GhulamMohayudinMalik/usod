/**
 * Test Blockchain Integration
 * Tests the full flow: Backend → Hyperledger Fabric → Query
 */

import blockchainService from './src/services/blockchainService.js';

async function test() {
    console.log('\n🧪 Testing Blockchain Integration\n');
    console.log('='.repeat(60));

    try {
        // Test 1: Health Check
        console.log('\n[TEST 1] Blockchain Health Check');
        const isAvailable = await blockchainService.isAvailable();
        console.log(`   Status: ${isAvailable ? '✅ CONNECTED' : '❌ DISCONNECTED'}`);
        
        if (!isAvailable) {
            throw new Error('Blockchain not available. Please start the network first.');
        }

        // Test 2: Get All Threats
        console.log('\n[TEST 2] Query All Threats from Blockchain');
        const allThreats = await blockchainService.getAllThreats();
        
        if (allThreats.success) {
            console.log(`   ✅ Retrieved ${allThreats.data.length} threats`);
            console.log(`   Threat IDs: ${allThreats.data.map(t => t.logId).join(', ')}`);
        } else {
            console.log(`   ❌ Failed: ${allThreats.error}`);
        }

        // Test 3: Create New Threat Log
        console.log('\n[TEST 3] Create New Threat Log via Backend');
        const newThreat = {
            _id: `INTEGRATION_TEST_${Date.now()}`,
            action: 'brute_force_attack',
            severity: 'critical',
            details: {
                type: 'brute_force_attack',
                severity: 'critical',
                sourceIP: '10.0.0.50',
                destinationIP: '192.168.1.1',
                protocol: 'SSH',
                confidence: 0.98,
                aiModel: 'IsolationForest_v1.0'
            },
            timestamp: new Date()
        };

        const createResult = await blockchainService.logThreat(newThreat);
        
        if (createResult.success) {
            console.log(`   ✅ Threat logged successfully`);
            console.log(`   Transaction ID: ${createResult.txId}`);
            console.log(`   Hash: ${createResult.hash}`);
        } else {
            console.log(`   ❌ Failed: ${createResult.error}`);
        }

        // Test 4: Query Specific Threat
        console.log('\n[TEST 4] Query Specific Threat by ID');
        const queryResult = await blockchainService.getThreatLog(newThreat._id);
        
        if (queryResult.success) {
            console.log(`   ✅ Threat retrieved successfully`);
            console.log(`   Threat Type: ${queryResult.data.logType}`);
            console.log(`   Detector: ${queryResult.data.detector}`);
            console.log(`   Blockchain Timestamp: ${queryResult.data.blockTimestamp}`);
        } else {
            console.log(`   ❌ Failed: ${queryResult.error}`);
        }

        // Test 5: Get Statistics
        console.log('\n[TEST 5] Get Blockchain Statistics');
        const statsResult = await blockchainService.getStats();
        
        if (statsResult.success) {
            console.log(`   ✅ Statistics retrieved`);
            console.log(`   Total Threats: ${statsResult.data.totalThreats}`);
            console.log(`   Critical: ${statsResult.data.bySeverity?.critical || 0}`);
            console.log(`   High: ${statsResult.data.bySeverity?.high || 0}`);
        } else {
            console.log(`   ❌ Failed: ${statsResult.error}`);
        }

        // Test 6: Verify Threat Integrity
        console.log('\n[TEST 6] Verify Threat Log Integrity');
        const verifyResult = await blockchainService.verifyThreatLog(
            newThreat._id,
            newThreat.details
        );
        
        if (verifyResult.success) {
            console.log(`   ${verifyResult.valid ? '✅ VALID' : '❌ TAMPERED'}`);
            console.log(`   Original Hash: ${verifyResult.originalHash}`);
            console.log(`   Current Hash: ${verifyResult.currentHash}`);
        } else {
            console.log(`   ❌ Failed: ${verifyResult.error}`);
        }

        console.log('\n' + '='.repeat(60));
        console.log('🎉 BLOCKCHAIN INTEGRATION TEST COMPLETE!\n');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

test();


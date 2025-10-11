import { getRealIP, isIPBlocked, getBlockedIPs, unblockIP, clearSuspiciousIPs, clearIPAttempts } from '../services/securityDetectionService.js';
import { connectMongoDB } from '../config/database.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function debugSecurity() {
  try {
    // Connect to database
    await connectMongoDB();
    console.log('Connected to MongoDB');

    console.log('🔍 Current Security State:');
    console.log(`- Blocked IPs: ${getBlockedIPs().length}`);
    console.log(`- Blocked IPs list:`, getBlockedIPs());
    
    // Test IP detection
    const testReq = {
      headers: {
        'x-forwarded-for': '127.0.0.1',
        'x-real-ip': '127.0.0.1'
      },
      connection: { remoteAddress: '127.0.0.1' },
      socket: { remoteAddress: '127.0.0.1' },
      ip: '127.0.0.1'
    };
    
    const detectedIP = getRealIP(testReq);
    console.log(`- Detected IP: ${detectedIP}`);
    console.log(`- Is IP blocked: ${isIPBlocked(detectedIP)}`);
    
    // Force unblock all IPs
    console.log('\n🔄 Force unblocking all IPs...');
    const blockedIPs = getBlockedIPs();
    for (const ip of blockedIPs) {
      unblockIP(ip, 'debug_unblock');
    }
    
    // Clear everything
    clearSuspiciousIPs();
    clearIPAttempts();
    
    console.log('\n✅ After unblock:');
    console.log(`- Blocked IPs: ${getBlockedIPs().length}`);
    console.log(`- Is IP blocked: ${isIPBlocked(detectedIP)}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

// Run the debug script
debugSecurity();

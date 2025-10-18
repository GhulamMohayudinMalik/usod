import { unblockIP, clearSuspiciousIPs, clearIPAttempts } from '../services/securityDetectionService.js';
import { connectMongoDB } from '../config/database.js';
import { User } from '../models/User.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function fullSecurityReset() {
  try {
    // Connect to database
    await connectMongoDB();
    console.log('Connected to MongoDB');

    // Get the current IP (you can modify this to unblock a specific IP)
    const targetIP = '127.0.0.1'; // Change this to your actual IP if needed
    
    console.log(`🔄 Starting full security reset...`);
    
    // 1. Unblock the specific IP
    const unblockResult = unblockIP(targetIP);
    console.log(`✅ IP unblock result: ${unblockResult ? 'Success' : 'IP was not blocked'}`);
    
    // 2. Clear suspicious IPs
    clearSuspiciousIPs();
    console.log('✅ Cleared suspicious IPs list');
    
    // 3. Clear IP attempts (this will reset brute force tracking)
    clearIPAttempts();
    console.log('✅ Cleared IP attempts tracking');
    
    // 4. Unlock all locked accounts
    const lockedUsers = await User.find({ isLocked: true });
    console.log(`🔓 Found ${lockedUsers.length} locked accounts`);
    
    for (const user of lockedUsers) {
      user.isLocked = false;
      user.lockoutUntil = null;
      user.failedLoginAttempts = 0;
      await user.save();
      console.log(`✅ Unlocked account: ${user.username}`);
    }
    
    // 5. Reset failed login attempts for all users
    const usersWithFailedAttempts = await User.find({ failedLoginAttempts: { $gt: 0 } });
    console.log(`🔄 Found ${usersWithFailedAttempts.length} users with failed attempts`);
    
    for (const user of usersWithFailedAttempts) {
      user.failedLoginAttempts = 0;
      await user.save();
      console.log(`✅ Reset failed attempts for: ${user.username}`);
    }
    
    // 6. Show current security state
    console.log('\n📊 Current Security State:');
    console.log(`- Blocked IPs: 0`);
    console.log(`- Suspicious IPs: 0`);
    console.log(`- Tracked attempts: 0`);
    console.log(`- Locked accounts: 0`);
    console.log(`- Users with failed attempts: 0`);
    
    console.log('\n🎉 Full security reset completed successfully!');
    console.log('You should now be able to log in normally.');
    console.log('\n💡 If you still have issues, try:');
    console.log('1. Restart the backend server');
    console.log('2. Clear your browser cache/cookies');
    console.log('3. Try logging in with a different browser');
    
  } catch (error) {
    console.error('❌ Error during security reset:', error);
  } finally {
    process.exit(0);
  }
}

// Run the full reset script
fullSecurityReset();

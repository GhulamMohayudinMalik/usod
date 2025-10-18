import fs from 'fs/promises';
import path from 'path';
import { logActions } from './loggingService.js';
import { eventBus } from './eventBus.js';

// Backup configuration
const BACKUP_CONFIG = {
  BACKUP_DIR: process.env.BACKUP_DIR || './backups',
  MAX_BACKUPS: parseInt(process.env.MAX_BACKUPS) || 10,
  BACKUP_RETENTION_DAYS: parseInt(process.env.BACKUP_RETENTION_DAYS) || 30
};

// Ensure backup directory exists
async function ensureBackupDir() {
  try {
    await fs.access(BACKUP_CONFIG.BACKUP_DIR);
  } catch (error) {
    await fs.mkdir(BACKUP_CONFIG.BACKUP_DIR, { recursive: true });
  }
}

// Generate backup filename with timestamp
function generateBackupName(type, extension = 'json') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${type}_backup_${timestamp}.${extension}`;
}

// Get backup file size
async function getBackupSize(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

// Format file size for display
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Create a backup of security logs
export async function createSecurityLogsBackup(userId, req, reason = 'manual') {
  try {
    await ensureBackupDir();
    
    const { SecurityLog } = await import('../models/securityLog.js');
    const logs = await SecurityLog.find({}).sort({ timestamp: -1 });
    
    const backupName = generateBackupName('security_logs');
    const backupPath = path.join(BACKUP_CONFIG.BACKUP_DIR, backupName);
    
    // Create backup data
    const backupData = {
      type: 'security_logs',
      createdAt: new Date().toISOString(),
      recordCount: logs.length,
      data: logs
    };
    
    await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2));
    
    const backupSize = await getBackupSize(backupPath);
    
    // Log backup creation
    await logActions.backupCreated(userId, 'success', req, {
      backupType: 'security_logs',
      backupName,
      backupSize: formatFileSize(backupSize),
      backupLocation: backupPath,
      createdBy: 'system',
      backupReason: reason,
      recordCount: logs.length
    });
    
    // Emit backup created event
    eventBus.emit('backup.created', {
      userId,
      backupType: 'security_logs',
      backupName,
      backupSize,
      recordCount: logs.length,
      timestamp: new Date()
    });
    
    return {
      success: true,
      backupName,
      backupPath,
      backupSize: formatFileSize(backupSize),
      recordCount: logs.length
    };
  } catch (error) {
    console.error('Error creating security logs backup:', error);
    
    // Log backup failure
    await logActions.backupCreated(userId, 'failure', req, {
      backupType: 'security_logs',
      backupName: 'failed',
      backupSize: '0 Bytes',
      backupLocation: 'unknown',
      createdBy: 'system',
      backupReason: reason,
      errorMessage: error.message
    });
    
    throw error;
  }
}

// Create a backup of user data
export async function createUsersBackup(userId, req, reason = 'manual') {
  try {
    await ensureBackupDir();
    
    const { User } = await import('../models/User.js');
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    
    const backupName = generateBackupName('users');
    const backupPath = path.join(BACKUP_CONFIG.BACKUP_DIR, backupName);
    
    // Create backup data (exclude sensitive password data)
    const backupData = {
      type: 'users',
      createdAt: new Date().toISOString(),
      recordCount: users.length,
      data: users.map(user => ({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isLocked: user.isLocked,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }))
    };
    
    await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2));
    
    const backupSize = await getBackupSize(backupPath);
    
    // Log backup creation
    await logActions.backupCreated(userId, 'success', req, {
      backupType: 'users',
      backupName,
      backupSize: formatFileSize(backupSize),
      backupLocation: backupPath,
      createdBy: 'system',
      backupReason: reason,
      recordCount: users.length
    });
    
    // Emit backup created event
    eventBus.emit('backup.created', {
      userId,
      backupType: 'users',
      backupName,
      backupSize,
      recordCount: users.length,
      timestamp: new Date()
    });
    
    return {
      success: true,
      backupName,
      backupPath,
      backupSize: formatFileSize(backupSize),
      recordCount: users.length
    };
  } catch (error) {
    console.error('Error creating users backup:', error);
    
    // Log backup failure
    await logActions.backupCreated(userId, 'failure', req, {
      backupType: 'users',
      backupName: 'failed',
      backupSize: '0 Bytes',
      backupLocation: 'unknown',
      createdBy: 'system',
      backupReason: reason,
      errorMessage: error.message
    });
    
    throw error;
  }
}

// Create a full system backup
export async function createFullBackup(userId, req, reason = 'manual') {
  try {
    await ensureBackupDir();
    
    const { SecurityLog } = await import('../models/securityLog.js');
    const { User } = await import('../models/User.js');
    
    const [logs, users] = await Promise.all([
      SecurityLog.find({}).sort({ timestamp: -1 }),
      User.find({}, '-password').sort({ createdAt: -1 })
    ]);
    
    const backupName = generateBackupName('full_system');
    const backupPath = path.join(BACKUP_CONFIG.BACKUP_DIR, backupName);
    
    // Create comprehensive backup data
    const backupData = {
      type: 'full_system',
      createdAt: new Date().toISOString(),
      version: '1.0',
      recordCounts: {
        securityLogs: logs.length,
        users: users.length
      },
      data: {
        securityLogs: logs,
        users: users.map(user => ({
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          isLocked: user.isLocked,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }))
      }
    };
    
    await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2));
    
    const backupSize = await getBackupSize(backupPath);
    
    // Log backup creation
    await logActions.backupCreated(userId, 'success', req, {
      backupType: 'full_system',
      backupName,
      backupSize: formatFileSize(backupSize),
      backupLocation: backupPath,
      createdBy: 'system',
      backupReason: reason,
      recordCount: logs.length + users.length
    });
    
    // Emit backup created event
    eventBus.emit('backup.created', {
      userId,
      backupType: 'full_system',
      backupName,
      backupSize,
      recordCount: logs.length + users.length,
      timestamp: new Date()
    });
    
    return {
      success: true,
      backupName,
      backupPath,
      backupSize: formatFileSize(backupSize),
      recordCounts: {
        securityLogs: logs.length,
        users: users.length
      }
    };
  } catch (error) {
    console.error('Error creating full backup:', error);
    
    // Log backup failure
    await logActions.backupCreated(userId, 'failure', req, {
      backupType: 'full_system',
      backupName: 'failed',
      backupSize: '0 Bytes',
      backupLocation: 'unknown',
      createdBy: 'system',
      backupReason: reason,
      errorMessage: error.message
    });
    
    throw error;
  }
}

// Restore from backup
export async function restoreFromBackup(userId, backupName, req, reason = 'manual', restoreScope = 'full') {
  try {
    const backupPath = path.join(BACKUP_CONFIG.BACKUP_DIR, backupName);
    
    // Check if backup file exists
    try {
      await fs.access(backupPath);
    } catch (error) {
      throw new Error('Backup file not found');
    }
    
    // Read backup file
    const backupContent = await fs.readFile(backupPath, 'utf8');
    const backupData = JSON.parse(backupContent);
    
    let restoredCount = 0;
    const restoreDetails = {};
    
    if (restoreScope === 'full' || restoreScope === 'security_logs') {
      if (backupData.data.securityLogs) {
        const { SecurityLog } = await import('../models/securityLog.js');
        
        // Clear existing logs if full restore
        if (restoreScope === 'full') {
          await SecurityLog.deleteMany({});
        }
        
        // Restore logs (skip duplicates)
        for (const logData of backupData.data.securityLogs) {
          try {
            const existingLog = await SecurityLog.findById(logData._id);
            if (!existingLog) {
              const log = new SecurityLog(logData);
              await log.save();
              restoredCount++;
            }
          } catch (error) {
            // Skip duplicate key errors
            if (error.code !== 11000) {
              throw error;
            }
          }
        }
        
        restoreDetails.securityLogs = backupData.data.securityLogs.length;
      }
    }
    
    if (restoreScope === 'full' || restoreScope === 'users') {
      if (backupData.data.users) {
        const { User } = await import('../models/User.js');
        
        // Clear existing users if full restore (be careful with this!)
        if (restoreScope === 'full') {
          // Don't delete all users in production - this is dangerous
          console.warn('Full user restore requested - this would delete all existing users');
        }
        
        // Restore users (skip if user already exists)
        for (const userData of backupData.data.users) {
          const existingUser = await User.findById(userData._id);
          if (!existingUser) {
            const user = new User({
              ...userData,
              password: 'restored_user_password_reset_required' // Force password reset
            });
            await user.save();
            restoredCount++;
          }
        }
        
        restoreDetails.users = backupData.data.users.length;
      }
    }
    
    // Log successful restore
    await logActions.backupRestored(userId, 'success', req, {
      backupType: backupData.type,
      backupName,
      backupDate: backupData.createdAt,
      restoredBy: 'system',
      restoreReason: reason,
      restoreScope,
      restoredCount,
      restoreDetails
    });
    
    // Emit backup restored event
    eventBus.emit('backup.restored', {
      userId,
      backupType: backupData.type,
      backupName,
      restoreScope,
      restoredCount,
      timestamp: new Date()
    });
    
    return {
      success: true,
      backupName,
      backupType: backupData.type,
      restoredCount,
      restoreDetails
    };
  } catch (error) {
    console.error('Error restoring from backup:', error);
    
    // Log restore failure
    await logActions.backupRestored(userId, 'failure', req, {
      backupType: 'unknown',
      backupName,
      backupDate: 'unknown',
      restoredBy: 'system',
      restoreReason: reason,
      restoreScope,
      errorMessage: error.message
    });
    
    throw error;
  }
}

// List available backups
export async function listBackups() {
  try {
    await ensureBackupDir();
    
    const files = await fs.readdir(BACKUP_CONFIG.BACKUP_DIR);
    const backups = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(BACKUP_CONFIG.BACKUP_DIR, file);
        const stats = await fs.stat(filePath);
        
        try {
          const content = await fs.readFile(filePath, 'utf8');
          const backupData = JSON.parse(content);
          
          backups.push({
            name: file,
            type: backupData.type || 'unknown',
            createdAt: backupData.createdAt || stats.birthtime.toISOString(),
            size: formatFileSize(stats.size),
            recordCount: backupData.recordCount || 0,
            recordCounts: backupData.recordCounts || {}
          });
        } catch (error) {
          // Skip corrupted backup files
          console.warn(`Skipping corrupted backup file: ${file}`);
        }
      }
    }
    
    return backups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('Error listing backups:', error);
    return [];
  }
}

// Clean up old backups
export async function cleanupOldBackups() {
  try {
    const backups = await listBackups();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - BACKUP_CONFIG.BACKUP_RETENTION_DAYS);
    
    let deletedCount = 0;
    
    for (const backup of backups) {
      const backupDate = new Date(backup.createdAt);
      if (backupDate < cutoffDate) {
        const filePath = path.join(BACKUP_CONFIG.BACKUP_DIR, backup.name);
        await fs.unlink(filePath);
        deletedCount++;
      }
    }
    
    // Also limit total number of backups
    if (backups.length > BACKUP_CONFIG.MAX_BACKUPS) {
      const excessBackups = backups.slice(BACKUP_CONFIG.MAX_BACKUPS);
      for (const backup of excessBackups) {
        const filePath = path.join(BACKUP_CONFIG.BACKUP_DIR, backup.name);
        await fs.unlink(filePath);
        deletedCount++;
      }
    }
    
    console.log(`Cleaned up ${deletedCount} old backup files`);
    return deletedCount;
  } catch (error) {
    console.error('Error cleaning up old backups:', error);
    return 0;
  }
}

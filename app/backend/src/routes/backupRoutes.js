import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { logActions } from '../services/loggingService.js';
import { performSecurityCheck } from '../services/securityDetectionService.js';
import { 
  createSecurityLogsBackup, 
  createUsersBackup, 
  createFullBackup, 
  restoreFromBackup, 
  listBackups,
  cleanupOldBackups
} from '../services/backupService.js';

const router = express.Router();

// All backup routes require authentication and security checks
router.use(performSecurityCheck);
router.use(authenticateToken);

// Create security logs backup
router.post('/security-logs', async (req, res) => {
  try {
    const { reason = 'manual' } = req.body;

    // Check if user has permission (admin only for now)
    if (req.user.role !== 'admin') {
      await logActions.accessDenied(req.user.id, 'failure', req, {
        resource: '/api/backup/security-logs',
        requiredRole: 'admin',
        userRole: req.user.role,
        reason: 'insufficient_permissions'
      });
      
      return res.status(403).json({ message: 'Only admins can create backups' });
    }

    const result = await createSecurityLogsBackup(req.user.id, req, reason);

    res.json({
      message: 'Security logs backup created successfully',
      backup: result
    });
  } catch (error) {
    console.error('Security logs backup error:', error);
    
    await logActions.systemError(req.user.id, 'failure', req, {
      errorCode: 'SECURITY_LOGS_BACKUP_ERROR',
      component: 'backup_service',
      severity: 'high',
      errorMessage: error.message
    });
    
    res.status(500).json({ message: 'Security logs backup failed' });
  }
});

// Create users backup
router.post('/users', async (req, res) => {
  try {
    const { reason = 'manual' } = req.body;

    // Check if user has permission (admin only for now)
    if (req.user.role !== 'admin') {
      await logActions.accessDenied(req.user.id, 'failure', req, {
        resource: '/api/backup/users',
        requiredRole: 'admin',
        userRole: req.user.role,
        reason: 'insufficient_permissions'
      });
      
      return res.status(403).json({ message: 'Only admins can create backups' });
    }

    const result = await createUsersBackup(req.user.id, req, reason);

    res.json({
      message: 'Users backup created successfully',
      backup: result
    });
  } catch (error) {
    console.error('Users backup error:', error);
    
    await logActions.systemError(req.user.id, 'failure', req, {
      errorCode: 'USERS_BACKUP_ERROR',
      component: 'backup_service',
      severity: 'high',
      errorMessage: error.message
    });
    
    res.status(500).json({ message: 'Users backup failed' });
  }
});

// Create full system backup
router.post('/full', async (req, res) => {
  try {
    const { reason = 'manual' } = req.body;

    // Check if user has permission (admin only for now)
    if (req.user.role !== 'admin') {
      await logActions.accessDenied(req.user.id, 'failure', req, {
        resource: '/api/backup/full',
        requiredRole: 'admin',
        userRole: req.user.role,
        reason: 'insufficient_permissions'
      });
      
      return res.status(403).json({ message: 'Only admins can create backups' });
    }

    const result = await createFullBackup(req.user.id, req, reason);

    res.json({
      message: 'Full system backup created successfully',
      backup: result
    });
  } catch (error) {
    console.error('Full backup error:', error);
    
    await logActions.systemError(req.user.id, 'failure', req, {
      errorCode: 'FULL_BACKUP_ERROR',
      component: 'backup_service',
      severity: 'high',
      errorMessage: error.message
    });
    
    res.status(500).json({ message: 'Full backup failed' });
  }
});

// List available backups
router.get('/list', async (req, res) => {
  try {
    // Check if user has permission (admin only for now)
    if (req.user.role !== 'admin') {
      await logActions.accessDenied(req.user.id, 'failure', req, {
        resource: '/api/backup/list',
        requiredRole: 'admin',
        userRole: req.user.role,
        reason: 'insufficient_permissions'
      });
      
      return res.status(403).json({ message: 'Only admins can view backups' });
    }

    const backups = await listBackups();

    res.json({
      message: 'Backups retrieved successfully',
      backups
    });
  } catch (error) {
    console.error('List backups error:', error);
    
    await logActions.systemError(req.user.id, 'failure', req, {
      errorCode: 'LIST_BACKUPS_ERROR',
      component: 'backup_service',
      severity: 'medium',
      errorMessage: error.message
    });
    
    res.status(500).json({ message: 'Failed to list backups' });
  }
});

// Restore from backup
router.post('/restore/:backupName', async (req, res) => {
  try {
    const { backupName } = req.params;
    const { reason = 'manual', restoreScope = 'full' } = req.body;

    // Check if user has permission (admin only for now)
    if (req.user.role !== 'admin') {
      await logActions.accessDenied(req.user.id, 'failure', req, {
        resource: `/api/backup/restore/${backupName}`,
        requiredRole: 'admin',
        userRole: req.user.role,
        reason: 'insufficient_permissions'
      });
      
      return res.status(403).json({ message: 'Only admins can restore backups' });
    }

    // Validate restore scope
    if (!['full', 'security_logs', 'users'].includes(restoreScope)) {
      return res.status(400).json({ 
        message: 'Invalid restore scope. Must be: full, security_logs, or users' 
      });
    }

    const result = await restoreFromBackup(req.user.id, backupName, req, reason, restoreScope);

    res.json({
      message: 'Backup restored successfully',
      restore: result
    });
  } catch (error) {
    console.error('Restore backup error:', error);
    
    await logActions.systemError(req.user.id, 'failure', req, {
      errorCode: 'RESTORE_BACKUP_ERROR',
      component: 'backup_service',
      severity: 'high',
      errorMessage: error.message
    });
    
    res.status(500).json({ message: 'Backup restore failed' });
  }
});

// Cleanup old backups
router.post('/cleanup', async (req, res) => {
  try {
    // Check if user has permission (admin only for now)
    if (req.user.role !== 'admin') {
      await logActions.accessDenied(req.user.id, 'failure', req, {
        resource: '/api/backup/cleanup',
        requiredRole: 'admin',
        userRole: req.user.role,
        reason: 'insufficient_permissions'
      });
      
      return res.status(403).json({ message: 'Only admins can cleanup backups' });
    }

    const deletedCount = await cleanupOldBackups();

    res.json({
      message: 'Backup cleanup completed successfully',
      deletedCount
    });
  } catch (error) {
    console.error('Backup cleanup error:', error);
    
    await logActions.systemError(req.user.id, 'failure', req, {
      errorCode: 'BACKUP_CLEANUP_ERROR',
      component: 'backup_service',
      severity: 'medium',
      errorMessage: error.message
    });
    
    res.status(500).json({ message: 'Backup cleanup failed' });
  }
});

// Get backup statistics
router.get('/stats', async (req, res) => {
  try {
    // Check if user has permission (admin only for now)
    if (req.user.role !== 'admin') {
      await logActions.accessDenied(req.user.id, 'failure', req, {
        resource: '/api/backup/stats',
        requiredRole: 'admin',
        userRole: req.user.role,
        reason: 'insufficient_permissions'
      });
      
      return res.status(403).json({ message: 'Only admins can view backup statistics' });
    }

    const backups = await listBackups();
    
    const stats = {
      totalBackups: backups.length,
      totalSize: backups.reduce((sum, backup) => {
        const sizeInBytes = parseFloat(backup.size) * (backup.size.includes('GB') ? 1024 * 1024 * 1024 : 
                                                      backup.size.includes('MB') ? 1024 * 1024 : 
                                                      backup.size.includes('KB') ? 1024 : 1);
        return sum + sizeInBytes;
      }, 0),
      byType: {},
      oldestBackup: null,
      newestBackup: null
    };

    // Calculate stats by type
    backups.forEach(backup => {
      if (!stats.byType[backup.type]) {
        stats.byType[backup.type] = { count: 0, totalSize: 0 };
      }
      stats.byType[backup.type].count++;
      
      const sizeInBytes = parseFloat(backup.size) * (backup.size.includes('GB') ? 1024 * 1024 * 1024 : 
                                                    backup.size.includes('MB') ? 1024 * 1024 : 
                                                    backup.size.includes('KB') ? 1024 : 1);
      stats.byType[backup.type].totalSize += sizeInBytes;
    });

    // Find oldest and newest backups
    if (backups.length > 0) {
      const sortedBackups = backups.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      stats.oldestBackup = sortedBackups[0];
      stats.newestBackup = sortedBackups[sortedBackups.length - 1];
    }

    // Format total size
    const formatSize = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    stats.totalSizeFormatted = formatSize(stats.totalSize);

    res.json({
      message: 'Backup statistics retrieved successfully',
      stats
    });
  } catch (error) {
    console.error('Backup stats error:', error);
    
    await logActions.systemError(req.user.id, 'failure', req, {
      errorCode: 'BACKUP_STATS_ERROR',
      component: 'backup_service',
      severity: 'low',
      errorMessage: error.message
    });
    
    res.status(500).json({ message: 'Failed to get backup statistics' });
  }
});

export default router;

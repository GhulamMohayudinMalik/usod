import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  RefreshControl,
  Dimensions 
} from 'react-native';
import apiService from '../services/api';

const { width } = Dimensions.get('window');

const BackupScreen = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  const [lastBackup, setLastBackup] = useState(null);
  const [backupStats, setBackupStats] = useState({
    totalBackups: 0,
    totalSize: '0 MB',
    lastBackupTime: null,
    nextScheduledBackup: null
  });


  useEffect(() => {
    fetchBackups();
    fetchBackupStats();
  }, []);

  const fetchBackups = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiService.getBackups();
      setBackups(response.backups || []);
      setLastBackup((response.backups || []).find(b => b.status === 'completed'));
    } catch (error) {
      console.error('Error fetching backups:', error);
      setError(error.message || 'Failed to load backups. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBackupStats = async () => {
    try {
      const response = await apiService.getBackupStats();
      const stats = response.stats;
      setBackupStats({
        totalBackups: stats.totalBackups || 0,
        totalSize: stats.totalSizeFormatted || '0 MB',
        lastBackupTime: stats.newestBackup?.createdAt,
        nextScheduledBackup: null // Not implemented in backend yet
      });
    } catch (error) {
      console.error('Error fetching backup stats:', error);
      // Don't set error for stats, just use defaults
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchBackups(), fetchBackupStats()]);
    } finally {
      setRefreshing(false);
    }
  };

  const createBackup = async (type) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const response = await apiService.createBackup(type, 'manual');
      
      setSuccessMessage(`${type === 'full' ? 'Full' : type === 'security_logs' ? 'Security Logs' : type === 'users' ? 'Users' : 'Incremental'} backup created successfully!`);
      
      // Refresh the backups list to show the new backup
      await fetchBackups();
      await fetchBackupStats();
    } catch (error) {
      console.error('Error creating backup:', error);
      setError(error.message || `Failed to create backup: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const restoreBackup = async (backup) => {
    Alert.alert(
      'Confirm Restore',
      `Are you sure you want to restore "${backup.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Restore', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            setError('');
            setSuccessMessage('');
            
            try {
              await apiService.restoreBackup(backup.name, 'full', 'manual');
              setSuccessMessage('Backup restored successfully!');
              
              // Refresh the backups list
              await fetchBackups();
              await fetchBackupStats();
            } catch (error) {
              console.error('Error restoring backup:', error);
              setError(error.message || `Failed to restore backup: ${error.message}`);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const deleteBackup = async (backup) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete "${backup.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            setError('');
            setSuccessMessage('');
            
            try {
              // Note: Backend doesn't have individual delete endpoint, using cleanup for now
              // In a real implementation, you'd need a DELETE /api/backup/:name endpoint
              setSuccessMessage('Backup deletion feature not yet implemented in backend.');
              await fetchBackups();
              await fetchBackupStats();
            } catch (error) {
              console.error('Error deleting backup:', error);
              setError(error.message || `Failed to delete backup: ${error.message}`);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const cleanupBackups = async () => {
    Alert.alert(
      'Confirm Cleanup',
      'Are you sure you want to cleanup old backups? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Cleanup', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            setError('');
            setSuccessMessage('');
            
            try {
              const response = await apiService.cleanupBackups();
              setSuccessMessage(`Cleanup completed successfully! ${response.deletedCount || 0} old backups removed.`);
              
              // Refresh the backups list
              await fetchBackups();
              await fetchBackupStats();
            } catch (error) {
              console.error('Error cleaning up backups:', error);
              setError(error.message || `Failed to cleanup backups: ${error.message}`);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    if (!status) return '#6B7280';
    switch (status) {
      case 'completed': return '#10B981';
      case 'in_progress': return '#3B82F6';
      case 'failed': return '#EF4444';
      case 'scheduled': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status) => {
    if (!status) return '❓';
    switch (status) {
      case 'completed': return '✅';
      case 'in_progress': return '⏳';
      case 'failed': return '❌';
      case 'scheduled': return '📅';
      default: return '❓';
    }
  };

  const getTypeIcon = (type) => {
    if (!type) return '📁';
    switch (type) {
      case 'full': return '💾';
      case 'incremental': return '📈';
      case 'differential': return '📊';
      case 'security_logs': return '🔒';
      case 'users': return '👥';
      default: return '📁';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>💾 Backup Management</Text>
          <Text style={styles.subtitle}>Manage system backups and data protection</Text>
        </View>

        {/* Messages */}
        {successMessage ? (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        ) : null}
        
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Loading State */}
        {loading && backups.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading backups...</Text>
          </View>
        ) : null}

        {/* Backup Statistics */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>📊 Backup Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📦</Text>
              <Text style={styles.statValue}>{backupStats.totalBackups}</Text>
              <Text style={styles.statLabel}>Total Backups</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>💿</Text>
              <Text style={styles.statValue}>{backupStats.totalSize}</Text>
              <Text style={styles.statLabel}>Total Size</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>⏰</Text>
              <Text style={styles.statValue}>
                {backupStats.lastBackupTime ? 
                  new Date(backupStats.lastBackupTime).toLocaleDateString() : 
                  'Never'
                }
              </Text>
              <Text style={styles.statLabel}>Last Backup</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📅</Text>
              <Text style={styles.statValue}>
                {backupStats.nextScheduledBackup ? 
                  new Date(backupStats.nextScheduledBackup).toLocaleDateString() : 
                  'Not Scheduled'
                }
              </Text>
              <Text style={styles.statLabel}>Next Scheduled</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionButton, styles.fullBackupButton]}
              onPress={() => createBackup('full')}
              disabled={loading}
            >
              <Text style={styles.actionIcon}>💾</Text>
              <Text style={styles.actionTitle}>Full Backup</Text>
              <Text style={styles.actionDescription}>Complete system backup</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.incrementalBackupButton]}
              onPress={() => createBackup('security_logs')}
              disabled={loading}
            >
              <Text style={styles.actionIcon}>📈</Text>
              <Text style={styles.actionTitle}>Security Logs</Text>
              <Text style={styles.actionDescription}>Backup security logs</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.scheduleButton]}
              onPress={() => createBackup('users')}
              disabled={loading}
            >
              <Text style={styles.actionIcon}>👥</Text>
              <Text style={styles.actionTitle}>Users Backup</Text>
              <Text style={styles.actionDescription}>Backup user data</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.settingsButton]}
              onPress={cleanupBackups}
              disabled={loading}
            >
              <Text style={styles.actionIcon}>🧹</Text>
              <Text style={styles.actionTitle}>Cleanup</Text>
              <Text style={styles.actionDescription}>Remove old backups</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Backup History */}
        <View style={styles.historySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📋 Backup History</Text>
            <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
              <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.backupsList}>
            {backups.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No backups found. Create your first backup to get started!</Text>
              </View>
            ) : (
              backups.map((backup, index) => (
                <View key={backup.id || backup.name || `backup-${index}`} style={styles.backupCard}>
                  <View style={styles.backupHeader}>
                    <View style={styles.backupInfo}>
                      <View style={styles.backupTitleRow}>
                        <Text style={styles.backupIcon}>{getTypeIcon(backup.type)}</Text>
                        <Text style={styles.backupName}>{backup.name || 'Unnamed Backup'}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(backup.status || 'completed') }]}>
                          <Text style={styles.statusText}>
                            {getStatusIcon(backup.status || 'completed')} {(backup.status || 'completed').toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.backupDescription}>
                        {backup.description || `${backup.type || 'Unknown'} backup with ${backup.recordCount || 0} records`}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.backupDetails}>
                    <View style={styles.backupDetailRow}>
                      <Text style={styles.backupDetailLabel}>Size:</Text>
                      <Text style={styles.backupDetailValue}>{backup.size || 'Unknown'}</Text>
                    </View>
                    <View style={styles.backupDetailRow}>
                      <Text style={styles.backupDetailLabel}>Type:</Text>
                      <Text style={styles.backupDetailValue}>{backup.type || 'Unknown'}</Text>
                    </View>
                    <View style={styles.backupDetailRow}>
                      <Text style={styles.backupDetailLabel}>Records:</Text>
                      <Text style={styles.backupDetailValue}>{backup.recordCount || 0}</Text>
                    </View>
                    <View style={styles.backupDetailRow}>
                      <Text style={styles.backupDetailLabel}>Created:</Text>
                      <Text style={styles.backupDetailValue}>{formatDate(backup.createdAt)}</Text>
                    </View>
                    {backup.recordCounts && Object.keys(backup.recordCounts).length > 0 && (
                      <View style={styles.backupDetailRow}>
                        <Text style={styles.backupDetailLabel}>Details:</Text>
                        <Text style={styles.backupDetailValue}>
                          {Object.entries(backup.recordCounts).map(([key, count]) => `${key}: ${count}`).join(', ')}
                        </Text>
                      </View>
                    )}
                  </View>


                  <View style={styles.backupActions}>
                    <TouchableOpacity
                      style={styles.restoreButton}
                      onPress={() => restoreBackup(backup)}
                      disabled={loading}
                    >
                      <Text style={styles.restoreButtonText}>🔄 Restore</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteBackup(backup)}
                      disabled={loading}
                    >
                      <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  successContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: '#10B981',
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
  },
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: (width - 40 - 12) / 2,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  actionsSection: {
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: (width - 40 - 12) / 2,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  fullBackupButton: {
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  incrementalBackupButton: {
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  scheduleButton: {
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  settingsButton: {
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  historySection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  refreshButtonText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  backupsList: {
    gap: 16,
  },
  backupCard: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  backupHeader: {
    marginBottom: 12,
  },
  backupInfo: {
    flex: 1,
  },
  backupTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backupIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  backupName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  backupDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  backupDetails: {
    marginBottom: 12,
  },
  backupDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  backupDetailLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  backupDetailValue: {
    fontSize: 12,
    color: '#D1D5DB',
    fontWeight: '500',
  },
  progressSection: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  backupActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  restoreButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  restoreButtonText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  deleteButtonText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default BackupScreen;
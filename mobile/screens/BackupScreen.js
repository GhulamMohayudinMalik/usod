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

const { width } = Dimensions.get('window');

const BackupScreen = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);
  const [lastBackup, setLastBackup] = useState(null);
  const [backupStats, setBackupStats] = useState({
    totalBackups: 0,
    totalSize: '0 MB',
    lastBackupTime: null,
    nextScheduledBackup: null
  });

  // Dummy backup data
  const dummyBackups = [
    {
      id: 1,
      name: 'Full System Backup',
      type: 'full',
      status: 'completed',
      size: '2.4 GB',
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      completedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 minutes ago
      duration: '5m 23s',
      description: 'Complete system backup including all data and configurations'
    },
    {
      id: 2,
      name: 'Security Logs Backup',
      type: 'incremental',
      status: 'completed',
      size: '156 MB',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 3).toISOString(), // 2 hours ago + 3 minutes
      duration: '3m 12s',
      description: 'Incremental backup of security logs and audit trails'
    },
    {
      id: 3,
      name: 'User Data Backup',
      type: 'incremental',
      status: 'completed',
      size: '89 MB',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 6 + 1000 * 60 * 2).toISOString(), // 6 hours ago + 2 minutes
      duration: '2m 45s',
      description: 'Incremental backup of user profiles and settings'
    },
    {
      id: 4,
      name: 'Database Backup',
      type: 'full',
      status: 'in_progress',
      size: '0 MB',
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
      completedAt: null,
      duration: null,
      description: 'Full database backup in progress',
      progress: 65
    },
    {
      id: 5,
      name: 'Configuration Backup',
      type: 'incremental',
      status: 'failed',
      size: '0 MB',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
      completedAt: null,
      duration: null,
      description: 'Configuration backup failed due to insufficient storage space',
      error: 'Insufficient storage space'
    }
  ];

  useEffect(() => {
    fetchBackups();
    calculateBackupStats();
  }, []);

  const fetchBackups = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        setBackups(dummyBackups);
        setLastBackup(dummyBackups.find(b => b.status === 'completed'));
      }, 1000);
    } catch (error) {
      console.error('Error fetching backups:', error);
    }
  };

  const calculateBackupStats = () => {
    const completedBackups = dummyBackups.filter(b => b.status === 'completed');
    const totalSize = completedBackups.reduce((sum, backup) => {
      const sizeInMB = parseFloat(backup.size.replace(' MB', '').replace(' GB', ''));
      return sum + (backup.size.includes('GB') ? sizeInMB * 1024 : sizeInMB);
    }, 0);

    setBackupStats({
      totalBackups: completedBackups.length,
      totalSize: totalSize > 1024 ? `${(totalSize / 1024).toFixed(1)} GB` : `${totalSize.toFixed(1)} MB`,
      lastBackupTime: lastBackup?.completedAt,
      nextScheduledBackup: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString() // 6 hours from now
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      fetchBackups();
      calculateBackupStats();
      setRefreshing(false);
    }, 1500);
  };

  const createBackup = async (type) => {
    setLoading(true);
    setError(null);
    setSuccessMessage('');
    
    try {
      // Simulate backup creation
      setTimeout(() => {
        const newBackup = {
          id: Date.now(),
          name: `${type === 'full' ? 'Full System' : 'Incremental'} Backup`,
          type,
          status: 'in_progress',
          size: '0 MB',
          createdAt: new Date().toISOString(),
          completedAt: null,
          duration: null,
          description: `${type === 'full' ? 'Complete system backup' : 'Incremental backup'} initiated`,
          progress: 0
        };
        
        setBackups(prev => [newBackup, ...prev]);
        setSuccessMessage(`${type === 'full' ? 'Full' : 'Incremental'} backup started successfully!`);
        setLoading(false);
        
        // Simulate backup completion after 10 seconds
        setTimeout(() => {
          setBackups(prev => prev.map(backup => 
            backup.id === newBackup.id 
              ? {
                  ...backup,
                  status: 'completed',
                  size: type === 'full' ? '2.1 GB' : '45 MB',
                  completedAt: new Date().toISOString(),
                  duration: '4m 32s',
                  progress: undefined
                }
              : backup
          ));
          calculateBackupStats();
        }, 10000);
      }, 2000);
    } catch (error) {
      setError(`Failed to create backup: ${error.message}`);
      setLoading(false);
    }
  };

  const restoreBackup = async (backupId) => {
    Alert.alert(
      'Confirm Restore',
      'Are you sure you want to restore this backup? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Restore', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            setError(null);
            setSuccessMessage('');
            
            try {
              // Simulate restore process
              setTimeout(() => {
                setSuccessMessage('Backup restored successfully!');
                setLoading(false);
              }, 3000);
            } catch (error) {
              setError(`Failed to restore backup: ${error.message}`);
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const deleteBackup = async (backupId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this backup? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setBackups(prev => prev.filter(backup => backup.id !== backupId));
              setSuccessMessage('Backup deleted successfully!');
              calculateBackupStats();
            } catch (error) {
              setError(`Failed to delete backup: ${error.message}`);
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'in_progress': return '#3B82F6';
      case 'failed': return '#EF4444';
      case 'scheduled': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'in_progress': return '⏳';
      case 'failed': return '❌';
      case 'scheduled': return '📅';
      default: return '❓';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'full': return '💾';
      case 'incremental': return '📈';
      case 'differential': return '📊';
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
              onPress={() => createBackup('incremental')}
              disabled={loading}
            >
              <Text style={styles.actionIcon}>📈</Text>
              <Text style={styles.actionTitle}>Incremental</Text>
              <Text style={styles.actionDescription}>Backup changes only</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.scheduleButton]}
              onPress={() => Alert.alert('Schedule Backup', 'Backup scheduling feature coming soon!')}
              disabled={loading}
            >
              <Text style={styles.actionIcon}>📅</Text>
              <Text style={styles.actionTitle}>Schedule</Text>
              <Text style={styles.actionDescription}>Set up automatic backups</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.settingsButton]}
              onPress={() => Alert.alert('Backup Settings', 'Backup settings feature coming soon!')}
              disabled={loading}
            >
              <Text style={styles.actionIcon}>⚙️</Text>
              <Text style={styles.actionTitle}>Settings</Text>
              <Text style={styles.actionDescription}>Configure backup options</Text>
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
              backups.map((backup) => (
                <View key={backup.id} style={styles.backupCard}>
                  <View style={styles.backupHeader}>
                    <View style={styles.backupInfo}>
                      <View style={styles.backupTitleRow}>
                        <Text style={styles.backupIcon}>{getTypeIcon(backup.type)}</Text>
                        <Text style={styles.backupName}>{backup.name}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(backup.status) }]}>
                          <Text style={styles.statusText}>
                            {getStatusIcon(backup.status)} {backup.status.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.backupDescription}>{backup.description}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.backupDetails}>
                    <View style={styles.backupDetailRow}>
                      <Text style={styles.backupDetailLabel}>Size:</Text>
                      <Text style={styles.backupDetailValue}>{backup.size}</Text>
                    </View>
                    <View style={styles.backupDetailRow}>
                      <Text style={styles.backupDetailLabel}>Created:</Text>
                      <Text style={styles.backupDetailValue}>{formatDate(backup.createdAt)}</Text>
                    </View>
                    {backup.completedAt && (
                      <View style={styles.backupDetailRow}>
                        <Text style={styles.backupDetailLabel}>Completed:</Text>
                        <Text style={styles.backupDetailValue}>{formatDate(backup.completedAt)}</Text>
                      </View>
                    )}
                    {backup.duration && (
                      <View style={styles.backupDetailRow}>
                        <Text style={styles.backupDetailLabel}>Duration:</Text>
                        <Text style={styles.backupDetailValue}>{backup.duration}</Text>
                      </View>
                    )}
                    {backup.error && (
                      <View style={styles.backupDetailRow}>
                        <Text style={styles.backupDetailLabel}>Error:</Text>
                        <Text style={[styles.backupDetailValue, { color: '#EF4444' }]}>{backup.error}</Text>
                      </View>
                    )}
                  </View>

                  {backup.status === 'in_progress' && backup.progress !== undefined && (
                    <View style={styles.progressSection}>
                      <View style={styles.progressBar}>
                        <View 
                          style={[
                            styles.progressFill, 
                            { width: `${backup.progress}%` }
                          ]} 
                        />
                      </View>
                      <Text style={styles.progressText}>{backup.progress}% Complete</Text>
                    </View>
                  )}

                  <View style={styles.backupActions}>
                    {backup.status === 'completed' && (
                      <TouchableOpacity
                        style={styles.restoreButton}
                        onPress={() => restoreBackup(backup.id)}
                        disabled={loading}
                      >
                        <Text style={styles.restoreButtonText}>🔄 Restore</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteBackup(backup.id)}
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
});

export default BackupScreen;
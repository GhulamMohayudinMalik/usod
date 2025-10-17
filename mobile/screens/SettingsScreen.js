import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  RefreshControl,
  Dimensions 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/api';

const { width } = Dimensions.get('window');

const SettingsScreen = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile settings
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: ''
  });
  
  // Security settings - removed non-functional settings
  const [securitySettings, setSecuritySettings] = useState({
    // Note: These settings are not actually enforced by the backend
    // They only log changes but don't affect actual behavior
  });
  
  // Notification settings - removed non-functional settings
  const [notificationSettings, setNotificationSettings] = useState({
    // Note: These settings are not actually enforced by the backend
    // They only log changes but don't affect actual behavior
  });

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

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError('');
    
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setProfile(user);
        setProfileForm({
          username: user.username,
          email: user.email
        });
      } else {
        throw new Error('No user data found');
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await apiService.updateProfile(profileForm);
      
      setSuccessMessage('Profile updated successfully!');
      
      // Update AsyncStorage with new user data
      const updatedUser = { ...profile, ...response.user };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setProfile(updatedUser);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSecuritySettingsUpdate = async () => {
    // Removed - these settings are not actually enforced by the backend
    setSuccessMessage('Security settings functionality removed - these settings were not actually enforced by the backend.');
  };

  const handleNotificationSettingsUpdate = async () => {
    // Removed - these settings are not actually enforced by the backend
    setSuccessMessage('Notification settings functionality removed - these settings were not actually enforced by the backend.');
  };

  const onRefresh = async () => {
    await fetchUserProfile();
  };

  const TabButton = ({ id, name, icon, isActive, onPress }) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        isActive && styles.activeTabButton
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.tabButtonText,
        isActive && styles.activeTabButtonText
      ]}>
        {icon} {name}
      </Text>
    </TouchableOpacity>
  );

  const ToggleSwitch = ({ value, onValueChange }) => (
    <TouchableOpacity
      style={[
        styles.toggleSwitch,
        value && styles.toggleSwitchActive
      ]}
      onPress={() => onValueChange(!value)}
    >
      <View style={[
        styles.toggleThumb,
        value && styles.toggleThumbActive
      ]} />
    </TouchableOpacity>
  );

  if (loading && !profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>⚙️ Settings</Text>
          <Text style={styles.subtitle}>Manage your account settings and preferences</Text>
        </View>

        {/* Success/Error Messages */}
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

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tabRow}>
              <TabButton
                id="profile"
                name="Profile"
                icon="👤"
                isActive={activeTab === 'profile'}
                onPress={() => setActiveTab('profile')}
              />
              <TabButton
                id="security"
                name="Security"
                icon="🔒"
                isActive={activeTab === 'security'}
                onPress={() => setActiveTab('security')}
              />
              <TabButton
                id="notifications"
                name="Notifications"
                icon="🔔"
                isActive={activeTab === 'notifications'}
                onPress={() => setActiveTab('notifications')}
              />
              <TabButton
                id="system"
                name="System"
                icon="⚙️"
                isActive={activeTab === 'system'}
                onPress={() => setActiveTab('system')}
              />
            </View>
          </ScrollView>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <View style={styles.tabSection}>
              <Text style={styles.sectionTitle}>Profile Information</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Username</Text>
                <TextInput
                  style={styles.textInput}
                  value={profileForm.username}
                  onChangeText={(value) => setProfileForm({...profileForm, username: value})}
                  placeholder="Enter username"
                  placeholderTextColor="#6B7280"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.textInput}
                  value={profileForm.email}
                  onChangeText={(value) => setProfileForm({...profileForm, email: value})}
                  placeholder="Enter email"
                  placeholderTextColor="#6B7280"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Role:</Text>
                <Text style={styles.infoValue}>{profile?.role}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>User ID:</Text>
                <Text style={styles.infoValue}>{profile?.id}</Text>
              </View>

              <TouchableOpacity
                style={styles.updateButton}
                onPress={handleProfileUpdate}
                disabled={loading}
              >
                <Text style={styles.updateButtonText}>
                  {loading ? 'Updating...' : 'Update Profile'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Security Tab - Removed non-functional settings */}
          {activeTab === 'security' && (
            <View style={styles.tabSection}>
              <Text style={styles.sectionTitle}>Security Settings</Text>
              
              <View style={styles.warningContainer}>
                <Text style={styles.warningText}>
                  Security settings have been removed as they were not actually enforced by the backend. 
                  These settings only logged changes but did not affect actual system behavior.
                </Text>
              </View>
            </View>
          )}

          {/* Notifications Tab - Removed non-functional settings */}
          {activeTab === 'notifications' && (
            <View style={styles.tabSection}>
              <Text style={styles.sectionTitle}>Notification Preferences</Text>
              
              <View style={styles.warningContainer}>
                <Text style={styles.warningText}>
                  Notification settings have been removed as they were not actually enforced by the backend. 
                  These settings only logged changes but did not affect actual system behavior.
                </Text>
              </View>
            </View>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <View style={styles.tabSection}>
              <Text style={styles.sectionTitle}>System Information</Text>
              
              <View style={styles.infoCard}>
                <Text style={styles.infoCardTitle}>Application Info</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Version:</Text>
                  <Text style={styles.infoValue}>1.0.0</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Environment:</Text>
                  <Text style={styles.infoValue}>Development</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Last Updated:</Text>
                  <Text style={styles.infoValue}>{new Date().toLocaleDateString()}</Text>
                </View>
              </View>
              
              <View style={styles.infoCard}>
                <Text style={styles.infoCardTitle}>User Statistics</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Account Created:</Text>
                  <Text style={styles.infoValue}>{new Date().toLocaleDateString()}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Last Login:</Text>
                  <Text style={styles.infoValue}>{new Date().toLocaleDateString()}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Total Logins:</Text>
                  <Text style={styles.infoValue}>1</Text>
                </View>
              </View>
            </View>
          )}
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
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
  tabContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    marginBottom: 16,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderBottomWidth: 2,
    borderBottomColor: '#10B981',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  activeTabButtonText: {
    color: '#10B981',
  },
  tabContent: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    padding: 16,
  },
  tabSection: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D1D5DB',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  selectContainer: {
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 8,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  selectArrow: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#D1D5DB',
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: 'rgba(55, 65, 81, 0.3)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55, 65, 81, 0.3)',
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    backgroundColor: '#374151',
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleSwitchActive: {
    backgroundColor: '#10B981',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  updateButton: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  warningContainer: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 8,
    padding: 12,
  },
  warningText: {
    color: '#F59E0B',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default SettingsScreen;
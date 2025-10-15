import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  Alert,
  RefreshControl,
  Dimensions 
} from 'react-native';

const { width } = Dimensions.get('window');

const SettingsScreen = () => {
  const [settings, setSettings] = useState({
    // General Settings
    theme: 'dark',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginNotifications: true,
    securityAlerts: true,
    ipWhitelist: false,
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    threatAlerts: true,
    systemUpdates: true,
    maintenanceAlerts: true,
    
    // Privacy Settings
    dataCollection: true,
    analytics: true,
    crashReporting: true,
    personalizedAds: false,
    
    // System Settings
    autoUpdates: true,
    backupFrequency: 'daily',
    logRetention: 30,
    debugMode: false,
    performanceMode: false
  });

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Simulate loading settings from API
      setTimeout(() => {
        // Settings are already initialized with default values
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading settings:', error);
      setError('Failed to load settings');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      loadSettings();
      setRefreshing(false);
    }, 1500);
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSuccessMessage(`Setting updated: ${key}`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        setSuccessMessage('All settings saved successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }, 2000);
    } catch (error) {
      setLoading(false);
      setError('Failed to save settings');
    }
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to their default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            setSettings({
              theme: 'dark',
              language: 'en',
              timezone: 'UTC',
              dateFormat: 'MM/DD/YYYY',
              timeFormat: '12h',
              twoFactorAuth: false,
              sessionTimeout: 30,
              passwordExpiry: 90,
              loginNotifications: true,
              securityAlerts: true,
              ipWhitelist: false,
              emailNotifications: true,
              pushNotifications: true,
              smsNotifications: false,
              threatAlerts: true,
              systemUpdates: true,
              maintenanceAlerts: true,
              dataCollection: true,
              analytics: true,
              crashReporting: true,
              personalizedAds: false,
              autoUpdates: true,
              backupFrequency: 'daily',
              logRetention: 30,
              debugMode: false,
              performanceMode: false
            });
            setSuccessMessage('Settings reset to defaults!');
            setTimeout(() => setSuccessMessage(''), 3000);
          }
        }
      ]
    );
  };

  const SettingItem = ({ title, description, value, onValueChange, type = 'switch' }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {description && <Text style={styles.settingDescription}>{description}</Text>}
      </View>
      <View style={styles.settingControl}>
        {type === 'switch' ? (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: '#374151', true: '#3B82F6' }}
            thumbColor={value ? '#FFFFFF' : '#9CA3AF'}
          />
        ) : (
          <TouchableOpacity style={styles.valueButton} onPress={onValueChange}>
            <Text style={styles.valueButtonText}>{value}</Text>
            <Text style={styles.valueButtonArrow}>→</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const SettingSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

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
          <Text style={styles.title}>⚙️ Settings</Text>
          <Text style={styles.subtitle}>Customize your application preferences</Text>
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

        {/* General Settings */}
        <SettingSection title="🌐 General">
          <SettingItem
            title="Theme"
            description="Choose your preferred color theme"
            value={settings.theme}
            type="button"
            onValueChange={() => Alert.alert('Theme', 'Theme selection feature coming soon!')}
          />
          <SettingItem
            title="Language"
            description="Select your preferred language"
            value={settings.language}
            type="button"
            onValueChange={() => Alert.alert('Language', 'Language selection feature coming soon!')}
          />
          <SettingItem
            title="Timezone"
            description="Set your local timezone"
            value={settings.timezone}
            type="button"
            onValueChange={() => Alert.alert('Timezone', 'Timezone selection feature coming soon!')}
          />
          <SettingItem
            title="Date Format"
            description="Choose how dates are displayed"
            value={settings.dateFormat}
            type="button"
            onValueChange={() => Alert.alert('Date Format', 'Date format selection feature coming soon!')}
          />
          <SettingItem
            title="Time Format"
            description="Choose 12-hour or 24-hour time format"
            value={settings.timeFormat}
            type="button"
            onValueChange={() => Alert.alert('Time Format', 'Time format selection feature coming soon!')}
          />
        </SettingSection>

        {/* Security Settings */}
        <SettingSection title="🔒 Security">
          <SettingItem
            title="Two-Factor Authentication"
            description="Add an extra layer of security to your account"
            value={settings.twoFactorAuth}
            onValueChange={(value) => updateSetting('twoFactorAuth', value)}
          />
          <SettingItem
            title="Login Notifications"
            description="Get notified when someone logs into your account"
            value={settings.loginNotifications}
            onValueChange={(value) => updateSetting('loginNotifications', value)}
          />
          <SettingItem
            title="Security Alerts"
            description="Receive alerts for security-related events"
            value={settings.securityAlerts}
            onValueChange={(value) => updateSetting('securityAlerts', value)}
          />
          <SettingItem
            title="IP Whitelist"
            description="Restrict access to specific IP addresses"
            value={settings.ipWhitelist}
            onValueChange={(value) => updateSetting('ipWhitelist', value)}
          />
          <SettingItem
            title="Session Timeout"
            description="Automatically log out after inactivity"
            value={`${settings.sessionTimeout} minutes`}
            type="button"
            onValueChange={() => Alert.alert('Session Timeout', 'Session timeout configuration coming soon!')}
          />
          <SettingItem
            title="Password Expiry"
            description="Require password changes periodically"
            value={`${settings.passwordExpiry} days`}
            type="button"
            onValueChange={() => Alert.alert('Password Expiry', 'Password expiry configuration coming soon!')}
          />
        </SettingSection>

        {/* Notification Settings */}
        <SettingSection title="🔔 Notifications">
          <SettingItem
            title="Email Notifications"
            description="Receive notifications via email"
            value={settings.emailNotifications}
            onValueChange={(value) => updateSetting('emailNotifications', value)}
          />
          <SettingItem
            title="Push Notifications"
            description="Receive push notifications on your device"
            value={settings.pushNotifications}
            onValueChange={(value) => updateSetting('pushNotifications', value)}
          />
          <SettingItem
            title="SMS Notifications"
            description="Receive notifications via SMS"
            value={settings.smsNotifications}
            onValueChange={(value) => updateSetting('smsNotifications', value)}
          />
          <SettingItem
            title="Threat Alerts"
            description="Get notified about security threats"
            value={settings.threatAlerts}
            onValueChange={(value) => updateSetting('threatAlerts', value)}
          />
          <SettingItem
            title="System Updates"
            description="Notifications about system updates"
            value={settings.systemUpdates}
            onValueChange={(value) => updateSetting('systemUpdates', value)}
          />
          <SettingItem
            title="Maintenance Alerts"
            description="Notifications about scheduled maintenance"
            value={settings.maintenanceAlerts}
            onValueChange={(value) => updateSetting('maintenanceAlerts', value)}
          />
        </SettingSection>

        {/* Privacy Settings */}
        <SettingSection title="🔐 Privacy">
          <SettingItem
            title="Data Collection"
            description="Allow collection of usage data to improve the service"
            value={settings.dataCollection}
            onValueChange={(value) => updateSetting('dataCollection', value)}
          />
          <SettingItem
            title="Analytics"
            description="Help improve the app by sharing anonymous usage statistics"
            value={settings.analytics}
            onValueChange={(value) => updateSetting('analytics', value)}
          />
          <SettingItem
            title="Crash Reporting"
            description="Automatically send crash reports to help fix bugs"
            value={settings.crashReporting}
            onValueChange={(value) => updateSetting('crashReporting', value)}
          />
          <SettingItem
            title="Personalized Ads"
            description="Show personalized advertisements based on your interests"
            value={settings.personalizedAds}
            onValueChange={(value) => updateSetting('personalizedAds', value)}
          />
        </SettingSection>

        {/* System Settings */}
        <SettingSection title="⚙️ System">
          <SettingItem
            title="Auto Updates"
            description="Automatically download and install updates"
            value={settings.autoUpdates}
            onValueChange={(value) => updateSetting('autoUpdates', value)}
          />
          <SettingItem
            title="Backup Frequency"
            description="How often to create automatic backups"
            value={settings.backupFrequency}
            type="button"
            onValueChange={() => Alert.alert('Backup Frequency', 'Backup frequency configuration coming soon!')}
          />
          <SettingItem
            title="Log Retention"
            description="How long to keep system logs"
            value={`${settings.logRetention} days`}
            type="button"
            onValueChange={() => Alert.alert('Log Retention', 'Log retention configuration coming soon!')}
          />
          <SettingItem
            title="Debug Mode"
            description="Enable detailed logging for troubleshooting"
            value={settings.debugMode}
            onValueChange={(value) => updateSetting('debugMode', value)}
          />
          <SettingItem
            title="Performance Mode"
            description="Optimize for better performance (may reduce features)"
            value={settings.performanceMode}
            onValueChange={(value) => updateSetting('performanceMode', value)}
          />
        </SettingSection>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveSettings}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : '💾 Save All Settings'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetToDefaults}
            disabled={loading}
          >
            <Text style={styles.resetButtonText}>🔄 Reset to Defaults</Text>
          </TouchableOpacity>
        </View>

        {/* App Information */}
        <View style={styles.appInfoSection}>
          <Text style={styles.appInfoTitle}>📱 App Information</Text>
          <View style={styles.appInfoContent}>
            <View style={styles.appInfoRow}>
              <Text style={styles.appInfoLabel}>Version:</Text>
              <Text style={styles.appInfoValue}>1.0.0</Text>
            </View>
            <View style={styles.appInfoRow}>
              <Text style={styles.appInfoLabel}>Build:</Text>
              <Text style={styles.appInfoValue}>2024.01.15</Text>
            </View>
            <View style={styles.appInfoRow}>
              <Text style={styles.appInfoLabel}>Platform:</Text>
              <Text style={styles.appInfoValue}>React Native</Text>
            </View>
            <TouchableOpacity 
              style={styles.aboutButton}
              onPress={() => Alert.alert('About', 'USOD Security Platform\nVersion 1.0.0\n\nA comprehensive security management solution.')}
            >
              <Text style={styles.aboutButtonText}>ℹ️ About</Text>
            </TouchableOpacity>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  sectionContent: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55, 65, 81, 0.3)',
  },
  settingContent: {
    flex: 1,
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
  settingControl: {
    marginLeft: 16,
  },
  valueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  valueButtonText: {
    color: '#D1D5DB',
    fontSize: 14,
    marginRight: 8,
  },
  valueButtonArrow: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  actionsSection: {
    marginBottom: 24,
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  resetButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  appInfoSection: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  appInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  appInfoContent: {
    gap: 12,
  },
  appInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appInfoLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  appInfoValue: {
    fontSize: 14,
    color: '#D1D5DB',
    fontWeight: '500',
  },
  aboutButton: {
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  aboutButtonText: {
    color: '#D1D5DB',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SettingsScreen;
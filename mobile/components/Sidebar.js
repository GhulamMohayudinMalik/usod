import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const Sidebar = ({ visible, onClose, onNavigate, activeRoute, user }) => {
  // Get safe area insets for proper padding on notched devices
  const insets = useSafeAreaInsets ? useSafeAreaInsets() : { top: 0, bottom: 0 };

  const navigationItems = [
    { name: 'Dashboard', route: 'Dashboard', icon: '📊' },
    { name: 'AI Network Monitoring', route: 'NetworkMonitoring', icon: '📡' },
    { name: 'Blockchain Ledger', route: 'BlockchainLedger', icon: '🔗' },
    { name: 'AI Packet Analyzer', route: 'PcapAnalyzer', icon: '📦' },
    { name: 'Logs Analysis', route: 'Logs', icon: '📋' },
    { name: 'Threat Analysis', route: 'Threats', icon: '⚠️' },
    { name: 'Analytics', route: 'Analytics', icon: '📈' },
    { name: 'AI Insights', route: 'AIInsights', icon: '🤖' },
    { name: 'Security Lab', route: 'SecurityLab', icon: '🧪' },
    { name: 'Security Management', route: 'Security', icon: '🔒' },
    { name: 'IP Tracer', route: 'IPTracer', icon: '🌍' },
    { name: 'User Management', route: 'Users', icon: '👥' },
    { name: 'Backup Management', route: 'Backup', icon: '💾' },
    { name: 'Change Password', route: 'ChangePassword', icon: '🔑' },
    { name: 'Settings', route: 'Settings', icon: '⚙️' },
  ];

  const handleNavigation = (routeName) => {
    onNavigate(routeName);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.sidebar}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>🛡️</Text>
            </View>
            <View style={styles.logoTextContainer}>
              <Text style={styles.logoText}>USOD</Text>
              <Text style={styles.logoSubtext}>Unified Security Operations Dashboard</Text>
            </View>
          </View>

          {/* Navigation Items */}
          <ScrollView
            style={styles.navigationContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {navigationItems.map((item, index) => {
              const isActive = activeRoute === item.route;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.navItem,
                    isActive && styles.activeNavItem,
                  ]}
                  onPress={() => handleNavigation(item.route)}
                >
                  <Text style={styles.navIcon}>{item.icon}</Text>
                  <Text style={[
                    styles.navText,
                    isActive && styles.activeNavText,
                  ]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.userInfo}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user?.username || 'User'}</Text>
                <Text style={styles.userEmail}>{user?.email || 'user@usod.com'}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={() => handleNavigation('Login')}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>▼</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    width: width * 0.8,
    maxWidth: 300,
    backgroundColor: '#1F2937',
    borderRightWidth: 1,
    borderRightColor: 'rgba(55, 65, 81, 0.5)',
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  backdrop: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55, 65, 81, 0.5)',
    alignItems: 'center',
  },
  logoContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#10B981',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoTextContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  logoIcon: {
    fontSize: 24,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  logoSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 57,
    top: '50%',
    marginTop: -15,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(31, 41, 55, 0.95)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.6)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#E5E7EB',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  navigationContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 15,
    paddingBottom: 20,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 12,
    marginVertical: 1,
    borderRadius: 8,
  },
  activeNavItem: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  navIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  navText: {
    fontSize: 15,
    color: '#D1D5DB',
    fontWeight: '500',
  },
  activeNavText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  footer: {
    padding: 14,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(55, 65, 81, 0.5)',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userAvatar: {
    width: 40,
    height: 40,
    backgroundColor: '#10B981',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userEmail: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginTop: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default Sidebar;

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

const DashboardScreen = ({ username = 'User' }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Text style={styles.successIconText}>✅</Text>
          </View>
          <Text style={styles.successTitle}>Login Successful!</Text>
          <Text style={styles.successMessage}>
            You have successfully logged into the USOD mobile application.
          </Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Security Dashboard</Text>
          <Text style={styles.infoText}>
            This is your unified security operations dashboard. From here you can monitor security events, manage users, and access various security tools.
          </Text>
          <Text style={styles.infoText}>
            The mobile app provides a streamlined interface for quick access to critical security information while on the go.
          </Text>
          <Text style={styles.infoText}>
            All your security data is synchronized with the main USOD system for real-time monitoring and response.
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>24/7</Text>
            <Text style={styles.statLabel}>Monitoring</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>99.9%</Text>
            <Text style={styles.statLabel}>Uptime</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>Real-time</Text>
            <Text style={styles.statLabel}>Alerts</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  successContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  successIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#10B981',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successIconText: {
    fontSize: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 24,
  },
  infoContainer: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#E5E7EB',
    lineHeight: 22,
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#D1D5DB',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default DashboardScreen;

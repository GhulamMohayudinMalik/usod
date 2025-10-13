import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const LogsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Logs Analysis</Text>
      <Text style={styles.subtitle}>This is the Logs page</Text>
      <Text style={styles.description}>
        View and analyze system logs, security events, and audit trails. 
        Search through log entries and monitor system activities.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#10B981',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
});

export default LogsScreen;

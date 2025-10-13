import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SecurityScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Security Management</Text>
      <Text style={styles.subtitle}>This is the Security page</Text>
      <Text style={styles.description}>
        Configure security policies, monitor security status, and manage 
        security configurations. View security alerts and compliance status.
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

export default SecurityScreen;

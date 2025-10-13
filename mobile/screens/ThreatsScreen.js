import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ThreatsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Threat Analysis</Text>
      <Text style={styles.subtitle}>This is the Threats page</Text>
      <Text style={styles.description}>
        Monitor and analyze security threats in real-time. View threat intelligence, 
        security alerts, and threat detection results.
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

export default ThreatsScreen;

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ChangePasswordScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Change Password</Text>
      <Text style={styles.subtitle}>This is the Change Password page</Text>
      <Text style={styles.description}>
        Update your account password and security settings. Configure password 
        policies and manage authentication preferences.
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

export default ChangePasswordScreen;

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import apiService from '../services/api';

const ChangePasswordScreen = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: []
  });

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'newPassword') {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password) => {
    let score = 0;
    const feedback = [];

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('At least 8 characters');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Lowercase letter');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Uppercase letter');
    }

    if (/[0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Number');
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Special character');
    }

    setPasswordStrength({ score, feedback });
  };

  const getPasswordStrengthColor = (score) => {
    if (score <= 2) return '#EF4444';
    if (score <= 3) return '#F59E0B';
    if (score <= 4) return '#3B82F6';
    return '#10B981';
  };

  const getPasswordStrengthText = (score) => {
    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Fair';
    if (score <= 4) return 'Good';
    return 'Strong';
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    setError('');
    
    if (!formData.currentPassword) {
      setError('Please enter your current password');
      return false;
    }

    if (!formData.newPassword) {
      setError('Please enter a new password');
      return false;
    }

    if (formData.newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return false;
    }

    if (passwordStrength.score < 3) {
      setError('New password is too weak. Please choose a stronger password');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return false;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError('New password must be different from current password');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await apiService.changePassword(formData.currentPassword, formData.newPassword);
      
      setSuccess('Password changed successfully!');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordStrength({ score: 0, feedback: [] });
    } catch (error) {
      console.error('Error changing password:', error);
      setError(error.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>🔐 Change Password</Text>
            <Text style={styles.subtitle}>Update your account password for better security</Text>
          </View>

          {/* Security Tips */}
          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>💡 Password Security Tips</Text>
            <View style={styles.tipsList}>
              <Text style={styles.tipItem}>• Use at least 8 characters</Text>
              <Text style={styles.tipItem}>• Include uppercase and lowercase letters</Text>
              <Text style={styles.tipItem}>• Add numbers and special characters</Text>
              <Text style={styles.tipItem}>• Avoid common words or personal information</Text>
              <Text style={styles.tipItem}>• Don't reuse passwords from other accounts</Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            {/* Current Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={formData.currentPassword}
                  onChangeText={(value) => handleInputChange('currentPassword', value)}
                  placeholder="Enter your current password"
                  placeholderTextColor="#6B7280"
                  secureTextEntry={!showPasswords.current}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => togglePasswordVisibility('current')}
                >
                  <Text style={styles.eyeButtonText}>
                    {showPasswords.current ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={formData.newPassword}
                  onChangeText={(value) => handleInputChange('newPassword', value)}
                  placeholder="Enter your new password"
                  placeholderTextColor="#6B7280"
                  secureTextEntry={!showPasswords.new}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => togglePasswordVisibility('new')}
                >
                  <Text style={styles.eyeButtonText}>
                    {showPasswords.new ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <View style={styles.passwordStrengthContainer}>
                  <View style={styles.passwordStrengthBar}>
                    <View 
                      style={[
                        styles.passwordStrengthFill,
                        { 
                          width: `${(passwordStrength.score / 5) * 100}%`,
                          backgroundColor: getPasswordStrengthColor(passwordStrength.score)
                        }
                      ]}
                    />
                  </View>
                  <Text style={[
                    styles.passwordStrengthText,
                    { color: getPasswordStrengthColor(passwordStrength.score) }
                  ]}>
                    {getPasswordStrengthText(passwordStrength.score)}
                  </Text>
                </View>
              )}

              {/* Password Requirements */}
              {formData.newPassword && passwordStrength.feedback.length > 0 && (
                <View style={styles.requirementsContainer}>
                  <Text style={styles.requirementsTitle}>Password Requirements:</Text>
                  {passwordStrength.feedback.map((requirement, index) => (
                    <Text key={index} style={styles.requirementItem}>
                      • {requirement}
                    </Text>
                  ))}
                </View>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  placeholder="Confirm your new password"
                  placeholderTextColor="#6B7280"
                  secureTextEntry={!showPasswords.confirm}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => togglePasswordVisibility('confirm')}
                >
                  <Text style={styles.eyeButtonText}>
                    {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <View style={styles.matchIndicator}>
                  <Text style={[
                    styles.matchText,
                    { 
                      color: formData.newPassword === formData.confirmPassword ? '#10B981' : '#EF4444'
                    }
                  ]}>
                    {formData.newPassword === formData.confirmPassword ? '✅ Passwords match' : '❌ Passwords do not match'}
                  </Text>
                </View>
              )}
            </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Success Message */}
            {success ? (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>{success}</Text>
              </View>
            ) : null}

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                (loading || formData.newPassword !== formData.confirmPassword || formData.newPassword.length < 8 || passwordStrength.score < 3) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={loading || formData.newPassword !== formData.confirmPassword || formData.newPassword.length < 8 || passwordStrength.score < 3}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Changing Password...' : 'Change Password'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Additional Security Options */}
          <View style={styles.securityOptionsSection}>
            <Text style={styles.sectionTitle}>🛡️ Additional Security</Text>
            <View style={styles.securityOptionsList}>
              <TouchableOpacity 
                style={styles.securityOption}
                onPress={() => Alert.alert('Two-Factor Authentication', '2FA setup feature coming soon!')}
              >
                <Text style={styles.securityOptionIcon}>🔐</Text>
                <View style={styles.securityOptionContent}>
                  <Text style={styles.securityOptionTitle}>Two-Factor Authentication</Text>
                  <Text style={styles.securityOptionDescription}>Add an extra layer of security to your account</Text>
                </View>
                <Text style={styles.securityOptionArrow}>→</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.securityOption}
                onPress={() => Alert.alert('Security Questions', 'Security questions setup feature coming soon!')}
              >
                <Text style={styles.securityOptionIcon}>❓</Text>
                <View style={styles.securityOptionContent}>
                  <Text style={styles.securityOptionTitle}>Security Questions</Text>
                  <Text style={styles.securityOptionDescription}>Set up security questions for account recovery</Text>
                </View>
                <Text style={styles.securityOptionArrow}>→</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.securityOption}
                onPress={() => Alert.alert('Login History', 'Login history feature coming soon!')}
              >
                <Text style={styles.securityOptionIcon}>📊</Text>
                <View style={styles.securityOptionContent}>
                  <Text style={styles.securityOptionTitle}>Login History</Text>
                  <Text style={styles.securityOptionDescription}>View recent login activity and sessions</Text>
                </View>
                <Text style={styles.securityOptionArrow}>→</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  content: {
    padding: 16,
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
  tipsSection: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  tipsList: {
    gap: 4,
  },
  tipItem: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
  },
  formSection: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  eyeButton: {
    padding: 12,
  },
  eyeButtonText: {
    fontSize: 18,
  },
  passwordStrengthContainer: {
    marginTop: 8,
  },
  passwordStrengthBar: {
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  passwordStrengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  passwordStrengthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  requirementsContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(55, 65, 81, 0.3)',
    borderRadius: 6,
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D1D5DB',
    marginBottom: 4,
  },
  requirementItem: {
    fontSize: 11,
    color: '#9CA3AF',
    lineHeight: 16,
  },
  matchIndicator: {
    marginTop: 8,
  },
  matchText: {
    fontSize: 12,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#6B7280',
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  securityOptionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  securityOptionsList: {
    gap: 12,
  },
  securityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  securityOptionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  securityOptionContent: {
    flex: 1,
  },
  securityOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  securityOptionDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  securityOptionArrow: {
    fontSize: 18,
    color: '#9CA3AF',
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
});

export default ChangePasswordScreen;
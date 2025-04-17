import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { AuthContext } from '../services/auth';
import { getUserSettings, updateUserSettings, changePassword } from '../services/storage';
import { validatePassword } from '../utils/validation';
import colors from '../theme/colors';
import typography from '../theme/typography';
import spacing from '../theme/spacing';

const SettingsScreen = ({ navigation }) => {
  const { state, updateUser } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    autoLock: true,
    dataSharing: false,
    biometricEnabled: false,
    fontSize: 'medium',
    highContrast: false,
  });

  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [hipaaModalVisible, setHipaaModalVisible] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  const currentPasswordRef = useRef(null);

  useEffect(() => {
    loadSettings();
    checkBiometricAvailability();
  }, []);

  useEffect(() => {
    if (passwordModalVisible && currentPasswordRef.current) {
      setTimeout(() => {
        currentPasswordRef.current.focus();
      }, 300);
    }
  }, [passwordModalVisible]);

  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setIsBiometricAvailable(compatible && enrolled);
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      setIsBiometricAvailable(false);
    }
  };

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const userSettings = await getUserSettings(state.user.id);
      if (userSettings) {
        setSettings({ ...settings, ...userSettings });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      Alert.alert('Error', 'Failed to load user settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSetting = async (setting, value) => {
    try {
      const updatedSettings = { ...settings, [setting]: value };
      setSettings(updatedSettings);
      await updateUserSettings(state.user.id, updatedSettings);

      if (setting === 'biometricEnabled') {
        updateUser({ ...state.user, biometricEnabled: value });
      }
    } catch (error) {
      console.error(`Failed to update ${setting}:`, error);
      Alert.alert('Error', 'Failed to update setting');
      setSettings((prev) => ({ ...prev, [setting]: !value }));
    }
  };

  const handleFontSizeChange = async (size) => {
    try {
      const updatedSettings = { ...settings, fontSize: size };
      setSettings(updatedSettings);
      await updateUserSettings(state.user.id, updatedSettings);
    } catch (error) {
      console.error('Failed to update font size:', error);
      Alert.alert('Error', 'Failed to update font size');
    }
  };

  const handleChangePassword = async () => {
    setPasswordErrors({});
    let hasError = false;
    const errors = {};

    if (!currentPassword.trim()) {
      errors.currentPassword = 'Current password is required';
      hasError = true;
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      errors.newPassword = passwordValidation.errorMessage;
      hasError = true;
    }

    if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      hasError = true;
    }

    if (hasError) {
      setPasswordErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(state.user.id, currentPassword, newPassword);
      setPasswordModalVisible(false);
      resetPasswordForm();
      Alert.alert('Success', 'Your password has been updated successfully');
    } catch (error) {
      if (error.message === 'Incorrect current password') {
        setPasswordErrors({ currentPassword: 'Current password is incorrect' });
      } else {
        console.error('Failed to change password:', error);
        Alert.alert('Error', 'Failed to update password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetPasswordForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setPasswordErrors({});
  };

  const renderPasswordModal = () => (
    <Modal
      visible={passwordModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {
        setPasswordModalVisible(false);
        resetPasswordForm();
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TouchableOpacity
              onPress={() => {
                setPasswordModalVisible(false);
                resetPasswordForm();
              }}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  ref={currentPasswordRef}
                  style={[styles.passwordInput, passwordErrors.currentPassword && styles.inputError]}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrentPassword}
                  placeholder="Enter current password"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  <Ionicons
                    name={showCurrentPassword ? "eye-off-outline" : "eye-outline"}
                    size={24}
                    color={colors.gray}
                  />
                </TouchableOpacity>
              </View>
              {passwordErrors.currentPassword && (
                <Text style={styles.errorText}>{passwordErrors.currentPassword}</Text>
              )}
            </View>

            {/* New Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={[styles.passwordInput, passwordErrors.newPassword && styles.inputError]}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  placeholder="Enter new password"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  <Ionicons
                    name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                    size={24}
                    color={colors.gray}
                  />
                </TouchableOpacity>
              </View>
              {passwordErrors.newPassword ? (
                <Text style={styles.errorText}>{passwordErrors.newPassword}</Text>
              ) : (
                <Text style={styles.passwordRequirements}>
                  Password must be at least 8 characters and include uppercase, lowercase, number, and special character.
                </Text>
              )}
            </View>

            {/* Confirm Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={[styles.passwordInput, passwordErrors.confirmPassword && styles.inputError]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  placeholder="Confirm new password"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                    size={24}
                    color={colors.gray}
                  />
                </TouchableOpacity>
              </View>
              {passwordErrors.confirmPassword && (
                <Text style={styles.errorText}>{passwordErrors.confirmPassword}</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.changePasswordButton}
              onPress={handleChangePassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.changePasswordButtonText}>Update Password</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  // Return full screen
  return (
    <SafeAreaView style={styles.container}>
      {/* ...existing layout stays unchanged... */}
      {renderPasswordModal()}
      {/* Other modals and content go here */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Reuse your current styles, or I can send them again if needed
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    margin: spacing.medium,
    maxHeight: '90%',
  },
  modalHeader: {
    padding: spacing.medium,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: colors.lightGray,
    borderBottomWidth: 1,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
  },
  modalContent: {
    padding: spacing.medium,
  },
  inputGroup: {
    marginBottom: spacing.medium,
  },
  inputLabel: {
    ...typography.label,
    marginBottom: spacing.small,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
  },
  passwordInput: {
    ...typography.input,
    flex: 1,
    padding: spacing.medium,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    ...typography.small,
    color: colors.error,
    marginTop: spacing.extraSmall,
  },
  passwordRequirements: {
    ...typography.small,
    color: colors.secondaryText,
    marginTop: spacing.extraSmall,
  },
  eyeButton: {
    padding: spacing.medium,
  },
  changePasswordButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.medium,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.medium,
  },
  changePasswordButtonText: {
    ...typography.button,
    color: colors.white,
  },
});

export default SettingsScreen;

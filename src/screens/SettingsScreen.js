import React, { useState, useContext, useEffect } from 'react';
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
  
  // Password change modal state
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});

  // Privacy modal state
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  
  // HIPAA modal state
  const [hipaaModalVisible, setHipaaModalVisible] = useState(false);
  
  // Biometric availability
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  useEffect(() => {
    loadSettings();
    checkBiometricAvailability();
  }, []);

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
        setSettings({
          ...settings,
          ...userSettings
        });
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
      const updatedSettings = {
        ...settings,
        [setting]: value,
      };
      
      setSettings(updatedSettings);
      await updateUserSettings(state.user.id, updatedSettings);
      
      // Update user biometric setting in auth context if needed
      if (setting === 'biometricEnabled') {
        updateUser({
          ...state.user,
          biometricEnabled: value,
        });
      }
    } catch (error) {
      console.error(`Failed to update ${setting}:`, error);
      Alert.alert('Error', 'Failed to update setting');
      // Revert the setting change on error
      setSettings(prevSettings => ({
        ...prevSettings,
        [setting]: !value
      }));
    }
  };

  const handleFontSizeChange = async (size) => {
    try {
      const updatedSettings = {
        ...settings,
        fontSize: size,
      };
      
      setSettings(updatedSettings);
      await updateUserSettings(state.user.id, updatedSettings);
    } catch (error) {
      console.error('Failed to update font size:', error);
      Alert.alert('Error', 'Failed to update font size');
    }
  };

  const handleChangePassword = async () => {
    // Reset errors
    setPasswordErrors({});
    
    // Validate inputs
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
        setPasswordErrors({
          currentPassword: 'Current password is incorrect'
        });
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

  const exportData = async () => {
    Alert.alert(
      'Export Health Data',
      'This will prepare all your health records for export. The data will be encrypted and password protected.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Export', 
          onPress: async () => {
            setIsLoading(true);
            try {
              // In a real app, this would actually export the data
              setTimeout(() => {
                setIsLoading(false);
                Alert.alert(
                  'Export Complete',
                  'Your health data has been exported successfully. You can find the encrypted file in your downloads folder.'
                );
              }, 2000);
            } catch (error) {
              console.error('Failed to export data:', error);
              setIsLoading(false);
              Alert.alert('Error', 'Failed to export health data');
            }
          }
        }
      ]
    );
  };

  const deleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Account', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirm Deletion',
              'Please type "DELETE" to confirm account deletion',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Proceed',
                  style: 'destructive',
                  onPress: () => {
                    // In a real app, this would delete the account
                    // For this demo, we'll just show a confirmation
                    Alert.alert(
                      'Account Scheduled for Deletion',
                      'Your account has been scheduled for deletion. You will receive an email confirmation when the process is complete.'
                    );
                  }
                }
              ],
              { cancelable: false }
            );
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholderRight} />
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Dark Mode</Text>
              <Text style={styles.settingDescription}>Switch to dark color theme</Text>
            </View>
            <Switch
              trackColor={{ false: colors.lightGray, true: colors.primaryLight }}
              thumbColor={settings.darkMode ? colors.primary : colors.gray}
              onValueChange={(value) => handleToggleSetting('darkMode', value)}
              value={settings.darkMode}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Notifications</Text>
              <Text style={styles.settingDescription}>Enable push notifications</Text>
            </View>
            <Switch
              trackColor={{ false: colors.lightGray, true: colors.primaryLight }}
              thumbColor={settings.notifications ? colors.primary : colors.gray}
              onValueChange={(value) => handleToggleSetting('notifications', value)}
              value={settings.notifications}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Automatic Lock</Text>
              <Text style={styles.settingDescription}>Lock app when inactive</Text>
            </View>
            <Switch
              trackColor={{ false: colors.lightGray, true: colors.primaryLight }}
              thumbColor={settings.autoLock ? colors.primary : colors.gray}
              onValueChange={(value) => handleToggleSetting('autoLock', value)}
              value={settings.autoLock}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Font Size</Text>
              <Text style={styles.settingDescription}>Adjust text size for readability</Text>
            </View>
            <View style={styles.fontSizeButtons}>
              <TouchableOpacity 
                style={[
                  styles.fontSizeButton, 
                  settings.fontSize === 'small' && styles.fontSizeButtonSelected
                ]}
                onPress={() => handleFontSizeChange('small')}
              >
                <Text style={[
                  styles.fontSizeButtonText,
                  settings.fontSize === 'small' && styles.fontSizeButtonTextSelected
                ]}>
                  A
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.fontSizeButton, 
                  settings.fontSize === 'medium' && styles.fontSizeButtonSelected
                ]}
                onPress={() => handleFontSizeChange('medium')}
              >
                <Text style={[
                  styles.fontSizeButtonText,
                  { fontSize: 16 },
                  settings.fontSize === 'medium' && styles.fontSizeButtonTextSelected
                ]}>
                  A
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.fontSizeButton, 
                  settings.fontSize === 'large' && styles.fontSizeButtonSelected
                ]}
                onPress={() => handleFontSizeChange('large')}
              >
                <Text style={[
                  styles.fontSizeButtonText,
                  { fontSize: 20 },
                  settings.fontSize === 'large' && styles.fontSizeButtonTextSelected
                ]}>
                  A
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>High Contrast</Text>
              <Text style={styles.settingDescription}>Improve visibility with higher contrast</Text>
            </View>
            <Switch
              trackColor={{ false: colors.lightGray, true: colors.primaryLight }}
              thumbColor={settings.highContrast ? colors.primary : colors.gray}
              onValueChange={(value) => handleToggleSetting('highContrast', value)}
              value={settings.highContrast}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Biometric Authentication</Text>
              <Text style={styles.settingDescription}>Use fingerprint or face ID to log in</Text>
            </View>
            <Switch
              trackColor={{ false: colors.lightGray, true: colors.primaryLight }}
              thumbColor={settings.biometricEnabled ? colors.primary : colors.gray}
              onValueChange={(value) => handleToggleSetting('biometricEnabled', value)}
              value={settings.biometricEnabled}
              disabled={!isBiometricAvailable}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setPasswordModalVisible(true)}
          >
            <View style={styles.actionButtonContent}>
              <Ionicons name="lock-closed-outline" size={24} color={colors.primary} />
              <Text style={styles.actionButtonText}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Data</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Anonymous Data Sharing</Text>
              <Text style={styles.settingDescription}>Share anonymous usage data to help improve the app</Text>
            </View>
            <Switch
              trackColor={{ false: colors.lightGray, true: colors.primaryLight }}
              thumbColor={settings.dataSharing ? colors.primary : colors.gray}
              onValueChange={(value) => handleToggleSetting('dataSharing', value)}
              value={settings.dataSharing}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setPrivacyModalVisible(true)}
          >
            <View style={styles.actionButtonContent}>
              <MaterialIcons name="privacy-tip" size={24} color={colors.primary} />
              <Text style={styles.actionButtonText}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setHipaaModalVisible(true)}
          >
            <View style={styles.actionButtonContent}>
              <Ionicons name="shield-checkmark-outline" size={24} color={colors.primary} />
              <Text style={styles.actionButtonText}>HIPAA Compliance</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={exportData}
          >
            <View style={styles.actionButtonContent}>
              <Ionicons name="download-outline" size={24} color={colors.primary} />
              <Text style={styles.actionButtonText}>Export Health Data</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.dangerSection}>
          <TouchableOpacity 
            style={styles.deleteAccountButton}
            onPress={deleteAccount}
          >
            <Text style={styles.deleteAccountButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>MagdaRecords v1.0.0</Text>
        </View>
      </ScrollView>
      
      {/* Change Password Modal */}
      <Modal
        visible={passwordModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setPasswordModalVisible(false);
          resetPasswordForm();
        }}
      >
        <View style={styles.modalOverlay}>
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
            
            <ScrollView style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Current Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
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
        </View>
      </Modal>
      
      {/* Privacy Policy Modal */}
      <Modal
        visible={privacyModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPrivacyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Privacy Policy</Text>
              <TouchableOpacity onPress={() => setPrivacyModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <Text style={styles.policyTitle}>MagdaRecords Privacy Policy</Text>
              <Text style={styles.policyDate}>Last updated: June 1, 2023</Text>
              
              <Text style={styles.policySection}>1. Information We Collect</Text>
              <Text style={styles.policyText}>
                MagdaRecords collects personal and health information that you provide directly to us, including:
              </Text>
              <Text style={styles.policyBullet}>• Personal identifiers (name, date of birth, email)</Text>
              <Text style={styles.policyBullet}>• Health records and medical information</Text>
              <Text style={styles.policyBullet}>• Healthcare provider information</Text>
              
              <Text style={styles.policySection}>2. How We Use Your Information</Text>
              <Text style={styles.policyText}>
                We use your information to:
              </Text>
              <Text style={styles.policyBullet}>• Provide and maintain our services</Text>
              <Text style={styles.policyBullet}>• Store and manage your medical records</Text>
              <Text style={styles.policyBullet}>• Generate health insights and recommendations</Text>
              <Text style={styles.policyBullet}>• Improve our services</Text>
              
              <Text style={styles.policySection}>3. Data Security</Text>
              <Text style={styles.policyText}>
                MagdaRecords implements industry-standard security measures to protect your data, including:
              </Text>
              <Text style={styles.policyBullet}>• End-to-end encryption of all health data</Text>
              <Text style={styles.policyBullet}>• Secure authentication systems</Text>
              <Text style={styles.policyBullet}>• Regular security audits and updates</Text>
              
              <Text style={styles.policySection}>4. HIPAA Compliance</Text>
              <Text style={styles.policyText}>
                MagdaRecords is designed to be compliant with the Health Insurance Portability and Accountability Act (HIPAA). 
                We maintain appropriate physical, electronic, and procedural safeguards to protect your information.
              </Text>
              
              <Text style={styles.policySection}>5. Data Sharing</Text>
              <Text style={styles.policyText}>
                We do not sell your personal information. We only share your information:
              </Text>
              <Text style={styles.policyBullet}>• With your explicit consent</Text>
              <Text style={styles.policyBullet}>• With healthcare providers you designate</Text>
              <Text style={styles.policyBullet}>• As required by law</Text>
              
              <Text style={styles.policySection}>6. Contact Us</Text>
              <Text style={styles.policyText}>
                If you have any questions about our privacy practices, please contact us at privacy@magdarecords.com.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* HIPAA Compliance Modal */}
      <Modal
        visible={hipaaModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setHipaaModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>HIPAA Compliance</Text>
              <TouchableOpacity onPress={() => setHipaaModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <Text style={styles.policyTitle}>MagdaRecords HIPAA Compliance</Text>
              
              <Text style={styles.policySection}>What is HIPAA?</Text>
              <Text style={styles.policyText}>
                The Health Insurance Portability and Accountability Act (HIPAA) is a federal law that sets standards for the protection of sensitive patient health information.
              </Text>
              
              <Text style={styles.policySection}>How MagdaRecords Protects Your Data</Text>
              <Text style={styles.policyText}>
                MagdaRecords implements the following measures to ensure HIPAA compliance:
              </Text>
              
              <Text style={styles.policySubsection}>1. Data Encryption</Text>
              <Text style={styles.policyText}>
                All personal health information is encrypted both in transit and at rest using AES-256 encryption standard.
              </Text>
              
              <Text style={styles.policySubsection}>2. Access Controls</Text>
              <Text style={styles.policyText}>
                We implement strict authentication and authorization controls to ensure only authorized users can access health information.
              </Text>
              
              <Text style={styles.policySubsection}>3. Data Isolation</Text>
              <Text style={styles.policyText}>
                Your health data is isolated and compartmentalized to prevent unauthorized access.
              </Text>
              
              <Text style={styles.policySubsection}>4. Audit Trails</Text>
              <Text style={styles.policyText}>
                We maintain detailed logs of all data access and modifications for security monitoring.
              </Text>
              
              <Text style={styles.policySubsection}>5. Secure Deletion</Text>
              <Text style={styles.policyText}>
                When data is deleted, we ensure it's securely removed from all storage systems.
              </Text>
              
              <Text style={styles.policySection}>Your Rights Under HIPAA</Text>
              <Text style={styles.policyText}>
                As a user, you have the right to:
              </Text>
              <Text style={styles.policyBullet}>• Access your health information</Text>
              <Text style={styles.policyBullet}>• Request corrections to your records</Text>
              <Text style={styles.policyBullet}>• Receive a notice of privacy practices</Text>
              <Text style={styles.policyBullet}>• Request restrictions on certain uses and disclosures</Text>
              <Text style={styles.policyBullet}>• Receive an accounting of disclosures</Text>
              
              <Text style={styles.policySection}>Data Breach Protocol</Text>
              <Text style={styles.policyText}>
                In the unlikely event of a data breach, MagdaRecords will:
              </Text>
              <Text style={styles.policyBullet}>• Notify affected users within 60 days</Text>
              <Text style={styles.policyBullet}>• Provide details of what information was compromised</Text>
              <Text style={styles.policyBullet}>• Offer guidance on protecting yourself from potential harm</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.medium,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  backButton: {
    padding: spacing.small,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
  },
  placeholderRight: {
    width: 40, // Same width as back button for proper alignment
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.white,
    marginBottom: spacing.medium,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.medium,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.medium,
    paddingBottom: spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: spacing.medium,
  },
  settingTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.extraSmall,
  },
  settingDescription: {
    ...typography.body,
    color: colors.secondaryText,
  },
  fontSizeButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fontSizeButton: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 17,
    marginLeft: spacing.small,
    backgroundColor: colors.lightGray,
  },
  fontSizeButtonSelected: {
    backgroundColor: colors.primary,
  },
  fontSizeButtonText: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.text,
  },
  fontSizeButtonTextSelected: {
    color: colors.white,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonText: {
    ...typography.subtitle,
    color: colors.text,
    marginLeft: spacing.medium,
  },
  dangerSection: {
    padding: spacing.medium,
    alignItems: 'center',
  },
  deleteAccountButton: {
    paddingVertical: spacing.medium,
    paddingHorizontal: spacing.large,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 8,
  },
  deleteAccountButtonText: {
    ...typography.button,
    color: colors.error,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: spacing.large,
  },
  versionText: {
    ...typography.small,
    color: colors.secondaryText,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
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
    color: colors.text,
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
  eyeButton: {
    padding: spacing.medium,
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
  policyTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.small,
  },
  policyDate: {
    ...typography.small,
    color: colors.secondaryText,
    marginBottom: spacing.medium,
  },
  policySection: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.large,
    marginBottom: spacing.small,
  },
  policySubsection: {
    ...typography.subtitle,
    color: colors.text,
    marginTop: spacing.medium,
    marginBottom: spacing.small,
  },
  policyText: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.medium,
  },
  policyBullet: {
    ...typography.body,
    color: colors.text,
    marginLeft: spacing.medium,
    marginBottom: spacing.small,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body,
    color: colors.text,
    marginTop: spacing.medium,
  },
});

export default SettingsScreen;

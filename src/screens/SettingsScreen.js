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
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { AuthContext } from '../services/auth';
import { ThemeContext } from '../theme/themeContext';
import { getUserSettings, updateUserSettings, changePassword } from '../services/storage';
import { validatePassword } from '../utils/validation';
import colors from '../theme/colors';
import typography from '../theme/typography';
import spacing from '../theme/spacing';

const SettingsScreen = ({ navigation }) => {
  const { state, updateUser } = useContext(AuthContext);
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);

  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({
    darkMode: isDarkMode,
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
      setTimeout(() => currentPasswordRef.current.focus(), 300);
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

      if (setting === 'darkMode') {
        toggleDarkMode(); // call context function
      }
    } catch (error) {
      console.error(`Failed to update ${setting}:`, error);
      Alert.alert('Error', 'Failed to update setting');
      setSettings(prev => ({ ...prev, [setting]: !value }));
    }
  };

  // ... other password modal logic remains unchanged ...

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>

          {/* ✅ DARK MODE TOGGLE */}
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Dark Mode</Text>
              <Text style={styles.settingDescription}>Enable dark theme across the app</Text>
            </View>
            <Switch
              trackColor={{ false: colors.lightGray, true: colors.primaryLight }}
              thumbColor={settings.darkMode ? colors.primary : colors.gray}
              onValueChange={(value) => handleToggleSetting('darkMode', value)}
              value={settings.darkMode}
            />
          </View>

          {/* Add any other toggles you want here... */}
        </View>
      </ScrollView>

      {renderPasswordModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: spacing.medium,
  },
  section: {
    marginBottom: spacing.large,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.medium,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.medium,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: spacing.medium,
  },
  settingTitle: {
    ...typography.subtitle,
    color: colors.text,
  },
  settingDescription: {
    ...typography.small,
    color: colors.secondaryText,
  },
  // Add any other reused styles here...
});

export default SettingsScreen;

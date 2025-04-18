import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../services/auth';
import {
  getLinkedAccounts,
  addLinkedAccount,
  removeLinkedAccount,
  updateUserDetails,
} from '../services/storage';
import { ThemeContext } from '../theme/themeContext';
import colors from '../theme/colors';
import darkColors from '../theme/darkColors';
import typography from '../theme/typography';
import spacing from '../theme/spacing';

const AccountScreen = ({ navigation }) => {
  const { state, updateUser, logout } = useContext(AuthContext);
  const themeContext = useContext(ThemeContext);

  if (!themeContext) {
    console.warn('ThemeContext is unavailable — defaulting to light theme');
  }

  const isDarkMode = themeContext?.isDarkMode ?? false;
  const theme = isDarkMode ? darkColors : colors;

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [linkedAccounts, setLinkedAccounts] = useState([]);
  const [showAddAccountForm, setShowAddAccountForm] = useState(false);
  const [newAccountFirstName, setNewAccountFirstName] = useState('');
  const [newAccountLastName, setNewAccountLastName] = useState('');
  const [newAccountRelationship, setNewAccountRelationship] = useState('');
  const [newAccountDateOfBirth, setNewAccountDateOfBirth] = useState('');
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      if (state.user) {
        setFirstName(state.user.firstName || '');
        setLastName(state.user.lastName || '');
        setEmail(state.user.email || '');
        setBiometricEnabled(state.user.biometricEnabled || false);
        const accounts = await getLinkedAccounts(state.user.id);
        setLinkedAccounts(accounts);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      Alert.alert('Error', 'Failed to load account information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveUserInfo = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setErrors({
        firstName: !firstName.trim() ? 'First name is required' : '',
        lastName: !lastName.trim() ? 'Last name is required' : '',
      });
      return;
    }

    setIsLoading(true);
    try {
      const updatedUser = {
        ...state.user,
        firstName,
        lastName,
        biometricEnabled,
      };

      await updateUserDetails(updatedUser);
      updateUser(updatedUser);
      setIsEditing(false);
      setErrors({});
      Alert.alert('Success', 'Your account information has been updated');
    } catch (error) {
      console.error('Failed to update user info:', error);
      Alert.alert('Error', 'Failed to update account information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAccount = async () => {
    if (
      !newAccountFirstName.trim() ||
      !newAccountLastName.trim() ||
      !newAccountRelationship.trim() ||
      !newAccountDateOfBirth.trim()
    ) {
      Alert.alert('Missing Information', 'Please fill in all fields for the new family account');
      return;
    }

    setIsLoading(true);
    try {
      const newAccount = {
        id: `family-${Date.now()}`,
        firstName: newAccountFirstName,
        lastName: newAccountLastName,
        relationship: newAccountRelationship,
        dateOfBirth: newAccountDateOfBirth,
        createdBy: state.user.id,
      };

      await addLinkedAccount(state.user.id, newAccount);
      setLinkedAccounts([...linkedAccounts, newAccount]);
      setShowAddAccountForm(false);
      resetNewAccountForm();
      Alert.alert('Success', `Account for ${newAccountFirstName} ${newAccountLastName} has been added`);
    } catch (error) {
      console.error('Failed to add linked account:', error);
      Alert.alert('Error', 'Failed to add family account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAccount = (accountId, accountName) => {
    Alert.alert(
      'Confirm Removal',
      `Are you sure you want to remove ${accountName}'s account? This will delete all their medical records.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await removeLinkedAccount(state.user.id, accountId);
              setLinkedAccounts(linkedAccounts.filter((account) => account.id !== accountId));
              Alert.alert('Success', `${accountName}'s account has been removed`);
            } catch (error) {
              console.error('Failed to remove linked account:', error);
              Alert.alert('Error', 'Failed to remove family account');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const resetNewAccountForm = () => {
    setNewAccountFirstName('');
    setNewAccountLastName('');
    setNewAccountRelationship('');
    setNewAccountDateOfBirth('');
  };

  const handleDateOfBirthChange = (text) => {
    let formatted = text;
    if (text.length === 2 && newAccountDateOfBirth.length === 1) {
      formatted = text + '/';
    } else if (text.length === 5 && newAccountDateOfBirth.length === 4) {
      formatted = text + '/';
    }
    setNewAccountDateOfBirth(formatted);
  };

  const handleLogout = () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => logout() },
    ]);
  };

  if (isLoading && !isEditing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>Loading account information...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Add your form fields and linked account UI here */}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.medium,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    marginTop: spacing.medium,
  },
});

export default AccountScreen;

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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../services/auth';
import { getLinkedAccounts, addLinkedAccount, removeLinkedAccount, updateUserDetails } from '../services/storage';
import colors from '../theme/colors';
import typography from '../theme/typography';
import spacing from '../theme/spacing';

const AccountScreen = ({ navigation }) => {
  const { state, updateUser, logout } = useContext(AuthContext);
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
        
        // Load linked accounts
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
    if (!newAccountFirstName.trim() || !newAccountLastName.trim() || !newAccountRelationship.trim() || !newAccountDateOfBirth.trim()) {
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
              setLinkedAccounts(linkedAccounts.filter(account => account.id !== accountId));
              Alert.alert('Success', `${accountName}'s account has been removed`);
            } catch (error) {
              console.error('Failed to remove linked account:', error);
              Alert.alert('Error', 'Failed to remove family account');
            } finally {
              setIsLoading(false);
            }
          }
        }
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
    // Format as MM/DD/YYYY
    let formatted = text;
    if (text.length === 2 && newAccountDateOfBirth.length === 1) {
      formatted = text + '/';
    } else if (text.length === 5 && newAccountDateOfBirth.length === 4) {
      formatted = text + '/';
    }
    setNewAccountDateOfBirth(formatted);
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => logout()
        }
      ]
    );
  };

  if (isLoading && !isEditing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading account information...</Text>
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
        <Text style={styles.headerTitle}>My Account</Text>
        <View style={styles.placeholderRight} />
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            {!isEditing && (
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {isEditing ? (
            <View style={styles.editForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                  style={[styles.input, errors.firstName && styles.inputError]}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Enter your first name"
                />
                {errors.firstName ? (
                  <Text style={styles.errorText}>{errors.firstName}</Text>
                ) : null}
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  style={[styles.input, errors.lastName && styles.inputError]}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Enter your last name"
                />
                {errors.lastName ? (
                  <Text style={styles.errorText}>{errors.lastName}</Text>
                ) : null}
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.lightGray }]}
                  value={email}
                  editable={false}
                />
                <Text style={styles.helperText}>Email cannot be changed</Text>
              </View>
              
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Enable Biometric Login</Text>
                <Switch
                  trackColor={{ false: colors.lightGray, true: colors.primaryLight }}
                  thumbColor={biometricEnabled ? colors.primary : colors.gray}
                  onValueChange={setBiometricEnabled}
                  value={biometricEnabled}
                />
              </View>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setIsEditing(false);
                    setFirstName(state.user.firstName || '');
                    setLastName(state.user.lastName || '');
                    setBiometricEnabled(state.user.biometricEnabled || false);
                    setErrors({});
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveUserInfo}
                >
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name:</Text>
                <Text style={styles.infoValue}>{`${firstName} ${lastName}`}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{email}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Biometric Login:</Text>
                <Text style={styles.infoValue}>{biometricEnabled ? 'Enabled' : 'Disabled'}</Text>
              </View>
            </View>
          )}
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Family Accounts</Text>
          </View>
          
          {linkedAccounts.length > 0 ? (
            linkedAccounts.map((account) => (
              <View key={account.id} style={styles.familyAccountCard}>
                <View>
                  <Text style={styles.familyAccountName}>{`${account.firstName} ${account.lastName}`}</Text>
                  <Text style={styles.familyAccountRelationship}>{account.relationship}</Text>
                  <Text style={styles.familyAccountDob}>DOB: {account.dateOfBirth}</Text>
                </View>
                
                <TouchableOpacity
                  style={styles.removeAccountButton}
                  onPress={() => handleRemoveAccount(account.id, `${account.firstName} ${account.lastName}`)}
                >
                  <Ionicons name="trash-outline" size={22} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.noAccountsText}>No family accounts added yet</Text>
          )}
          
          {showAddAccountForm ? (
            <View style={styles.addAccountForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                  style={styles.input}
                  value={newAccountFirstName}
                  onChangeText={setNewAccountFirstName}
                  placeholder="Enter first name"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  value={newAccountLastName}
                  onChangeText={setNewAccountLastName}
                  placeholder="Enter last name"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Relationship</Text>
                <TextInput
                  style={styles.input}
                  value={newAccountRelationship}
                  onChangeText={setNewAccountRelationship}
                  placeholder="e.g., Spouse, Child, Parent"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date of Birth</Text>
                <TextInput
                  style={styles.input}
                  value={newAccountDateOfBirth}
                  onChangeText={handleDateOfBirthChange}
                  placeholder="MM/DD/YYYY"
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowAddAccountForm(false);
                    resetNewAccountForm();
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleAddAccount}
                >
                  <Text style={styles.saveButtonText}>Add Account</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addAccountButton}
              onPress={() => setShowAddAccountForm(true)}
            >
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
              <Text style={styles.addAccountButtonText}>Add Family Account</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
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
    padding: spacing.medium,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.medium,
    marginBottom: spacing.medium,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.medium,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  editText: {
    ...typography.button,
    color: colors.primary,
  },
  infoContainer: {
    gap: spacing.small,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    ...typography.body,
    color: colors.secondaryText,
    width: 120,
  },
  infoValue: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  editForm: {
    gap: spacing.medium,
  },
  inputGroup: {
    marginBottom: spacing.small,
  },
  label: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.extraSmall,
  },
  input: {
    ...typography.input,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    padding: spacing.medium,
    backgroundColor: colors.white,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    ...typography.small,
    color: colors.error,
    marginTop: spacing.extraSmall,
  },
  helperText: {
    ...typography.small,
    color: colors.secondaryText,
    marginTop: spacing.extraSmall,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.small,
  },
  switchLabel: {
    ...typography.body,
    color: colors.text,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.medium,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.medium,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: spacing.small,
    backgroundColor: colors.lightGray,
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.text,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.medium,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: spacing.small,
  },
  saveButtonText: {
    ...typography.button,
    color: colors.white,
  },
  familyAccountCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  familyAccountName: {
    ...typography.subtitle,
    color: colors.text,
  },
  familyAccountRelationship: {
    ...typography.body,
    color: colors.secondaryText,
  },
  familyAccountDob: {
    ...typography.small,
    color: colors.secondaryText,
    marginTop: spacing.extraSmall,
  },
  removeAccountButton: {
    padding: spacing.small,
  },
  noAccountsText: {
    ...typography.body,
    color: colors.secondaryText,
    textAlign: 'center',
    paddingVertical: spacing.medium,
  },
  addAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.medium,
    marginTop: spacing.small,
  },
  addAccountButtonText: {
    ...typography.button,
    color: colors.primary,
    marginLeft: spacing.small,
  },
  addAccountForm: {
    marginTop: spacing.medium,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingTop: spacing.medium,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    paddingVertical: spacing.medium,
    borderRadius: 8,
    marginBottom: spacing.large,
  },
  logoutButtonText: {
    ...typography.button,
    color: colors.error,
    marginLeft: spacing.small,
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

export default AccountScreen;

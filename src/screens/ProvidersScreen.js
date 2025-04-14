import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../services/auth';
import { getProviders, saveProvider, deleteProvider } from '../services/storage';
import ProviderCard from '../components/ProviderCard';
import AccountSelector from '../components/AccountSelector';
import colors from '../theme/colors';
import typography from '../theme/typography';
import spacing from '../theme/spacing';

const ProvidersScreen = () => {
  const { state } = useContext(AuthContext);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentProvider, setCurrentProvider] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filteredProviders, setFilteredProviders] = useState([]);

  // Form fields
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [facility, setFacility] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    // Set the current user as default selected account
    if (state.user) {
      setSelectedAccount(state.user.id);

      // In a real app, we would fetch linked accounts
      // For this demo, we'll create some mock accounts based on the current user
      if (state.user.firstName) {
        const mockAccounts = [
          { id: state.user.id, name: `${state.user.firstName} ${state.user.lastName}`, isPrimary: true },
          { id: 'family1', name: 'Jane Smith', relationship: 'Spouse' },
          { id: 'family2', name: 'Alex Smith', relationship: 'Child' }
        ];
        setAccounts(mockAccounts);
      }
    }

    loadProviders();
  }, [state.user]);

  useEffect(() => {
    if (selectedAccount) {
      loadProviders();
    }
  }, [selectedAccount]);

  useEffect(() => {
    if (searchText) {
      const filtered = providers.filter(provider => 
        provider.name.toLowerCase().includes(searchText.toLowerCase()) ||
        provider.specialty.toLowerCase().includes(searchText.toLowerCase()) ||
        provider.facility.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredProviders(filtered);
    } else {
      setFilteredProviders(providers);
    }
  }, [providers, searchText]);

  const loadProviders = async () => {
    if (!selectedAccount) return;

    setIsLoading(true);
    try {
      const accountProviders = await getProviders(selectedAccount);
      setProviders(accountProviders);
      setFilteredProviders(accountProviders);
    } catch (error) {
      console.error('Failed to load providers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountChange = (accountId) => {
    setSelectedAccount(accountId);
  };

  const resetForm = () => {
    setName('');
    setSpecialty('');
    setFacility('');
    setPhone('');
    setAddress('');
    setNotes('');
    setFormErrors({});
    setCurrentProvider(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (provider) => {
    setCurrentProvider(provider);
    setName(provider.name);
    setSpecialty(provider.specialty);
    setFacility(provider.facility);
    setPhone(provider.phone);
    setAddress(provider.address);
    setNotes(provider.notes);
    setModalVisible(true);
  };

  const validateForm = () => {
    const errors = {};

    if (!name.trim()) {
      errors.name = 'Provider name is required';
    }

    // Validate phone number format if provided
    if (phone && !/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const providerData = {
        id: currentProvider?.id || Date.now().toString(),
        name,
        specialty,
        facility,
        phone,
        address,
        notes,
      };

      await saveProvider(selectedAccount, providerData);
      setModalVisible(false);
      resetForm();
      loadProviders();
    } catch (error) {
      Alert.alert('Error', 'Failed to save provider information');
      console.error(error);
    }
  };

  const handleDeleteProvider = async (providerId) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this provider?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProvider(selectedAccount, providerId);
              loadProviders();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete provider');
              console.error(error);
            }
          }
        }
      ]
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Ionicons name="people-outline" size={64} color={colors.lightGray} />
      <Text style={styles.emptyStateTitle}>No Providers Found</Text>
      <Text style={styles.emptyStateMessage}>
        {searchText 
          ? 'Try changing your search criteria.'
          : 'Add your healthcare providers to keep track of your care team.'}
      </Text>

      {!searchText && (
        <TouchableOpacity 
          style={styles.emptyStateButton}
          onPress={openAddModal}
        >
          <Text style={styles.emptyStateButtonText}>Add Provider</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Healthcare Providers</Text>
      </View>

      <AccountSelector 
        accounts={accounts} 
        selectedAccount={selectedAccount}
        onSelectAccount={handleAccountChange}
      />

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={colors.gray} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search providers..."
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText ? (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={20} color={colors.gray} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading providers...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProviders}
          renderItem={({ item }) => (
            <ProviderCard 
              provider={item} 
              onEdit={() => openEditModal(item)}
              onDelete={() => handleDeleteProvider(item.id)}
            />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.providersList}
          ListEmptyComponent={renderEmptyState}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      <TouchableOpacity 
        style={styles.addButton}
        onPress={openAddModal}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {currentProvider ? 'Edit Provider' : 'Add Provider'}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Provider Name*</Text>
                <TextInput
                  style={[styles.input, formErrors.name && styles.inputError]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter provider's name"
                />
                {formErrors.name && (
                  <Text style={styles.errorText}>{formErrors.name}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Specialty</Text>
                <TextInput
                  style={styles.input}
                  value={specialty}
                  onChangeText={setSpecialty}
                  placeholder="e.g., Cardiologist, Primary Care"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Facility/Practice</Text>
                <TextInput
                  style={styles.input}
                  value={facility}
                  onChangeText={setFacility}
                  placeholder="e.g., Memorial Hospital"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={[styles.input, formErrors.phone && styles.inputError]}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="(555) 555-5555"
                  keyboardType="phone-pad"
                />
                {formErrors.phone && (
                  <Text style={styles.errorText}>{formErrors.phone}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Address</Text>
                <TextInput
                  style={styles.input}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Enter office address"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add any additional notes about this provider"
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSubmit}
                >
                  <Text style={styles.saveButtonText}>Save Provider</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
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
    padding: spacing.medium,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
  },
  searchContainer: {
    padding: spacing.medium,
    backgroundColor: colors.white,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: spacing.medium,
    height: 40,
  },
  searchIcon: {
    marginRight: spacing.small,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  providersList: {
    padding: spacing.medium,
  },
  separator: {
    height: spacing.medium,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    position: 'absolute',
    bottom: 24,
    right: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
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
    ...typography.h2,
    color: colors.text,
  },
  closeButton: {
    padding: spacing.small,
  },
  formContainer: {
    padding: spacing.medium,
  },
  inputGroup: {
    marginBottom: spacing.medium,
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
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
  emptyStateContainer: {
    padding: spacing.extraLarge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.medium,
    marginBottom: spacing.small,
  },
  emptyStateMessage: {
    ...typography.body,
    color: colors.secondaryText,
    textAlign: 'center',
    marginBottom: spacing.medium,
  },
  emptyStateButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.medium,
    paddingHorizontal: spacing.large,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    ...typography.button,
    color: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.text,
    marginTop: spacing.medium,
  },
});

export default ProvidersScreen;

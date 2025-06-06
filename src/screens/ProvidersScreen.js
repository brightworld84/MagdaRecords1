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
import { ThemeContext } from '../theme/themeContext';
import { getProviders, saveProvider, deleteProvider } from '../services/storage';
import ProviderCard from '../components/ProviderCard';
import AccountSelector from '../components/AccountSelector';
import colors from '../theme/colors';
import darkColors from '../theme/darkColors';
import typography from '../theme/typography';
import spacing from '../theme/spacing';

const ProvidersScreen = () => {
  const { state } = useContext(AuthContext);
  const themeContext = useContext(ThemeContext);

  if (!themeContext) {
    console.warn('ThemeContext is unavailable — defaulting to light theme');
  }

  const isDarkMode = themeContext?.isDarkMode ?? false;
  const theme = isDarkMode ? darkColors : colors;

  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentProvider, setCurrentProvider] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filteredProviders, setFilteredProviders] = useState([]);

  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [facility, setFacility] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (state.user) {
      setSelectedAccount(state.user.id);
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
    if (selectedAccount) loadProviders();
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

  const handleAccountChange = (accountId) => setSelectedAccount(accountId);

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
    if (!name.trim()) errors.name = 'Provider name is required';
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
      <Ionicons name="people-outline" size={64} color={theme.lightGray} />
      <Text style={[styles.emptyStateTitle, { color: theme.text }]}>No Providers Found</Text>
      <Text style={[styles.emptyStateMessage, { color: theme.secondaryText }]}>
        {searchText
          ? 'Try changing your search criteria.'
          : 'Add your healthcare providers to keep track of your care team.'}
      </Text>
      {!searchText && (
        <TouchableOpacity style={[styles.emptyStateButton, { backgroundColor: theme.primary }]} onPress={openAddModal}>
          <Text style={[styles.emptyStateButtonText, { color: theme.white }]}>Add Provider</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <AccountSelector
        accounts={accounts}
        selectedAccount={selectedAccount}
        onSelectAccount={handleAccountChange}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <View style={styles.searchContainer}>
          <TextInput
            style={[styles.searchInput, { backgroundColor: theme.white, color: theme.text, borderColor: theme.lightGray }]}
            placeholder="Search providers..."
            placeholderTextColor={theme.secondaryText}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={filteredProviders}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ProviderCard
                provider={item}
                onEdit={() => openEditModal(item)}
                onDelete={() => handleDeleteProvider(item.id)}
              />
            )}
            ListEmptyComponent={renderEmptyState}
            contentContainerStyle={{ padding: spacing.medium }}
            keyboardShouldPersistTaps="handled"
          />
        )}

        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.primary }]}
          onPress={openAddModal}
        >
          <Ionicons name="add" size={28} color={theme.white} />
        </TouchableOpacity>

        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalContainer, { backgroundColor: theme.white }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {currentProvider ? 'Edit Provider' : 'Add Provider'}
              </Text>

              <TextInput
                placeholder="Name"
                value={name}
                onChangeText={setName}
                style={[styles.input, { borderColor: theme.lightGray, color: theme.text }]}
                placeholderTextColor={theme.secondaryText}
              />
              {formErrors.name && <Text style={styles.errorText}>{formErrors.name}</Text>}

              <TextInput
                placeholder="Specialty"
                value={specialty}
                onChangeText={setSpecialty}
                style={[styles.input, { borderColor: theme.lightGray, color: theme.text }]}
                placeholderTextColor={theme.secondaryText}
              />
              <TextInput
                placeholder="Facility"
                value={facility}
                onChangeText={setFacility}
                style={[styles.input, { borderColor: theme.lightGray, color: theme.text }]}
                placeholderTextColor={theme.secondaryText}
              />
              <TextInput
                placeholder="Phone"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                style={[styles.input, { borderColor: theme.lightGray, color: theme.text }]}
                placeholderTextColor={theme.secondaryText}
              />
              {formErrors.phone && <Text style={styles.errorText}>{formErrors.phone}</Text>}

              <TextInput
                placeholder="Address"
                value={address}
                onChangeText={setAddress}
                style={[styles.input, { borderColor: theme.lightGray, color: theme.text }]}
                placeholderTextColor={theme.secondaryText}
              />
              <TextInput
                placeholder="Notes"
                value={notes}
                onChangeText={setNotes}
                style={[styles.input, { borderColor: theme.lightGray, color: theme.text, height: 80 }]}
                placeholderTextColor={theme.secondaryText}
                multiline
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                  <Text style={[styles.cancelText, { color: theme.primary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.primary }]} onPress={handleSubmit}>
                  <Text style={[styles.saveText, { color: theme.white }]}>
                    {currentProvider ? 'Update' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: {
    padding: spacing.medium,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.large,
    right: spacing.large,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing.medium,
  },
  modalContainer: {
    borderRadius: 12,
    padding: spacing.large,
  },
  modalTitle: {
    ...typography.h2,
    marginBottom: spacing.medium,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    marginBottom: spacing.small,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.medium,
  },
  cancelButton: {
    marginRight: spacing.medium,
  },
  cancelText: {
    ...typography.button,
  },
  saveButton: {
    borderRadius: 8,
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
  },
  saveText: {
    ...typography.button,
    textAlign: 'center',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.extraLarge,
    padding: spacing.large,
  },
  emptyStateTitle: {
    ...typography.h3,
    marginTop: spacing.medium,
  },
  emptyStateMessage: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.small,
  },
  emptyStateButton: {
    marginTop: spacing.medium,
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    ...typography.button,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: spacing.small,
    fontSize: 13,
  },
});

export default ProvidersScreen;

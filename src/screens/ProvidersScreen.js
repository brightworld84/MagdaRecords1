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
import { ThemeContext } from '../contexts/ThemeContext';
import { getProviders, saveProvider, deleteProvider } from '../services/storage';
import ProviderCard from '../components/ProviderCard';
import AccountSelector from '../components/AccountSelector';
import colors from '../theme/colors';
import darkColors from '../theme/darkColors';
import typography from '../theme/typography';
import spacing from '../theme/spacing';

const ProvidersScreen = () => {
  const { state } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
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
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Healthcare Providers</Text>
      </View>

      <AccountSelector
        accounts={accounts}
        selectedAccount={selectedAccount}
        onSelectAccount={handleAccountChange}
      />

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={theme.gray} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search providers..."
            placeholderTextColor={theme.secondaryText}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText ? (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={20} color={theme.gray} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading providers...</Text>
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

      <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.primary }]} onPress={openAddModal}>
        <Ionicons name="add" size={28} color={theme.white} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.white }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {currentProvider ? 'Edit Provider' : 'Add Provider'}
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            {/* form code remains unchanged */}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.medium,
  },
  headerTitle: {
    ...typography.h2,
  },
  searchContainer: {
    paddingHorizontal: spacing.medium,
    marginBottom: spacing.medium,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: 8,
    paddingHorizontal: spacing.medium,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
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
  providersList: {
    padding: spacing.medium,
  },
  separator: {
    height: spacing.small,
  },
  addButton: {
    position: 'absolute',
    right: spacing.large,
    bottom: spacing.large,
    padding: spacing.medium,
    borderRadius: 50,
    elevation: 2,
  },
  emptyStateContainer: {
    alignItems: 'center',
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
    marginBottom: spacing.medium,
  },
  emptyStateButton: {
    paddingVertical: spacing.small,
    paddingHorizontal: spacing.large,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    ...typography.button,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.medium,
  },
  modalContent: {
    borderRadius: 12,
    padding: spacing.large,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.medium,
  },
  modalTitle: {
    ...typography.h3,
  },
  closeButton: {
    padding: spacing.small,
  },
});

export default ProvidersScreen;

import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../services/auth';
import { ThemeContext } from '../theme/themeContext';
import { getAllRecords } from '../services/storage';
import RecordCard from '../components/RecordCard';
import RecordFilter from '../components/RecordFilter';
import AccountSelector from '../components/AccountSelector';
import colors from '../theme/colors';
import darkColors from '../theme/darkColors';
import typography from '../theme/typography';
import spacing from '../theme/spacing';

const RecordsScreen = () => {
  const { state } = useContext(AuthContext);
  const themeContext = useContext(ThemeContext);

  if (!themeContext) {
    console.warn('ThemeContext is unavailable — falling back to light theme.');
  }

  const isDarkMode = themeContext?.isDarkMode ?? false;
  const theme = isDarkMode ? darkColors : colors;

  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    recordType: 'all',
    dateRange: 'all',
    provider: 'all',
    keywords: [],
  });
  const [isFilterVisible, setIsFilterVisible] = useState(false);

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
    loadRecords();
  }, [state.user]);

  useEffect(() => {
    if (selectedAccount) {
      loadRecords();
    }
  }, [selectedAccount]);

  useEffect(() => {
    applyFilters();
  }, [records, searchText, filterOptions]);

  const loadRecords = async () => {
    if (!selectedAccount) return;
    setIsLoading(true);
    try {
      const allRecords = await getAllRecords(selectedAccount);
      setRecords(allRecords);
    } catch (error) {
      console.error('Failed to load records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...records];

    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(record =>
        record.title.toLowerCase().includes(searchLower) ||
        record.provider.toLowerCase().includes(searchLower) ||
        record.description.toLowerCase().includes(searchLower)
      );
    }

    if (filterOptions.recordType !== 'all') {
      filtered = filtered.filter(record => record.type === filterOptions.recordType);
    }

    if (filterOptions.dateRange !== 'all') {
      const now = new Date();
      let startDate;

      switch (filterOptions.dateRange) {
        case 'lastMonth':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          break;
        case 'last3Months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
          break;
        case 'lastYear':
          startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        filtered = filtered.filter(record => new Date(record.date) >= startDate);
      }
    }

    if (filterOptions.provider !== 'all') {
      filtered = filtered.filter(record => record.provider === filterOptions.provider);
    }

    if (filterOptions.keywords && filterOptions.keywords.length > 0) {
      filtered = filtered.filter(record => {
        return filterOptions.keywords.some(keyword => {
          if (record.metadata?.keywords?.some(k =>
            k.toLowerCase().includes(keyword.toLowerCase()) ||
            keyword.toLowerCase().includes(k.toLowerCase())
          )) {
            return true;
          }
          const text = `${record.title} ${record.description} ${record.provider}`.toLowerCase();
          return text.includes(keyword.toLowerCase());
        });
      });
    }

    setFilteredRecords(filtered);
  };

  const handleAccountChange = (accountId) => {
    setSelectedAccount(accountId);
  };

  const handleFilterChange = (newFilters) => {
    setFilterOptions(newFilters);
    setIsFilterVisible(false);
  };

  const toggleFilterVisibility = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Ionicons name="document-text-outline" size={64} color={theme.lightGray} />
      <Text style={[styles.emptyStateTitle, { color: theme.text }]}>No Records Found</Text>
      <Text style={[styles.emptyStateMessage, { color: theme.secondaryText }]}>
        {searchText || filterOptions.recordType !== 'all' || filterOptions.dateRange !== 'all' || 
         filterOptions.provider !== 'all' || (filterOptions.keywords?.length > 0)
          ? 'Try changing your search or filter criteria.'
          : 'Upload your first medical record to start tracking your health information.'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.white, borderBottomColor: theme.lightGray }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Medical Records</Text>
      </View>

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
        <View style={[styles.searchContainer, { backgroundColor: theme.white }]}>
          <View style={[styles.searchInputContainer, { backgroundColor: theme.background }]}>
            <Ionicons name="search" size={20} color={theme.gray} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search records..."
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

          <TouchableOpacity style={styles.filterButton} onPress={toggleFilterVisibility}>
            <Ionicons name="options-outline" size={24} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {isFilterVisible && (
          <RecordFilter
            options={filterOptions}
            onApplyFilters={handleFilterChange}
            onCancel={() => setIsFilterVisible(false)}
            allRecords={records}
          />
        )}

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.text }]}>Loading records...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredRecords}
            renderItem={({ item }) => <RecordCard record={item} />}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.recordsList}
            ListEmptyComponent={renderEmptyState}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.medium,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.medium,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  filterButton: {
    marginLeft: spacing.medium,
    padding: spacing.small,
  },
  recordsList: {
    padding: spacing.medium,
  },
  separator: {
    height: spacing.medium,
  },
  emptyStateContainer: {
    padding: spacing.extraLarge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    ...typography.h3,
    marginTop: spacing.medium,
    marginBottom: spacing.small,
  },
  emptyStateMessage: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.medium,
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

export default RecordsScreen;

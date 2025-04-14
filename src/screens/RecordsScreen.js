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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../services/auth';
import { getAllRecords } from '../services/storage';
import RecordCard from '../components/RecordCard';
import RecordFilter from '../components/RecordFilter';
import AccountSelector from '../components/AccountSelector';
import colors from '../theme/colors';
import typography from '../theme/typography';
import spacing from '../theme/spacing';

const RecordsScreen = () => {
  const { state } = useContext(AuthContext);
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
    
    // Apply search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(record => 
        record.title.toLowerCase().includes(searchLower) ||
        record.provider.toLowerCase().includes(searchLower) ||
        record.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply record type filter
    if (filterOptions.recordType !== 'all') {
      filtered = filtered.filter(record => record.type === filterOptions.recordType);
    }
    
    // Apply date range filter
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
    
    // Apply provider filter
    if (filterOptions.provider !== 'all') {
      filtered = filtered.filter(record => record.provider === filterOptions.provider);
    }
    
    // Apply keyword filters
    if (filterOptions.keywords && filterOptions.keywords.length > 0) {
      filtered = filtered.filter(record => {
        // Check if any of the selected keywords match the record
        return filterOptions.keywords.some(keyword => {
          // Check in record metadata keywords if available
          if (record.metadata?.keywords && Array.isArray(record.metadata.keywords)) {
            if (record.metadata.keywords.some(k => 
              k.toLowerCase().includes(keyword.toLowerCase()) || 
              keyword.toLowerCase().includes(k.toLowerCase())
            )) {
              return true;
            }
          }
          
          // Check if keyword appears in title, description, or provider
          const recordText = `${record.title} ${record.description} ${record.provider}`.toLowerCase();
          return recordText.includes(keyword.toLowerCase());
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
      <Ionicons name="document-text-outline" size={64} color={colors.lightGray} />
      <Text style={styles.emptyStateTitle}>No Records Found</Text>
      <Text style={styles.emptyStateMessage}>
        {searchText || filterOptions.recordType !== 'all' || filterOptions.dateRange !== 'all' || 
         filterOptions.provider !== 'all' || (filterOptions.keywords && filterOptions.keywords.length > 0)
          ? 'Try changing your search or filter criteria.'
          : 'Upload your first medical record to start tracking your health information.'}
      </Text>
      {!searchText && filterOptions.recordType === 'all' && filterOptions.dateRange === 'all' && 
       filterOptions.provider === 'all' && (!filterOptions.keywords || filterOptions.keywords.length === 0) && (
        <TouchableOpacity 
          style={styles.emptyStateButton}
          onPress={() => navigation.navigate('Upload')}
        >
          <Text style={styles.emptyStateButtonText}>Upload Records</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Medical Records</Text>
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
            placeholder="Search records..."
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText ? (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={20} color={colors.gray} />
            </TouchableOpacity>
          ) : null}
        </View>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={toggleFilterVisibility}
        >
          <Ionicons name="options-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      {isFilterVisible && (
        <RecordFilter 
          options={filterOptions || { recordType: 'all', dateRange: 'all', provider: 'all', keywords: [] }}
          onApplyFilters={handleFilterChange}
          onCancel={() => setIsFilterVisible(false)}
          allRecords={records || []}
        />
      )}
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading records...</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.medium,
    backgroundColor: colors.white,
  },
  searchInputContainer: {
    flex: 1,
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

export default RecordsScreen;

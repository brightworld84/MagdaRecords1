import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../services/auth';
import { getRecentRecords } from '../services/storage';
import { analyzeMedicationInteractions, getHealthRecommendations } from '../services/ai';
import RecordCard from '../components/RecordCard';
import MedicationInteraction from '../components/MedicationInteraction';
import HealthRecommendation from '../components/HealthRecommendation';
import AccountSelector from '../components/AccountSelector';
import colors from '../theme/colors';
import typography from '../theme/typography';
import spacing from '../theme/spacing';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { state } = useContext(AuthContext);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recentRecords, setRecentRecords] = useState([]);
  const [medicationInteractions, setMedicationInteractions] = useState([]);
  const [healthRecommendations, setHealthRecommendations] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);

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
    
    loadData();
  }, [state.user]);
  
  useEffect(() => {
    if (selectedAccount) {
      loadData();
    }
  }, [selectedAccount]);

  const loadData = async () => {
    try {
      // Get recent records for the selected account
      const records = await getRecentRecords(selectedAccount);
      setRecentRecords(records);
      
      // Get medication interactions from AI
      if (records.length > 0) {
        const interactions = await analyzeMedicationInteractions(records);
        setMedicationInteractions(interactions);
        
        // Get health recommendations from AI
        const recommendations = await getHealthRecommendations(records);
        setHealthRecommendations(recommendations);
      } else {
        setMedicationInteractions([]);
        setHealthRecommendations([]);
      }
    } catch (error) {
      console.error('Failed to load home data:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleAccountChange = (accountId) => {
    setSelectedAccount(accountId);
  };

  const handleOpenMenu = () => {
    navigation.openDrawer();
  };

  const handleViewAllRecords = () => {
    navigation.navigate('Records');
  };

  const renderNoRecordsView = () => (
    <View style={styles.emptyStateContainer}>
      <Ionicons name="document-text-outline" size={64} color={colors.lightGray} />
      <Text style={styles.emptyStateTitle}>No Records Yet</Text>
      <Text style={styles.emptyStateMessage}>
        Upload your first medical record to start tracking your health information.
      </Text>
      <TouchableOpacity 
        style={styles.emptyStateButton}
        onPress={() => navigation.navigate('Upload')}
      >
        <Text style={styles.emptyStateButtonText}>Upload Records</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleOpenMenu} style={styles.menuButton}>
          <Ionicons name="menu" size={28} color={colors.primary} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Home</Text>
        
        <View style={styles.placeholder} />
      </View>
      
      <AccountSelector 
        accounts={accounts} 
        selectedAccount={selectedAccount}
        onSelectAccount={handleAccountChange}
      />
      
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {recentRecords.length > 0 ? (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Records</Text>
                <TouchableOpacity onPress={handleViewAllRecords}>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.recordsContainer}>
                {recentRecords.slice(0, 3).map((record) => (
                  <RecordCard key={record.id} record={record} />
                ))}
              </View>
            </View>
            
            {medicationInteractions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Potential Medication Interactions</Text>
                <View style={styles.interactionsContainer}>
                  {medicationInteractions.map((interaction, index) => (
                    <MedicationInteraction key={index} interaction={interaction} />
                  ))}
                </View>
              </View>
            )}
            
            {healthRecommendations.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Health Recommendations</Text>
                <View style={styles.recommendationsContainer}>
                  {healthRecommendations.map((recommendation, index) => (
                    <HealthRecommendation key={index} recommendation={recommendation} />
                  ))}
                </View>
              </View>
            )}
          </>
        ) : (
          renderNoRecordsView()
        )}
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
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.medium,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  menuButton: {
    padding: spacing.small,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
  },
  placeholder: {
    width: 40, // Same width as menu button for proper alignment
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
  viewAllText: {
    ...typography.button,
    color: colors.primary,
  },
  recordsContainer: {
    gap: spacing.medium,
  },
  interactionsContainer: {
    gap: spacing.medium,
  },
  recommendationsContainer: {
    gap: spacing.medium,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.large,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: spacing.medium,
  },
  emptyStateTitle: {
    ...typography.h2,
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
});

export default HomeScreen;

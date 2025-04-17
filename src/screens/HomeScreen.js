import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../services/auth';
import { ThemeContext } from '../contexts/ThemeContext';
import { getRecentRecords } from '../services/storage';
import { analyzeMedicationInteractions, getHealthRecommendations } from '../services/ai';
import RecordCard from '../components/RecordCard';
import MedicationInteraction from '../components/MedicationInteraction';
import HealthRecommendation from '../components/HealthRecommendation';
import AccountSelector from '../components/AccountSelector';
import colors from '../theme/colors';
import darkColors from '../theme/darkColors';
import typography from '../theme/typography';
import spacing from '../theme/spacing';

const HomeScreen = ({ navigation }) => {
  const { state } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  const theme = isDarkMode ? darkColors : colors;

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recentRecords, setRecentRecords] = useState([]);
  const [medicationInteractions, setMedicationInteractions] = useState([]);
  const [healthRecommendations, setHealthRecommendations] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);

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

    loadData();
  }, [state.user]);

  useEffect(() => {
    if (selectedAccount) {
      loadData();
    }
  }, [selectedAccount]);

  const loadData = async () => {
    try {
      const records = await getRecentRecords(selectedAccount);
      setRecentRecords(records);

      if (records.length > 0) {
        const interactions = await analyzeMedicationInteractions(records);
        setMedicationInteractions(interactions);

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

  const handleViewAllRecords = () => {
    navigation.navigate('Records');
  };

  const renderNoRecordsView = () => (
    <View style={[styles.emptyStateContainer, { backgroundColor: theme.white }]}>
      <Ionicons name="document-text-outline" size={64} color={theme.lightGray} />
      <Text style={[styles.emptyStateTitle, { color: theme.text }]}>No Records Yet</Text>
      <Text style={[styles.emptyStateMessage, { color: theme.secondaryText }]}>
        Upload your first medical record to start tracking your health information.
      </Text>
      <TouchableOpacity 
        style={[styles.emptyStateButton, { backgroundColor: theme.primary }]}
        onPress={() => navigation.navigate('Upload')}
      >
        <Text style={[styles.emptyStateButtonText, { color: theme.white }]}>Upload Records</Text>
      </TouchableOpacity>
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView
          style={styles.content}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[theme.primary]}
            />
          }
        >
          {recentRecords.length > 0 ? (
            <>
              <View style={[styles.section, { backgroundColor: theme.white, shadowColor: theme.black }]}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Records</Text>
                  <TouchableOpacity onPress={handleViewAllRecords}>
                    <Text style={[styles.viewAllText, { color: theme.primary }]}>View All</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.recordsContainer}>
                  {recentRecords.slice(0, 3).map((record) => (
                    <RecordCard key={record.id} record={record} />
                  ))}
                </View>
              </View>

              {medicationInteractions.length > 0 && (
                <View style={[styles.section, { backgroundColor: theme.white, shadowColor: theme.black }]}>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    Potential Medication Interactions
                  </Text>
                  <View style={styles.interactionsContainer}>
                    {medicationInteractions.map((interaction, index) => (
                      <MedicationInteraction key={index} interaction={interaction} />
                    ))}
                  </View>
                </View>
              )}

              {healthRecommendations.length > 0 && (
                <View style={[styles.section, { backgroundColor: theme.white, shadowColor: theme.black }]}>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>Health Recommendations</Text>
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
  section: {
    borderRadius: 12,
    padding: spacing.medium,
    marginBottom: spacing.medium,
    elevation: 2,
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
  },
  viewAllText: {
    ...typography.button,
  },
  recordsContainer: {
    marginBottom: spacing.medium,
  },  
  interactionsContainer: {
    marginBottom: spacing.medium,
  },
  recommendationsContainer: {
    marginBottom: spacing.medium,
  },  
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.large,
    borderRadius: 12,
    marginBottom: spacing.medium,
  },
  emptyStateTitle: {
    ...typography.h2,
    marginTop: spacing.medium,
    marginBottom: spacing.small,
  },
  emptyStateMessage: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.medium,
  },
  emptyStateButton: {
    paddingVertical: spacing.medium,
    paddingHorizontal: spacing.large,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    ...typography.button,
  },
});

export default HomeScreen;

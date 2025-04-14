import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../services/auth';
import { getLinkedAccounts } from '../services/storage';
import colors from '../theme/colors';
import typography from '../theme/typography';
import spacing from '../theme/spacing';

const DrawerContent = (props) => {
  const { state, logout } = useContext(AuthContext);
  const [linkedAccounts, setLinkedAccounts] = useState([]);
  const [showLinkedAccounts, setShowLinkedAccounts] = useState(false);

  useEffect(() => {
    loadLinkedAccounts();
  }, []);

  const loadLinkedAccounts = async () => {
    try {
      if (state.user && state.user.id) {
        const accounts = await getLinkedAccounts(state.user.id);
        setLinkedAccounts(accounts);
      }
    } catch (error) {
      console.error('Failed to load linked accounts:', error);
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName ? firstName.charAt(0) : ''}${lastName ? lastName.charAt(0) : ''}`;
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfoSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getInitials(state.user?.firstName, state.user?.lastName)}
              </Text>
            </View>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>
              {state.user?.firstName} {state.user?.lastName}
            </Text>
            <Text style={styles.userEmail}>{state.user?.email}</Text>
          </View>
        </View>

        {linkedAccounts.length > 0 && (
          <View style={styles.linkedAccountsSection}>
            <TouchableOpacity 
              style={styles.linkedAccountsHeader}
              onPress={() => setShowLinkedAccounts(!showLinkedAccounts)}
            >
              <Text style={styles.linkedAccountsTitle}>Family Accounts</Text>
              <Ionicons 
                name={showLinkedAccounts ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={colors.text} 
              />
            </TouchableOpacity>
            
            {showLinkedAccounts && (
              <View style={styles.linkedAccountsList}>
                {linkedAccounts.map((account) => (
                  <TouchableOpacity 
                    key={account.id}
                    style={styles.linkedAccountItem}
                  >
                    <View style={styles.linkedAccountAvatar}>
                      <Text style={styles.linkedAccountAvatarText}>
                        {getInitials(account.firstName, account.lastName)}
                      </Text>
                    </View>
                    <Text style={styles.linkedAccountName}>
                      {account.firstName} {account.lastName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </View>

      <View style={styles.drawerItems}>
        <DrawerItemList {...props} />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => logout()}
        >
          <Ionicons name="log-out-outline" size={24} color={colors.error} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: spacing.large,
    paddingBottom: spacing.medium,
    backgroundColor: colors.primaryLight,
  },
  userInfoSection: {
    flexDirection: 'row',
    paddingHorizontal: spacing.medium,
    paddingBottom: spacing.medium,
    alignItems: 'center',
  },
  avatarContainer: { marginRight: spacing.medium },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.h2,
    color: colors.white,
  },
  userDetails: { flex: 1 },
  userName: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.extraSmall,
  },
  userEmail: {
    ...typography.body,
    color: colors.secondaryText,
  },
  linkedAccountsSection: {
    paddingHorizontal: spacing.medium,
    paddingTop: spacing.small,
  },
  linkedAccountsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.small,
  },
  linkedAccountsTitle: {
    ...typography.subtitle,
    color: colors.text,
  },
  linkedAccountsList: { marginTop: spacing.small },
  linkedAccountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.small,
  },
  linkedAccountAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.small,
  },
  linkedAccountAvatarText: {
    ...typography.subtitle,
    color: colors.white,
  },
  linkedAccountName: {
    ...typography.body,
    color: colors.text,
  },
  drawerItems: {
    flex: 1,
    paddingTop: spacing.medium,
  },
  footer: {
    paddingVertical: spacing.large,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    marginTop: spacing.medium,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.medium,
  },
  logoutButtonText: {
    ...typography.button,
    color: colors.error,
    marginLeft: spacing.small,
  },
});

export default DrawerContent;

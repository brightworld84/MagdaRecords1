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
import { ThemeContext } from '../theme/themeContext';
import colors from '../theme/colors';
import darkColors from '../theme/darkColors';
import typography from '../theme/typography';
import spacing from '../theme/spacing';

const DrawerContent = (props) => {
  const { state, logout } = useContext(AuthContext);
  const themeContext = useContext(ThemeContext);

  if (!themeContext) {
    console.warn('ThemeContext unavailable — defaulting to light mode.');
  }

  const isDarkMode = themeContext?.isDarkMode ?? false;
  const theme = isDarkMode ? darkColors : colors;

  const [linkedAccounts, setLinkedAccounts] = useState([]);
  const [showLinkedAccounts, setShowLinkedAccounts] = useState(false);

  useEffect(() => {
    loadLinkedAccounts();
  }, []);

  const loadLinkedAccounts = async () => {
    try {
      if (state.user?.id) {
        const accounts = await getLinkedAccounts(state.user.id);
        setLinkedAccounts(accounts);
      }
    } catch (error) {
      console.error('Failed to load linked accounts:', error);
    }
  };

  const getInitials = (first = '', last = '') => {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  const userFirstName = state.user?.firstName || 'U';
  const userLastName = state.user?.lastName || '';
  const userEmail = state.user?.email || '';

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={[styles.header, { backgroundColor: theme.primaryLight }]}>
        <View style={styles.userInfoSection}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
              <Text style={[styles.avatarText, { color: theme.white }]}>
                {getInitials(userFirstName, userLastName)}
              </Text>
            </View>
          </View>
          <View style={styles.userDetails}>
            <Text style={[styles.userName, { color: theme.text }]}>
              {userFirstName} {userLastName}
            </Text>
            <Text style={[styles.userEmail, { color: theme.secondaryText }]}>
              {userEmail}
            </Text>
          </View>
        </View>

        {linkedAccounts.length > 0 && (
          <View style={styles.linkedAccountsSection}>
            <TouchableOpacity
              style={styles.linkedAccountsHeader}
              onPress={() => setShowLinkedAccounts(!showLinkedAccounts)}
            >
              <Text style={[styles.linkedAccountsTitle, { color: theme.text }]}>
                Family Accounts
              </Text>
              <Ionicons
                name={showLinkedAccounts ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={theme.text}
              />
            </TouchableOpacity>

            {showLinkedAccounts && (
              <View style={styles.linkedAccountsList}>
                {linkedAccounts.map((account) => (
                  <TouchableOpacity key={account.id} style={styles.linkedAccountItem}>
                    <View style={[styles.linkedAccountAvatar, { backgroundColor: theme.accent }]}>
                      <Text style={[styles.linkedAccountAvatarText, { color: theme.white }]}>
                        {getInitials(account.firstName || '', account.lastName || '')}
                      </Text>
                    </View>
                    <Text style={[styles.linkedAccountName, { color: theme.text }]}>
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

      <View style={[styles.footer, { borderTopColor: theme.lightGray }]}>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={24} color={theme.error} />
          <Text style={[styles.logoutButtonText, { color: theme.error }]}>Logout</Text>
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
  },
  userInfoSection: {
    flexDirection: 'row',
    paddingHorizontal: spacing.medium,
    paddingBottom: spacing.medium,
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: spacing.medium,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.h2,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    ...typography.h3,
    marginBottom: spacing.extraSmall,
  },
  userEmail: {
    ...typography.body,
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
  },
  linkedAccountsList: {
    marginTop: spacing.small,
  },
  linkedAccountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.small,
  },
  linkedAccountAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.small,
  },
  linkedAccountAvatarText: {
    ...typography.subtitle,
  },
  linkedAccountName: {
    ...typography.body,
  },
  drawerItems: {
    flex: 1,
    paddingTop: spacing.medium,
  },
  footer: {
    paddingVertical: spacing.large,
    alignItems: 'center',
    borderTopWidth: 1,
    marginTop: spacing.medium,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.medium,
  },
  logoutButtonText: {
    ...typography.button,
    marginLeft: spacing.small,
  },
});

export default DrawerContent;

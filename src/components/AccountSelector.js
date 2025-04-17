import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import darkColors from '../theme/darkColors';
import typography from '../theme/typography';
import spacing from '../theme/spacing';
import { ThemeContext } from '../theme/themeContext';

const AccountSelector = ({ accounts, selectedAccount, onSelectAccount }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { isDarkMode } = useContext(ThemeContext);
  const theme = isDarkMode ? darkColors : colors;

  const currentAccount = accounts.find(acc => acc.id === selectedAccount) || accounts[0];
  
  const getInitials = (firstName, lastName) => {
    return `${firstName ? firstName.charAt(0) : ''}${lastName ? lastName.charAt(0) : ''}`;
  };

  const toggleModal = () => setModalVisible(!modalVisible);

  const handleSelectAccount = (accountId) => {
    onSelectAccount(accountId);
    setModalVisible(false);
  };

  if (!accounts || accounts.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderBottomColor: theme.lightGray }]}>
      <TouchableOpacity style={styles.selector} onPress={toggleModal}>
        <View style={styles.selectedAccount}>
          <View style={[styles.avatarContainer, { backgroundColor: theme.primary }]}>
            <Text style={[styles.avatarText, { color: theme.white }]}>
              {currentAccount ? getInitials(currentAccount.name.split(' ')[0], currentAccount.name.split(' ')[1]) : ''}
            </Text>
          </View>
          <Text style={[styles.accountName, { color: theme.text }]}>{currentAccount ? currentAccount.name : ''}</Text>
        </View>
        <Ionicons name="chevron-down" size={20} color={theme.text} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={toggleModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={toggleModal}
        >
          <View style={[styles.modalContainer, { backgroundColor: theme.card, shadowColor: theme.black }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.lightGray }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Select Account</Text>
              <TouchableOpacity onPress={toggleModal}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.accountsList}>
              {accounts.map((account) => (
                <TouchableOpacity
                  key={account.id}
                  style={[
                    styles.accountItem,
                    selectedAccount === account.id && { backgroundColor: theme.primaryLight }
                  ]}
                  onPress={() => handleSelectAccount(account.id)}
                >
                  <View style={styles.accountItemContent}>
                    <View style={[
                      styles.accountAvatar,
                      { backgroundColor: selectedAccount === account.id ? theme.primary : theme.lightGray }
                    ]}>
                      <Text style={[
                        styles.accountAvatarText,
                        { color: selectedAccount === account.id ? theme.white : theme.text }
                      ]}>
                        {getInitials(account.name.split(' ')[0], account.name.split(' ')[1])}
                      </Text>
                    </View>
                    <View style={styles.accountDetails}>
                      <Text style={[
                        styles.accountItemName,
                        { color: selectedAccount === account.id ? theme.primary : theme.text }
                      ]}>
                        {account.name}
                      </Text>
                      {account.relationship && (
                        <Text style={[styles.accountRelationship, { color: theme.secondaryText }]}>
                          {account.relationship}
                        </Text>
                      )}
                    </View>
                  </View>

                  {selectedAccount === account.id && (
                    <Ionicons name="checkmark" size={24} color={theme.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedAccount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.small,
  },
  avatarText: {
    ...typography.subtitle,
    fontSize: 14,
  },
  accountName: {
    ...typography.subtitle,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    borderRadius: 12,
    width: '80%',
    maxHeight: '60%',
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.medium,
    borderBottomWidth: 1,
  },
  modalTitle: {
    ...typography.h3,
  },
  accountsList: {
    padding: spacing.small,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.medium,
    borderRadius: 8,
  },
  accountItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.medium,
  },
  accountAvatarText: {
    ...typography.body,
    fontWeight: 'bold',
  },
  accountDetails: {
    flex: 1,
  },
  accountItemName: {
    ...typography.subtitle,
  },
  accountRelationship: {
    ...typography.small,
  },
});

export default AccountSelector;

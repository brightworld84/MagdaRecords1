import React, { useState } from 'react';
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
import typography from '../theme/typography';
import spacing from '../theme/spacing';

const AccountSelector = ({ accounts, selectedAccount, onSelectAccount }) => {
  const [modalVisible, setModalVisible] = useState(false);

  // Find the currently selected account object
  const currentAccount = accounts.find(acc => acc.id === selectedAccount) || accounts[0];
  
  const getInitials = (firstName, lastName) => {
    return `${firstName ? firstName.charAt(0) : ''}${lastName ? lastName.charAt(0) : ''}`;
  };

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const handleSelectAccount = (accountId) => {
    onSelectAccount(accountId);
    setModalVisible(false);
  };

  if (!accounts || accounts.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.selector} onPress={toggleModal}>
        <View style={styles.selectedAccount}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {currentAccount ? getInitials(currentAccount.name.split(' ')[0], currentAccount.name.split(' ')[1]) : ''}
            </Text>
          </View>
          <Text style={styles.accountName}>{currentAccount ? currentAccount.name : ''}</Text>
        </View>
        <Ionicons name="chevron-down" size={20} color={colors.text} />
      </TouchableOpacity>
      
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={toggleModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={toggleModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Account</Text>
              <TouchableOpacity onPress={toggleModal}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.accountsList}>
              {accounts.map((account) => (
                <TouchableOpacity
                  key={account.id}
                  style={[
                    styles.accountItem,
                    selectedAccount === account.id && styles.selectedAccountItem
                  ]}
                  onPress={() => handleSelectAccount(account.id)}
                >
                  <View style={styles.accountItemContent}>
                    <View style={[
                      styles.accountAvatar,
                      selectedAccount === account.id && styles.selectedAccountAvatar
                    ]}>
                      <Text style={[
                        styles.accountAvatarText,
                        selectedAccount === account.id && styles.selectedAccountAvatarText
                      ]}>
                        {getInitials(account.name.split(' ')[0], account.name.split(' ')[1])}
                      </Text>
                    </View>
                    <View style={styles.accountDetails}>
                      <Text style={[
                        styles.accountItemName,
                        selectedAccount === account.id && styles.selectedAccountItemName
                      ]}>
                        {account.name}
                      </Text>
                      {account.relationship && (
                        <Text style={styles.accountRelationship}>
                          {account.relationship}
                        </Text>
                      )}
                    </View>
                  </View>
                  
                  {selectedAccount === account.id && (
                    <Ionicons name="checkmark" size={24} color={colors.primary} />
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
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
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
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.small,
  },
  avatarText: {
    ...typography.subtitle,
    fontSize: 14,
    color: colors.white,
  },
  accountName: {
    ...typography.subtitle,
    color: colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    width: '80%',
    maxHeight: '60%',
    elevation: 5,
    shadowColor: colors.black,
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
    borderBottomColor: colors.lightGray,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
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
  selectedAccountItem: {
    backgroundColor: colors.primaryLight,
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
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.medium,
  },
  selectedAccountAvatar: {
    backgroundColor: colors.primary,
  },
  accountAvatarText: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.text,
  },
  selectedAccountAvatarText: {
    color: colors.white,
  },
  accountDetails: {
    flex: 1,
  },
  accountItemName: {
    ...typography.subtitle,
    color: colors.text,
  },
  selectedAccountItemName: {
    color: colors.primary,
  },
  accountRelationship: {
    ...typography.small,
    color: colors.secondaryText,
  },
});

export default AccountSelector;

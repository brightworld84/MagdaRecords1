import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import typography from '../../theme/typography';
import spacing from '../../theme/spacing';

const ConfirmationDialog = ({ visible, title, message, onCancel, onConfirm }) => {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Ionicons name="alert-circle" size={32} color={colors.warning} style={styles.icon} />
          <Text style={styles.title}>{title || 'Are you sure?'}</Text>
          <Text style={styles.message}>{message || 'This action cannot be undone.'}</Text>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
              <Text style={styles.confirmText}>Yes, Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.large,
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.large,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    elevation: 5,
  },
  icon: {
    marginBottom: spacing.small,
  },
  title: {
    ...typography.h3,
    textAlign: 'center',
    color: colors.text,
    marginBottom: spacing.small,
  },
  message: {
    ...typography.body,
    textAlign: 'center',
    color: colors.secondaryText,
    marginBottom: spacing.medium,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    marginRight: spacing.small,
    paddingVertical: spacing.medium,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButton: {
    flex: 1,
    marginLeft: spacing.small,
    paddingVertical: spacing.medium,
    backgroundColor: colors.error,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelText: {
    ...typography.button,
    color: colors.text,
  },
  confirmText: {
    ...typography.button,
    color: colors.white,
  },
});

export default ConfirmationDialog;

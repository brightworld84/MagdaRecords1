import React, { useContext } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../../theme/themeContext';
import colors from '../../theme/colors';
import darkColors from '../../theme/darkColors';
import typography from '../../theme/typography';
import spacing from '../../theme/spacing';

const ConfirmationDialog = ({ visible, title, message, onCancel, onConfirm }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const theme = isDarkMode ? darkColors : colors;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
        <View style={[styles.container, { backgroundColor: theme.white }]}>
          <Ionicons name="alert-circle" size={32} color={theme.warning} style={styles.icon} />
          <Text style={[styles.title, { color: theme.text }]}>
            {title || 'Are you sure?'}
          </Text>
          <Text style={[styles.message, { color: theme.secondaryText }]}>
            {message || 'This action cannot be undone.'}
          </Text>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: theme.lightGray }]}
              onPress={onCancel}
            >
              <Text style={[styles.cancelText, { color: theme.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: theme.error }]}
              onPress={onConfirm}
            >
              <Text style={[styles.confirmText, { color: theme.white }]}>Yes, Delete</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.large,
  },
  container: {
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
    marginBottom: spacing.small,
  },
  message: {
    ...typography.body,
    textAlign: 'center',
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
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButton: {
    flex: 1,
    marginLeft: spacing.small,
    paddingVertical: spacing.medium,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelText: {
    ...typography.button,
  },
  confirmText: {
    ...typography.button,
  },
});

export default ConfirmationDialog;

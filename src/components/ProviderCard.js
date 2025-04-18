import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ThemeContext } from '../theme/themeContext';
import colors from '../theme/colors';
import darkColors from '../theme/darkColors';
import typography from '../theme/typography';
import spacing from '../theme/spacing';

const ProviderCard = ({ provider = {}, onEdit = () => {}, onDelete = () => {} }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const theme = isDarkMode ? darkColors : colors;

  const handleCall = () => {
    if (provider.phone) {
      Alert.alert(`Calling ${provider.name}`, provider.phone);
    } else {
      Alert.alert('No phone number available');
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete Provider',
      `Are you sure you want to delete ${provider.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(provider.id),
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.white, shadowColor: theme.black }]}>
      <View style={styles.header}>
        <View style={styles.nameContainer}>
          <Text style={[styles.name, { color: theme.text }]}>{provider.name}</Text>
          {provider.specialty && (
            <Text style={[styles.specialty, { color: theme.secondaryText }]}>
              {provider.specialty}
            </Text>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
            <Ionicons name="create-outline" size={22} color={theme.primary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={confirmDelete}>
            <Ionicons name="trash-outline" size={22} color={theme.error} />
          </TouchableOpacity>
        </View>
      </View>

      {provider.facility && (
        <View style={styles.infoRow}>
          <MaterialIcons name="business" size={16} color={theme.secondaryText} />
          <Text style={[styles.infoText, { color: theme.text }]}>{provider.facility}</Text>
        </View>
      )}

      {provider.phone && (
        <TouchableOpacity style={styles.infoRow} onPress={handleCall}>
          <Ionicons name="call-outline" size={16} color={theme.secondaryText} />
          <Text style={[styles.infoText, styles.phoneText, { color: theme.primary }]}>
            {provider.phone}
          </Text>
        </TouchableOpacity>
      )}

      {provider.address && (
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color={theme.secondaryText} />
          <Text style={[styles.infoText, { color: theme.text }]}>{provider.address}</Text>
        </View>
      )}

      {provider.notes && (
        <View style={[styles.notesContainer, { backgroundColor: theme.lightBackground }]}>
          <Text style={[styles.notesLabel, { color: theme.text }]}>Notes:</Text>
          <Text style={[styles.notesText, { color: theme.text }]}>{provider.notes}</Text>
        </View>
      )}

      <View style={[styles.footer, { borderTopColor: theme.lightGray }]}>
        <TouchableOpacity style={styles.footerButton} onPress={handleCall}>
          <Ionicons name="call-outline" size={20} color={theme.primary} />
          <Text style={[styles.footerButtonText, { color: theme.primary }]}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerButton}>
          <MaterialIcons name="directions" size={20} color={theme.primary} />
          <Text style={[styles.footerButtonText, { color: theme.primary }]}>Directions</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerButton} onPress={onEdit}>
          <Ionicons name="create-outline" size={20} color={theme.primary} />
          <Text style={[styles.footerButtonText, { color: theme.primary }]}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: spacing.medium,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.medium,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    ...typography.h3,
    marginBottom: spacing.extraSmall,
  },
  specialty: {
    ...typography.body,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: spacing.small,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  infoText: {
    ...typography.body,
    marginLeft: spacing.small,
    flex: 1,
  },
  phoneText: {
    fontWeight: 'bold',
  },
  notesContainer: {
    marginTop: spacing.small,
    padding: spacing.medium,
    borderRadius: 8,
  },
  notesLabel: {
    ...typography.label,
    marginBottom: spacing.extraSmall,
  },
  notesText: {
    ...typography.body,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.medium,
    paddingTop: spacing.medium,
    borderTopWidth: 1,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerButtonText: {
    ...typography.button,
    marginLeft: spacing.extraSmall,
  },
});

export default ProviderCard;

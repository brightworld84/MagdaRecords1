import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import colors from '../theme/colors';
import typography from '../theme/typography';
import spacing from '../theme/spacing';

const ProviderCard = ({ provider, onEdit, onDelete }) => {
  const handleCall = () => {
    // In a real app, this would use Linking to make a phone call
    if (provider.phone) {
      alert(`Calling ${provider.name} at ${provider.phone}`);
    } else {
      alert('No phone number available');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{provider.name}</Text>
          {provider.specialty && (
            <Text style={styles.specialty}>{provider.specialty}</Text>
          )}
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onEdit}
          >
            <Ionicons name="create-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onDelete}
          >
            <Ionicons name="trash-outline" size={22} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
      
      {provider.facility && (
        <View style={styles.infoRow}>
          <MaterialIcons name="business" size={16} color={colors.secondaryText} />
          <Text style={styles.infoText}>{provider.facility}</Text>
        </View>
      )}
      
      {provider.phone && (
        <TouchableOpacity style={styles.infoRow} onPress={handleCall}>
          <Ionicons name="call-outline" size={16} color={colors.secondaryText} />
          <Text style={[styles.infoText, styles.phoneText]}>{provider.phone}</Text>
        </TouchableOpacity>
      )}
      
      {provider.address && (
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color={colors.secondaryText} />
          <Text style={styles.infoText}>{provider.address}</Text>
        </View>
      )}
      
      {provider.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Notes:</Text>
          <Text style={styles.notesText}>{provider.notes}</Text>
        </View>
      )}
      
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton} onPress={handleCall}>
          <Ionicons name="call-outline" size={20} color={colors.primary} />
          <Text style={styles.footerButtonText}>Call</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.footerButton}>
          <MaterialIcons name="directions" size={20} color={colors.primary} />
          <Text style={styles.footerButtonText}>Directions</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.footerButton} onPress={onEdit}>
          <Ionicons name="create-outline" size={20} color={colors.primary} />
          <Text style={styles.footerButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: spacing.medium,
    elevation: 1,
    shadowColor: colors.black,
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
    color: colors.text,
    marginBottom: spacing.extraSmall,
  },
  specialty: {
    ...typography.body,
    color: colors.secondaryText,
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
    color: colors.text,
    marginLeft: spacing.small,
    flex: 1,
  },
  phoneText: {
    color: colors.primary,
  },
  notesContainer: {
    marginTop: spacing.small,
    backgroundColor: colors.lightBackground,
    padding: spacing.medium,
    borderRadius: 8,
  },
  notesLabel: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.extraSmall,
  },
  notesText: {
    ...typography.body,
    color: colors.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    marginTop: spacing.medium,
    paddingTop: spacing.medium,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerButtonText: {
    ...typography.button,
    color: colors.primary,
    marginLeft: spacing.extraSmall,
  },
});

export default ProviderCard;
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import typography from '../theme/typography';

export default function ProviderCard({ provider, onPress, onEdit }) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.name}>{provider.name}</Text>
        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
          <Ionicons name="pencil" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.specialty}>{provider.specialty}</Text>
      <Text style={styles.facility}>{provider.facility}</Text>
      
      <View style={styles.contactInfo}>
        <Text style={styles.phone}>{provider.phone}</Text>
        <Text style={styles.address}>{provider.address}</Text>
      </View>
      
      {provider.notes && (
        <Text style={styles.notes}>{provider.notes}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    ...typography.h3,
  },
  editButton: {
    padding: 4,
  },
  specialty: {
    ...typography.subtitle,
    color: colors.secondary,
    marginBottom: 4,
  },
  facility: {
    ...typography.body,
    marginBottom: 8,
  },
  contactInfo: {
    marginBottom: 8,
  },
  phone: {
    ...typography.body,
    marginBottom: 4,
  },
  address: {
    ...typography.bodySmall,
    color: colors.secondaryText,
  },
  notes: {
    ...typography.bodySmall,
    fontStyle: 'italic',
    color: colors.secondaryText,
    marginTop: 8,
  },
});

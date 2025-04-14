import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import typography from '../theme/typography';
import spacing from '../theme/spacing';

const MedicationInteraction = ({ interaction }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return colors.error;
      case 'moderate':
        return colors.warning;
      case 'low':
        return colors.success;
      default:
        return colors.text;
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'warning-outline';
      case 'moderate':
        return 'alert-circle-outline';
      case 'low':
        return 'information-circle-outline';
      default:
        return 'information-circle-outline';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.medicationsContainer}>
          <Text style={styles.medicationName}>{interaction.medication1}</Text>
          <Ionicons name="swap-horizontal" size={18} color={colors.text} style={styles.interactionIcon} />
          <Text style={styles.medicationName}>{interaction.medication2}</Text>
        </View>
        
        <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(interaction.severity) }]}>
          <Ionicons name={getSeverityIcon(interaction.severity)} size={14} color={colors.white} />
          <Text style={styles.severityText}>{interaction.severity}</Text>
        </View>
      </View>
      
      <Text style={styles.summary} numberOfLines={2}>
        {interaction.summary}
      </Text>
      
      <TouchableOpacity 
        style={styles.detailsButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.detailsButtonText}>View Details</Text>
      </TouchableOpacity>
      
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Medication Interaction</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <View style={styles.modalMedicationsContainer}>
                <View style={styles.modalMedicationItem}>
                  <Ionicons name="medkit-outline" size={20} color={colors.primary} />
                  <Text style={styles.modalMedicationName}>{interaction.medication1}</Text>
                </View>
                <View style={styles.modalInteractionIconContainer}>
                  <Ionicons name="swap-vertical" size={24} color={colors.text} />
                </View>
                <View style={styles.modalMedicationItem}>
                  <Ionicons name="medkit-outline" size={20} color={colors.primary} />
                  <Text style={styles.modalMedicationName}>{interaction.medication2}</Text>
                </View>
              </View>
              
              <View style={[
                styles.modalSeverityContainer, 
                { backgroundColor: getSeverityColor(interaction.severity) + '20' }
              ]}>
                <Ionicons 
                  name={getSeverityIcon(interaction.severity)} 
                  size={22} 
                  color={getSeverityColor(interaction.severity)} 
                />
                <Text style={[
                  styles.modalSeverityText,
                  { color: getSeverityColor(interaction.severity) }
                ]}>
                  {interaction.severity} Severity
                </Text>
              </View>
              
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Description</Text>
                <Text style={styles.modalSectionText}>{interaction.description}</Text>
              </View>
              
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Potential Effects</Text>
                <Text style={styles.modalSectionText}>{interaction.effects}</Text>
              </View>
              
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Recommendations</Text>
                <Text style={styles.modalSectionText}>{interaction.recommendations}</Text>
              </View>
              
              <View style={styles.modalFooter}>
                <Text style={styles.modalDisclaimer}>
                  Always consult your healthcare provider before making any changes to your medication regimen.
                </Text>
              </View>
              
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  medicationsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  medicationName: {
    ...typography.subtitle,
    color: colors.text,
  },
  interactionIcon: {
    marginHorizontal: spacing.small,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.small,
    paddingVertical: spacing.extraSmall,
    borderRadius: 12,
  },
  severityText: {
    ...typography.small,
    color: colors.white,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  summary: {
    ...typography.body,
    color: colors.secondaryText,
    marginBottom: spacing.small,
  },
  detailsButton: {
    alignSelf: 'flex-start',
  },
  detailsButtonText: {
    ...typography.button,
    color: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
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
    ...typography.h2,
    color: colors.text,
  },
  modalContent: {
    padding: spacing.medium,
  },
  modalMedicationsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.medium,
  },
  modalMedicationItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBackground,
    padding: spacing.medium,
    borderRadius: 8,
  },
  modalInteractionIconContainer: {
    paddingHorizontal: spacing.small,
  },
  modalMedicationName: {
    ...typography.subtitle,
    color: colors.text,
    marginLeft: spacing.small,
  },
  modalSeverityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.medium,
    borderRadius: 8,
    marginBottom: spacing.medium,
  },
  modalSeverityText: {
    ...typography.subtitle,
    marginLeft: spacing.small,
  },
  modalSection: {
    marginBottom: spacing.medium,
  },
  modalSectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.small,
  },
  modalSectionText: {
    ...typography.body,
    color: colors.text,
  },
  modalFooter: {
    marginTop: spacing.medium,
    padding: spacing.medium,
    backgroundColor: colors.lightBackground,
    borderRadius: 8,
  },
  modalDisclaimer: {
    ...typography.small,
    color: colors.secondaryText,
    fontStyle: 'italic',
  },
  modalCloseButton: {
    backgroundColor: colors.primary,
    padding: spacing.medium,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.medium,
  },
  modalCloseButtonText: {
    ...typography.button,
    color: colors.white,
  },
});

export default MedicationInteraction;

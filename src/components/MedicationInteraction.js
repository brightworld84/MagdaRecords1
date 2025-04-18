import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../theme/themeContext';
import colors from '../theme/colors';
import darkColors from '../theme/darkColors';
import typography from '../theme/typography';
import spacing from '../theme/spacing';

const MedicationInteraction = ({ interaction = {} }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { isDarkMode } = useContext(ThemeContext);
  const theme = isDarkMode ? darkColors : colors;

  const getSeverityColor = (severity = '') => {
    switch (severity.toLowerCase()) {
      case 'high': return theme.error;
      case 'moderate': return theme.warning;
      case 'low': return theme.success;
      default: return theme.text;
    }
  };

  const getSeverityIcon = (severity = '') => {
    switch (severity.toLowerCase()) {
      case 'high': return 'warning-outline';
      case 'moderate': return 'alert-circle-outline';
      case 'low': return 'information-circle-outline';
      default: return 'information-circle-outline';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.white, shadowColor: theme.black }]}>
      <View style={styles.header}>
        <View style={styles.medicationsContainer}>
          <Text style={[styles.medicationName, { color: theme.text }]}>
            {interaction.medication1}
          </Text>
          <Ionicons name="swap-horizontal" size={18} color={theme.text} style={styles.interactionIcon} />
          <Text style={[styles.medicationName, { color: theme.text }]}>
            {interaction.medication2}
          </Text>
        </View>

        <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(interaction.severity) }]}>
          <Ionicons name={getSeverityIcon(interaction.severity)} size={14} color={theme.white} />
          <Text style={styles.severityText}>{interaction.severity}</Text>
        </View>
      </View>

      <Text style={[styles.summary, { color: theme.secondaryText }]} numberOfLines={2}>
        {interaction.summary}
      </Text>

      <TouchableOpacity style={styles.detailsButton} onPress={() => setModalVisible(true)}>
        <Text style={[styles.detailsButtonText, { color: theme.primary }]}>View Details</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.white }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.lightGray }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Medication Interaction</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.modalMedicationsContainer}>
                <View style={[styles.modalMedicationItem, { backgroundColor: theme.lightBackground }]}>
                  <Ionicons name="medkit-outline" size={20} color={theme.primary} />
                  <Text style={[styles.modalMedicationName, { color: theme.text }]}>
                    {interaction.medication1}
                  </Text>
                </View>
                <View style={styles.modalInteractionIconContainer}>
                  <Ionicons name="swap-vertical" size={24} color={theme.text} />
                </View>
                <View style={[styles.modalMedicationItem, { backgroundColor: theme.lightBackground }]}>
                  <Ionicons name="medkit-outline" size={20} color={theme.primary} />
                  <Text style={[styles.modalMedicationName, { color: theme.text }]}>
                    {interaction.medication2}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.modalSeverityContainer,
                  { backgroundColor: getSeverityColor(interaction.severity) + '20' },
                ]}
              >
                <Ionicons
                  name={getSeverityIcon(interaction.severity)}
                  size={22}
                  color={getSeverityColor(interaction.severity)}
                />
                <Text
                  style={[
                    styles.modalSeverityText,
                    { color: getSeverityColor(interaction.severity) },
                  ]}
                >
                  {interaction.severity} Severity
                </Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Description</Text>
                <Text style={[styles.modalSectionText, { color: theme.text }]}>
                  {interaction.description}
                </Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Potential Effects</Text>
                <Text style={[styles.modalSectionText, { color: theme.text }]}>
                  {interaction.effects}
                </Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Recommendations</Text>
                <Text style={[styles.modalSectionText, { color: theme.text }]}>
                  {interaction.recommendations}
                </Text>
              </View>

              <View style={[styles.modalFooter, { backgroundColor: theme.lightBackground }]}>
                <Text style={[styles.modalDisclaimer, { color: theme.secondaryText }]}>
                  Always consult your healthcare provider before making any changes to your medication regimen.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.modalCloseButton, { backgroundColor: theme.primary }]}
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
    marginBottom: spacing.small,
  },
  detailsButton: {
    alignSelf: 'flex-start',
  },
  detailsButtonText: {
    ...typography.button,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
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
  },
  modalTitle: {
    ...typography.h2,
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
    padding: spacing.medium,
    borderRadius: 8,
  },
  modalInteractionIconContainer: {
    paddingHorizontal: spacing.small,
  },
  modalMedicationName: {
    ...typography.subtitle,
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
    marginBottom: spacing.small,
  },
  modalSectionText: {
    ...typography.body,
  },
  modalFooter: {
    marginTop: spacing.medium,
    padding: spacing.medium,
    borderRadius: 8,
  },
  modalDisclaimer: {
    ...typography.small,
    fontStyle: 'italic',
  },
  modalCloseButton: {
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

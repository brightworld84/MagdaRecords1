import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../theme/themeContext';
import colors from '../theme/colors';
import darkColors from '../theme/darkColors';
import typography from '../theme/typography';
import spacing from '../theme/spacing';

const HealthRecommendation = ({ recommendation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { isDarkMode } = useContext(ThemeContext);
  const theme = isDarkMode ? darkColors : colors;

  const getCategoryIcon = (category) => {
    const iconColor = theme.primary;
    switch (category) {
      case 'nutrition':
        return <Ionicons name="nutrition-outline" size={24} color={iconColor} />;
      case 'exercise':
        return <Ionicons name="fitness-outline" size={24} color={iconColor} />;
      case 'medication':
        return <Ionicons name="medkit-outline" size={24} color={iconColor} />;
      case 'checkup':
        return <Ionicons name="calendar-outline" size={24} color={iconColor} />;
      case 'lifestyle':
        return <Ionicons name="sunny-outline" size={24} color={iconColor} />;
      case 'mentalHealth':
        return <Ionicons name="heart-outline" size={24} color={iconColor} />;
      default:
        return <Ionicons name="bulb-outline" size={24} color={iconColor} />;
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'nutrition':
        return 'Nutrition';
      case 'exercise':
        return 'Exercise';
      case 'medication':
        return 'Medication';
      case 'checkup':
        return 'Check-up';
      case 'lifestyle':
        return 'Lifestyle';
      case 'mentalHealth':
        return 'Mental Health';
      default:
        return 'General';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return theme.error;
      case 'medium':
        return theme.warning;
      case 'low':
        return theme.success;
      default:
        return theme.text;
    }
  };

  return (
    <TouchableOpacity style={[styles.container, { backgroundColor: theme.white, shadowColor: theme.black }]} onPress={() => setModalVisible(true)}>
      <View style={styles.iconContainer}>{getCategoryIcon(recommendation.category)}</View>

      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: theme.text }]}>{recommendation.title}</Text>
        <Text style={[styles.summary, { color: theme.secondaryText }]} numberOfLines={2}>
          {recommendation.summary}
        </Text>

        <View style={styles.footer}>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(recommendation.priority) }]}>
            <Text style={styles.priorityText}>
              {recommendation.priority === 'high' ? 'High Priority' :
               recommendation.priority === 'medium' ? 'Medium Priority' : 'Low Priority'}
            </Text>
          </View>

          <Text style={[styles.sourceText, { color: theme.secondaryText }]}>
            Based on your {recommendation.basedOn}
          </Text>
        </View>
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.white }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.lightGray }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Health Recommendation</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.modalCategoryContainer}>
                {getCategoryIcon(recommendation.category)}
                <Text style={[styles.modalCategoryText, { color: theme.primary }]}>
                  {getCategoryLabel(recommendation.category)}
                </Text>
              </View>

              <Text style={[styles.modalRecommendationTitle, { color: theme.text }]}>
                {recommendation.title}
              </Text>

              <View
                style={[
                  styles.modalPriorityContainer,
                  { backgroundColor: getPriorityColor(recommendation.priority) + '20' },
                ]}
              >
                <Ionicons
                  name={
                    recommendation.priority === 'high'
                      ? 'alert-circle'
                      : recommendation.priority === 'medium'
                      ? 'information-circle'
                      : 'checkmark-circle'
                  }
                  size={22}
                  color={getPriorityColor(recommendation.priority)}
                />
                <Text
                  style={[
                    styles.modalPriorityText,
                    { color: getPriorityColor(recommendation.priority) },
                  ]}
                >
                  {recommendation.priority === 'high'
                    ? 'High Priority'
                    : recommendation.priority === 'medium'
                    ? 'Medium Priority'
                    : 'Low Priority'}
                </Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Summary</Text>
                <Text style={[styles.modalSectionText, { color: theme.text }]}>
                  {recommendation.summary}
                </Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Details</Text>
                <Text style={[styles.modalSectionText, { color: theme.text }]}>
                  {recommendation.details}
                </Text>
              </View>

              {recommendation.steps && (
                <View style={styles.modalSection}>
                  <Text style={[styles.modalSectionTitle, { color: theme.text }]}>
                    Suggested Steps
                  </Text>
                  {recommendation.steps.map((step, index) => (
                    <View key={index} style={styles.stepContainer}>
                      <View style={[styles.stepNumberContainer, { backgroundColor: theme.primary }]}>
                        <Text style={[styles.stepNumber, { color: theme.white }]}>
                          {index + 1}
                        </Text>
                      </View>
                      <Text style={[styles.stepText, { color: theme.text }]}>{step}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View
                style={[
                  styles.modalSourceContainer,
                  { backgroundColor: theme.lightBackground },
                ]}
              >
                <Text style={[styles.modalSourceTitle, { color: theme.text }]}>
                  Based On
                </Text>
                <Text style={[styles.modalSourceText, { color: theme.secondaryText }]}>
                  This recommendation is based on your {recommendation.basedOn.toLowerCase()}.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.modalCloseButton, { backgroundColor: theme.primary }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: spacing.medium,
    flexDirection: 'row',
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  iconContainer: { marginRight: spacing.medium },
  contentContainer: { flex: 1 },
  title: { ...typography.subtitle, marginBottom: spacing.small },
  summary: { ...typography.body, marginBottom: spacing.small },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priorityBadge: {
    paddingHorizontal: spacing.small,
    paddingVertical: spacing.extraSmall,
    borderRadius: 12,
  },
  priorityText: {
    ...typography.small,
    color: colors.white,
    fontWeight: 'bold',
  },
  sourceText: { ...typography.small },
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
  modalTitle: { ...typography.h2 },
  modalContent: { padding: spacing.medium },
  modalCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.medium,
  },
  modalCategoryText: {
    ...typography.subtitle,
    marginLeft: spacing.small,
  },
  modalRecommendationTitle: {
    ...typography.h2,
    marginBottom: spacing.medium,
  },
  modalPriorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.medium,
    borderRadius: 8,
    marginBottom: spacing.medium,
  },
  modalPriorityText: {
    ...typography.subtitle,
    marginLeft: spacing.small,
  },
  modalSection: { marginBottom: spacing.large },
  modalSectionTitle: {
    ...typography.h3,
    marginBottom: spacing.small,
  },
  modalSectionText: { ...typography.body },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: spacing.medium,
    alignItems: 'flex-start',
  },
  stepNumberContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.medium,
    marginTop: 2,
  },
  stepNumber: {
    ...typography.small,
    fontWeight: 'bold',
  },
  stepText: {
    ...typography.body,
    flex: 1,
  },
  modalSourceContainer: {
    padding: spacing.medium,
    borderRadius: 8,
    marginBottom: spacing.medium,
  },
  modalSourceTitle: {
    ...typography.subtitle,
    marginBottom: spacing.small,
  },
  modalSourceText: { ...typography.body },
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

export default HealthRecommendation;

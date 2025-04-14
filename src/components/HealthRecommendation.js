import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
// other imports...
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import typography from '../theme/typography';
import spacing from '../theme/spacing';

const HealthRecommendation = ({ recommendation }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'nutrition':
        return <Ionicons name="nutrition-outline" size={24} color={colors.primary} />;
      case 'exercise':
        return <Ionicons name="fitness-outline" size={24} color={colors.primary} />;
      case 'medication':
        return <Ionicons name="medkit-outline" size={24} color={colors.primary} />;
      case 'checkup':
        return <Ionicons name="calendar-outline" size={24} color={colors.primary} />;
      case 'lifestyle':
        return <Ionicons name="sunny-outline" size={24} color={colors.primary} />;
      case 'mentalHealth':
        return <Ionicons name="heart-outline" size={24} color={colors.primary} />;
      default:
        return <Ionicons name="bulb-outline" size={24} color={colors.primary} />;
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
        return colors.error;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.success;
      default:
        return colors.text;
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => setModalVisible(true)}
    >
      <View style={styles.iconContainer}>
        {getCategoryIcon(recommendation.category)}
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{recommendation.title}</Text>
        <Text style={styles.summary} numberOfLines={2}>
          {recommendation.summary}
        </Text>
        
        <View style={styles.footer}>
          <View style={[
            styles.priorityBadge, 
            { backgroundColor: getPriorityColor(recommendation.priority) }
          ]}>
            <Text style={styles.priorityText}>
              {recommendation.priority === 'high' ? 'High Priority' :
               recommendation.priority === 'medium' ? 'Medium Priority' : 'Low Priority'}
            </Text>
          </View>
          
          <Text style={styles.sourceText}>
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
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Health Recommendation</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <View style={styles.modalCategoryContainer}>
                {getCategoryIcon(recommendation.category)}
                <Text style={styles.modalCategoryText}>
                  {getCategoryLabel(recommendation.category)}
                </Text>
              </View>
              
              <Text style={styles.modalRecommendationTitle}>
                {recommendation.title}
              </Text>
              
              <View style={[
                styles.modalPriorityContainer,
                { backgroundColor: getPriorityColor(recommendation.priority) + '20' }
              ]}>
                <Ionicons 
                  name={recommendation.priority === 'high' ? 'alert-circle' : 
                        recommendation.priority === 'medium' ? 'information-circle' : 'checkmark-circle'} 
                  size={22} 
                  color={getPriorityColor(recommendation.priority)} 
                />
                <Text style={[
                  styles.modalPriorityText,
                  { color: getPriorityColor(recommendation.priority) }
                ]}>
                  {recommendation.priority === 'high' ? 'High Priority' :
                   recommendation.priority === 'medium' ? 'Medium Priority' : 'Low Priority'}
                </Text>
              </View>
              
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Summary</Text>
                <Text style={styles.modalSectionText}>{recommendation.summary}</Text>
              </View>
              
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Details</Text>
                <Text style={styles.modalSectionText}>{recommendation.details}</Text>
              </View>
              
              {recommendation.steps && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Suggested Steps</Text>
                  {recommendation.steps.map((step, index) => (
                    <View key={index} style={styles.stepContainer}>
                      <View style={styles.stepNumberContainer}>
                        <Text style={styles.stepNumber}>{index + 1}</Text>
                      </View>
                      <Text style={styles.stepText}>{step}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Why This Matters</Text>
                <Text style={styles.modalSectionText}>{recommendation.whyItMatters}</Text>
              </View>
              
              <View style={styles.modalSourceContainer}>
                <Text style={styles.modalSourceTitle}>Based On</Text>
                <Text style={styles.modalSourceText}>
                  This recommendation is based on your {recommendation.basedOn.toLowerCase()}.
                </Text>
              </View>
              
              <TouchableOpacity 
                style={styles.modalCloseButton}
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
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: spacing.medium,
    flexDirection: 'row',
    elevation: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  iconContainer: {
    marginRight: spacing.medium,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.small,
  },
  summary: {
    ...typography.body,
    color: colors.secondaryText,
    marginBottom: spacing.small,
  },
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
  sourceText: {
    ...typography.small,
    color: colors.secondaryText,
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
  modalCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.medium,
  },
  modalCategoryText: {
    ...typography.subtitle,
    color: colors.primary,
    marginLeft: spacing.small,
  },
  modalRecommendationTitle: {
    ...typography.h2,
    color: colors.text,
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
  modalSection: {
    marginBottom: spacing.large,
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
  stepContainer: {
    flexDirection: 'row',
    marginBottom: spacing.medium,
    alignItems: 'flex-start',
  },
  stepNumberContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.medium,
    marginTop: 2,
  },
  stepNumber: {
    ...typography.small,
    color: colors.white,
    fontWeight: 'bold',
  },
  stepText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  modalSourceContainer: {
    backgroundColor: colors.lightBackground,
    padding: spacing.medium,
    borderRadius: 8,
    marginBottom: spacing.medium,
  },
  modalSourceTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.small,
  },
  modalSourceText: {
    ...typography.body,
    color: colors.secondaryText,
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

export default HealthRecommendation;

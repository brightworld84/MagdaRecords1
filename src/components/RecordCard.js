import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../theme/colors';
import typography from '../theme/typography';
import spacing from '../theme/spacing';

const RecordCard = ({ record, onDelete }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'lab':
        return <MaterialCommunityIcons name="test-tube" size={22} color={colors.primary} />;
      case 'imaging':
        return <MaterialCommunityIcons name="radioactive" size={22} color={colors.primary} />;
      case 'visit':
        return <Ionicons name="document-text-outline" size={22} color={colors.primary} />;
      case 'prescription':
        return <Ionicons name="medkit-outline" size={22} color={colors.primary} />;
      case 'immunization':
        return <MaterialCommunityIcons name="needle" size={22} color={colors.primary} />;
      default:
        return <Ionicons name="document-outline" size={22} color={colors.primary} />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'lab':
        return 'Lab Results';
      case 'imaging':
        return 'Imaging';
      case 'visit':
        return 'Visit Summary';
      case 'prescription':
        return 'Prescription';
      case 'immunization':
        return 'Immunization';
      default:
        return 'Document';
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleDelete = () => {
    setModalVisible(false);
    if (onDelete) {
      onDelete(record.id);
    }
  };

  const handleView = () => {
    setModalVisible(true);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handleView}>
      <View style={styles.header}>
        <View style={styles.typeContainer}>
          {getTypeIcon(record.type)}
          <Text style={styles.typeLabel}>{getTypeLabel(record.type)}</Text>
        </View>
        <Text style={styles.date}>{formatDate(record.date)}</Text>
      </View>
      
      <View style={styles.titleRow}>
        <Text style={styles.title}>{record.title}</Text>
        {record.metadata && record.metadata.aiAnalyzed && (
          <View style={styles.aiProcessedTag}>
            <MaterialCommunityIcons name="brain" size={14} color={colors.white} />
            <Text style={styles.aiProcessedText}>AI Analyzed</Text>
          </View>
        )}
      </View>
      
      {record.provider && (
        <View style={styles.providerContainer}>
          <Ionicons name="medical-outline" size={16} color={colors.secondaryText} />
          <Text style={styles.provider}>{record.provider}</Text>
        </View>
      )}
      
      {record.description && (
        <Text style={styles.description} numberOfLines={2}>
          {record.description}
        </Text>
      )}
      
      {record.metadata && record.metadata.keywords && record.metadata.keywords.length > 0 && (
        <View style={styles.keywordsContainer}>
          <Text style={styles.keywordsLabel}>Keywords:</Text>
          <View style={styles.keywords}>
            {record.metadata.keywords.slice(0, 3).map((keyword, index) => (
              <View key={index} style={styles.keywordChip}>
                <Text style={styles.keywordText}>{keyword}</Text>
              </View>
            ))}
            {record.metadata.keywords.length > 3 && (
              <View style={styles.keywordChip}>
                <Text style={styles.keywordText}>+{record.metadata.keywords.length - 3}</Text>
              </View>
            )}
          </View>
        </View>
      )}
      
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Medical Record</Text>
              <TouchableOpacity
                style={styles.shareButton}
              >
                <Ionicons name="share-outline" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <View style={styles.modalTypeContainer}>
                {getTypeIcon(record.type)}
                <Text style={styles.modalTypeLabel}>{getTypeLabel(record.type)}</Text>
              </View>
              
              <Text style={styles.modalRecordTitle}>{record.title}</Text>
              
              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>Date:</Text>
                <Text style={styles.modalInfoValue}>{formatDate(record.date)}</Text>
              </View>
              
              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>Provider:</Text>
                <Text style={styles.modalInfoValue}>{record.provider || 'Not specified'}</Text>
              </View>
              
              {record.description && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Description</Text>
                  <Text style={styles.modalSectionContent}>{record.description}</Text>
                </View>
              )}
              
              {record.uploadType && (
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoLabel}>Upload Method:</Text>
                  <Text style={styles.modalInfoValue}>
                    {record.uploadType === 'image' ? 'Image Upload' : 
                     record.uploadType === 'document' ? 'Document Upload' :
                     record.uploadType === 'camera' ? 'Camera Capture' :
                     record.uploadType === 'fhir' ? 'FHIR Import' :
                     record.uploadType === 'email' ? 'Email Import' : 'Unknown'}
                  </Text>
                </View>
              )}
              
              {record.metadata && record.metadata.aiAnalyzed && (
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoLabel}>AI Analysis:</Text>
                  <View style={styles.aiTag}>
                    <MaterialCommunityIcons name="brain" size={16} color={colors.white} />
                    <Text style={styles.aiTagText}>Analyzed by AI</Text>
                  </View>
                </View>
              )}
              
              {record.metadata && record.metadata.keywords && record.metadata.keywords.length > 0 && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Keywords</Text>
                  <View style={styles.modalKeywordsContainer}>
                    {record.metadata.keywords.map((keyword, index) => (
                      <View key={index} style={styles.modalKeywordChip}>
                        <Text style={styles.modalKeywordText}>{keyword}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalActionButton}>
                  <Ionicons name="download-outline" size={20} color={colors.primary} />
                  <Text style={styles.modalActionText}>Download</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.modalActionButton}>
                  <Ionicons name="create-outline" size={20} color={colors.primary} />
                  <Text style={styles.modalActionText}>Edit</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalActionButton, styles.deleteButton]}
                  onPress={handleDelete}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                  <Text style={[styles.modalActionText, styles.deleteText]}>Delete</Text>
                </TouchableOpacity>
              </View>
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
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeLabel: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '500',
    marginLeft: spacing.extraSmall,
  },
  date: {
    ...typography.small,
    color: colors.secondaryText,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.small,
  },
  title: {
    ...typography.subtitle,
    color: colors.text,
    flex: 1,
    marginRight: spacing.small,
  },
  aiProcessedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingVertical: 2,
    paddingHorizontal: spacing.small,
    borderRadius: 12,
  },
  aiProcessedText: {
    ...typography.small,
    color: colors.white,
    marginLeft: 4,
    fontSize: 10,
  },
  providerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  provider: {
    ...typography.small,
    color: colors.secondaryText,
    marginLeft: spacing.extraSmall,
  },
  description: {
    ...typography.body,
    color: colors.secondaryText,
    marginBottom: spacing.small,
  },
  keywordsContainer: {
    marginTop: spacing.small,
  },
  keywordsLabel: {
    ...typography.small,
    color: colors.secondaryText,
    marginBottom: 4,
  },
  keywords: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  keywordChip: {
    backgroundColor: colors.lightBackground,
    paddingVertical: 2,
    paddingHorizontal: spacing.small,
    borderRadius: 12,
    marginRight: spacing.small,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  keywordText: {
    ...typography.small,
    color: colors.text,
    fontSize: 10,
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
    height: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  closeButton: {
    padding: spacing.small,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
  },
  shareButton: {
    padding: spacing.small,
  },
  modalContent: {
    padding: spacing.medium,
  },
  modalTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBackground,
    paddingVertical: spacing.small,
    paddingHorizontal: spacing.medium,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: spacing.medium,
  },
  modalTypeLabel: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '500',
    marginLeft: spacing.small,
  },
  modalRecordTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.medium,
  },
  modalInfoRow: {
    flexDirection: 'row',
    marginBottom: spacing.small,
  },
  modalInfoLabel: {
    ...typography.body,
    color: colors.secondaryText,
    width: 100,
  },
  modalInfoValue: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  modalSection: {
    marginTop: spacing.medium,
    marginBottom: spacing.medium,
  },
  modalSectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.small,
  },
  modalSectionContent: {
    ...typography.body,
    color: colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingTop: spacing.large,
    marginTop: spacing.large,
  },
  modalActionButton: {
    alignItems: 'center',
    padding: spacing.medium,
  },
  modalActionText: {
    ...typography.button,
    color: colors.primary,
    marginTop: spacing.small,
  },
  deleteButton: {
    // Special styles for delete button
  },
  deleteText: {
    color: colors.error,
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingVertical: 3,
    paddingHorizontal: spacing.small,
    borderRadius: 12,
  },
  aiTagText: {
    ...typography.small,
    color: colors.white,
    marginLeft: 4,
    fontSize: 12,
  },
  modalKeywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modalKeywordChip: {
    backgroundColor: colors.lightBackground,
    paddingVertical: 4,
    paddingHorizontal: spacing.small,
    borderRadius: 12,
    marginRight: spacing.small,
    marginBottom: spacing.small,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  modalKeywordText: {
    ...typography.small,
    color: colors.text,
  }
});

export default RecordCard;
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import typography from '../theme/typography';

export default function RecordCard({ record, onPress }) {
  const getIconName = (type) => {
    switch (type) {
      case 'visit':
        return 'medical';
      case 'lab':
        return 'flask';
      case 'imaging':
        return 'scan';
      case 'prescription':
        return 'medkit';
      case 'immunization':
        return 'fitness';
      default:
        return 'document-text';
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name={getIconName(record.type)} size={24} color={colors.primary} />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{record.title}</Text>
          <Text style={styles.date}>{record.date}</Text>
        </View>
      </View>
      
      <Text style={styles.provider}>{record.provider}</Text>
      <Text style={styles.description} numberOfLines={2}>{record.description}</Text>
      
      {record.metadata?.aiAnalyzed && (
        <View style={styles.aiContainer}>
          <Ionicons name="analytics" size={16} color={colors.secondary} />
          <Text style={styles.aiText}>AI Analysis Available</Text>
        </View>
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
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...typography.subtitle,
    marginBottom: 4,
  },
  date: {
    ...typography.caption,
  },
  provider: {
    ...typography.body,
    color: colors.secondary,
    marginBottom: 4,
  },
  description: {
    ...typography.bodySmall,
    color: colors.secondaryText,
  },
  aiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  aiText: {
    ...typography.caption,
    color: colors.secondary,
    marginLeft: 4,
  },
});

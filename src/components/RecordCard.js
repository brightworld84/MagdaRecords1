import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeContext } from '../theme/themeContext';
import colors from '../theme/colors';
import darkColors from '../theme/darkColors';
import typography from '../theme/typography';
import spacing from '../theme/spacing';

const RecordCard = ({ record, onDelete }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const themedColors = isDarkMode ? darkColors : colors;
  const [modalVisible, setModalVisible] = useState(false);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'lab':
        return <MaterialCommunityIcons name="test-tube" size={22} color={themedColors.primary} />;
      case 'imaging':
        return <MaterialCommunityIcons name="radioactive" size={22} color={themedColors.primary} />;
      case 'visit':
        return <Ionicons name="document-text-outline" size={22} color={themedColors.primary} />;
      case 'prescription':
        return <Ionicons name="medkit-outline" size={22} color={themedColors.primary} />;
      case 'immunization':
        return <MaterialCommunityIcons name="needle" size={22} color={themedColors.primary} />;
      default:
        return <Ionicons name="document-outline" size={22} color={themedColors.primary} />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'lab': return 'Lab Results';
      case 'imaging': return 'Imaging';
      case 'visit': return 'Visit Summary';
      case 'prescription': return 'Prescription';
      case 'immunization': return 'Immunization';
      default: return 'Document';
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete Record',
      'Are you sure you want to delete this record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (onDelete) {
              onDelete(record.id);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleView = () => {
    setModalVisible(true);
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: themedColors.white, shadowColor: themedColors.black }]}
      onPress={handleView}
    >
      <View style={styles.header}>
        <View style={styles.typeContainer}>
          {getTypeIcon(record.type)}
          <Text style={[styles.typeLabel, { color: themedColors.primary }]}>
            {getTypeLabel(record.type)}
          </Text>
        </View>
        <Text style={[styles.date, { color: themedColors.secondaryText }]}>
          {formatDate(record.date)}
        </Text>
      </View>

      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: themedColors.text }]}>
          {record.title}
        </Text>
        {record.metadata?.aiAnalyzed && (
          <View style={styles.aiProcessedTag}>
            <MaterialCommunityIcons name="brain" size={14} color={themedColors.white} />
            <Text style={styles.aiProcessedText}>AI Analyzed</Text>
          </View>
        )}
      </View>

      {record.provider && (
        <View style={styles.providerContainer}>
          <Ionicons name="medical-outline" size={16} color={themedColors.secondaryText} />
          <Text style={[styles.provider, { color: themedColors.secondaryText }]}>
            {record.provider}
          </Text>
        </View>
      )}

      {record.description && (
        <Text style={[styles.description, { color: themedColors.secondaryText }]} numberOfLines={2}>
          {record.description}
        </Text>
      )}

      {record.metadata?.keywords?.length > 0 && (
        <View style={styles.keywordsContainer}>
          <Text style={[styles.keywordsLabel, { color: themedColors.secondaryText }]}>Keywords:</Text>
          <View style={styles.keywords}>
            {record.metadata.keywords.slice(0, 3).map((keyword, index) => (
              <View
                key={index}
                style={[
                  styles.keywordChip,
                  {
                    backgroundColor: themedColors.lightBackground,
                    borderColor: themedColors.lightGray,
                  },
                ]}
              >
                <Text style={[styles.keywordText, { color: themedColors.text }]}>
                  {keyword}
                </Text>
              </View>
            ))}
            {record.metadata.keywords.length > 3 && (
              <View
                style={[
                  styles.keywordChip,
                  {
                    backgroundColor: themedColors.lightBackground,
                    borderColor: themedColors.lightGray,
                  },
                ]}
              >
                <Text style={[styles.keywordText, { color: themedColors.text }]}>
                  +{record.metadata.keywords.length - 3}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Add more modal or buttons here as needed */}
      <TouchableOpacity onPress={confirmDelete} style={{ marginTop: spacing.medium }}>
        <Text style={{ color: themedColors.error, fontWeight: 'bold' }}>Delete</Text>
      </TouchableOpacity>
    </TouchableOpacity>
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
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeLabel: {
    ...typography.small,
    fontWeight: '500',
    marginLeft: spacing.extraSmall,
  },
  date: {
    ...typography.small,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.small,
  },
  title: {
    ...typography.subtitle,
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
    marginLeft: spacing.extraSmall,
  },
  description: {
    ...typography.body,
    marginBottom: spacing.small,
  },
  keywordsContainer: {
    marginTop: spacing.small,
  },
  keywordsLabel: {
    ...typography.small,
    marginBottom: 4,
  },
  keywords: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  keywordChip: {
    paddingVertical: 2,
    paddingHorizontal: spacing.small,
    borderRadius: 12,
    marginRight: spacing.small,
    marginBottom: 4,
    borderWidth: 1,
  },
  keywordText: {
    ...typography.small,
    fontSize: 10,
  },
});

export default RecordCard;

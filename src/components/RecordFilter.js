import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import typography from '../theme/typography';
import spacing from '../theme/spacing';

const RecordFilter = ({ options, onApplyFilters, onCancel, allRecords = [] }) => {
  const safeOptions = options || { recordType: 'all', dateRange: 'all', provider: 'all', keywords: [] };

  const [selectedType, setSelectedType] = useState(safeOptions.recordType || 'all');
  const [selectedDateRange, setSelectedDateRange] = useState(safeOptions.dateRange || 'all');
  const [selectedProvider, setSelectedProvider] = useState(safeOptions.provider || 'all');
  const [selectedKeywords, setSelectedKeywords] = useState(safeOptions.keywords || []);
  const [keywordInput, setKeywordInput] = useState('');
  const [suggestedKeywords, setSuggestedKeywords] = useState([]);

  useEffect(() => {
    if (options) {
      setSelectedType(safeOptions.recordType || 'all');
      setSelectedDateRange(safeOptions.dateRange || 'all');
      setSelectedProvider(safeOptions.provider || 'all');
      setSelectedKeywords(safeOptions.keywords || []);
    }
  }, [options]);

  useEffect(() => {
    const keywordMap = new Map();
    allRecords.forEach(record => {
      if (record.metadata?.keywords && Array.isArray(record.metadata.keywords)) {
        record.metadata.keywords.forEach(keyword => {
          const count = keywordMap.get(keyword) || 0;
          keywordMap.set(keyword, count + 1);
        });
      }
    });

    const allKeywords = Array.from(keywordMap.entries())
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)
      .map(item => item.keyword);

    setSuggestedKeywords(allKeywords);
  }, [allRecords]);

  const handleApply = () => {
    onApplyFilters({
      recordType: selectedType,
      dateRange: selectedDateRange,
      provider: selectedProvider,
      keywords: selectedKeywords,
    });
  };

  const handleReset = () => {
    setSelectedType('all');
    setSelectedDateRange('all');
    setSelectedProvider('all');
    setSelectedKeywords([]);
    setKeywordInput('');
  };

  const addKeyword = (keyword) => {
    if (keyword && !selectedKeywords.includes(keyword)) {
      setSelectedKeywords([...selectedKeywords, keyword]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword) => {
    setSelectedKeywords(selectedKeywords.filter(k => k !== keyword));
  };

  const recordTypes = [
    { id: 'all', label: 'All Types' },
    { id: 'lab', label: 'Lab Results' },
    { id: 'imaging', label: 'Imaging Reports' },
    { id: 'visit', label: 'Visit Summaries' },
    { id: 'prescription', label: 'Prescriptions' },
    { id: 'immunization', label: 'Immunizations' },
    { id: 'other', label: 'Other Documents' },
  ];

  const dateRanges = [
    { id: 'all', label: 'All Time' },
    { id: 'lastMonth', label: 'Last Month' },
    { id: 'last3Months', label: 'Last 3 Months' },
    { id: 'lastYear', label: 'Last Year' },
  ];

  const providers = [
    { id: 'all', label: 'All Providers' },
    { id: 'Dr. Sarah Johnson', label: 'Dr. Sarah Johnson' },
    { id: 'Dr. Michael Chen', label: 'Dr. Michael Chen' },
    { id: 'Memorial Hospital', label: 'Memorial Hospital' },
    { id: 'City Medical Center', label: 'City Medical Center' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Filter Records</Text>
        <TouchableOpacity onPress={onCancel}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Record Type */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Record Type</Text>
          <View style={styles.optionsContainer}>
            {recordTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.optionButton,
                  selectedType === type.id && styles.selectedOptionButton
                ]}
                onPress={() => setSelectedType(type.id)}
              >
                <Text style={[
                  styles.optionButtonText,
                  selectedType === type.id && styles.selectedOptionButtonText
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Date Range */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Date Range</Text>
          <View style={styles.optionsContainer}>
            {dateRanges.map((range) => (
              <TouchableOpacity
                key={range.id}
                style={[
                  styles.optionButton,
                  selectedDateRange === range.id && styles.selectedOptionButton
                ]}
                onPress={() => setSelectedDateRange(range.id)}
              >
                <Text style={[
                  styles.optionButtonText,
                  selectedDateRange === range.id && styles.selectedOptionButtonText
                ]}>
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Provider */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Provider</Text>
          <View style={styles.optionsContainer}>
            {providers.map((provider) => (
              <TouchableOpacity
                key={provider.id}
                style={[
                  styles.optionButton,
                  selectedProvider === provider.id && styles.selectedOptionButton
                ]}
                onPress={() => setSelectedProvider(provider.id)}
              >
                <Text style={[
                  styles.optionButtonText,
                  selectedProvider === provider.id && styles.selectedOptionButtonText
                ]}>
                  {provider.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Keyword Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Keywords</Text>
          <View style={styles.keywordInputContainer}>
            <TextInput
              style={styles.keywordInput}
              value={keywordInput}
              onChangeText={setKeywordInput}
              placeholder="Add keyword"
              placeholderTextColor={colors.mediumGray}
              onSubmitEditing={() => addKeyword(keywordInput)}
            />
            <TouchableOpacity style={styles.addButton} onPress={() => addKeyword(keywordInput)}>
              <Ionicons name="add" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>

          {/* Selected Keywords */}
          {selectedKeywords.length > 0 && (
            <View style={styles.optionsContainer}>
              {selectedKeywords.map((keyword) => (
                <TouchableOpacity
                  key={keyword}
                  style={styles.selectedKeywordChip}
                  onPress={() => removeKeyword(keyword)}
                >
                  <Text style={styles.selectedKeywordText}>{keyword}</Text>
                  <Ionicons name="close-circle" size={16} color={colors.white} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.footerButton, styles.resetButton]}
          onPress={handleReset}
        >
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.footerButton, styles.applyButton]}
          onPress={handleApply}
        >
          <Text style={styles.applyButtonText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 8,
    marginHorizontal: spacing.medium,
    marginBottom: spacing.medium,
    elevation: 3,
    maxHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  content: {
    padding: spacing.medium,
  },
  filterSection: {
    marginBottom: spacing.medium,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.small,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    backgroundColor: colors.lightBackground,
    paddingVertical: spacing.small,
    paddingHorizontal: spacing.medium,
    borderRadius: 20,
    margin: spacing.extraSmall,
  },
  selectedOptionButton: {
    backgroundColor: colors.primary,
  },
  optionButtonText: {
    ...typography.small,
    color: colors.text,
  },
  selectedOptionButtonText: {
    color: colors.white,
  },
  keywordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  keywordInput: {
    flex: 1,
    height: 40,
    backgroundColor: colors.lightBackground,
    borderRadius: 8,
    paddingHorizontal: spacing.medium,
    marginRight: spacing.small,
  },
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedKeywordChip: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.small,
    paddingVertical: spacing.extraSmall,
    borderRadius: 16,
    margin: spacing.extraSmall,
  },
  selectedKeywordText: {
    ...typography.small,
    color: colors.white,
    marginRight: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.medium,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  footerButton: {
    flex: 1,
    paddingVertical: spacing.medium,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: colors.lightGray,
    marginRight: spacing.small,
  },
  resetButtonText: {
    ...typography.button,
    color: colors.text,
  },
  applyButton: {
    backgroundColor: colors.primary,
    marginLeft: spacing.small,
  },
  applyButtonText: {
    ...typography.button,
    color: colors.white,
  },
});

export default RecordFilter;

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
  console.log('RecordFilter rendered with options:', options);
  console.log('allRecords:', allRecords?.length || 0);
  
  // Use safe defaults for all options
  const safeOptions = options || { recordType: 'all', dateRange: 'all', provider: 'all', keywords: [] };
  
  const [selectedType, setSelectedType] = useState(safeOptions.recordType || 'all');
  const [selectedDateRange, setSelectedDateRange] = useState(safeOptions.dateRange || 'all');
  const [selectedProvider, setSelectedProvider] = useState(safeOptions.provider || 'all');
  const [selectedKeywords, setSelectedKeywords] = useState(safeOptions.keywords || []);
  const [keywordInput, setKeywordInput] = useState('');
  const [suggestedKeywords, setSuggestedKeywords] = useState([]);

  // Reset selections when props change
  useEffect(() => {
    if (options) {
      setSelectedType(safeOptions.recordType || 'all');
      setSelectedDateRange(safeOptions.dateRange || 'all');
      setSelectedProvider(safeOptions.provider || 'all');
      setSelectedKeywords(safeOptions.keywords || []);
      console.log('Filter options updated:', safeOptions);
    }
  }, [options, safeOptions]);

  // Extract common keywords from all records for suggestions
  useEffect(() => {
    const keywordMap = new Map();
    
    // Extract all keywords from AI-analyzed records
    allRecords.forEach(record => {
      if (record.metadata?.keywords && Array.isArray(record.metadata.keywords)) {
        record.metadata.keywords.forEach(keyword => {
          const count = keywordMap.get(keyword) || 0;
          keywordMap.set(keyword, count + 1);
        });
      }
    });
    
    // Convert to array and sort by frequency
    const allKeywords = Array.from(keywordMap.entries())
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20) // Keep top 20 most common keywords
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

  // In a real app, this would be fetched from a list of unique providers
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
                <Text
                  style={[
                    styles.optionButtonText,
                    selectedType === type.id && styles.selectedOptionButtonText
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
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
                <Text
                  style={[
                    styles.optionButtonText,
                    selectedDateRange === range.id && styles.selectedOptionButtonText
                  ]}
                >
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
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
                <Text
                  style={[
                    styles.optionButtonText,
                    selectedProvider === provider.id && styles.selectedOptionButtonText
                  ]}
                >
                  {provider.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Medical Keywords</Text>
          <View style={styles.keywordInputContainer}>
            <TextInput
              style={styles.keywordInput}
              value={keywordInput}
              onChangeText={setKeywordInput}
              placeholder="Search or add keywords"
              placeholderTextColor={colors.mediumGray}
              returnKeyType="done"
              onSubmitEditing={() => addKeyword(keywordInput)}
            />
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => addKeyword(keywordInput)}
            >
              <Ionicons name="add" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
          
          {/* Selected keywords */}
          {selectedKeywords.length > 0 && (
            <View style={styles.selectedKeywordsContainer}>
              <Text style={styles.subsectionTitle}>Selected Keywords:</Text>
              <View style={styles.optionsContainer}>
                {selectedKeywords.map((keyword) => (
                  <TouchableOpacity
                    key={keyword}
                    style={styles.selectedKeywordChip}
                    onPress={() => removeKeyword(keyword)}
                  >
                    <Text style={styles.selectedKeywordText}>{keyword}</Text>
                    <Ionicons name="close-circle" size={16} color={colors.white} style={styles.chipIcon} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          
          {/* Suggested keywords */}
          {suggestedKeywords.length > 0 && (
            <View style={styles.suggestedKeywordsContainer}>
              <Text style={styles.subsectionTitle}>Suggested Keywords:</Text>
              <View style={styles.optionsContainer}>
                {suggestedKeywords
                  .filter(keyword => !selectedKeywords.includes(keyword))
                  .slice(0, 10)
                  .map((keyword) => (
                    <TouchableOpacity
                      key={keyword}
                      style={styles.suggestedKeywordChip}
                      onPress={() => addKeyword(keyword)}
                    >
                      <Text style={styles.suggestedKeywordText}>{keyword}</Text>
                      <Ionicons name="add-circle" size={16} color={colors.primary} style={styles.chipIcon} />
                    </TouchableOpacity>
                  ))
                }
              </View>
            </View>
          )}
        </View>
      </ScrollView>
      
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
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
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
  subsectionTitle: {
    ...typography.small,
    fontWeight: '500',
    color: colors.text,
    marginTop: spacing.small,
    marginBottom: spacing.extraSmall,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.extraSmall,
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
    marginBottom: spacing.small,
  },
  keywordInput: {
    flex: 1,
    height: 40,
    backgroundColor: colors.lightBackground,
    borderRadius: 8,
    paddingHorizontal: spacing.medium,
    marginRight: spacing.small,
    ...typography.regular,
  },
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedKeywordsContainer: {
    marginTop: spacing.small,
  },
  suggestedKeywordsContainer: {
    marginTop: spacing.small,
  },
  selectedKeywordChip: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.extraSmall,
    paddingLeft: spacing.small,
    paddingRight: spacing.extraSmall,
    borderRadius: 16,
    margin: spacing.extraSmall,
  },
  selectedKeywordText: {
    ...typography.small,
    color: colors.white,
    marginRight: 4,
  },
  suggestedKeywordChip: {
    backgroundColor: colors.lightBackground,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.extraSmall,
    paddingLeft: spacing.small,
    paddingRight: spacing.extraSmall,
    borderRadius: 16,
    margin: spacing.extraSmall,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  suggestedKeywordText: {
    ...typography.small,
    color: colors.text,
    marginRight: 4,
  },
  chipIcon: {
    marginLeft: 2,
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
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import typography from '../theme/typography';
import { RECORD_TYPES } from '../utils/constants';

export default function RecordFilter({ selectedType, onSelectType }) {
  const renderFilterOption = (type, label, iconName) => (
    <TouchableOpacity
      style={[
        styles.filterOption,
        selectedType === type && styles.selectedFilter
      ]}
      onPress={() => onSelectType(type)}
    >
      <Ionicons
        name={iconName}
        size={20}
        color={selectedType === type ? colors.white : colors.primary}
      />
      <Text
        style={[
          styles.filterText,
          selectedType === type && styles.selectedFilterText
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {renderFilterOption('all', 'All', 'documents')}
      {renderFilterOption(RECORD_TYPES.VISIT, 'Visits', 'medical')}
      {renderFilterOption(RECORD_TYPES.LAB, 'Labs', 'flask')}
      {renderFilterOption(RECORD_TYPES.IMAGING, 'Imaging', 'scan')}
      {renderFilterOption(RECORD_TYPES.PRESCRIPTION, 'Prescriptions', 'medkit')}
      {renderFilterOption(RECORD_TYPES.IMMUNIZATION, 'Immunizations', 'fitness')}
      {renderFilterOption(RECORD_TYPES.OTHER, 'Other', 'document-text')}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 44,
  },
  content: {
    paddingHorizontal: 16,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    marginRight: 8,
  },
  selectedFilter: {
    backgroundColor: colors.primary,
  },
  filterText: {
    ...typography.caption,
    color: colors.primary,
    marginLeft: 4,
  },
  selectedFilterText: {
    color: colors.white,
  },
});

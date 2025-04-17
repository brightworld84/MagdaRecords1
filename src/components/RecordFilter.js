import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../theme/themeContext';
import colors from '../theme/colors';
import darkColors from '../theme/darkColors';
import typography from '../theme/typography';
import spacing from '../theme/spacing';

const RecordFilter = ({ options, onApplyFilters, onCancel, allRecords = [] }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const themedColors = isDarkMode ? darkColors : colors;

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
    <View style={[styles.container, { backgroundColor: themedColors.white }]}>
      <View style={[styles.header, { borderBottomColor: themedColors.lightGray }]}>
        <Text style={[styles.title, { color: themedColors.text }]}>Filter Records</Text>
        <TouchableOpacity onPress={onCancel}>
          <Ionicons name="close" size={24} color={themedColors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Record Type */}
        <View style={styles.filterSection}>
          <Text style={[styles.sectionTitle, { color: themedColors.text }]}>Record Type</Text>
          <View style={styles.optionsContainer}>
            {recordTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.optionButton,
                  { backgroundColor: selectedType === type.id ? themedColors.primary : themedColors.lightBackground }
                ]}
                onPress={() => setSelectedType(type.id)}
              >
                <Text style={[
                  styles.optionButtonText,
                  { color: selectedType === type.id ? themedColors.white : themedColors.text }
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Date Range */}
        <View style={styles.filterSection}>
          <Text style={[styles.sectionTitle, { color: themedColors.text }]}>Date Range</Text>
          <View style={styles.optionsContainer}>
            {dateRanges.map((range) => (
              <TouchableOpacity
                key={range.id}
                style={[
                  styles.optionButton,
                  { backgroundColor: selectedDateRange === range.id ? themedColors.primary : themedColors.lightBackground }
                ]}
                onPress={() => setSelectedDateRange(range.id)}
              >
                <Text style={[
                  styles.optionButtonText,
                  { color: selectedDateRange === range.id ? themedColors.white : themedColors.text }
                ]}>
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Provider */}
        <View style={styles.filterSection}>
          <Text style={[styles.sectionTitle, { color: themedColors.text }]}>Provider</Text>
          <View style={styles.optionsContainer}>
            {providers.map((provider) => (
              <TouchableOpacity
                key={provider.id}
                style={[
                  styles.optionButton,
                  { backgroundColor: selectedProvider === provider.id ? themedColors.primary : themedColors.lightBackground }
                ]}
                onPress={() => setSelectedProvider(provider.id)}
              >
                <Text style={[
                  styles.optionButtonText,
                  { color: selectedProvider === provider.id ? themedColors.white : themedColors.text }
                ]}>
                  {provider.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Keyword Filter */}
        <View style={styles.filterSection}>
          <Text style={[styles.sectionTitle, { color: themedColors.text }]}>Keywords</Text>
          <View style={styles.keywordInputContainer}>
            <TextInput
              style={[styles.keywordInput, { backgroundColor: themedColors.lightBackground, color: themedColors.text }]}
              value={keywordInput}
              onChangeText={setKeywordInput}
              placeholder="Add keyword"
              placeholderTextColor={themedColors.mediumGray}
              onSubmitEditing={() => addKeyword(keywordInput)}
            />
            <TouchableOpacity style={[styles.addButton, { backgroundColor: themedColors.primary }]} onPress={() => addKeyword(keywordInput)}>
              <Ionicons name="add" size={20} color={themedColors.white} />
            </TouchableOpacity>
          </View>

          {selectedKeywords.length > 0 && (
            <View style={styles.optionsContainer}>
              {selectedKeywords.map((keyword) => (
                <TouchableOpacity
                  key={keyword}
                  style={[styles.selectedKeywordChip, { backgroundColor: themedColors.primary }]}
                  onPress={() => removeKeyword(keyword)}
                >
                  <Text style={[styles.selectedKeywordText, { color: themedColors.white }]}>{keyword}</Text>
                  <Ionicons name="close-circle" size={16} color={themedColors.white} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: themedColors.lightGray }]}>
        <TouchableOpacity
          style={[styles.footerButton, { backgroundColor: themedColors.lightGray, marginRight: spacing.small }]}
          onPress={handleReset}
        >
          <Text style={[styles.resetButtonText, { color: themedColors.text }]}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.footerButton, { backgroundColor: themedColors.primary, marginLeft: spacing.small }]}
          onPress={handleApply}
        >
          <Text style={[styles.applyButtonText, { color: themedColors.white }]}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  },
  title: {
    ...typography.h3,
  },
  content: {
    padding: spacing.medium,
  },
  filterSection: {
    marginBottom: spacing.medium,
  },
  sectionTitle: {
    ...typography.subtitle,
    marginBottom: spacing.small,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    paddingVertical: spacing.small,
    paddingHorizontal: spacing.medium,
    borderRadius: 20,
    margin: spacing.extraSmall,
  },
  optionButtonText: {
    ...typography.small,
  },
  keywordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  keywordInput: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    paddingHorizontal: spacing.medium,
    marginRight: spacing.small,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedKeywordChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.small,
    paddingVertical: spacing.extraSmall,
    borderRadius: 16,
    margin: spacing.extraSmall,
  },
  selectedKeywordText: {
    ...typography.small,
    marginRight: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.medium,
    borderTopWidth: 1,
  },
  footerButton: {
    flex: 1,
    paddingVertical: spacing.medium,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    ...typography.button,
  },
  applyButtonText: {
    ...typography.button,
  },
});

export default RecordFilter;

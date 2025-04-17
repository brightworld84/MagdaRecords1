import React, { useState, useContext, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Camera } from 'expo-camera';
import { AuthContext } from '../services/auth';
import { ThemeContext } from '../contexts/ThemeContext';
import { uploadRecord } from '../services/storage';
import { extractTextFromImage } from '../services/ai';
import { importFromFHIR } from '../services/fhir';
import AccountSelector from '../components/AccountSelector';
import colors from '../theme/colors';
import darkColors from '../theme/darkColors';
import typography from '../theme/typography';
import spacing from '../theme/spacing';

const UploadScreen = () => {
  const { state } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  const theme = isDarkMode ? darkColors : colors;

  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [uploadType, setUploadType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recordTitle, setRecordTitle] = useState('');
  const [recordDescription, setRecordDescription] = useState('');
  const [recordProvider, setRecordProvider] = useState('');
  const [recordDate, setRecordDate] = useState('');
  const [recordType, setRecordType] = useState('');
  const [fhirEndpoint, setFhirEndpoint] = useState('');
  const [email, setEmail] = useState('');
  const cameraRef = useRef(null);

  const recordTypes = [
    { id: 'lab', label: 'Lab Results' },
    { id: 'imaging', label: 'Imaging Report' },
    { id: 'visit', label: 'Visit Summary' },
    { id: 'prescription', label: 'Prescription' },
    { id: 'immunization', label: 'Immunization Record' },
    { id: 'other', label: 'Other' },
  ];

  React.useEffect(() => {
    if (state.user) {
      setSelectedAccount(state.user.id);
      if (state.user.firstName) {
        const mockAccounts = [
          { id: state.user.id, name: `${state.user.firstName} ${state.user.lastName}`, isPrimary: true },
          { id: 'family1', name: 'Jane Smith', relationship: 'Spouse' },
          { id: 'family2', name: 'Alex Smith', relationship: 'Child' }
        ];
        setAccounts(mockAccounts);
      }
    }
  }, [state.user]);

  const resetForm = () => {
    setUploadType('');
    setRecordTitle('');
    setRecordDescription('');
    setRecordProvider('');
    setRecordDate('');
    setRecordType('');
    setFhirEndpoint('');
    setEmail('');
  };

  const handleDateChange = (text) => {
    let formatted = text;
    if (text.length === 2 && recordDate.length === 1) {
      formatted = text + '/';
    } else if (text.length === 5 && recordDate.length === 4) {
      formatted = text + '/';
    }
    setRecordDate(formatted);
  };

  const validateRecord = () => {
    if (!recordTitle.trim()) {
      Alert.alert('Missing Information', 'Please enter a title for this record.');
      return false;
    }
    if (!recordDate.trim()) {
      Alert.alert('Missing Information', 'Please enter the date of this record.');
      return false;
    }
    if (!recordType) {
      Alert.alert('Missing Information', 'Please select a record type.');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please grant camera roll permissions.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled) {
        setIsLoading(true);
        try {
          const extractedData = await extractTextFromImage(result.assets[0].uri);
          if (extractedData.title) setRecordTitle(extractedData.title);
          if (extractedData.date) setRecordDate(extractedData.date);
          if (extractedData.provider) setRecordProvider(extractedData.provider);
          if (extractedData.description) setRecordDescription(extractedData.description);
          if (extractedData.type) setRecordType(extractedData.type);
          setUploadType('image');
        } catch (error) {
          console.error('Text extraction failed:', error);
          setUploadType('image');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });
      if (result.type === 'success') {
        setUploadType('document');
        if (result.name) {
          const name = result.name.replace(/\.[^/.]+$/, "");
          setRecordTitle(name);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload document.');
      console.error(error);
    }
  };

  const saveRecord = async () => {
    if (!validateRecord()) return;
    setIsLoading(true);
    try {
      const record = {
        title: recordTitle,
        date: recordDate,
        provider: recordProvider,
        description: recordDescription,
        type: recordType,
        uploadType,
      };
      await uploadRecord(selectedAccount, record);
      Alert.alert('Upload Successful', 'Your medical record has been saved.', [
        { text: 'OK', onPress: () => resetForm() },
      ]);
    } catch (error) {
      Alert.alert('Upload Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.headerTitle, { color: theme.text }]}>Upload Medical Records</Text>
          <AccountSelector
            accounts={accounts}
            selectedAccount={selectedAccount}
            onSelectAccount={(id) => setSelectedAccount(id)}
          />
          {uploadType ? (
            <View style={[styles.formContainer, { backgroundColor: theme.card }]}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Record Title*</Text>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.lightGray }]}
                  value={recordTitle}
                  onChangeText={setRecordTitle}
                  placeholder="e.g., Blood Test Results"
                  placeholderTextColor={theme.secondaryText}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Date of Record*</Text>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.lightGray }]}
                  value={recordDate}
                  onChangeText={handleDateChange}
                  placeholder="MM/DD/YYYY"
                  placeholderTextColor={theme.secondaryText}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Provider/Facility</Text>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.lightGray }]}
                  value={recordProvider}
                  onChangeText={setRecordProvider}
                  placeholder="e.g., Dr. Smith or Memorial Hospital"
                  placeholderTextColor={theme.secondaryText}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { color: theme.text, borderColor: theme.lightGray }]}
                  value={recordDescription}
                  onChangeText={setRecordDescription}
                  placeholder="Enter details about this record"
                  placeholderTextColor={theme.secondaryText}
                  multiline
                  numberOfLines={4}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Record Type*</Text>
                <View style={styles.recordTypeContainer}>
                  {recordTypes.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.recordTypeButton,
                        {
                          borderColor: theme.lightGray,
                          backgroundColor: recordType === type.id ? theme.primary : 'transparent',
                        },
                      ]}
                      onPress={() => setRecordType(type.id)}
                    >
                      <Text
                        style={[
                          styles.recordTypeButtonText,
                          {
                            color: recordType === type.id ? theme.white : theme.text,
                          },
                        ]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: theme.primary }]}
                onPress={saveRecord}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={theme.white} />
                ) : (
                  <Text style={[styles.saveButtonText, { color: theme.white }]}>Save Record</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
                <Text style={[styles.cancelButtonText, { color: theme.error }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <TouchableOpacity style={[styles.uploadOption, { backgroundColor: theme.card }]} onPress={pickImage}>
                <Ionicons name="images-outline" size={24} color={theme.primary} />
                <Text style={[styles.uploadOptionText, { color: theme.text }]}>Upload Image</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.uploadOption, { backgroundColor: theme.card }]} onPress={pickDocument}>
                <Ionicons name="document-outline" size={24} color={theme.primary} />
                <Text style={[styles.uploadOptionText, { color: theme.text }]}>Upload Document</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { padding: spacing.medium },
  headerTitle: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.large,
  },
  formContainer: {
    borderRadius: 12,
    padding: spacing.medium,
    marginTop: spacing.medium,
  },
  inputGroup: { marginBottom: spacing.medium },
  label: {
    ...typography.label,
    marginBottom: spacing.extraSmall,
  },
  input: {
    ...typography.input,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.medium,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  recordTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.small,
    marginTop: spacing.small,
  },
  recordTypeButton: {
    paddingVertical: spacing.small,
    paddingHorizontal: spacing.medium,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: spacing.small,
    marginBottom: spacing.small,
  },
  recordTypeButtonText: {
    ...typography.button,
  },
  saveButton: {
    paddingVertical: spacing.medium,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.medium,
  },
  saveButtonText: {
    ...typography.button,
  },
  cancelButton: {
    alignItems: 'center',
    marginTop: spacing.medium,
  },
  cancelButtonText: {
    ...typography.body,
  },
  uploadOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.medium,
    borderRadius: 12,
    marginBottom: spacing.medium,
    elevation: 2,
  },
  uploadOptionText: {
    marginLeft: spacing.medium,
    ...typography.body,
  },
});

export default UploadScreen;

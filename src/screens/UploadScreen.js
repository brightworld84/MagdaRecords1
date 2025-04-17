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
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Camera } from 'expo-camera';
import { AuthContext } from '../services/auth';
import { uploadRecord } from '../services/storage';
import { extractTextFromImage } from '../services/ai';
import { importFromFHIR } from '../services/fhir';
import AccountSelector from '../components/AccountSelector';
import colors from '../theme/colors';
import typography from '../theme/typography';
import spacing from '../theme/spacing';

const UploadScreen = () => {
  const { state } = useContext(AuthContext);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [uploadType, setUploadType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recordTitle, setRecordTitle] = useState('');
  const [recordDescription, setRecordDescription] = useState('');
  const [recordProvider, setRecordProvider] = useState('');
  const [recordDate, setRecordDate] = useState('');
  const [recordType, setRecordType] = useState('');
  const [showCamera, setShowCamera] = useState(false);
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.headerTitle}>Upload Medical Records</Text>
          <AccountSelector
            accounts={accounts}
            selectedAccount={selectedAccount}
            onSelectAccount={(id) => setSelectedAccount(id)}
          />
          {uploadType ? (
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Record Title*</Text>
                <TextInput
                  style={styles.input}
                  value={recordTitle}
                  onChangeText={setRecordTitle}
                  placeholder="e.g., Blood Test Results"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date of Record*</Text>
                <TextInput
                  style={styles.input}
                  value={recordDate}
                  onChangeText={handleDateChange}
                  placeholder="MM/DD/YYYY"
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Provider/Facility</Text>
                <TextInput
                  style={styles.input}
                  value={recordProvider}
                  onChangeText={setRecordProvider}
                  placeholder="e.g., Dr. Smith or Memorial Hospital"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={recordDescription}
                  onChangeText={setRecordDescription}
                  placeholder="Enter details about this record"
                  multiline
                  numberOfLines={4}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Record Type*</Text>
                <View style={styles.recordTypeContainer}>
                  {recordTypes.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.recordTypeButton,
                        recordType === type.id && styles.recordTypeButtonSelected,
                      ]}
                      onPress={() => setRecordType(type.id)}
                    >
                      <Text
                        style={[
                          styles.recordTypeButtonText,
                          recordType === type.id && styles.recordTypeButtonTextSelected,
                        ]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveRecord}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.saveButtonText}>Save Record</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <TouchableOpacity style={styles.uploadOption} onPress={pickImage}>
                <Ionicons name="images-outline" size={24} color={colors.primary} />
                <Text style={styles.uploadOptionText}>Upload Image</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.uploadOption} onPress={pickDocument}>
                <Ionicons name="document-outline" size={24} color={colors.primary} />
                <Text style={styles.uploadOptionText}>Upload Document</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scrollContent: { padding: spacing.medium },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.large,
  },
  formContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.medium,
    marginTop: spacing.medium,
  },
  inputGroup: { marginBottom: spacing.medium },
  label: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.extraSmall,
  },
  input: {
    ...typography.input,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
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
    borderColor: colors.lightGray,
    marginRight: spacing.small,
    marginBottom: spacing.small,
  },
  recordTypeButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  recordTypeButtonText: {
    ...typography.button,
    color: colors.text,
  },
  recordTypeButtonTextSelected: {
    color: colors.white,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.medium,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.medium,
  },
  saveButtonText: {
    ...typography.button,
    color: colors.white,
  },
  cancelButton: {
    alignItems: 'center',
    marginTop: spacing.medium,
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.error,
  },
  uploadOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.medium,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: spacing.medium,
    elevation: 2,
  },
  uploadOptionText: {
    marginLeft: spacing.medium,
    ...typography.body,
    color: colors.text,
  },
});

export default UploadScreen;

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
    // Set the current user as default selected account
    if (state.user) {
      setSelectedAccount(state.user.id);
      
      // In a real app, we would fetch linked accounts
      // For this demo, we'll create some mock accounts based on the current user
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

  const handleAccountChange = (accountId) => {
    setSelectedAccount(accountId);
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

  const handleDateChange = (text) => {
    // Format as MM/DD/YYYY
    let formatted = text;
    if (text.length === 2 && recordDate.length === 1) {
      formatted = text + '/';
    } else if (text.length === 5 && recordDate.length === 4) {
      formatted = text + '/';
    }
    setRecordDate(formatted);
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload photos.');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      
      if (!result.canceled) {
        setIsLoading(true);
        
        // Extract text from image using AI
        try {
          // Here we're simulating this capability - in a real app you'd pass the image to an OCR service
          const extractedData = await extractTextFromImage(result.assets[0].uri);
          
          // Auto-fill form fields with extracted data if possible
          if (extractedData.title) setRecordTitle(extractedData.title);
          if (extractedData.date) setRecordDate(extractedData.date);
          if (extractedData.provider) setRecordProvider(extractedData.provider);
          if (extractedData.description) setRecordDescription(extractedData.description);
          if (extractedData.type) setRecordType(extractedData.type);
          
          setUploadType('image');
        } catch (error) {
          console.error('Text extraction failed:', error);
          // Continue anyway, user can fill in manually
          setUploadType('image');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image. Please try again.');
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
        
        // Try to extract some metadata from the filename
        if (result.name) {
          const name = result.name.replace(/\.[^/.]+$/, ""); // Remove extension
          setRecordTitle(name);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload document. Please try again.');
      console.error(error);
    }
  };

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === 'granted') {
      setShowCamera(true);
    } else {
      Alert.alert('Permission Required', 'Please grant camera permissions to take photos.');
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
        setShowCamera(false);
        setIsLoading(true);
        
        // Extract text from image using AI
        try {
          // Here we're simulating this capability - in a real app you'd pass the image to an OCR service
          const extractedData = await extractTextFromImage(photo.uri);
          
          // Auto-fill form fields with extracted data if possible
          if (extractedData.title) setRecordTitle(extractedData.title);
          if (extractedData.date) setRecordDate(extractedData.date);
          if (extractedData.provider) setRecordProvider(extractedData.provider);
          if (extractedData.description) setRecordDescription(extractedData.description);
          if (extractedData.type) setRecordType(extractedData.type);
          
          setUploadType('camera');
        } catch (error) {
          console.error('Text extraction failed:', error);
          // Continue anyway, user can fill in manually
          setUploadType('camera');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture. Please try again.');
        console.error(error);
        setShowCamera(false);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const importFromFHIRSystem = async () => {
    if (!fhirEndpoint) {
      Alert.alert('Missing Information', 'Please enter a FHIR endpoint URL.');
      return;
    }
    
    setIsLoading(true);
    try {
      const importedRecords = await importFromFHIR(fhirEndpoint);
      Alert.alert(
        'Import Successful',
        `${importedRecords.length} records were imported from the FHIR system.`
      );
      resetForm();
    } catch (error) {
      Alert.alert('Import Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const setupEmailImport = async () => {
    if (!email) {
      Alert.alert('Missing Information', 'Please enter an email address to monitor for records.');
      return;
    }
    
    setIsLoading(true);
    try {
      // In a real app, this would set up a service to monitor the provided email
      // For this demo, we'll just simulate success
      setTimeout(() => {
        Alert.alert(
          'Email Monitor Set Up',
          `Records sent to ${email} will be automatically imported. This feature would require server-side implementation in a production environment.`
        );
        resetForm();
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      Alert.alert('Setup Failed', error.message);
      setIsLoading(false);
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
        uploadType: uploadType,
        // In a real app, we would include the file data
      };
      
      await uploadRecord(selectedAccount, record);
      Alert.alert(
        'Upload Successful',
        'Your medical record has been saved securely.',
        [{ text: 'OK', onPress: () => resetForm() }]
      );
    } catch (error) {
      Alert.alert('Upload Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (showCamera) {
    return (
      <SafeAreaView style={styles.container}>
        <Camera
          style={styles.camera}
          ref={cameraRef}
          type={Camera.Constants.Type.back}
        >
          <View style={styles.cameraButtonsContainer}>
            <TouchableOpacity 
              style={styles.cameraCloseButton}
              onPress={() => setShowCamera(false)}
            >
              <Ionicons name="close" size={28} color={colors.white} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.takePictureButton}
              onPress={takePicture}
            >
              <View style={styles.takePictureButtonInner} />
            </TouchableOpacity>
          </View>
        </Camera>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidView}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Upload Medical Records</Text>
        </View>
        
        <AccountSelector 
          accounts={accounts} 
          selectedAccount={selectedAccount}
          onSelectAccount={handleAccountChange}
        />
        
        <ScrollView style={styles.content}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Processing...</Text>
            </View>
          ) : uploadType ? (
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Record Information</Text>
              
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
                  placeholder="Enter additional details about this record"
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
                        recordType === type.id && styles.recordTypeButtonSelected
                      ]}
                      onPress={() => setRecordType(type.id)}
                    >
                      <Text
                        style={[
                          styles.recordTypeButtonText,
                          recordType === type.id && styles.recordTypeButtonTextSelected
                        ]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={resetForm}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={saveRecord}
                >
                  <Text style={styles.saveButtonText}>Save Record</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <Text style={styles.uploadTitle}>Select Upload Method</Text>
              
              <View style={styles.uploadMethodsContainer}>
                <TouchableOpacity
                  style={styles.uploadMethodCard}
                  onPress={pickImage}
                >
                  <Ionicons name="images-outline" size={48} color={colors.primary} />
                  <Text style={styles.uploadMethodTitle}>Upload Image</Text>
                  <Text style={styles.uploadMethodDescription}>
                    Select images from your photo library
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.uploadMethodCard}
                  onPress={pickDocument}
                >
                  <Ionicons name="document-outline" size={48} color={colors.primary} />
                  <Text style={styles.uploadMethodTitle}>Upload Document</Text>
                  <Text style={styles.uploadMethodDescription}>
                    Upload PDF files and other documents
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.uploadMethodCard}
                  onPress={requestCameraPermission}
                >
                  <Ionicons name="camera-outline" size={48} color={colors.primary} />
                  <Text style={styles.uploadMethodTitle}>Take Photo</Text>
                  <Text style={styles.uploadMethodDescription}>
                    Use camera to capture your record
                  </Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.advancedTitle}>Advanced Options</Text>
              
              <View style={styles.advancedMethodsContainer}>
                <TouchableOpacity
                  style={styles.advancedMethodCard}
                  onPress={() => setUploadType('fhir')}
                >
                  <MaterialIcons name="sync" size={32} color={colors.primary} />
                  <Text style={styles.advancedMethodTitle}>FHIR Integration</Text>
                  <Text style={styles.advancedMethodDescription}>
                    Import records from healthcare providers using FHIR
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.advancedMethodCard}
                  onPress={() => setUploadType('email')}
                >
                  <Feather name="mail" size={32} color={colors.primary} />
                  <Text style={styles.advancedMethodTitle}>Email Import</Text>
                  <Text style={styles.advancedMethodDescription}>
                    Automatically import records from your email
                  </Text>
                </TouchableOpacity>
              </View>
              
              {uploadType === 'fhir' && (
                <View style={styles.advancedFormContainer}>
                  <Text style={styles.advancedFormTitle}>FHIR Integration</Text>
                  <TextInput
                    style={styles.input}
                    value={fhirEndpoint}
                    onChangeText={setFhirEndpoint}
                    placeholder="Enter FHIR endpoint URL"
                  />
                  <TouchableOpacity
                    style={styles.advancedButton}
                    onPress={importFromFHIRSystem}
                  >
                    <Text style={styles.advancedButtonText}>Import Records</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {uploadType === 'email' && (
                <View style={styles.advancedFormContainer}>
                  <Text style={styles.advancedFormTitle}>Email Import</Text>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter email address to monitor"
                    keyboardType="email-address"
                  />
                  <TouchableOpacity
                    style={styles.advancedButton}
                    onPress={setupEmailImport}
                  >
                    <Text style={styles.advancedButtonText}>Set Up Email Import</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  header: {
    padding: spacing.medium,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: spacing.medium,
  },
  uploadTitle: {
    ...typography.h3,
    color: colors.text,
    marginVertical: spacing.medium,
  },
  uploadMethodsContainer: {
    flexDirection: 'column',
    gap: spacing.medium,
    marginBottom: spacing.large,
  },
  uploadMethodCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.large,
    alignItems: 'center',
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  uploadMethodTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.medium,
    marginBottom: spacing.extraSmall,
  },
  uploadMethodDescription: {
    ...typography.body,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  advancedTitle: {
    ...typography.h3,
    color: colors.text,
    marginVertical: spacing.medium,
  },
  advancedMethodsContainer: {
    flexDirection: 'column',
    gap: spacing.medium,
  },
  advancedMethodCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.medium,
    alignItems: 'center',
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  advancedMethodTitle: {
    ...typography.h4,
    color: colors.text,
    marginTop: spacing.medium,
    marginBottom: spacing.extraSmall,
  },
  advancedMethodDescription: {
    ...typography.body,
    color: colors.secondaryText,
    textAlign: 'center',
    fontSize: 14,
  },
  advancedFormContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.medium,
    marginTop: spacing.medium,
  },
  advancedFormTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.medium,
  },
  advancedButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.medium,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.medium,
  },
  advancedButtonText: {
    ...typography.button,
    color: colors.white,
  },
  formContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.medium,
  },
  formTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.medium,
  },
  inputGroup: {
    marginBottom: spacing.medium,
  },
  label: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.extraSmall,
  },
  input: {
    ...typography.input,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    padding: spacing.medium,
    backgroundColor: colors.white,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  recordTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.small,
  },
  recordTypeButton: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 20,
    paddingVertical: spacing.small,
    paddingHorizontal: spacing.medium,
    marginBottom: spacing.small,
  },
  recordTypeButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  recordTypeButtonText: {
    ...typography.button,
    color: colors.text,
    fontSize: 14,
  },
  recordTypeButtonTextSelected: {
    color: colors.white,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.medium,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.medium,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: spacing.small,
    backgroundColor: colors.lightGray,
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.text,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.medium,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: spacing.small,
  },
  saveButtonText: {
    ...typography.button,
    color: colors.white,
  },
  loadingContainer: {
    backgroundColor: colors.white,
    padding: spacing.extraLarge,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.text,
    marginTop: spacing.medium,
  },
  camera: {
    flex: 1,
  },
  cameraButtonsContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 20,
  },
  cameraCloseButton: {
    position: 'absolute',
    top: 30,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  takePictureButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  takePictureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.white,
  },
});

export default UploadScreen;

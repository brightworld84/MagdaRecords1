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
import { ThemeContext } from '../theme/themeContext';
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
  const themeContext = useContext(ThemeContext);

  if (!themeContext) {
    console.warn('ThemeContext unavailable. Falling back to light theme.');
  }

  const isDarkMode = themeContext?.isDarkMode ?? false;
  const theme = isDarkMode ? darkColors : colors;

  const [selectedAccount, setSelectedAccount] = useState(state.user?.id ?? null);
  const [fileName, setFileName] = useState('');
  const [fileData, setFileData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleAccountChange = (accountId) => {
    setSelectedAccount(accountId);
  };

  const handleUpload = async () => {
    if (!fileData) {
      Alert.alert('No File Selected', 'Please select a file or image to upload.');
      return;
    }

    setIsUploading(true);

    try {
      const result = await uploadRecord(selectedAccount, fileData, fileName);
      Alert.alert('Upload Success', `Record uploaded successfully.`);
      setFileName('');
      setFileData(null);
    } catch (error) {
      console.error('Upload failed:', error);
      Alert.alert('Upload Failed', 'There was an error uploading the record.');
    } finally {
      setIsUploading(false);
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
    if (result.assets && result.assets.length > 0) {
      setFileName(result.assets[0].name);
      setFileData(result.assets[0]);
    }
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Denied', 'Media library access is required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({ quality: 1, base64: false });
    if (!result.canceled && result.assets.length > 0) {
      setFileName('selected-image.jpg');
      setFileData(result.assets[0]);
    }
  };

  const capturePhoto = async () => {
    const permission = await Camera.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Denied', 'Camera access is required.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 1 });
    if (!result.canceled && result.assets.length > 0) {
      setFileName('captured-photo.jpg');
      setFileData(result.assets[0]);
    }
  };

  const handleExtractText = async () => {
    if (!fileData?.uri) {
      Alert.alert('No File', 'Please select an image to analyze.');
      return;
    }

    try {
      const extracted = await extractTextFromImage(fileData.uri);
      Alert.alert('Extracted Text', extracted?.slice(0, 300) || 'No readable text found.');
    } catch (err) {
      console.error('Text extraction failed:', err);
      Alert.alert('Error', 'Failed to extract text from image.');
    }
  };

  const handleImportFHIR = async () => {
    setIsUploading(true);
    try {
      await importFromFHIR(selectedAccount);
      Alert.alert('Success', 'Records imported via FHIR.');
    } catch (err) {
      console.error('FHIR import failed:', err);
      Alert.alert('Error', 'Failed to import from FHIR.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.title, { color: theme.text }]}>Upload Medical Record</Text>

          <AccountSelector
            accounts={[
              { id: state.user?.id, name: `${state.user?.firstName} ${state.user?.lastName}`, isPrimary: true },
              { id: 'family1', name: 'Jane Smith', relationship: 'Spouse' },
              { id: 'family2', name: 'Alex Smith', relationship: 'Child' }
            ]}
            selectedAccount={selectedAccount}
            onSelectAccount={handleAccountChange}
          />

          <View style={styles.buttonGroup}>
            <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={pickDocument}>
              <Ionicons name="document" size={20} color={theme.white} />
              <Text style={[styles.buttonText, { color: theme.white }]}>Pick Document</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, { backgroundColor: theme.secondary }]} onPress={pickImage}>
              <Ionicons name="image" size={20} color={theme.white} />
              <Text style={[styles.buttonText, { color: theme.white }]}>Pick Image</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, { backgroundColor: theme.accent }]} onPress={capturePhoto}>
              <Ionicons name="camera" size={20} color={theme.white} />
              <Text style={[styles.buttonText, { color: theme.white }]}>Capture Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, { backgroundColor: theme.info }]} onPress={handleExtractText}>
              <Ionicons name="search" size={20} color={theme.white} />
              <Text style={[styles.buttonText, { color: theme.white }]}>Extract Text</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, { backgroundColor: theme.success }]} onPress={handleImportFHIR}>
              <Ionicons name="cloud-download" size={20} color={theme.white} />
              <Text style={[styles.buttonText, { color: theme.white }]}>Import from FHIR</Text>
            </TouchableOpacity>
          </View>

          {fileName ? (
            <View style={styles.previewContainer}>
              <Ionicons name="checkmark-circle" size={24} color={theme.success} />
              <Text style={[styles.previewText, { color: theme.text }]}>{fileName}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.uploadButton, { backgroundColor: theme.primary }]}
            onPress={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color={theme.white} />
            ) : (
              <Text style={[styles.uploadButtonText, { color: theme.white }]}>Upload Record</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    padding: spacing.medium,
  },
  title: {
    ...typography.h2,
    marginBottom: spacing.large,
    textAlign: 'center',
  },
  buttonGroup: {
    gap: spacing.medium,
    marginBottom: spacing.large,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.medium,
    borderRadius: 8,
    justifyContent: 'center',
  },
  buttonText: {
    ...typography.button,
    marginLeft: spacing.small,
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.medium,
  },
  previewText: {
    ...typography.body,
    marginLeft: spacing.small,
  },
  uploadButton: {
    padding: spacing.medium,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButtonText: {
    ...typography.button,
  },
});

export default UploadScreen;

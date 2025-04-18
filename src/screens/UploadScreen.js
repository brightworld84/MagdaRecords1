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
import { ThemeContext } from '../theme/themeContext'; // ✅ Corrected import
import { uploadRecord } from '../services/storage';
import { extractTextFromImage } from '../services/ai';
import { importFromFHIR } from '../services/fhir';
import AccountSelector from '../components/AccountSelector';
import colors from '../theme/colors';
import darkColors from '../theme/darkColors';
import typography from '../theme/typography';
import spacing from '../theme/spacing';



export default UploadScreen;

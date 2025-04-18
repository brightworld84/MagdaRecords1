import React, { useState, useContext, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../services/auth';
import { ThemeContext } from '../theme/themeContext';
import {
  validateEmail,
  validatePassword,
  validateName,
  validateDateOfBirth,
} from '../utils/validation';
import colors from '../theme/colors';
import darkColors from '../theme/darkColors';
import typography from '../theme/typography';
import spacing from '../theme/spacing';

const SignUpScreen = ({ navigation }) => {
  const { register } = useContext(AuthContext);
  const themeContext = useContext(ThemeContext);

  if (!themeContext) {
    console.warn('ThemeContext is unavailable — using light theme fallback');
  }

  const isDarkMode = themeContext?.isDarkMode ?? false;
  const theme = isDarkMode ? darkColors : colors;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const firstNameRef = useRef(null);

  useEffect(() => {
    if (firstNameRef.current) {
      setTimeout(() => firstNameRef.current.focus(), 300);
    }
  }, []);

  const validateForm = () => {
    let formErrors = {};
    let isValid = true;

    if (!validateName(firstName)) {
      formErrors.firstName = 'Please enter a valid first name';
      isValid = false;
    }

    if (!validateName(lastName)) {
      formErrors.lastName = 'Please enter a valid last name';
      isValid = false;
    }

    if (!validateDateOfBirth(dateOfBirth)) {
      formErrors.dateOfBirth = 'Please enter a valid date of birth (MM/DD/YYYY)';
      isValid = false;
    }

    if (!validateEmail(email)) {
      formErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      formErrors.password = passwordValidation.errorMessage;
      isValid = false;
    }

    if (password !== confirmPassword) {
      formErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(formErrors);
    return isValid;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await register({
        firstName,
        lastName,
        dateOfBirth,
        email,
        password,
      });
      Alert.alert('Registration Successful', 'Your account has been created.', [
        { text: 'OK', onPress: () => navigation.navigate('Landing') },
      ]);
    } catch (error) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateOfBirthChange = (text) => {
    let formatted = text;
    if (text.length === 2 && dateOfBirth.length === 1) {
      formatted = text + '/';
    } else if (text.length === 5 && dateOfBirth.length === 4) {
      formatted = text + '/';
    }
    setDateOfBirth(formatted);
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>Creating your account...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.primary} />
          </TouchableOpacity>

          <Text style={[styles.title, { color: theme.text }]}>Create an Account</Text>
          <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
            Secure your medical records with a personal account
          </Text>

          <View style={styles.form}>
            {/* First Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>First Name</Text>
              <TextInput
                ref={firstNameRef}
                style={[
                  styles.input,
                  { color: theme.text, borderColor: errors.firstName ? theme.error : theme.inputBorder },
                ]}
                placeholder="Enter your first name"
                placeholderTextColor={theme.secondaryText}
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
              {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
            </View>

            {/* Last Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Last Name</Text>
              <TextInput
                style={[
                  styles.input,
                  { color: theme.text, borderColor: errors.lastName ? theme.error : theme.inputBorder },
                ]}
                placeholder="Enter your last name"
                placeholderTextColor={theme.secondaryText}
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
              {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
            </View>

            {/* DOB */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Date of Birth</Text>
              <TextInput
                style={[
                  styles.input,
                  { color: theme.text, borderColor: errors.dateOfBirth ? theme.error : theme.inputBorder },
                ]}
                placeholder="MM/DD/YYYY"
                placeholderTextColor={theme.secondaryText}
                value={dateOfBirth}
                onChangeText={handleDateOfBirthChange}
                keyboardType="numeric"
                maxLength={10}
              />
              {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth}</Text>}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  { color: theme.text, borderColor: errors.email ? theme.error : theme.inputBorder },
                ]}
                placeholder="Enter your email address"
                placeholderTextColor={theme.secondaryText}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.passwordInput,
                    { color: theme.text, borderColor: errors.password ? theme.error : theme.inputBorder },
                  ]}
                  placeholder="Create a password"
                  placeholderTextColor={theme.secondaryText}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={24}
                    color={theme.gray}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              <Text style={[styles.passwordHint, { color: theme.secondaryText }]}>
                Password must contain at least 8 characters, including uppercase, lowercase,
                number, and special character.
              </Text>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Confirm Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.passwordInput,
                    {
                      color: theme.text,
                      borderColor: errors.confirmPassword ? theme.error : theme.inputBorder,
                    },
                  ]}
                  placeholder="Confirm your password"
                  placeholderTextColor={theme.secondaryText}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={24}
                    color={theme.gray}
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.signUpButton, { backgroundColor: theme.primary }]}
              onPress={handleSignUp}
            >
              <Text style={[styles.signUpButtonText, { color: theme.white }]}>Create Account</Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: theme.text }]}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Landing')}>
                <Text style={[styles.loginLink, { color: theme.primary }]}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  backButton: {
    marginBottom: spacing.medium,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.small,
  },
  subtitle: {
    ...typography.body,
    marginBottom: spacing.large,
  },
  form: {
    marginTop: spacing.small,
  },
  inputGroup: {
    marginBottom: spacing.medium,
  },
  label: {
    ...typography.subtitle,
    marginBottom: spacing.extraSmall,
  },
  input: {
    ...typography.body,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.small,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    padding: spacing.small,
    ...typography.body,
  },
  eyeIcon: {
    paddingHorizontal: spacing.small,
  },
  passwordHint: {
    fontSize: 12,
    marginTop: spacing.extraSmall,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: spacing.extraSmall,
  },
  signUpButton: {
    padding: spacing.medium,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.large,
  },
  signUpButtonText: {
    ...typography.button,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.medium,
  },
  loginText: {
    ...typography.body,
  },
  loginLink: {
    ...typography.body,
    marginLeft: 5,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    marginTop: spacing.medium,
  },
});

export default SignUpScreen;

import React, { useState, useContext } from 'react';
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
import { validateEmail, validatePassword, validateName, validateDateOfBirth } from '../utils/validation';
import colors from '../theme/colors';
import typography from '../theme/typography';
import spacing from '../theme/spacing';

const SignUpScreen = ({ navigation }) => {
  const { register } = useContext(AuthContext);
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
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await register({
        firstName,
        lastName,
        dateOfBirth,
        email,
        password
      });
      Alert.alert(
        'Registration Successful',
        'Your account has been created. You can now log in.',
        [{ text: 'OK', onPress: () => navigation.navigate('Landing') }]
      );
    } catch (error) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateOfBirthChange = (text) => {
    // Format as MM/DD/YYYY
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Creating your account...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>

          <Text style={styles.title}>Create an Account</Text>
          <Text style={styles.subtitle}>
            Secure your medical records with a personal account
          </Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={[styles.input, errors.firstName && styles.inputError]}
                placeholder="Enter your first name"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
              {errors.firstName && (
                <Text style={styles.errorText}>{errors.firstName}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={[styles.input, errors.lastName && styles.inputError]}
                placeholder="Enter your last name"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
              {errors.lastName && (
                <Text style={styles.errorText}>{errors.lastName}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of Birth</Text>
              <TextInput
                style={[styles.input, errors.dateOfBirth && styles.inputError]}
                placeholder="MM/DD/YYYY"
                value={dateOfBirth}
                onChangeText={handleDateOfBirthChange}
                keyboardType="numeric"
                maxLength={10}
              />
              {errors.dateOfBirth && (
                <Text style={styles.errorText}>{errors.dateOfBirth}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="Enter your email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.passwordInput, errors.password && styles.inputError]}
                  placeholder="Create a password"
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
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={24} 
                    color={colors.gray} 
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
              <Text style={styles.passwordHint}>
                Password must contain at least 8 characters, including uppercase, 
                lowercase, number, and special character.
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.passwordInput, errors.confirmPassword && styles.inputError]}
                  placeholder="Confirm your password"
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
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                    size={24} 
                    color={colors.gray} 
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.signUpButton}
              onPress={handleSignUp}
            >
              <Text style={styles.signUpButtonText}>Create Account</Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Landing')}>
                <Text style={styles.loginLink}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.large,
  },
  backButton: {
    marginBottom: spacing.medium,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.small,
  },
  subtitle: {
    ...typography.subtitle,
    color: colors.secondaryText,
    marginBottom: spacing.large,
  },
  form: {
    flex: 1,
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
  inputError: {
    borderColor: colors.error,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    ...typography.input,
    flex: 1,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    padding: spacing.medium,
    backgroundColor: colors.white,
  },
  eyeIcon: {
    position: 'absolute',
    right: spacing.medium,
  },
  errorText: {
    ...typography.small,
    color: colors.error,
    marginTop: spacing.extraSmall,
  },
  passwordHint: {
    ...typography.small,
    color: colors.secondaryText,
    marginTop: spacing.extraSmall,
  },
  signUpButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.medium,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.medium,
  },
  signUpButtonText: {
    ...typography.button,
    color: colors.white,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.large,
  },
  loginText: {
    ...typography.body,
    color: colors.text,
  },
  loginLink: {
    ...typography.body,
    color: colors.primary,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  loadingText: {
    ...typography.body,
    color: colors.text,
    marginTop: 10,
  },
});

export default SignUpScreen;

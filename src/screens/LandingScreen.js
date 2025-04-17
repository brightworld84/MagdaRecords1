import React, { useState, useContext, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { AuthContext } from '../services/auth';
import colors from '../theme/colors';
import typography from '../theme/typography';

const LandingScreen = ({ navigation }) => {
  const { login, tryLocalAuth } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  
  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setIsBiometricAvailable(compatible && enrolled);
    })();
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await login('email@example.com', 'password', 'google');
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setIsLoading(true);
    try {
      await login('email@example.com', 'password', 'apple');
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    setIsLoading(true);
    try {
      await login('email@example.com', 'password', 'email');
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    if (!isBiometricAvailable) {
      Alert.alert('Error', 'Biometric authentication is not available on this device');
      return;
    }

    setIsLoading(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access MagdaRecords',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        await tryLocalAuth();
      } else {
        Alert.alert('Authentication Failed', 'Please try again or use another login method');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Authenticating...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>MagdaRecords</Text>
            <Text style={styles.tagline}>Secure Medical Records at Your Fingertips</Text>
          </View>

          <View style={styles.authContainer}>
            <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
              <View style={styles.googleIconContainer}>
                <View style={styles.googleIconWrapper}>
                  <View style={[styles.googlePart, { backgroundColor: '#4285F4' }]} />
                  <View style={[styles.googlePart, { backgroundColor: '#EA4335' }]} />
                  <View style={[styles.googlePart, { backgroundColor: '#FBBC05' }]} />
                  <View style={[styles.googlePart, { backgroundColor: '#34A853' }]} />
                </View>
              </View>
              <Text style={styles.buttonText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.appleButton} onPress={handleAppleLogin}>
              <FontAwesome name="apple" size={24} color={colors.white} />
              <Text style={[styles.buttonText, styles.appleButtonText]}>Continue with Apple</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.emailButton} onPress={handleEmailLogin}>
              <Ionicons name="mail-outline" size={22} color={colors.primary} />
              <Text style={[styles.buttonText, styles.emailButtonText]}>Login with Email</Text>
            </TouchableOpacity>

            {isBiometricAvailable && (
              <TouchableOpacity style={styles.biometricButton} onPress={handleBiometricAuth}>
                <Ionicons name="finger-print" size={22} color={colors.primary} />
                <Text style={[styles.buttonText, styles.emailButtonText]}>Login with Biometrics</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account?</Text>
            <TouchableOpacity onPress={handleSignUp}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.privacyText}>
            By signing in, you agree to our Terms of Service and Privacy Policy.
            Your data is encrypted and HIPAA compliant.
          </Text>
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
  content: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: 10,
  },
  tagline: {
    ...typography.subtitle,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  authContainer: {
    marginBottom: 30,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.lightGray,
    elevation: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  googleIconContainer: {
    marginRight: 10,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconWrapper: {
    width: 20,
    height: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  googlePart: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.black,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  appleButtonText: {
    color: colors.white,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  emailButtonText: {
    color: colors.primary,
  },
  buttonText: {
    ...typography.button,
    marginLeft: 10,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  signUpText: {
    ...typography.body,
    color: colors.text,
  },
  signUpLink: {
    ...typography.body,
    color: colors.primary,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  privacyText: {
    ...typography.small,
    color: colors.secondaryText,
    textAlign: 'center',
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

export default LandingScreen;

import React, { useContext, useState, useEffect } from 'react';
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
  ScrollView,
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { AuthContext } from '../services/auth';
import { ThemeContext } from '../theme/themeContext';
import colors from '../theme/colors';
import darkColors from '../theme/darkColors';
import typography from '../theme/typography';

const LandingScreen = ({ navigation }) => {
  try {
    console.log('📍 LandingScreen mounted'); // ✅ Mount log

    const { login, tryLocalAuth } = useContext(AuthContext);
    const themeContext = useContext(ThemeContext);

    if (!themeContext) {
      console.warn('ThemeContext is unavailable — using fallback light theme');
    }

    const isDarkMode = themeContext?.isDarkMode ?? false;
    const themedColors = isDarkMode ? darkColors : colors;

    const [isLoading, setIsLoading] = useState(false);
    const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

    useEffect(() => {
      (async () => {
        try {
          console.log('🔐 Checking biometric availability...');
          const compatible = await LocalAuthentication.hasHardwareAsync();
          const enrolled = await LocalAuthentication.isEnrolledAsync();
          setIsBiometricAvailable(compatible && enrolled);
          console.log(`✅ Biometric availability: ${compatible && enrolled}`);
        } catch (error) {
          console.error('❌ Biometric check error:', error);
          setIsBiometricAvailable(false);
        }
      })();
    }, []);

    const handleAuth = async (provider) => {
      setIsLoading(true);
      try {
        console.log(`🔑 Attempting ${provider} login...`);
        await login('email@example.com', 'password', provider);
        console.log('✅ Login successful');
      } catch (error) {
        console.error(`❌ Login failed (${provider}):`, error);
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
        console.log('🔐 Attempting biometric authentication...');
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authenticate to access MagdaRecords',
          cancelLabel: 'Cancel',
          disableDeviceFallback: false,
        });

        if (result.success) {
          console.log('✅ Biometric authentication successful');
          await tryLocalAuth();
        } else {
          console.warn('⚠️ Biometric authentication failed');
          Alert.alert('Authentication Failed', 'Please try again or use another login method');
        }
      } catch (error) {
        console.error('❌ Biometric authentication error:', error);
        Alert.alert('Error', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoading) {
      return (
        <View style={[styles.loadingContainer, { backgroundColor: themedColors.background }]}>
          <ActivityIndicator size="large" color={themedColors.primary} />
          <Text style={[styles.loadingText, { color: themedColors.text }]}>Authenticating...</Text>
        </View>
      );
    }

    console.log('✅ LandingScreen: rendering UI'); // ✅ Render log

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themedColors.background }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.logoContainer}>
              <Text style={[styles.logo, { color: themedColors.primary }]}>MagdaRecords</Text>
              <Text style={[styles.tagline, { color: themedColors.secondaryText }]}>
                Secure Medical Records at Your Fingertips
              </Text>
            </View>

            <View style={styles.authContainer}>
              <TouchableOpacity
                style={[styles.googleButton, { borderColor: themedColors.lightGray, backgroundColor: themedColors.white }]}
                onPress={() => handleAuth('google')}
              >
                <View style={styles.googleIconContainer}>
                  <View style={styles.googleIconWrapper}>
                    <View style={[styles.googlePart, { backgroundColor: '#4285F4' }]} />
                    <View style={[styles.googlePart, { backgroundColor: '#EA4335' }]} />
                    <View style={[styles.googlePart, { backgroundColor: '#FBBC05' }]} />
                    <View style={[styles.googlePart, { backgroundColor: '#34A853' }]} />
                  </View>
                </View>
                <Text style={[styles.buttonText, { color: themedColors.text }]}>Continue with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.appleButton, { backgroundColor: themedColors.black }]}
                onPress={() => handleAuth('apple')}
              >
                <FontAwesome name="apple" size={24} color={themedColors.white} />
                <Text style={[styles.buttonText, { color: themedColors.white }]}>Continue with Apple</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.emailButton, { borderColor: themedColors.primary, backgroundColor: themedColors.white }]}
                onPress={() => handleAuth('email')}
              >
                <Ionicons name="mail-outline" size={22} color={themedColors.primary} />
                <Text style={[styles.buttonText, { color: themedColors.primary }]}>Login with Email</Text>
              </TouchableOpacity>

              {isBiometricAvailable && (
                <TouchableOpacity
                  style={[styles.biometricButton, { borderColor: themedColors.primary, backgroundColor: themedColors.white }]}
                  onPress={handleBiometricAuth}
                >
                  <Ionicons name="finger-print" size={22} color={themedColors.primary} />
                  <Text style={[styles.buttonText, { color: themedColors.primary }]}>Login with Biometrics</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.signUpContainer}>
              <Text style={[styles.signUpText, { color: themedColors.text }]}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={[styles.signUpLink, { color: themedColors.primary }]}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.privacyText, { color: themedColors.secondaryText }]}>
              By signing in, you agree to our Terms of Service and Privacy Policy.
              Your data is encrypted and HIPAA compliant.
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  } catch (error) {
    console.error('❌ LandingScreen critical error:', error);
    // Fallback UI in case of error
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, color: '#ff0000', marginBottom: 10 }}>
            Something went wrong
          </Text>
          <Text style={{ textAlign: 'center', marginBottom: 20 }}>
            The app encountered an error while loading this screen.
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#007aff',
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 8,
            }}
            onPress={() => navigation.goBack()}
          >
            <Text style={{ color: '#ffffff', fontWeight: '500' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
};

const styles = StyleSheet.create({
  container: { flex: 1 },
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
    marginBottom: 10,
  },
  tagline: {
    ...typography.subtitle,
    textAlign: 'center',
  },
  authContainer: {
    marginBottom: 30,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 1,
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
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 16,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
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
  },
  signUpLink: {
    ...typography.body,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  privacyText: {
    ...typography.small,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    marginTop: 10,
  },
});

export default LandingScreen;
// App.js

import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert, Button } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import ErrorBoundary from './src/components/ErrorBoundary';
import * as SecureStore from 'expo-secure-store';

console.log('✅ App.js: Mounting main app...');

// Global error handler for uncaught promises
const setupErrorHandlers = () => {
  // Handle global JavaScript errors
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error('❌ GLOBAL ERROR:', error);
    if (isFatal) {
      Alert.alert(
        'Unexpected Error',
        'The app encountered a serious problem and needs to restart.',
        [{ text: 'OK' }]
      );
    }
  });

  // Handle promises that reject without being caught
  const originalHandler = global.onunhandledrejection || (() => {});
  global.onunhandledrejection = (event) => {
    console.error('❌ UNHANDLED REJECTION:', event.reason);
    originalHandler(event);
  };
};

// Try to get encryption key - common early failure point
const testStorageAccess = async () => {
  try {
    console.log('🔐 Testing secure storage access...');
    await SecureStore.setItemAsync('test_key', 'test_value');
    const value = await SecureStore.getItemAsync('test_key');
    if (value !== 'test_value') throw new Error('Storage verification failed');
    await SecureStore.deleteItemAsync('test_key');
    return true;
  } catch (error) {
    console.error('❌ Secure storage test failed:', error);
    return false;
  }
};

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isStorageWorking, setIsStorageWorking] = useState(null);
  const [safeMode, setSafeMode] = useState(false);
  const [AppNavigator, setAppNavigator] = useState(null);
  const [ThemeProvider, setThemeProvider] = useState(null);
  const [AuthProvider, setAuthProvider] = useState(null);
  const [loadError, setLoadError] = useState(null);

  // Setup global error handlers
  useEffect(() => {
    setupErrorHandlers();
  }, []);

  // Test secure storage access
  useEffect(() => {
    const testStorage = async () => {
      try {
        const storageWorks = await testStorageAccess();
        setIsStorageWorking(storageWorks);
        if (!storageWorks) {
          console.warn('⚠️ Secure storage not working, enabling safe mode');
          setSafeMode(true);
        }
      } catch (error) {
        console.error('❌ Storage test error:', error);
        setIsStorageWorking(false);
        setSafeMode(true);
      }
    };
    testStorage();
  }, []);

  // Initialize components in sequence
  useEffect(() => {
    const initialize = async () => {
      try {
        if (safeMode) {
          console.log('🔒 Running in safe mode, skipping normal initialization');
          setIsInitializing(false);
          return;
        }

        // Step 1: Load theme provider first
        console.log('⏳ Loading ThemeProvider...');
        const themeModule = await import('./src/theme/themeContext');
        setThemeProvider(() => themeModule.ThemeProvider);
        console.log('✅ ThemeProvider loaded successfully');

        // Step 2: Load auth provider next
        console.log('⏳ Loading AuthProvider...');
        const authModule = await import('./src/services/auth');
        setAuthProvider(() => authModule.AuthProvider);
        console.log('✅ AuthProvider loaded successfully');

        // Step 3: Finally load app navigator
        console.log('⏳ Loading AppNavigator...');
        const navigatorModule = await import('./src/navigation/AppNavigator');
        setAppNavigator(() => navigatorModule.default);
        console.log('✅ AppNavigator loaded successfully');
      } catch (error) {
        console.error('❌ Failed during initialization:', error);
        setLoadError(error.message || 'Failed to initialize application');
        setSafeMode(true);
      } finally {
        setIsInitializing(false);
      }
    };

    if (isStorageWorking !== null) {
      initialize();
    }
  }, [isStorageWorking, safeMode]);

  // Toggle safe mode manually
  const toggleSafeMode = () => {
    setSafeMode(!safeMode);
    console.log(`${!safeMode ? '🔒' : '🔓'} Safe mode ${!safeMode ? 'enabled' : 'disabled'}`);
  };

  // Loading state
  if (isInitializing || isStorageWorking === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="large" color="#007aff" />
        <Text style={{ marginTop: 10, color: '#333', fontWeight: '500' }}>
          Initializing MagdaRecords...
        </Text>
      </View>
    );
  }

  // Safe mode UI
  if (safeMode) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#007aff' }}>
          MagdaRecords
        </Text>
        <Text style={{ fontSize: 18, marginBottom: 20, textAlign: 'center' }}>
          Safe Mode
        </Text>
        
        {loadError && (
          <Text style={{ color: '#ff3b30', marginBottom: 20, textAlign: 'center' }}>
            Error: {loadError}
          </Text>
        )}

        {!isStorageWorking && (
          <Text style={{ color: '#ff9500', marginBottom: 20, textAlign: 'center' }}>
            Secure storage is not working properly on this device. This may affect login and data encryption.
          </Text>
        )}

        <Text style={{ marginBottom: 30, textAlign: 'center' }}>
          The app is running in safe mode to help diagnose and fix issues.
        </Text>

        <Button 
          title="Try Normal Mode" 
          onPress={toggleSafeMode} 
          color="#007aff"
        />
        
        <Text style={{ marginTop: 30, fontSize: 12, color: '#8e8e93', textAlign: 'center' }}>
          Build version: 1.0.5
        </Text>
      </View>
    );
  }

  // Error loading key components
  if (!ThemeProvider || !AuthProvider || !AppNavigator) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <Text style={{ color: '#ff3b30', fontWeight: 'bold', marginBottom: 10 }}>
          Component Loading Error
        </Text>
        <Text style={{ color: '#333', textAlign: 'center', marginBottom: 20 }}>
          Failed to load essential app components.
        </Text>
        <Button 
          title="Enable Safe Mode" 
          onPress={() => setSafeMode(true)} 
          color="#007aff"
        />
      </View>
    );
  }

  // Normal app rendering with error boundary
  return (
    <ErrorBoundary fallbackComponent={(error) => (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, color: '#ff3b30', marginBottom: 10 }}>
          Application Error
        </Text>
        <Text style={{ textAlign: 'center', marginBottom: 20 }}>
          {error?.message || 'An unexpected error occurred.'}
        </Text>
        <Button 
          title="Enable Safe Mode" 
          onPress={() => setSafeMode(true)} 
          color="#007aff"
        />
      </View>
    )}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <StatusBar style="auto" />
            <AppNavigator />
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
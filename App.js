import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from './src/theme/themeContext';
import { AuthProvider } from './src/services/auth';

console.log('✅ App.js: Mounting main app...');

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [AppNavigator, setAppNavigator] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('⏳ App.js: Loading AppNavigator...');
        const navigatorModule = await import('./src/navigation/AppNavigator');
        setAppNavigator(() => navigatorModule.default);
        console.log('✅ App.js: AppNavigator loaded');
      } catch (error) {
        console.error('❌ App.js: Failed to load AppNavigator:', error);
      } finally {
        setIsReady(true);
      }
    };

    initialize();
  }, []);

  if (!isReady || !AppNavigator) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="large" color="#007aff" />
        <Text style={{ marginTop: 10, color: '#333', fontWeight: '500' }}>
          Initializing MagdaRecords...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <StatusBar style="auto" />
          <AppNavigator />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

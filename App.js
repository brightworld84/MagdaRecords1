import React, { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/services/auth';
import {
  AppRegistry,
  View,
  Text,
  ActivityIndicator,
  LogBox,
} from 'react-native';
import { ThemeProvider } from './src/theme/themeContext';

LogBox.ignoreLogs([
  'Warning: ...',
  'Possible Unhandled Promise Rejection',
]);

console.log('✅ App.js: App component is mounting...');

function AppContent() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        console.log('⏳ AppContent: preparing app...');
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.warn('⚠️ Failed to initialize app:', e);
      } finally {
        console.log('✅ AppContent: ready to load navigator');
        setIsReady(true);
      }
    };

    prepare();
  }, []);

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
        }}
      >
        <ActivityIndicator size="large" color="#007aff" />
        <Text
          style={{
            marginTop: 10,
            color: '#333',
            fontWeight: '500',
          }}
        >
          Loading MagdaRecords...
        </Text>
      </View>
    );
  }

  return <AppNavigator />;
}

export default function App() {
  console.log('✅ App.js: Rendering App with Providers');

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <StatusBar style="auto" />
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

AppRegistry.registerComponent('MagdaRecords', () => App);

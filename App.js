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
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider, useTheme } from './src/theme/themeContext';

// Ignore specific warnings that might be coming from dependencies
LogBox.ignoreLogs([
  'Warning: ...',
  'Possible Unhandled Promise Rejection',
]);

console.log('App is initializing...');

function AppContent() {
  const [isReady, setIsReady] = useState(false);
  const { theme, isDark } = useTheme();

  useEffect(() => {
    const prepare = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.warn('Failed to initialize app:', e);
      } finally {
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
          backgroundColor: theme.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.primary} />
        <Text
          style={{
            marginTop: 10,
            color: theme.text,
            fontWeight: '500',
          }}
        >
          Loading MagdaRecords...
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

AppRegistry.registerComponent('MagdaRecords', () => App);

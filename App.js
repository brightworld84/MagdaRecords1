import React, { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { initializeStorage } from './src/services/storage';
import { AuthProvider } from './src/services/auth';
import { AppRegistry, View, Text, ActivityIndicator, LogBox } from 'react-native';
import colors from './src/theme/colors';
import { initializeOpenAI } from './src/services/ai';

// Ignore specific warnings that might be coming from dependencies
LogBox.ignoreLogs([
  'Warning: ...',  // Add specific warnings to ignore here
  'Possible Unhandled Promise Rejection',
]);

console.log('App is initializing...');

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        // Temporarily disable storage and AI init for web
        // await initializeStorage();
        // const openAIInitialized = await initializeOpenAI();
        // if (openAIInitialized) {
        //   console.log('OpenAI client initialized successfully');
        // } else {
        //   console.warn('OpenAI client could not be initialized. AI features will use mock data.');
        // }
  
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.warn('Failed to initialize app:', e);
      } finally {
        setIsReady(true);
      }
    };
  
    prepare();
  }, []);
  
        console.warn('Failed to initialize app:', e);
      } finally {
        setIsReady(true);
      }
    };

    prepare();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10, color: colors.text, fontWeight: '500' }}>
          Loading MagdaRecords...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

AppRegistry.registerComponent('MagdaRecords', () => App);

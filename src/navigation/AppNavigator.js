import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform, View, ActivityIndicator, Text } from 'react-native';

import LandingScreen from '../screens/LandingScreen';
import SignUpScreen from '../screens/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import RecordsScreen from '../screens/RecordsScreen';
import UploadScreen from '../screens/UploadScreen';
import HealthAssistantScreen from '../screens/HealthAssistantScreen';
import ProvidersScreen from '../screens/ProvidersScreen';
import AccountScreen from '../screens/AccountScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DrawerContent from '../components/DrawerContent';

import { AuthContext } from '../services/auth';
import { ThemeContext } from '../theme/themeContext';
import colors from '../theme/colors';
import darkColors from '../theme/darkColors';
import typography from '../theme/typography';
import spacing from '../theme/spacing';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Landing" component={LandingScreen} />
    <Stack.Screen name="SignUp" component={SignUpScreen} />
  </Stack.Navigator>
);

const MainTabs = ({ theme }) => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: theme.primary,
      tabBarInactiveTintColor: theme.gray,
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '500',
      },
      tabBarStyle: {
        backgroundColor: theme.cardBg,
        borderTopColor: theme.lightGray,
        paddingTop: 5,
        paddingBottom: Platform.OS === 'ios' ? spacing.medium : 10,
        height: 70,
        elevation: 8,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      headerShown: false,
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="home-outline" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Records"
      component={RecordsScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="file-document-outline" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Upload"
      component={UploadScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="cloud-upload-outline" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Health Assistant"
      component={HealthAssistantScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="robot-outline" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Providers"
      component={ProvidersScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="people-outline" size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

const MainDrawer = ({ theme }) => (
  <Drawer.Navigator
    drawerContent={(props) => <DrawerContent {...props} />}
    screenOptions={{
      headerStyle: {
        backgroundColor: theme.cardBg,
        elevation: 6,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        borderBottomWidth: Platform.OS === 'android' ? 0 : 1,
        borderBottomColor: theme.lightGray,
      },
      headerTintColor: theme.text,
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      drawerStyle: {
        backgroundColor: theme.cardBg,
        width: 280,
      },
    }}
  >
    <Drawer.Screen
      name="MainTabs"
      options={{
        title: 'MagdaRecords',
        headerTitleAlign: 'center',
      }}
    >
      {() => <MainTabs theme={theme} />}
    </Drawer.Screen>
    <Drawer.Screen name="Account" component={AccountScreen} />
    <Drawer.Screen name="Settings" component={SettingsScreen} />
  </Drawer.Navigator>
);

const AppNavigator = () => {
  const { state } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  const theme = isDarkMode ? darkColors : colors;

  console.log('🧭 AppNavigator auth state:', state);

  if (state.isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[typography.body, { marginTop: spacing.medium, color: theme.text }]}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {state.isAuthenticated ? <MainDrawer theme={theme} /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;

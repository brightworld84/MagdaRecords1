import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Screens
import LandingScreen from '../screens/LandingScreen';
import SignUpScreen from '../screens/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import RecordsScreen from '../screens/RecordsScreen';
import UploadScreen from '../screens/UploadScreen';
import HealthAssistantScreen from '../screens/HealthAssistantScreen';
import ProvidersScreen from '../screens/ProvidersScreen';
import AccountScreen from '../screens/AccountScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Components
import DrawerContent from '../components/DrawerContent';

// Contexts and Theme
import { AuthContext } from '../services/auth';
import { ThemeContext } from '../theme/themeContext';
import colors from '../theme/colors';
import darkColors from '../theme/darkColors';

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
        backgroundColor: theme.card,
        borderTopColor: theme.lightGray,
        paddingTop: 5,
        height: 60,
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
        backgroundColor: theme.card,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: theme.lightGray,
      },
      headerTintColor: theme.text,
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      drawerStyle: {
        backgroundColor: theme.card,
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

  return (
    <NavigationContainer>
      {state.isAuthenticated ? <MainDrawer theme={theme} /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;

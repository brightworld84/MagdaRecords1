import React, { createContext, useReducer, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { encryptData, decryptData } from '../utils/encryption';
import { AUTH_KEYS } from '../utils/constants';

// Initial state
const initialState = {
  isAuthenticated: false,
  user: null,
  isLoading: true,
  error: null,
};

// Create context
export const AuthContext = createContext({
  ...initialState,
  register: () => {},
  login: () => {},
  logout: () => {},
  tryLocalAuth: () => {},
  updateUser: () => {},
});

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        error: null,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
        },
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const userJson = await SecureStore.getItemAsync(AUTH_KEYS.USER_DATA);
        
        if (userJson) {
          // Decrypt the stored user data
          const decryptedUserJson = await decryptData(userJson);
          const userData = JSON.parse(decryptedUserJson);
          
          // If we have user data, we're authenticated
          dispatch({ type: 'LOGIN', payload: userData });
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  // Register a new user
  const register = async (userData) => {
    try {
      // In a real app, this would make an API call to create the user account
      // For this demo, we'll simulate a successful registration
      
      // Create a new user object with an ID and timestamp
      const newUser = {
        ...userData,
        id: `user-${Date.now()}`,
        createdAt: new Date().toISOString(),
        biometricEnabled: false,
      };
      
      // Encrypt and store the user data
      const encryptedUserData = await encryptData(JSON.stringify(newUser));
      await SecureStore.setItemAsync(AUTH_KEYS.USER_DATA, encryptedUserData);
      
      return newUser;
    } catch (error) {
      console.error('Registration error:', error);
      dispatch({
        type: 'AUTH_ERROR',
        payload: error.message || 'Failed to register. Please try again.',
      });
      throw error;
    }
  };

  // Login a user
  const login = async (email, password, provider = 'email') => {
    try {
      // In a real app, this would validate credentials against an API
      // For this demo, we'll simulate a successful login
      
      // Allow any credentials for demo purposes for easy testing
      // Generate a consistent user ID based on email for persistence
      const emailHash = email.split('').reduce((a, b) => {
        return a + b.charCodeAt(0);
      }, 0);
      
      // For demo purposes, create a user with provided details
      const testUser = {
        id: `user-${emailHash}`,
        email,
        firstName: email.split('@')[0],
        lastName: 'User',
        provider,
        createdAt: new Date().toISOString(),
        biometricEnabled: false,
      };
      
      console.log(`Logging in as ${testUser.firstName} ${testUser.lastName}`);
      
      // Encrypt and store the user data
      const encryptedUserData = await encryptData(JSON.stringify(testUser));
      await SecureStore.setItemAsync(AUTH_KEYS.USER_DATA, encryptedUserData);
      
      dispatch({ type: 'LOGIN', payload: testUser });
      return testUser;
    } catch (error) {
      console.error('Login error:', error);
      dispatch({
        type: 'AUTH_ERROR',
        payload: error.message || 'Failed to login. Please check your credentials.',
      });
      throw error;
    }
  };

  // Try to authenticate with biometrics
  const tryLocalAuth = async () => {
    try {
      const userJson = await SecureStore.getItemAsync(AUTH_KEYS.USER_DATA);
      
      if (!userJson) {
        throw new Error('No stored user found');
      }
      
      // Decrypt the stored user data
      const decryptedUserJson = await decryptData(userJson);
      const userData = JSON.parse(decryptedUserJson);
      
      // Ensure biometric authentication is enabled for this user
      if (!userData.biometricEnabled) {
        throw new Error('Biometric authentication not enabled');
      }
      
      dispatch({ type: 'LOGIN', payload: userData });
    } catch (error) {
      console.error('Biometric auth error:', error);
      dispatch({
        type: 'AUTH_ERROR',
        payload: error.message || 'Biometric authentication failed.',
      });
      throw error;
    }
  };

  // Update user information
  const updateUser = async (userData) => {
    try {
      // Encrypt and store the updated user data
      const encryptedUserData = await encryptData(JSON.stringify(userData));
      await SecureStore.setItemAsync(AUTH_KEYS.USER_DATA, encryptedUserData);
      
      dispatch({ type: 'UPDATE_USER', payload: userData });
    } catch (error) {
      console.error('Update user error:', error);
      dispatch({
        type: 'AUTH_ERROR',
        payload: error.message || 'Failed to update user information.',
      });
      throw error;
    }
  };

  // Logout the user
  const logout = async () => {
    try {
      // Remove the stored user data
      await SecureStore.deleteItemAsync(AUTH_KEYS.USER_DATA);
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        register,
        login,
        logout,
        tryLocalAuth,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

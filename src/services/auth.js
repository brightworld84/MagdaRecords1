// src/services/auth.js

import React, { createContext, useReducer, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { encryptData, decryptData } from '../utils/encryption';
import { AUTH_KEYS } from '../utils/constants';

const initialState = {
  isAuthenticated: false,
  user: null,
  isLoading: true,
  error: null,
};

export const AuthContext = createContext({
  ...initialState,
  register: () => {},
  login: () => {},
  logout: () => {},
  tryLocalAuth: () => {},
  updateUser: () => {},
});

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, isAuthenticated: true, user: action.payload, error: null };
    case 'LOGOUT':
      return { ...state, isAuthenticated: false, user: null };
    case 'AUTH_ERROR':
      return { ...state, error: action.payload };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔑 AuthProvider: checking for existing user...');
        dispatch({ type: 'SET_LOADING', payload: true });

        const userJson = await SecureStore.getItemAsync(AUTH_KEYS.USER_DATA);

        if (userJson) {
          try {
            const decryptedUserJson = await decryptData(userJson);
            const userData = JSON.parse(decryptedUserJson);

            console.log('✅ Dispatching login for:', userData);
            dispatch({ type: 'LOGIN', payload: userData });
          } catch (parseError) {
            console.warn('⚠️ Could not parse user data. Clearing corrupted entry.');
            await SecureStore.deleteItemAsync(AUTH_KEYS.USER_DATA);
          }
        } else {
          console.log('ℹ️ No stored user found.');
        }
      } catch (error) {
        console.error('❌ AuthProvider error in checkAuth:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  const register = async (userData) => {
    try {
      const newUser = {
        ...userData,
        id: `user-${Date.now()}`,
        createdAt: new Date().toISOString(),
        biometricEnabled: false,
      };
      const encrypted = await encryptData(JSON.stringify(newUser));
      await SecureStore.setItemAsync(AUTH_KEYS.USER_DATA, encrypted);
      dispatch({ type: 'LOGIN', payload: newUser });
      return newUser;
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error.message || 'Registration failed' });
      throw error;
    }
  };

  const login = async (email, password, provider = 'email') => {
    try {
      const emailHash = email.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      const testUser = {
        id: `user-${emailHash}`,
        email,
        firstName: email.split('@')[0],
        lastName: 'User',
        provider,
        createdAt: new Date().toISOString(),
        biometricEnabled: false,
      };

      const encrypted = await encryptData(JSON.stringify(testUser));
      await SecureStore.setItemAsync(AUTH_KEYS.USER_DATA, encrypted);
      dispatch({ type: 'LOGIN', payload: testUser });
      return testUser;
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error.message || 'Login failed' });
      throw error;
    }
  };

  const tryLocalAuth = async () => {
    try {
      const userJson = await SecureStore.getItemAsync(AUTH_KEYS.USER_DATA);
      if (!userJson) throw new Error('No stored user found');
      const decrypted = await decryptData(userJson);
      const user = JSON.parse(decrypted);
      if (!user.biometricEnabled) throw new Error('Biometric authentication not enabled');
      dispatch({ type: 'LOGIN', payload: user });
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error.message || 'Biometric login failed' });
      throw error;
    }
  };

  const updateUser = async (userData) => {
    try {
      const encrypted = await encryptData(JSON.stringify(userData));
      await SecureStore.setItemAsync(AUTH_KEYS.USER_DATA, encrypted);
      dispatch({ type: 'UPDATE_USER', payload: userData });
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error.message || 'Failed to update user' });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync(AUTH_KEYS.USER_DATA);
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ state, register, login, logout, tryLocalAuth, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const getApiKey = async () => {
  try {
    const encryptedKey = await SecureStore.getItemAsync(AUTH_KEYS.OPENAI_API_KEY);
    if (!encryptedKey) return null;
    const decrypted = await decryptData(encryptedKey);
    return decrypted;
  } catch (error) {
    console.error('❌ Failed to retrieve API key:', error);
    return null;
  }
};

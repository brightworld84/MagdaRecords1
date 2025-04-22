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

  // Wrapper for secure store operations that won't crash the app
  const safeSecureStore = {
    async getItemAsync(key) {
      try {
        return await SecureStore.getItemAsync(key);
      } catch (error) {
        console.error(`❌ SecureStore getItemAsync error for key '${key}':`, error);
        return null;
      }
    },
    async setItemAsync(key, value) {
      try {
        await SecureStore.setItemAsync(key, value);
        return true;
      } catch (error) {
        console.error(`❌ SecureStore setItemAsync error for key '${key}':`, error);
        return false;
      }
    },
    async deleteItemAsync(key) {
      try {
        await SecureStore.deleteItemAsync(key);
        return true;
      } catch (error) {
        console.error(`❌ SecureStore deleteItemAsync error for key '${key}':`, error);
        return false;
      }
    }
  };

  // Safe decrypt with fallbacks
  const safeDecrypt = async (encryptedData) => {
    try {
      if (!encryptedData) return null;
      return await decryptData(encryptedData);
    } catch (error) {
      console.error('❌ Decryption error:', error);
      // Return null rather than throwing
      return null;
    }
  };

  // Safe encrypt with fallbacks
  const safeEncrypt = async (data) => {
    try {
      if (!data) return null;
      return await encryptData(data);
    } catch (error) {
      console.error('❌ Encryption error:', error);
      // If encryption fails, store unencrypted as last resort
      console.warn('⚠️ Falling back to unencrypted storage');
      return `unencrypted:${data}`;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔑 AuthProvider: checking for existing user...');
        dispatch({ type: 'SET_LOADING', payload: true });

        const userJson = await safeSecureStore.getItemAsync(AUTH_KEYS.USER_DATA);
        console.log('📂 Got stored user data:', userJson ? 'Yes' : 'No');

        if (userJson) {
          try {
            // Check if using fallback unencrypted storage
            let userData;
            if (userJson.startsWith('unencrypted:')) {
              const unencryptedData = userJson.substring(12);
              userData = JSON.parse(unencryptedData);
            } else {
              const decryptedUserJson = await safeDecrypt(userJson);
              if (!decryptedUserJson) {
                throw new Error('Decryption returned null');
              }
              userData = JSON.parse(decryptedUserJson);
            }

            console.log('✅ User data parsed successfully:', userData.email);
            dispatch({ type: 'LOGIN', payload: userData });
          } catch (parseError) {
            console.warn('⚠️ Could not parse user data:', parseError);
            console.log('⚠️ Clearing corrupted user data and continuing...');
            await safeSecureStore.deleteItemAsync(AUTH_KEYS.USER_DATA);
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

    // Add a delay to ensure initialization is complete
    setTimeout(() => {
      checkAuth();
    }, 500);
  }, []);

  const register = async (userData) => {
    try {
      const newUser = {
        ...userData,
        id: `user-${Date.now()}`,
        createdAt: new Date().toISOString(),
        biometricEnabled: false,
      };
      
      // Convert to string first to handle errors early
      const userString = JSON.stringify(newUser);
      const encrypted = await safeEncrypt(userString);
      
      if (!encrypted) {
        throw new Error('Failed to encrypt user data');
      }
      
      const stored = await safeSecureStore.setItemAsync(AUTH_KEYS.USER_DATA, encrypted);
      if (!stored) {
        throw new Error('Failed to store user data');
      }
      
      dispatch({ type: 'LOGIN', payload: newUser });
      return newUser;
    } catch (error) {
      console.error('❌ Registration error:', error);
      dispatch({ type: 'AUTH_ERROR', payload: error.message || 'Registration failed' });
      throw error;
    }
  };

  const login = async (email, password, provider = 'email') => {
    try {
      // Generate simple hash for demo
      const emailHash = Array.from(email)
        .reduce((a, b) => a + b.charCodeAt(0), 0)
        .toString();
      
      const testUser = {
        id: `user-${emailHash}`,
        email,
        firstName: email.split('@')[0],
        lastName: 'User',
        provider,
        createdAt: new Date().toISOString(),
        biometricEnabled: false,
      };

      // Convert to string first
      const userString = JSON.stringify(testUser);
      const encrypted = await safeEncrypt(userString);
      
      if (!encrypted) {
        throw new Error('Failed to encrypt user data');
      }
      
      const stored = await safeSecureStore.setItemAsync(AUTH_KEYS.USER_DATA, encrypted);
      if (!stored) {
        throw new Error('Failed to store user data');
      }
      
      dispatch({ type: 'LOGIN', payload: testUser });
      return testUser;
    } catch (error) {
      console.error('❌ Login error:', error);
      dispatch({ type: 'AUTH_ERROR', payload: error.message || 'Login failed' });
      throw error;
    }
  };

  const tryLocalAuth = async () => {
    try {
      const userJson = await safeSecureStore.getItemAsync(AUTH_KEYS.USER_DATA);
      if (!userJson) {
        throw new Error('No stored user found');
      }
      
      let userData;
      if (userJson.startsWith('unencrypted:')) {
        const unencryptedData = userJson.substring(12);
        userData = JSON.parse(unencryptedData);
      } else {
        const decrypted = await safeDecrypt(userJson);
        if (!decrypted) {
          throw new Error('Decryption failed');
        }
        userData = JSON.parse(decrypted);
      }
      
      if (!userData.biometricEnabled) {
        throw new Error('Biometric authentication not enabled');
      }
      
      dispatch({ type: 'LOGIN', payload: userData });
    } catch (error) {
      console.error('❌ Biometric auth error:', error);
      dispatch({ type: 'AUTH_ERROR', payload: error.message || 'Biometric login failed' });
      throw error;
    }
  };

  const updateUser = async (userData) => {
    try {
      const userString = JSON.stringify(userData);
      const encrypted = await safeEncrypt(userString);
      
      if (!encrypted) {
        throw new Error('Failed to encrypt user data');
      }
      
      const stored = await safeSecureStore.setItemAsync(AUTH_KEYS.USER_DATA, encrypted);
      if (!stored) {
        throw new Error('Failed to store user data');
      }
      
      dispatch({ type: 'UPDATE_USER', payload: userData });
    } catch (error) {
      console.error('❌ Update user error:', error);
      dispatch({ type: 'AUTH_ERROR', payload: error.message || 'Failed to update user' });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await safeSecureStore.deleteItemAsync(AUTH_KEYS.USER_DATA);
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
    
    try {
      const decrypted = await decryptData(encryptedKey);
      return decrypted;
    } catch (decryptError) {
      console.error('❌ API key decryption failed:', decryptError);
      return null;
    }
  } catch (error) {
    console.error('❌ Failed to retrieve API key:', error);
    return null;
  }
};
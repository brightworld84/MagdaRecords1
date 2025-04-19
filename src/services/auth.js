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

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const userJson = await SecureStore.getItemAsync(AUTH_KEYS.USER_DATA);
        if (userJson) {
          const decryptedUserJson = await decryptData(userJson);
          const userData = JSON.parse(decryptedUserJson);
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

  const register = async (userData) => {
    try {
      const newUser = {
        ...userData,
        id: `user-${Date.now()}`,
        createdAt: new Date().toISOString(),
        biometricEnabled: false,
      };
      const encryptedUserData = await encryptData(JSON.stringify(newUser));
      await SecureStore.setItemAsync(AUTH_KEYS.USER_DATA, encryptedUserData);
      dispatch({ type: 'LOGIN', payload: newUser }); // ✅ Add this line
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

  const tryLocalAuth = async () => {
    try {
      const userJson = await SecureStore.getItemAsync(AUTH_KEYS.USER_DATA);
      if (!userJson) throw new Error('No stored user found');
      const decryptedUserJson = await decryptData(userJson);
      const userData = JSON.parse(decryptedUserJson);
      if (!userData.biometricEnabled) throw new Error('Biometric authentication not enabled');
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

  const updateUser = async (userData) => {
    try {
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

  const logout = async () => {
    try {
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

// Get OpenAI API Key (used by AI features)
export const getApiKey = async () => {
  try {
    const encryptedKey = await SecureStore.getItemAsync(AUTH_KEYS.OPENAI_API_KEY);
    if (!encryptedKey) return null;
    const decryptedKey = await decryptData(encryptedKey);
    return decryptedKey;
  } catch (error) {
    console.error('Failed to retrieve API key:', error);
    return null;
  }
};

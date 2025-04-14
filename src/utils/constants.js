// Keys for secure storage
export const STORAGE_KEYS = {
  USER_DATA: 'magda_user_data',
  ENCRYPTION_KEY: 'magda_encryption_key',
  AUTH_TOKEN: 'magda_auth_token',
  OPENAI_API_KEY: 'magda_openai_api_key',
};

// Keys for authentication
export const AUTH_KEYS = {
  USER_DATA: 'magda_user_data',
  SESSION_TOKEN: 'magda_session_token',
};

// Record types
export const RECORD_TYPES = {
  LAB: 'lab',
  IMAGING: 'imaging',
  VISIT: 'visit',
  PRESCRIPTION: 'prescription',
  IMMUNIZATION: 'immunization',
  OTHER: 'other',
};

// API endpoints (for a real backend)
export const API_ENDPOINTS = {
  BASE_URL: 'https://api.magdarecords.com',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  RECORDS: '/records',
  PROVIDERS: '/providers',
  SETTINGS: '/settings',
  ACCOUNTS: '/accounts',
  AI: '/ai',
};


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
  
  // AI features
  export const AI_FEATURES = {
    MEDICATION_ANALYSIS: 'medication_analysis',
    HEALTH_RECOMMENDATIONS: 'health_recommendations',
    TEXT_EXTRACTION: 'text_extraction',
    HEALTH_ASSISTANT: 'health_assistant',
  };
  
  // HIPAA compliance settings
  export const HIPAA_SETTINGS = {
    DATA_RETENTION_DAYS: 365 * 7, // 7 years
    AUDIT_LOG_ENABLED: true,
    ENCRYPTION_REQUIRED: true,
    SESSION_TIMEOUT_MINUTES: 15,
  };
  
  // App-wide settings
  export const APP_SETTINGS = {
    DEFAULT_FONT_SIZE: 'medium',
    AUTO_LOCK_TIMEOUT_MS: 5 * 60 * 1000, // 5 minutes
    MAX_UPLOAD_FILE_SIZE_MB: 10,
    SUPPORTED_FILE_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
  };
  export const STORAGE_KEYS = {
    USER_DATA: 'user_data',
    AUTH_TOKEN: 'auth_token',
    ENCRYPTION_KEY: 'encryption_key',
    OPENAI_API_KEY: 'openai_api_key',
  };
  
  export const RECORD_TYPES = {
    VISIT: 'visit',
    LAB: 'lab',
    IMAGING: 'imaging',
    PRESCRIPTION: 'prescription',
    IMMUNIZATION: 'immunization',
    OTHER: 'other',
  };
  
  export const UPLOAD_TYPES = {
    DOCUMENT: 'document',
    IMAGE: 'image',
    CAMERA: 'camera',
    FHIR: 'fhir',
  };
  
  export const ERROR_MESSAGES = {
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_PASSWORD: 'Password must be at least 8 characters long',
    PASSWORDS_DONT_MATCH: 'Passwords do not match',
    REQUIRED_FIELD: 'This field is required',
    INVALID_DATE: 'Please enter a valid date',
    NETWORK_ERROR: 'Network error. Please try again',
    AUTH_ERROR: 'Authentication failed. Please try again',
  };
  
  export const ANIMATIONS = {
    DURATION: {
      SHORT: 200,
      MEDIUM: 300,
      LONG: 500,
    },
  };
  
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';
import { encryptData, decryptData, generateKey } from '../utils/encryption';
import { STORAGE_KEYS } from '../utils/constants';

// Initialize storage
export const initializeStorage = async () => {
  try {
    // Create secure directories for storing medical records and other data
    const recordsDir = `${FileSystem.documentDirectory}secure_records/`;
    const exists = await FileSystem.getInfoAsync(recordsDir);
    
    if (!exists.exists) {
      await FileSystem.makeDirectoryAsync(recordsDir, { intermediates: true });
    }
    
    // Check if we need to set up encryption keys
    const hasEncryptionKey = await SecureStore.getItemAsync(STORAGE_KEYS.ENCRYPTION_KEY);
    
    if (!hasEncryptionKey) {
      // Generate and store new encryption key
      const newKey = await generateKey();
      await SecureStore.setItemAsync(STORAGE_KEYS.ENCRYPTION_KEY, newKey);
    }
    
    // Check if we need to save the OpenAI API key from environment
    if (process.env.OPENAI_API_KEY) {
      const hasOpenAIKey = await SecureStore.getItemAsync(STORAGE_KEYS.OPENAI_API_KEY);
      if (!hasOpenAIKey) {
        await SecureStore.setItemAsync(STORAGE_KEYS.OPENAI_API_KEY, process.env.OPENAI_API_KEY);
        console.log('Stored OpenAI API key from environment');
      }
    }
    
    return true;
  } catch (error) {
    console.error('Failed to initialize storage:', error);
    throw error;
  }
};

// In-memory storage for records and other data (in a real app, this would use a proper database)
const memoryStorage = {
  records: {},
  providers: {},
  settings: {},
  linkedAccounts: {},
};

// Get path for user's secure data
const getUserDataPath = (userId) => {
  return `${FileSystem.documentDirectory}secure_records/${userId}/`;
};

// Ensure user directory exists
const ensureUserDirectory = async (userId) => {
  const userDir = getUserDataPath(userId);
  const exists = await FileSystem.getInfoAsync(userDir);
  
  if (!exists.exists) {
    await FileSystem.makeDirectoryAsync(userDir, { intermediates: true });
  }
  
  return userDir;
};

// Get recent records for a user
export const getRecentRecords = async (userId) => {
  try {
    if (!memoryStorage.records[userId]) {
      // In a real app, we would fetch from a database
      // For this demo, we'll create some mock records
      memoryStorage.records[userId] = [
        {
          id: 'record1',
          title: 'Annual Physical Exam',
          date: '2023-06-15',
          type: 'visit',
          provider: 'Dr. Sarah Johnson',
          description: 'Annual physical examination with routine blood work. Blood pressure 120/80. Heart rate 72 BPM. All vitals within normal range.',
          uploadType: 'document',
          metadata: {
            aiAnalyzed: true,
            keywords: ['physical exam', 'vitals', 'blood pressure', 'heart rate', 'wellness'],
            summary: 'Annual physical with normal findings'
          }
        },
        {
          id: 'record2',
          title: 'Cholesterol Panel Results',
          date: '2023-05-20',
          type: 'lab',
          provider: 'Memorial Hospital',
          description: 'Complete lipid panel shows total cholesterol: 190 mg/dL, HDL: 55 mg/dL, LDL: 120 mg/dL, Triglycerides: 85 mg/dL.',
          uploadType: 'image',
          metadata: {
            aiAnalyzed: true,
            keywords: ['cholesterol', 'lipids', 'HDL', 'LDL', 'triglycerides', 'cardiovascular'],
            summary: 'Lipid panel showing normal cholesterol levels'
          }
        },
        {
          id: 'record3',
          title: 'Flu Vaccine',
          date: '2023-04-10',
          type: 'immunization',
          provider: 'City Medical Center',
          description: 'Seasonal influenza vaccine administered. Quadrivalent vaccine, lot #FL29384. No adverse reactions.',
          uploadType: 'camera',
        },
        {
          id: 'record4',
          title: 'MRI - Right Knee',
          date: '2023-03-05',
          type: 'imaging',
          provider: 'Dr. Michael Chen',
          description: 'MRI of right knee shows mild meniscal tear, no signs of ligament damage. Conservative treatment recommended.',
          uploadType: 'document',
          metadata: {
            aiAnalyzed: true,
            keywords: ['MRI', 'knee', 'meniscus', 'tear', 'orthopedic', 'joint'],
            summary: 'Right knee MRI showing mild meniscal tear'
          }
        },
        {
          id: 'record5',
          title: 'Prescription - Amoxicillin',
          date: '2023-02-18',
          type: 'prescription',
          provider: 'Dr. Sarah Johnson',
          description: 'Amoxicillin 500mg, 1 capsule three times daily for 10 days. For treatment of bacterial sinus infection.',
          uploadType: 'image',
          metadata: {
            aiAnalyzed: true,
            keywords: ['antibiotics', 'amoxicillin', 'prescription', 'sinus infection', 'medication'],
            summary: 'Prescription for Amoxicillin to treat sinus infection'
          }
        },
      ];
    }
    
    // Sort records by date (newest first)
    return [...memoryStorage.records[userId]].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    ).slice(0, 5); // Get only the 5 most recent
  } catch (error) {
    console.error('Failed to get recent records:', error);
    throw error;
  }
};

// Get all records for a user
export const getAllRecords = async (userId) => {
  try {
    if (!memoryStorage.records[userId]) {
      // Initialize with mock data for demo purposes
      await getRecentRecords(userId);
      
      // Add a few more records for the demo
      memoryStorage.records[userId].push(
        {
          id: 'record6',
          title: 'Chest X-Ray',
          date: '2023-01-05',
          type: 'imaging',
          provider: 'Memorial Hospital',
          description: 'Chest X-ray due to persistent cough. No abnormalities detected.',
          uploadType: 'fhir',
          metadata: {
            aiAnalyzed: true,
            keywords: ['x-ray', 'chest', 'respiratory', 'cough', 'lungs'],
            summary: 'Normal chest X-ray results'
          }
        },
        {
          id: 'record7',
          title: 'Dermatology Consultation',
          date: '2022-12-15',
          type: 'visit',
          provider: 'Dr. Emily Wong',
          description: 'Evaluation of mole on upper back. No signs of irregularity or malignancy.',
          uploadType: 'document',
        }
      );
    }
    
    // Sort records by date (newest first)
    return [...memoryStorage.records[userId]].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
  } catch (error) {
    console.error('Failed to get all records:', error);
    throw error;
  }
};

// Upload a new record
export const uploadRecord = async (userId, recordData) => {
  try {
    // Ensure user directory exists
    await ensureUserDirectory(userId);
    
    // If records for this user don't exist yet, initialize the array
    if (!memoryStorage.records[userId]) {
      memoryStorage.records[userId] = [];
    }
    
    // Create a base record with ID and timestamps
    let newRecord = {
      ...recordData,
      id: `record-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    
    // Process the record with AI analysis if applicable
    try {
      // Dynamically import to avoid circular dependency
      const { processUploadedRecord } = await import('./ai');
      if (processUploadedRecord) {
        console.log('Analyzing record with AI...');
        // Process with AI (enhance with metadata, extract information, etc.)
        const enhancedRecord = await processUploadedRecord(newRecord);
        if (enhancedRecord) {
          newRecord = enhancedRecord;
          console.log('Record successfully enhanced with AI analysis');
        }
      }
    } catch (aiError) {
      // If AI processing fails, continue with the original record
      console.warn('AI processing skipped:', aiError.message);
    }
    
    // Add HIPAA-compliant timestamp and audit info
    newRecord.hipaaInfo = {
      lastAccessed: new Date().toISOString(),
      accessHistory: [{
        timestamp: new Date().toISOString(),
        action: 'created',
        userId
      }]
    };
    
    // Add to in-memory storage
    memoryStorage.records[userId].push(newRecord);
    
    // In a real app, we would also store the record securely on disk
    // For this demo, we'll just use the in-memory storage
    
    return newRecord;
  } catch (error) {
    console.error('Failed to upload record:', error);
    throw error;
  }
};

// Get providers for a user
export const getProviders = async (userId) => {
  try {
    if (!memoryStorage.providers[userId]) {
      // In a real app, we would fetch from a database
      // For this demo, we'll create some mock providers
      memoryStorage.providers[userId] = [
        {
          id: 'provider1',
          name: 'Dr. Sarah Johnson',
          specialty: 'Primary Care Physician',
          facility: 'City Medical Group',
          phone: '(555) 123-4567',
          address: '123 Main St, Anytown, USA',
          notes: 'Annual checkup in April.',
        },
        {
          id: 'provider2',
          name: 'Dr. Michael Chen',
          specialty: 'Cardiologist',
          facility: 'Heart Health Specialists',
          phone: '(555) 987-6543',
          address: '456 Cardio Lane, Anytown, USA',
          notes: 'Follow-up appointment needed in 6 months.',
        },
      ];
    }
    
    return [...memoryStorage.providers[userId]];
  } catch (error) {
    console.error('Failed to get providers:', error);
    throw error;
  }
};

// Save a provider
export const saveProvider = async (userId, providerData) => {
  try {
    // Ensure user directory exists
    await ensureUserDirectory(userId);
    
    // If providers for this user don't exist yet, initialize the array
    if (!memoryStorage.providers[userId]) {
      memoryStorage.providers[userId] = [];
    }
    
    // Check if this is an update or a new provider
    const existingIndex = memoryStorage.providers[userId].findIndex(
      p => p.id === providerData.id
    );
    
    if (existingIndex >= 0) {
      // Update existing provider
      memoryStorage.providers[userId][existingIndex] = {
        ...memoryStorage.providers[userId][existingIndex],
        ...providerData,
        updatedAt: new Date().toISOString(),
      };
      
      return memoryStorage.providers[userId][existingIndex];
    } else {
      // Create a new provider with ID if none was provided
      const newProvider = {
        ...providerData,
        id: providerData.id || `provider-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      
      // Add to in-memory storage
      memoryStorage.providers[userId].push(newProvider);
      
      return newProvider;
    }
  } catch (error) {
    console.error('Failed to save provider:', error);
    throw error;
  }
};

// Delete a provider
export const deleteProvider = async (userId, providerId) => {
  try {
    if (!memoryStorage.providers[userId]) {
      return false;
    }
    
    // Filter out the provider to delete
    memoryStorage.providers[userId] = memoryStorage.providers[userId].filter(
      p => p.id !== providerId
    );
    
    return true;
  } catch (error) {
    console.error('Failed to delete provider:', error);
    throw error;
  }
};

// Get linked accounts for a user
export const getLinkedAccounts = async (userId) => {
  try {
    if (!memoryStorage.linkedAccounts[userId]) {
      // In a real app, we would fetch from a database
      // For this demo, we'll create some mock linked accounts
      memoryStorage.linkedAccounts[userId] = [
        {
          id: 'family1',
          firstName: 'Jane',
          lastName: 'Smith',
          relationship: 'Spouse',
          dateOfBirth: '04/15/1985',
          createdBy: userId,
        },
        {
          id: 'family2',
          firstName: 'Alex',
          lastName: 'Smith',
          relationship: 'Child',
          dateOfBirth: '06/22/2012',
          createdBy: userId,
        },
      ];
    }
    
    return [...memoryStorage.linkedAccounts[userId]];
  } catch (error) {
    console.error('Failed to get linked accounts:', error);
    throw error;
  }
};

// Add a linked account
export const addLinkedAccount = async (userId, accountData) => {
  try {
    // Ensure user directory exists
    await ensureUserDirectory(userId);
    
    // If linked accounts for this user don't exist yet, initialize the array
    if (!memoryStorage.linkedAccounts[userId]) {
      memoryStorage.linkedAccounts[userId] = [];
    }
    
    // Add the new account
    memoryStorage.linkedAccounts[userId].push({
      ...accountData,
      createdAt: new Date().toISOString(),
    });
    
    return accountData;
  } catch (error) {
    console.error('Failed to add linked account:', error);
    throw error;
  }
};

// Remove a linked account
export const removeLinkedAccount = async (userId, accountId) => {
  try {
    if (!memoryStorage.linkedAccounts[userId]) {
      return false;
    }
    
    // Filter out the account to remove
    memoryStorage.linkedAccounts[userId] = memoryStorage.linkedAccounts[userId].filter(
      a => a.id !== accountId
    );
    
    // Also remove any records associated with this account
    if (memoryStorage.records[accountId]) {
      delete memoryStorage.records[accountId];
    }
    
    return true;
  } catch (error) {
    console.error('Failed to remove linked account:', error);
    throw error;
  }
};

// Get user settings
export const getUserSettings = async (userId) => {
  try {
    if (!memoryStorage.settings[userId]) {
      // Initialize with default settings
      memoryStorage.settings[userId] = {
        darkMode: false,
        notifications: true,
        autoLock: true,
        dataSharing: false,
        biometricEnabled: false,
        fontSize: 'medium',
        highContrast: false,
      };
    }
    
    return { ...memoryStorage.settings[userId] };
  } catch (error) {
    console.error('Failed to get user settings:', error);
    throw error;
  }
};

// Update user settings
export const updateUserSettings = async (userId, settingsData) => {
  try {
    // Ensure settings for this user exist
    if (!memoryStorage.settings[userId]) {
      await getUserSettings(userId);
    }
    
    // Update settings
    memoryStorage.settings[userId] = {
      ...memoryStorage.settings[userId],
      ...settingsData,
    };
    
    return { ...memoryStorage.settings[userId] };
  } catch (error) {
    console.error('Failed to update user settings:', error);
    throw error;
  }
};

// Update user details
export const updateUserDetails = async (userData) => {
  try {
    // In a real app, this would update the user account in a database
    // For this demo, we'll just update the stored user data
    
    // Encrypt and store the updated user data
    const encryptedUserData = await encryptData(JSON.stringify(userData));
    await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, encryptedUserData);
    
    return userData;
  } catch (error) {
    console.error('Failed to update user details:', error);
    throw error;
  }
};

// Change user password
export const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    // In a real app, this would validate the current password and update it
    // For this demo, we'll just simulate a successful password change
    
    // Simulate a slight delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // If current password is "wrong", reject the change
    if (currentPassword === "wrong") {
      throw new Error('Incorrect current password');
    }
    
    return true;
  } catch (error) {
    console.error('Failed to change password:', error);
    throw error;
  }
};

// Get the OpenAI API key
export const getOpenAIAPIKey = async () => {
  try {
    const apiKey = await SecureStore.getItemAsync(STORAGE_KEYS.OPENAI_API_KEY);
    return apiKey;
  } catch (error) {
    console.error('Failed to get OpenAI API key:', error);
    throw error;
  }
};

// Save the OpenAI API key
export const saveOpenAIAPIKey = async (apiKey) => {
  try {
    await SecureStore.setItemAsync(STORAGE_KEYS.OPENAI_API_KEY, apiKey);
    return true;
  } catch (error) {
    console.error('Failed to save OpenAI API key:', error);
    throw error;
  }
};

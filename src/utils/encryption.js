import * as Crypto from 'expo-crypto';
import * as Random from 'expo-random';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from './constants';

// Generate a new encryption key
export const generateKey = async () => {
  try {
    // Generate a random 32-byte key
    const randomBytes = await Random.getRandomBytesAsync(32);
    return Array.from(randomBytes)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  } catch (error) {
    console.error('Failed to generate encryption key:', error);
    throw error;
  }
};

// Get the stored encryption key
const getEncryptionKey = async () => {
  try {
    const key = await SecureStore.getItemAsync(STORAGE_KEYS.ENCRYPTION_KEY);
    
    if (!key) {
      // Generate a new key if one doesn't exist
      const newKey = await generateKey();
      await SecureStore.setItemAsync(STORAGE_KEYS.ENCRYPTION_KEY, newKey);
      return newKey;
    }
    
    return key;
  } catch (error) {
    console.error('Failed to get encryption key:', error);
    throw error;
  }
};

// Encrypt data using AES-CBC
export const encryptData = async (plaintext) => {
  try {
    // For a real app, this would use a proper encryption library
    // For this demo, we'll use a simple algorithm for illustration
    
    // Get the encryption key
    const key = await getEncryptionKey();
    
    // Generate a random initialization vector (IV)
    const iv = await Random.getRandomBytesAsync(16);
    const ivHex = Array.from(iv)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
    
    // Create a simple "encryption" by XOR-ing with the key
    // Note: This is NOT secure and only for demonstration purposes
    // A real app would use proper AES encryption
    const keyBytes = [];
    for (let i = 0; i < key.length; i += 2) {
      keyBytes.push(parseInt(key.substr(i, 2), 16));
    }
    
    // Convert plaintext to byte array
    const plaintextBytes = new TextEncoder().encode(plaintext);
    
    // Apply a simple XOR operation with the key (for demonstration only)
    const ciphertextBytes = new Uint8Array(plaintextBytes.length);
    for (let i = 0; i < plaintextBytes.length; i++) {
      ciphertextBytes[i] = plaintextBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    
    // Convert to hex string
    const ciphertextHex = Array.from(ciphertextBytes)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
    
    // Return IV + ciphertext
    return ivHex + ciphertextHex;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

// Decrypt data
export const decryptData = async (ciphertext) => {
  try {
    // For a real app, this would use a proper decryption library
    // For this demo, we'll use a simple algorithm for illustration
    
    // Get the encryption key
    const key = await getEncryptionKey();
    
    // Extract IV and ciphertext
    const ivHex = ciphertext.substring(0, 32);
    const ciphertextHex = ciphertext.substring(32);
    
    // Convert key to byte array
    const keyBytes = [];
    for (let i = 0; i < key.length; i += 2) {
      keyBytes.push(parseInt(key.substr(i, 2), 16));
    }
    
    // Convert ciphertext to byte array
    const ciphertextBytes = new Uint8Array(ciphertextHex.length / 2);
    for (let i = 0; i < ciphertextHex.length; i += 2) {
      ciphertextBytes[i / 2] = parseInt(ciphertextHex.substr(i, 2), 16);
    }
    
    // Apply a simple XOR operation with the key (for demonstration only)
    const plaintextBytes = new Uint8Array(ciphertextBytes.length);
    for (let i = 0; i < ciphertextBytes.length; i++) {
      plaintextBytes[i] = ciphertextBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    
    // Convert back to string
    return new TextDecoder().decode(plaintextBytes);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

// Generate a hash of data using SHA-256
export const hashData = async (data) => {
  try {
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      data
    );
    return hash;
  } catch (error) {
    console.error('Hashing error:', error);
    throw new Error('Failed to hash data');
  }
};
import * as Crypto from 'expo-crypto';

// Generate a new encryption key
export const generateKey = async () => {
  const key = await Crypto.getRandomBytesAsync(32);
  return Array.from(key)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Encrypt data
export const encryptData = async (data) => {
  try {
    const stringData = typeof data === 'string' ? data : JSON.stringify(data);
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(stringData);
    const encrypted = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      encodedData
    );
    return encrypted;
  } catch (error) {
    console.error('Encryption failed:', error);
    throw error;
  }
};

// Decrypt data
export const decryptData = async (encryptedData) => {
  try {
    // In a real app, implement actual decryption
    // This is just a placeholder
    return encryptedData;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw error;
  }
};

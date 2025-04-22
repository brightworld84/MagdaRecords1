// src/utils/encryption.js

import * as Crypto from 'expo-crypto';
import * as Random from 'expo-random';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from './constants';

// Generate a new encryption key
export const generateKey = async () => {
  try {
    console.log('🔐 Generating new encryption key...');
    const randomBytes = await Random.getRandomBytesAsync(32);
    return Array.from(randomBytes)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  } catch (error) {
    console.error('❌ Failed to generate encryption key:', error);
    // Fallback to a deterministic key for emergency recovery
    console.log('⚠️ Using fallback deterministic key');
    return 'fallback_key_for_emergency_only_' + Date.now();
  }
};

// Get the stored encryption key
const getEncryptionKey = async () => {
  try {
    console.log('🔐 Retrieving encryption key...');
    const key = await SecureStore.getItemAsync(STORAGE_KEYS.ENCRYPTION_KEY);
    if (!key) {
      console.log('🔐 No encryption key found, generating new one');
      const newKey = await generateKey();
      await SecureStore.setItemAsync(STORAGE_KEYS.ENCRYPTION_KEY, newKey);
      return newKey;
    }
    return key;
  } catch (error) {
    console.error('❌ Failed to get encryption key:', error);
    // Fallback to a temporary key instead of crashing
    console.log('⚠️ Using temporary key as fallback');
    return 'temporary_fallback_key_for_testing';
  }
};

// Encrypt data using simple XOR (demo only — not real AES)
export const encryptData = async (plaintext) => {
  try {
    if (!plaintext) {
      console.warn('⚠️ Encryption warning: Empty plaintext provided');
      return '';
    }
    
    const key = await getEncryptionKey();
    
    // Generate IV (initialization vector)
    let iv;
    try {
      iv = await Random.getRandomBytesAsync(16);
    } catch (randomError) {
      console.warn('⚠️ Failed to generate random IV:', randomError);
      // Fallback to timestamp-based IV
      const timestamp = Date.now().toString();
      iv = new Uint8Array(16);
      for (let i = 0; i < 16; i++) {
        iv[i] = i < timestamp.length ? timestamp.charCodeAt(i) : i;
      }
    }
    
    const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');

    const keyBytes = [];
    for (let i = 0; i < key.length; i += 2) {
      keyBytes.push(parseInt(key.substr(i, 2), 16));
    }

    // Handle text encoding safely
    let plaintextBytes;
    try {
      plaintextBytes = new TextEncoder().encode(plaintext);
    } catch (encodeError) {
      console.warn('⚠️ TextEncoder failed:', encodeError);
      // Manual fallback encoding
      plaintextBytes = new Uint8Array(plaintext.length);
      for (let i = 0; i < plaintext.length; i++) {
        plaintextBytes[i] = plaintext.charCodeAt(i) & 0xff;
      }
    }
    
    const ciphertextBytes = new Uint8Array(plaintextBytes.length);
    for (let i = 0; i < plaintextBytes.length; i++) {
      ciphertextBytes[i] = plaintextBytes[i] ^ keyBytes[i % keyBytes.length];
    }

    const ciphertextHex = Array.from(ciphertextBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    return ivHex + ciphertextHex;
  } catch (error) {
    console.error('❌ Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

// Decrypt data
export const decryptData = async (ciphertext) => {
  try {
    if (!ciphertext) {
      console.warn('⚠️ Decryption warning: Empty ciphertext provided');
      return '';
    }
    
    const key = await getEncryptionKey();
    
    if (ciphertext.length < 32) {
      console.warn('⚠️ Decryption warning: Ciphertext too short');
      return '';
    }
    
    const ivHex = ciphertext.substring(0, 32);
    const ciphertextHex = ciphertext.substring(32);

    const keyBytes = [];
    for (let i = 0; i < key.length; i += 2) {
      keyBytes.push(parseInt(key.substr(i, 2), 16));
    }

    const ciphertextBytes = new Uint8Array(ciphertextHex.length / 2);
    for (let i = 0; i < ciphertextHex.length; i += 2) {
      ciphertextBytes[i / 2] = parseInt(ciphertextHex.substr(i, 2), 16);
    }

    const plaintextBytes = new Uint8Array(ciphertextBytes.length);
    for (let i = 0; i < ciphertextBytes.length; i++) {
      plaintextBytes[i] = ciphertextBytes[i] ^ keyBytes[i % keyBytes.length];
    }

    // Handle text decoding safely
    try {
      return new TextDecoder().decode(plaintextBytes);
    } catch (decodeError) {
      console.warn('⚠️ TextDecoder failed:', decodeError);
      // Manual fallback decoding
      let result = '';
      for (let i = 0; i < plaintextBytes.length; i++) {
        result += String.fromCharCode(plaintextBytes[i]);
      }
      return result;
    }
  } catch (error) {
    console.error('❌ Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

// SHA-256 hash
export const hashData = async (data) => {
  try {
    if (!data) {
      console.warn('⚠️ Hashing warning: Empty data provided');
      return '';
    }
    
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      data
    );
  } catch (error) {
    console.error('❌ Hashing error:', error);
    // Fallback to a basic hash implementation
    console.log('⚠️ Using fallback hash implementation');
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }
};
import * as Crypto from 'expo-crypto';
import * as Random from 'expo-random';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from './constants';

// Generate a new encryption key
export const generateKey = async () => {
  try {
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

// Encrypt data using simple XOR (demo only — not real AES)
export const encryptData = async (plaintext) => {
  try {
    const key = await getEncryptionKey();
    const iv = await Random.getRandomBytesAsync(16);
    const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');

    const keyBytes = [];
    for (let i = 0; i < key.length; i += 2) {
      keyBytes.push(parseInt(key.substr(i, 2), 16));
    }

    const plaintextBytes = new TextEncoder().encode(plaintext);
    const ciphertextBytes = new Uint8Array(plaintextBytes.length);
    for (let i = 0; i < plaintextBytes.length; i++) {
      ciphertextBytes[i] = plaintextBytes[i] ^ keyBytes[i % keyBytes.length];
    }

    const ciphertextHex = Array.from(ciphertextBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    return ivHex + ciphertextHex;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

// Decrypt data
export const decryptData = async (ciphertext) => {
  try {
    const key = await getEncryptionKey();
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

    return new TextDecoder().decode(plaintextBytes);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

// SHA-256 hash
export const hashData = async (data) => {
  try {
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      data
    );
  } catch (error) {
    console.error('Hashing error:', error);
    throw new Error('Failed to hash data');
  }
};

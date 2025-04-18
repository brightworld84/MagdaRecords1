// src/services/ai.js

import OpenAI from 'openai';
import { getApiKey } from './auth'; // or wherever your key retrieval is
import { Alert } from 'react-native';

let openai = null;

// Toggle this to use mock responses during development or offline
export const FORCE_MOCK_MODE = false;

// Initialize OpenAI safely
export const initializeOpenAI = async () => {
  try {
    if (FORCE_MOCK_MODE) {
      console.warn('FORCE_MOCK_MODE is enabled. AI features will use mock data.');
      return false;
    }

    const apiKey = await getApiKey();
    if (!apiKey) {
      console.warn('OpenAI API key not found. AI features will use mock data.');
      return false;
    }

    openai = new OpenAI({ apiKey });
    return true;
  } catch (error) {
    console.error('Failed to initialize OpenAI:', error);
    return false;
  }
};

// Example: Basic AI prompt usage (with mock fallback)
export const askHealthQuestion = async (question) => {
  if (!openai || FORCE_MOCK_MODE) {
    return `Mock response to: "${question}"`;
  }

  try {
    const response = await openai.chat.completions.create({
      messages: [{ role: 'user', content: question }],
      model: 'gpt-3.5-turbo',
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI request failed:', error);
    Alert.alert('AI Error', 'Unable to process your question right now.');
    return 'Sorry, something went wrong.';
  }
};

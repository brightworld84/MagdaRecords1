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

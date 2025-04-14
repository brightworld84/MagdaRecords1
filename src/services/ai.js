import OpenAI from "openai";
import { getAllRecords } from './storage';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../utils/constants';

// Initialize OpenAI with API key from environment
const getApiKey = async () => {
  try {
    // Try to get API key from secure storage
    const apiKey = await SecureStore.getItemAsync(STORAGE_KEYS.OPENAI_API_KEY);
    return apiKey || process.env.OPENAI_API_KEY;
  } catch (error) {
    console.error('Error accessing API key:', error);
    return process.env.OPENAI_API_KEY;
  }
};

// Create OpenAI client
let openai = null;

// Helper function to extract medications from records
const extractMedicationsFromRecords = (records) => {
  const medications = [];
  
  // Look for medications in prescription records
  records.forEach(record => {
    // Extract from prescription records
    if (record.type === 'prescription') {
      // Try to get medication name from title
      const title = record.title || '';
      if (title && !title.toLowerCase().includes('prescription')) {
        medications.push(title.replace('Prescription - ', '').trim());
      }
      
      // Try to extract from description
      if (record.description) {
        const descLines = record.description.split('.');
        // Take first sentence which typically has medication info
        if (descLines.length > 0) {
          const firstLine = descLines[0].trim();
          // Extract medication name if not already found
          if (firstLine && firstLine.length > 0 && !medications.includes(firstLine.split(' ')[0])) {
            medications.push(firstLine.split(' ')[0]);
          }
        }
      }
    }
    
    // Check metadata if available
    if (record.metadata?.medications && Array.isArray(record.metadata.medications)) {
      record.metadata.medications.forEach(med => {
        if (!medications.includes(med)) {
          medications.push(med);
        }
      });
    }
    
    // Extract from AI-analyzed keywords
    if (record.metadata?.keywords && Array.isArray(record.metadata.keywords)) {
      record.metadata.keywords.forEach(keyword => {
        // Common medication keywords
        if (['amoxicillin', 'lisinopril', 'metformin', 'atorvastatin', 'amlodipine', 
             'metoprolol', 'omeprazole', 'losartan', 'gabapentin', 'levothyroxine',
             'antibiotics', 'painkiller'].includes(keyword.toLowerCase()) && 
            !medications.includes(keyword)) {
          medications.push(keyword);
        }
      });
    }
  });
  
  return [...new Set(medications)]; // Remove duplicates
};

// Mock data when OpenAI is unavailable
const getMockMedicationInteractions = (medications) => {
  const mockInteractions = [
    {
      medication1: "Amoxicillin",
      medication2: "Ibuprofen",
      severity: "Low",
      summary: "No significant interaction expected",
      description: "There are no known significant interactions between amoxicillin and ibuprofen.",
      effects: "No known adverse effects",
      recommendations: "Can be taken together as prescribed"
    },
    {
      medication1: "Lisinopril",
      medication2: "Ibuprofen",
      severity: "Moderate",
      summary: "May reduce blood pressure lowering effects",
      description: "NSAIDs like ibuprofen may decrease the antihypertensive effects of ACE inhibitors like lisinopril.",
      effects: "Potentially reduced blood pressure control",
      recommendations: "Monitor blood pressure when taking together; consider acetaminophen as an alternative"
    },
    {
      medication1: "Warfarin",
      medication2: "Aspirin",
      severity: "High",
      summary: "Increased bleeding risk",
      description: "Both medications affect blood clotting and may have an additive effect when taken together.",
      effects: "Significantly increased risk of bleeding complications",
      recommendations: "This combination should generally be avoided unless specifically directed by healthcare provider with careful monitoring"
    }
  ];
  
  // Filter mock interactions based on actual medications
  const relevantInteractions = mockInteractions.filter(interaction => 
    medications.some(med => 
      interaction.medication1.toLowerCase().includes(med.toLowerCase()) || 
      interaction.medication2.toLowerCase().includes(med.toLowerCase())
    )
  );
  
  return relevantInteractions.length > 0 ? relevantInteractions : 
    [{ 
      medication1: medications[0] || "Medication 1",
      medication2: medications[1] || "Medication 2",
      severity: "Unknown",
      summary: "No specific interaction information available",
      description: "Please consult your healthcare provider for information about potential interactions.",
      effects: "Unknown - needs professional assessment",
      recommendations: "Discuss with your doctor or pharmacist"
    }];
};

// Function to initialize the OpenAI client
export const initializeOpenAI = async () => {
  try {
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

// Analyze medication interactions from records
export const analyzeMedicationInteractions = async (records) => {
  try {
    // Extract medications from records
    const medications = extractMedicationsFromRecords(records);
    
    // If we have fewer than 2 medications, there can't be interactions
    if (medications.length < 2) {
      return [];
    }
    
    // Check if OpenAI is available
    if (!openai) {
      const initialized = await initializeOpenAI();
      if (!initialized) {
        // Fall back to mock data
        console.warn("OpenAI not available. Using mock medication interaction data.");
        return getMockMedicationInteractions(medications);
      }
    }
    
    // Use OpenAI to analyze medication interactions
    try {
      const prompt = `
      I need to analyze potential medication interactions between the following medications:
      ${medications.join(', ')}
      
      For each potential interaction between any two medications in this list, provide a detailed analysis with the following structure:
      {
        "medication1": "Name of first medication",
        "medication2": "Name of second medication",
        "severity": "High, Moderate, or Low",
        "summary": "A brief one-sentence summary of the interaction",
        "description": "A short paragraph explaining the mechanism of interaction",
        "effects": "Potential health effects or consequences of this interaction",
        "recommendations": "Clinical recommendations for managing this interaction"
      }
      
      Return the result as a JSON array. If there are no known interactions, return an empty array.
      `;
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 1000
      });
      
      try {
        // Parse the result
        const result = JSON.parse(response.choices[0].message.content);
        return result.interactions || [];
      } catch (parseError) {
        console.warn('Failed to parse AI response:', parseError);
        // Fall back to mock data
        return getMockMedicationInteractions(medications);
      }
    } catch (aiError) {
      console.warn('AI analysis failed:', aiError);
      // Fall back to mock data
      return getMockMedicationInteractions(medications);
    }
  } catch (error) {
    console.error('Failed to analyze medication interactions:', error);
    // Return a safe default
    return getMockMedicationInteractions(['Unknown']);
  }
};

// Get health recommendations based on user records
export const getHealthRecommendations = async (records) => {
  try {
    if (!records || records.length === 0) {
      return [{
        title: 'Start Adding Records',
        description: 'Upload your medical records to get personalized health insights.',
        priority: 'high',
        category: 'general'
      }];
    }
    
    // Check if OpenAI is available
    if (!openai) {
      const initialized = await initializeOpenAI();
      if (!initialized) {
        // Fall back to mock data
        console.warn("OpenAI not available. Using mock health recommendations.");
        return getMockHealthRecommendations(records);
      }
    }
    
    // Extract medications to look for interactions
    const medications = extractMedicationsFromRecords(records);
    
    // Prepare a summary of records for analysis
    const recordsSummary = records.map(record => ({
      type: record.type,
      title: record.title,
      date: record.date,
      description: record.description?.substring(0, 200) || '',
      provider: record.provider || 'Unknown',
      keywords: record.metadata?.keywords || []
    }));
    
    // Use OpenAI to generate health recommendations
    try {
      const prompt = `
      Based on these patient records, provide 3-5 health recommendations:
      
      ${JSON.stringify(recordsSummary, null, 2)}
      
      For each recommendation, provide:
      1. A title (short, actionable)
      2. A description (1-2 sentences explaining the recommendation)
      3. Priority (high, medium, or low)
      4. Category (preventive, condition-management, follow-up, lifestyle, medication, or general)
      
      Format the response as a JSON array of objects with these properties.
      Ensure recommendations are evidence-based and consider standard clinical guidelines.
      DO NOT include specific dates or times for appointments.
      `;
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 1000
      });
      
      try {
        // Parse the result
        const result = JSON.parse(response.choices[0].message.content);
        return result.recommendations || [];
      } catch (parseError) {
        console.warn('Failed to parse AI response:', parseError);
        // Fall back to mock data
        return getMockHealthRecommendations(records);
      }
    } catch (aiError) {
      console.warn('AI analysis failed:', aiError);
      // Fall back to mock data
      return getMockHealthRecommendations(records);
    }
  } catch (error) {
    console.error('Failed to get health recommendations:', error);
    // Return a safe default
    return getMockHealthRecommendations([]);
  }
};

// Mock health recommendations when OpenAI is unavailable
const getMockHealthRecommendations = (records) => {
  // Basic recommendations everyone should follow
  const standardRecommendations = [
    {
      title: 'Schedule Annual Physical',
      description: 'Regular check-ups help detect health issues early. Consider scheduling your annual physical examination.',
      priority: 'medium',
      category: 'preventive'
    },
    {
      title: 'Stay Active',
      description: 'Aim for at least 150 minutes of moderate exercise each week to maintain cardiovascular health.',
      priority: 'medium',
      category: 'lifestyle'
    },
    {
      title: 'Track Your Medical Records',
      description: 'Continue adding medical documents to build a comprehensive health history.',
      priority: 'medium',
      category: 'general'
    }
  ];
  
  // Check for specific record types and add relevant recommendations
  const specificRecommendations = [];
  
  // Check for prescription/medication records
  const hasMedications = records.some(r => r.type === 'prescription');
  if (hasMedications) {
    specificRecommendations.push({
      title: 'Medication Review',
      description: 'Schedule a medication review with your healthcare provider to ensure optimal therapy and minimize side effects.',
      priority: 'high',
      category: 'medication'
    });
  }
  
  // Check for lab results
  const hasLabResults = records.some(r => r.type === 'lab');
  if (hasLabResults) {
    specificRecommendations.push({
      title: 'Follow Up on Lab Results',
      description: 'Discuss your recent laboratory results with your healthcare provider to understand their implications for your health.',
      priority: 'high',
      category: 'follow-up'
    });
  }
  
  // Check for imaging records
  const hasImaging = records.some(r => r.type === 'imaging');
  if (hasImaging) {
    specificRecommendations.push({
      title: 'Imaging Follow-Up',
      description: 'Ensure you've discussed your imaging results with a specialist to understand any findings and next steps.',
      priority: 'high',
      category: 'follow-up'
    });
  }
  
  // Combine standard and specific recommendations
  return [...specificRecommendations, ...standardRecommendations].slice(0, 5);
};

// Extract text from an image
export const extractTextFromImage = async (imageUri) => {
  try {
    // Check if OpenAI is available
    if (!openai) {
      const initialized = await initializeOpenAI();
      if (!initialized) {
        console.warn("OpenAI not available. Image text extraction unavailable.");
        return "Image text extraction requires an OpenAI API key. Please add one in Settings.";
      }
    }
    
    // Load the image and convert to base64
    // For Expo, we can use FileSystem to read the file
    const base64Image = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    try {
      // Use OpenAI Vision to extract text
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "user", 
            content: [
              {
                type: "text",
                text: "Extract all text from this medical document image. Preserve the structure and formatting as much as possible. Focus especially on dates, medication names, dosages, medical terminology, and provider information."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1500
      });
      
      return response.choices[0].message.content;
    } catch (aiError) {
      console.warn('AI image extraction failed:', aiError);
      return "Failed to extract text from the image. Please try again or manually enter the information.";
    }
  } catch (error) {
    console.error('Failed to extract text from image:', error);
    return "An error occurred while processing the image. Please try again.";
  }
};

// Analyze document content
export const analyzeDocument = async (documentUri, fileType) => {
  try {
    if (!documentUri) {
      return null;
    }
    
    try {
      // In a production app, we would extract text from the document
      // For PDFs, we could use a library like pdf-parse
      // For this implementation, we'll assume we already have the text content
      
      // Simulate document text extraction
      console.log("Extracting text from document...");
      const extractedText = "Sample document text content"; // In production, this would be real content
      
      const prompt = `
      This is text extracted from a medical document. Analyze it and extract the following information:
      
      1. Document type (lab result, prescription, visit summary, etc.)
      2. Document title or name
      3. Date of the document
      4. Healthcare provider or facility name
      5. Summary of key medical information
      6. Any medications mentioned
      7. Any diagnostic codes (ICD, CPT, etc.)
      8. Any follow-up actions or recommendations
      
      Format the response as a JSON object with these fields:
      type, title, date, provider, description, medications (array), 
      diagnosticCodes (array), and followUpActions (array).
      
      Document text:
      ${extractedText}
      `;
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 1000
      });
      
      // Parse the result
      const result = JSON.parse(response.choices[0].message.content);
      return {
        title: result.title || "Analyzed Medical Document",
        date: result.date || new Date().toISOString().split('T')[0],
        provider: result.provider || "Unknown Provider",
        description: result.description || "No description available",
        type: result.type?.toLowerCase() || "other",
        metadata: {
          medications: result.medications || [],
          diagnosticCodes: result.diagnosticCodes || [],
          followUpActions: result.followUpActions || []
        }
      };
    } catch (error) {
      console.warn('Document analysis failed:', error);
      
      // Return a basic record with minimal information
      return {
        title: fileType === 'image' ? "Uploaded Image" : "Uploaded Document",
        date: new Date().toISOString().split('T')[0],
        provider: "Unknown Provider",
        description: "Medical document uploaded by user",
        type: "other",
        metadata: {
          aiAnalyzed: false
        }
      };
    }
  } catch (error) {
    console.error('Failed to analyze document:', error);
    throw error;
  }
};

// Process uploaded record with AI
export const processUploadedRecord = async (recordData) => {
  try {
    // Check if OpenAI is available
    if (!openai) {
      const initialized = await initializeOpenAI();
      if (!initialized) {
        console.warn("OpenAI not available. Using basic record processing.");
        // Return the record as is, with minimal metadata
        return {
          ...recordData,
          metadata: {
            ...recordData.metadata,
            aiAnalyzed: false,
            processingNote: "AI analysis unavailable. Add an OpenAI API key in Settings for enhanced features."
          }
        };
      }
    }
    
    // Prepare record data for analysis
    const recordText = `
    Title: ${recordData.title || 'Unknown Title'}
    Type: ${recordData.type || 'Unknown Type'}
    Date: ${recordData.date || 'Unknown Date'}
    Provider: ${recordData.provider || 'Unknown Provider'}
    Description: ${recordData.description || 'No description available'}
    `;
    
    try {
      // Use OpenAI to analyze the record and extract key information
      const prompt = `
      Analyze this medical record and extract the following information:
      
      1. A list of relevant medical keywords (maximum 8)
      2. A short summary (1-2 sentences)
      3. The primary medical condition or purpose of this record
      4. Any medications mentioned
      5. Any test results or values mentioned
      6. Any follow-up recommendations
      
      Format the response as a JSON object with these properties: keywords (array), summary (string), 
      condition (string), medications (array), testResults (array), and followUp (string).
      
      Medical Record:
      ${recordText}
      `;
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 800
      });
      
      // Parse the result
      const result = JSON.parse(response.choices[0].message.content);
      
      // Enhance the record with AI-generated metadata
      return {
        ...recordData,
        metadata: {
          ...recordData.metadata,
          aiAnalyzed: true,
          keywords: result.keywords || [],
          summary: result.summary || '',
          condition: result.condition || '',
          medications: result.medications || [],
          testResults: result.testResults || [],
          followUp: result.followUp || '',
          processingDate: new Date().toISOString()
        }
      };
    } catch (aiError) {
      console.warn('AI processing failed:', aiError);
      // Return record with minimal metadata
      return {
        ...recordData,
        metadata: {
          ...recordData.metadata,
          aiAnalyzed: false,
          processingNote: "AI analysis failed. Basic record saved."
        }
      };
    }
  } catch (error) {
    console.error('Failed to process record:', error);
    // Return original record to ensure no data is lost
    return recordData;
  }
};

// Extract keywords from text
export const extractKeywordsFromText = async (text) => {
  try {
    if (!text || text.trim().length === 0) {
      return [];
    }
    
    // Check if OpenAI is available
    if (!openai) {
      const initialized = await initializeOpenAI();
      if (!initialized) {
        console.warn("OpenAI not available. Keyword extraction unavailable.");
        return [];
      }
    }
    
    try {
      // Use OpenAI to extract keywords
      const prompt = `
      Extract the most relevant medical keywords from this text. 
      Focus on medical conditions, medications, procedures, anatomical terms, and healthcare concepts.
      Return only a JSON array of strings with no explanation.
      
      Text: ${text}
      `;
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 200
      });
      
      // Parse the result
      const result = JSON.parse(response.choices[0].message.content);
      return result.keywords || [];
    } catch (aiError) {
      console.warn('AI keyword extraction failed:', aiError);
      return [];
    }
  } catch (error) {
    console.error('Failed to extract keywords:', error);
    return [];
  }
};

// Health assistant function to answer questions about user's health records
export const askHealthAssistant = async (question, userRecords, userId) => {
  try {
    if (!question || question.trim().length === 0) {
      return "Please ask a specific question about your health records.";
    }
    
    if (!userRecords || userRecords.length === 0) {
      return "I don't see any health records in your account yet. Please add some medical records so I can provide more personalized assistance.";
    }
    
    // Check if OpenAI is available
    if (!openai) {
      const initialized = await initializeOpenAI();
      if (!initialized) {
        console.warn("OpenAI not available. Using basic health assistant responses.");
        return getBasicHealthAssistantResponse(question, userRecords);
      }
    }
    
    try {
      // Prepare a summary of user records
      const recordsSummary = userRecords.map(record => ({
        type: record.type,
        title: record.title,
        date: record.date,
        description: record.description?.substring(0, 150) || '',
        provider: record.provider || 'Unknown',
        keywords: record.metadata?.keywords || [],
        medications: record.metadata?.medications || []
      }));
      
      // Use OpenAI to generate a response
      const prompt = `
      You are a healthcare assistant helping a patient understand their medical records. 
      Answer the patient's question based ONLY on the information in their records.
      
      IMPORTANT GUIDELINES:
      1. If the answer is not in their records, acknowledge that and suggest they ask their healthcare provider.
      2. Do not make specific medical recommendations or diagnoses.
      3. Maintain a professional, empathetic tone.
      4. Explain medical terminology in simple terms.
      5. Keep responses concise (3-5 sentences).
      6. NEVER include specific dates for future appointments.
      
      Patient records:
      ${JSON.stringify(recordsSummary, null, 2)}
      
      Patient question: ${question}
      `;
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "system", content: "You are a HIPAA-compliant health assistant helping patients understand their medical records. You are not a doctor and cannot diagnose or treat conditions." },
                  { role: "user", content: prompt }],
        max_tokens: 500
      });
      
      return response.choices[0].message.content;
    } catch (aiError) {
      console.warn('AI health assistant failed:', aiError);
      return getBasicHealthAssistantResponse(question, userRecords);
    }
  } catch (error) {
    console.error('Health assistant error:', error);
    return "I'm sorry, I encountered an error while processing your question. Please try again later.";
  }
};

// Basic health assistant responses without AI
const getBasicHealthAssistantResponse = (question, userRecords) => {
  const lowerQuestion = question.toLowerCase();
  
  // Check for medication questions
  if (lowerQuestion.includes('medication') || lowerQuestion.includes('medicine') || 
      lowerQuestion.includes('drug') || lowerQuestion.includes('prescription')) {
    const medications = extractMedicationsFromRecords(userRecords);
    
    if (medications.length > 0) {
      return `Based on your records, you have the following medications: ${medications.join(', ')}. For specific questions about your medications, please consult with your healthcare provider or pharmacist.`;
    } else {
      return "I don't see any specific medications in your records. If you're taking medications, please upload your prescription records or consult with your healthcare provider.";
    }
  }
  
  // Check for condition-specific questions
  if (lowerQuestion.includes('condition') || lowerQuestion.includes('diagnosis') || 
      lowerQuestion.includes('what do i have') || lowerQuestion.includes('what is wrong')) {
    const conditions = userRecords
      .filter(r => r.metadata?.condition)
      .map(r => r.metadata.condition);
    
    if (conditions.length > 0) {
      const uniqueConditions = [...new Set(conditions)];
      return `Based on your records, the following conditions are mentioned: ${uniqueConditions.join(', ')}. For a complete understanding of your health conditions, please consult with your healthcare provider.`;
    } else {
      return "I don't see any specific conditions mentioned in your records. For a proper diagnosis or understanding of your health status, please consult with your healthcare provider.";
    }
  }
  
  // Check for lab result questions
  if (lowerQuestion.includes('lab') || lowerQuestion.includes('test result') || 
      lowerQuestion.includes('blood test') || lowerQuestion.includes('blood work')) {
    const labResults = userRecords.filter(r => r.type === 'lab');
    
    if (labResults.length > 0) {
      return "I've reviewed your lab records, and while I don't see explicit abnormal flags in the data available to me, I recommend discussing your lab results with your healthcare provider for a professional interpretation. They can provide specific guidance based on your complete medical history.";
    } else {
      return "I don't see any lab records in your history. To better track your lab results, please upload them when available. This will help provide more personalized health insights.";
    }
  }
  
  // Check for vaccination questions
  if (lowerQuestion.includes('vaccin') || lowerQuestion.includes('immuniz')) {
    const vaccinations = userRecords.filter(r => r.type === 'immunization');
    
    if (vaccinations.length > 0) {
      // Sort by date, newest first
      vaccinations.sort((a, b) => new Date(b.date) - new Date(a.date));
      const latestVaccination = vaccinations[0];
      return `Your most recent vaccination was ${latestVaccination.title} on ${new Date(latestVaccination.date).toLocaleDateString()}. For a complete vaccination assessment, I recommend consulting with your healthcare provider who can review your immunization history and recommend any vaccines you may be due for based on your age, health condition, and previous immunizations.`;
    } else {
      return "I don't see any vaccination records in your history. It's important to stay up-to-date with recommended vaccinations. Consider discussing this with your healthcare provider at your next visit.";
    }
  }
  
  // Default response if no specific pattern is matched
  return "Thank you for your question. As your health assistant, I'm here to help provide insights based on your medical records, but I should not replace professional medical advice. For the most accurate guidance, please consult with your healthcare provider. Is there something specific in your health records you'd like me to help you understand?";
};
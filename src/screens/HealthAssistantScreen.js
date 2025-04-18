import React, { useState, useContext, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../services/auth';
import { ThemeContext } from '../theme/themeContext';
import { askHealthAssistant } from '../services/ai';
import { getAllRecords } from '../services/storage';
import AccountSelector from '../components/AccountSelector';
import colors from '../theme/colors';
import darkColors from '../theme/darkColors';
import typography from '../theme/typography';
import spacing from '../theme/spacing';

const Message = ({ message, isUser, theme }) => (
  <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.aiMessage]}>
    {!isUser && (
      <View style={[styles.aiIconContainer, { backgroundColor: theme.accent }]}>
        <Ionicons name="medkit" size={20} color={theme.white} />
      </View>
    )}
    <View
      style={[
        styles.messageBubble,
        isUser
          ? [styles.userBubble, { backgroundColor: theme.primary }]
          : [styles.aiBubble, { backgroundColor: theme.white }],
      ]}
    >
      <Text
        style={[
          styles.messageText,
          isUser ? { color: theme.white } : { color: theme.text },
        ]}
      >
        {message.text}
      </Text>
    </View>
  </View>
);

const HealthAssistantScreen = () => {
  const { state } = useContext(AuthContext);
  const themeContext = useContext(ThemeContext);

  if (!themeContext) {
    console.warn('ThemeContext is unavailable — using fallback light theme');
  }

  const isDarkMode = themeContext?.isDarkMode ?? false;
  const theme = isDarkMode ? darkColors : colors;

  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);
  const [userRecords, setUserRecords] = useState([]);

  useEffect(() => {
    if (state.user) {
      setSelectedAccount(state.user.id);
      if (state.user.firstName) {
        const mockAccounts = [
          { id: state.user.id, name: `${state.user.firstName} ${state.user.lastName}`, isPrimary: true },
          { id: 'family1', name: 'Jane Smith', relationship: 'Spouse' },
          { id: 'family2', name: 'Alex Smith', relationship: 'Child' }
        ];
        setAccounts(mockAccounts);
      }

      if (messages.length === 0) {
        setMessages([
          {
            id: 'welcome',
            text: "Hello! I'm your Health Assistant. I can answer questions about your health records and provide general medical information. How can I help you today?",
            isUser: false,
            timestamp: new Date(),
          }
        ]);
      }
    }
  }, [state.user]);

  useEffect(() => {
    if (selectedAccount) {
      loadUserRecords();
    }
  }, [selectedAccount]);

  const loadUserRecords = async () => {
    try {
      const records = await getAllRecords(selectedAccount);
      setUserRecords(records);
    } catch (error) {
      console.error('Failed to load user records:', error);
    }
  };

  const handleAccountChange = (accountId) => {
    setSelectedAccount(accountId);
    setMessages([
      {
        id: 'welcome',
        text: "Hello! I'm your Health Assistant. I can answer questions about your health records and provide general medical information. How can I help you today?",
        isUser: false,
        timestamp: new Date(),
      }
    ]);
  };

  const scrollToEnd = () => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await askHealthAssistant(inputText, userRecords, selectedAccount);
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error('Health assistant error:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSuggestion = (text) => (
    <TouchableOpacity
      style={[styles.suggestionButton, { backgroundColor: theme.white, borderColor: theme.lightGray }]}
      onPress={() => {
        setInputText(text);
        handleSendMessage();
      }}
    >
      <Text style={[styles.suggestionText, { color: theme.primary }]}>{text}</Text>
    </TouchableOpacity>
  );

  const renderSuggestions = () => (
    <View style={[styles.suggestionsContainer, { backgroundColor: theme.lightBackground }]}>
      <Text style={[styles.suggestionsTitle, { color: theme.text }]}>Suggested Questions:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsScroll}>
        {renderSuggestion("What medications am I currently taking?")}
        {renderSuggestion("When was my last physical exam?")}
        {renderSuggestion("Are there any abnormal results in my recent lab work?")}
        {renderSuggestion("What vaccinations am I due for?")}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.white, borderBottomColor: theme.lightGray }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Health Assistant</Text>
      </View>

      <AccountSelector
        accounts={accounts}
        selectedAccount={selectedAccount}
        onSelectAccount={handleAccountChange}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Message message={item} isUser={item.isUser} theme={theme} />}
          contentContainerStyle={styles.messagesList}
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic"
          onContentSizeChange={scrollToEnd}
          onLayout={scrollToEnd}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
                Ask a question to get started
              </Text>
            </View>
          }
        />

        {messages.length === 1 && renderSuggestions()}

        <View style={[styles.inputContainer, { backgroundColor: theme.white, borderTopColor: theme.lightGray }]}>
          <TextInput
            style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask a health question..."
            placeholderTextColor={theme.secondaryText}
            multiline
            maxHeight={100}
            returnKeyType="send"
            onSubmitEditing={handleSendMessage}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: inputText.trim() ? theme.primary : theme.lightGray },
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.white} size="small" />
            ) : (
              <Ionicons name="send" size={20} color={theme.white} />
            )}
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.disclaimer,
            { backgroundColor: theme.lightBackground, borderTopColor: theme.lightGray },
          ]}
        >
          <Ionicons name="information-circle-outline" size={16} color={theme.secondaryText} />
          <Text style={[styles.disclaimerText, { color: theme.secondaryText }]}>
            This assistant provides general information and is not a substitute for professional medical advice.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: spacing.medium,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h2,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  messagesList: {
    padding: spacing.medium,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: spacing.medium,
    maxWidth: '80%',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  aiMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 20,
    paddingVertical: spacing.medium,
    paddingHorizontal: spacing.medium,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  messageText: {
    ...typography.body,
  },
  aiIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.small,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.medium,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    ...typography.body,
    borderRadius: 20,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.small,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.extraLarge,
  },
  emptyText: {
    ...typography.body,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.small,
    borderTopWidth: 1,
  },
  disclaimerText: {
    ...typography.small,
    flex: 1,
    marginLeft: spacing.extraSmall,
  },
  suggestionsContainer: {
    padding: spacing.medium,
  },
  suggestionsTitle: {
    ...typography.label,
    marginBottom: spacing.small,
  },
  suggestionsScroll: {
    flexDirection: 'row',
  },
  suggestionButton: {
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    borderRadius: 20,
    marginRight: spacing.small,
    borderWidth: 1,
  },
  suggestionText: {
    ...typography.small,
  },
});

export default HealthAssistantScreen;

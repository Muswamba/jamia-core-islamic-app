import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { sendChatMessage } from '../modules/ai/api';
import { useTheme } from '../theme/ThemeProvider';
import { useFontScale } from '../theme/FontScaleProvider';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function AIChat() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { typography } = useFontScale();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await sendChatMessage(userMessage.text);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.blocked
          ? response.message || 'Request blocked'
          : response.success
          ? response.data?.response || 'No response'
          : response.message || 'Error occurred',
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error in chat:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: t('ai.error'),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 96 : 0}
    >
      <View style={styles.content}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={[
            styles.messagesContent,
            { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.disclaimerBanner,
              { backgroundColor: `${colors.primaryLight}22`, borderColor: colors.primaryLight },
            ]}
          >
            <Text style={[styles.disclaimerText, { color: colors.primaryDark, fontSize: typography.caption }]}>
              {t('ai.disclaimer')}
            </Text>
          </View>

          {messages.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateText, { color: colors.textSecondary, fontSize: typography.body }]}>
                {t('ai.askQuestion')}
              </Text>
            </View>
          )}

          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.isUser
                  ? [styles.userMessage, { backgroundColor: colors.primary }]
                  : [styles.aiMessage, { backgroundColor: colors.card, borderColor: colors.border }],
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  { fontSize: typography.body },
                  message.isUser ? { color: '#fff' } : { color: colors.text },
                ]}
              >
                {message.text}
              </Text>
              <Text style={[styles.timestamp, { color: colors.textSecondary, fontSize: typography.caption }]}>
                {message.timestamp.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          ))}

          {loading && (
            <View
              style={[
                styles.messageBubble,
                styles.aiMessage,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          )}
        </ScrollView>

        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="mic" size={24} color={colors.primary} />
          </TouchableOpacity>
          <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              style={[
                styles.inputField,
                {
                  color: colors.text,
                  fontSize: typography.body,
                },
              ]}
              value={inputText}
              onChangeText={setInputText}
              placeholder={t('ai.askQuestion')}
              placeholderTextColor={colors.textSecondary}
              multiline
              maxLength={500}
              editable={!loading}
            />
          </View>
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: inputText.trim() && !loading ? colors.primary : colors.border,
              },
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || loading}
            accessibilityRole="button"
            accessibilityLabel={t('ai.send')}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() && !loading ? '#fff' : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  disclaimerBanner: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 12,
  },
  disclaimerText: {
    textAlign: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    textAlign: 'center',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  messageText: {
    lineHeight: 22,
  },
  timestamp: {
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    padding: 12,
    alignItems: 'flex-end',
  },
  iconButton: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  inputField: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    maxHeight: 120,
  },
  inputWrapper: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 24,
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  sendButton: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

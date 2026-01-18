import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Stack } from 'expo-router';
import { API_V1_BASE_URL } from '../src/config/api';
import { Screen } from '../src/components';
import { useTheme } from '../src/theme/ThemeProvider';
import { useFontScale } from '../src/theme/FontScaleProvider';

interface Translation {
  id: string;
  name: string;
  translator: string;
  languageCode: string;
  attribution?: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    translations: Translation[];
  };
}

export default function CreditsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { typography } = useFontScale();
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTranslations();
  }, []);

  const fetchTranslations = async () => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${API_V1_BASE_URL}/quran/translations/catalog`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      if (data.success && data.data?.translations) {
        setTranslations(data.data.translations);
      } else {
        setError(t('common.error'));
      }
    } catch (err: any) {
      console.error('Error fetching translations:', err);

      if (err?.name === 'AbortError') {
        setError(t('common.timeout'));
      } else {
        setError(
          err instanceof Error
            ? err.message
            : t('common.error')
        );
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTranslations();
  };

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch((err) => {
      console.error('Error opening link:', err);
    });
  };

  const renderTranslationItem = (translation: Translation) => (
    <View
      key={translation.id}
      style={[
        styles.translationItem,
        {
          backgroundColor: colors.surface,
          borderLeftColor: colors.primaryLight,
        },
      ]}
    >
      <View style={styles.translationHeader}>
        <Text style={[styles.translationName, { color: colors.text }]}>{translation.name}</Text>
        {translation.languageCode && (
          <Text style={[styles.languageCode, { backgroundColor: colors.primaryLight, color: colors.text }]}>
            {translation.languageCode.toUpperCase()}
          </Text>
        )}
      </View>
      {translation.translator && (
        <Text style={[styles.translatorText, { color: colors.textSecondary }]}>
          {t('quran.translation')}: {translation.translator}
        </Text>
      )}
      {translation.attribution && (
        <Text style={[styles.attributionText, { color: colors.textSecondary }]}>
          {translation.attribution}
        </Text>
      )}
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: t('credits.title'),
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
        }}
      />
      <Screen
        edges={['top', 'bottom']}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <ScrollView
          style={[styles.scrollView, { backgroundColor: colors.background }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {/* Header Section */}
          <View style={[styles.headerSection, { backgroundColor: colors.primary }]}>
            <Text style={styles.headerTitle}>{t('credits.title')}</Text>
            <Text style={styles.headerSubtitle}>
              Thank you to all contributors and sources
            </Text>
          </View>

          {/* Quran Arabic Text Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('credits.quranText')}
            </Text>
            <View
              style={[
                styles.contentBox,
                { backgroundColor: colors.surface, borderLeftColor: colors.primaryLight },
              ]}
            >
              <Text style={[styles.contentText, { color: colors.text, fontSize: typography.body }]}>
                {t('credits.quranSource')}
              </Text>
              <Text style={[styles.contentDescription, { color: colors.textSecondary }]}>
                The text is unmodified from the original source
              </Text>
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => handleOpenLink('https://tanzil.net')}
              >
                <Text style={styles.linkButtonText}>Visit Tanzil.net</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Translations Section */}
          <View
            style={[
              styles.section,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={styles.sectionTitle}>
              {t('credits.translations')}
            </Text>

            {loading && !refreshing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  {t('common.loading')}
                </Text>
              </View>
            ) : error ? (
              <View
                style={[
                  styles.errorContainer,
                  { backgroundColor: colors.surface, borderLeftColor: colors.error },
                ]}
              >
                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                <TouchableOpacity
                  style={[styles.retryButton, { backgroundColor: colors.error }]}
                  onPress={fetchTranslations}
                >
                  <Ionicons name="refresh" size={16} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
                </TouchableOpacity>
              </View>
            ) : translations.length > 0 ? (
              <View style={styles.translationsList}>
                {translations.map(renderTranslationItem)}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No translations available
                </Text>
              </View>
            )}
          </View>

          {/* AI Assistant Section */}
          <View
            style={[
              styles.section,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={styles.sectionTitle}>{t('ai.aiHelper')}</Text>
            <View
              style={[
                styles.contentBox,
                { backgroundColor: colors.surface, borderLeftColor: colors.primaryLight },
              ]}
            >
              <View style={styles.disclaimerItem}>
                <Text style={[styles.disclaimerDot, { color: colors.primary }]}>•</Text>
                <Text style={[styles.disclaimerText, { color: colors.text }]}>
                  {t('ai.disclaimer')}
                </Text>
              </View>
              <View style={styles.disclaimerItem}>
                <Text style={[styles.disclaimerDot, { color: colors.primary }]}>•</Text>
                <Text style={[styles.disclaimerText, { color: colors.text }]}>
                  Powered by OpenAI GPT-3.5-turbo
                </Text>
              </View>
              <View
                style={[
                  styles.disclaimerBox,
                  { backgroundColor: colors.surface, borderLeftColor: colors.primary },
                ]}
              >
                <Text style={[styles.disclaimerWarning, { color: colors.primaryDark }]}>
                  Educational purposes only. Not a substitute for qualified Islamic scholars.
                </Text>
              </View>
            </View>
          </View>

          {/* Disclaimer Section */}
          <View
            style={[
              styles.section,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={styles.sectionTitle}>{t('settings.disclaimer')}</Text>
            <View
              style={[
                styles.disclaimerBox,
                { backgroundColor: colors.surface, borderLeftColor: colors.primary },
              ]}
            >
              <Text style={[styles.disclaimerContent, { color: colors.textSecondary }]}>
                {t('credits.disclaimerText')}
              </Text>
            </View>
          </View>

          {/* Footer Spacer */}
          <View style={styles.spacer} />
        </ScrollView>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  headerSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '400',
  },
  section: {
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contentBox: {
    borderLeftWidth: 4,
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  contentText: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 22,
  },
  contentDescription: {
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 20,
  },
  linkButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    borderLeftWidth: 4,
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  translationsList: {
    gap: 12,
  },
  translationItem: {
    borderLeftWidth: 4,
    padding: 14,
    borderRadius: 8,
    marginBottom: 8,
  },
  translationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  translationName: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  languageCode: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  translatorText: {
    fontSize: 13,
    marginBottom: 4,
    lineHeight: 20,
  },
  attributionText: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  disclaimerItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  disclaimerDot: {
    fontSize: 16,
    marginRight: 10,
    marginTop: -2,
  },
  disclaimerText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 22,
  },
  disclaimerBox: {
    borderLeftWidth: 4,
    padding: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  disclaimerWarning: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
  },
  disclaimerContent: {
    fontSize: 13,
    lineHeight: 22,
  },
  emptyContainer: {
    paddingVertical: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  spacer: {
    height: 24,
  },
});



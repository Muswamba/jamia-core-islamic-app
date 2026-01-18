import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  Pressable,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { QURAN_METADATA, getArabicText } from '../../src/modules/quran/data';
import { fetchTranslation } from '../../src/modules/quran/api';
import { storage, STORAGE_KEYS } from '../../src/storage';
import { Bookmark, LastRead, Surah } from '../../src/modules/quran/types';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useFontScale } from '../../src/theme/FontScaleProvider';
import { Screen, ThemedCard, ThemedText, HeaderActionButton } from '../../src/components';

type View_Type = 'surah-list' | 'ayah-list';

export default function QuranScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const { typography } = useFontScale();
  const router = useRouter();
  const [viewType, setViewType] = useState<View_Type>('surah-list');
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [lastRead, setLastRead] = useState<LastRead | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchOverlayVisible, setSearchOverlayVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadBookmarksAndLastRead();
  }, []);

  const loadBookmarksAndLastRead = async () => {
    try {
      const storedBookmarks = await storage.get<Bookmark[]>(STORAGE_KEYS.QURAN_BOOKMARKS);
      const storedLastRead = await storage.get<LastRead>(STORAGE_KEYS.QURAN_LAST_READ);

      if (storedBookmarks) {
        setBookmarks(storedBookmarks);
      }

      if (storedLastRead) {
        setLastRead(storedLastRead);
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  const handleSelectSurah = async (surah: Surah) => {
    setSelectedSurah(surah);
    setLoading(true);
    setError(null);
    setViewType('ayah-list');

    try {
      const translationLang = i18n.language || 'en';
      const trans = await fetchTranslation(translationLang, surah.number);
      setTranslations(trans);
    } catch (error) {
      console.error('Error loading surah:', error);
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (selectedSurah) {
      handleSelectSurah(selectedSurah);
    }
  };

  const handleBack = () => {
    setViewType('surah-list');
    setSelectedSurah(null);
    setTranslations({});
    setError(null);
  };

  const openSearchOverlay = () => {
    setSearchOverlayVisible(true);
  };

  const closeSearchOverlay = () => {
    setSearchTerm('');
    setSearchOverlayVisible(false);
  };

  const handleSearchSubmit = () => {
    const query = searchTerm.trim();
    if (!query) return;
    const prompt = `Find in Quran: ${query}. Return surah:ayah references.`;
    closeSearchOverlay();
    router.push(`/ai-helper?prompt=${encodeURIComponent(prompt)}`);
  };

  const toggleBookmark = async (surahNumber: number, ayahNumber: number) => {
    const existing = bookmarks.find(
      (b) => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber
    );

    let newBookmarks: Bookmark[];

    if (existing) {
      newBookmarks = bookmarks.filter(
        (b) => !(b.surahNumber === surahNumber && b.ayahNumber === ayahNumber)
      );
    } else {
      newBookmarks = [
        ...bookmarks,
        { surahNumber, ayahNumber, timestamp: Date.now() },
      ];
    }

    setBookmarks(newBookmarks);
    await storage.set(STORAGE_KEYS.QURAN_BOOKMARKS, newBookmarks);
  };

  const saveLastRead = async (surahNumber: number, ayahNumber: number) => {
    const newLastRead: LastRead = {
      surahNumber,
      ayahNumber,
      timestamp: Date.now(),
    };
    setLastRead(newLastRead);
    await storage.set(STORAGE_KEYS.QURAN_LAST_READ, newLastRead);
  };

  const isBookmarked = (surahNumber: number, ayahNumber: number): boolean => {
    return bookmarks.some(
      (b) => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber
    );
  };

  const filteredSurahs = QURAN_METADATA;

  const renderSurahList = () => (
    <Screen edges={['top']}>

      {lastRead && (
        <TouchableOpacity
          onPress={() => {
            const surah = QURAN_METADATA.find((s) => s.number === lastRead.surahNumber);
            if (surah) handleSelectSurah(surah);
          }}
          style={{ marginHorizontal: 16, marginVertical: 8 }}
        >
          <ThemedCard style={{ backgroundColor: colors.primary }}>
            <ThemedText variant="caption" style={{ color: '#fff', opacity: 0.9, marginBottom: 4 }}>
              {t('quran.lastRead')}
            </ThemedText>
            <ThemedText variant="body" style={{ color: '#fff', fontWeight: '600' }}>
              {QURAN_METADATA.find((s) => s.number === lastRead.surahNumber)?.englishName}{' '}
              {lastRead.ayahNumber}
            </ThemedText>
          </ThemedCard>
        </TouchableOpacity>
      )}

      <FlatList
        data={filteredSurahs}
        keyExtractor={(item) => item.number.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => handleSelectSurah(item)}
          >
            <ThemedCard style={styles.surahItem}>
              <View style={[styles.surahNumber, { backgroundColor: colors.primary + '20' }]}>
                <ThemedText variant="body" color="primary" style={{ fontWeight: '600' }}>
                  {item.number}
                </ThemedText>
              </View>
              <View style={styles.surahInfo}>
                <ThemedText variant="body" style={{ fontWeight: '600', marginBottom: 4 }}>
                  {item.englishName}
                </ThemedText>
                <ThemedText variant="bodyLarge" color="primary" style={{ marginBottom: 4 }}>
                  {item.name}
                </ThemedText>
                <ThemedText variant="caption" color="textSecondary">
                  {item.numberOfAyahs} {t('quran.ayah')} - {item.revelationType}
                </ThemedText>
              </View>
            </ThemedCard>
          </TouchableOpacity>
        )}
      />

      <Modal
        visible={searchOverlayVisible}
        transparent
        animationType="fade"
      >
        <Pressable style={styles.overlay} onPress={closeSearchOverlay}>
          <Pressable
            style={[styles.searchPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.searchHeader}>
              <ThemedText variant="bodySmall" style={{ fontWeight: '600' }}>
                {t('quran.search')}
              </ThemedText>
              <TouchableOpacity onPress={closeSearchOverlay}>
                <Ionicons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
            <View style={[styles.searchRow, { borderColor: colors.border }]}>
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder={t('quran.search')}
                placeholderTextColor={colors.textSecondary}
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
              <TouchableOpacity onPress={handleSearchSubmit} disabled={!searchTerm.trim()}>
                <Ionicons
                  name="search"
                  size={24}
                  color={searchTerm.trim() ? colors.primary : colors.border}
                />
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );

  const renderAyahList = () => {
    if (!selectedSurah) return null;

    if (loading) {
      return (
        <Screen edges={['top', 'bottom']}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <ThemedText variant="body" color="textSecondary" style={{ marginTop: 16 }}>
              {t('common.loading')}
            </ThemedText>
          </View>
        </Screen>
      );
    }

    if (error) {
      return (
        <Screen edges={['top', 'bottom']}>
          <View style={styles.errorContainer}>
            <ThemedText variant="h4" color="error" style={{ marginBottom: 8 }}>
              {t('common.error')}
            </ThemedText>
            <ThemedText variant="body" color="textSecondary" style={{ textAlign: 'center', marginBottom: 24, lineHeight: 24 }}>
              {error}
            </ThemedText>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              onPress={handleRetry}
            >
              <ThemedText variant="body" style={{ color: '#fff', fontWeight: '600' }}>
                {t('common.retry')}
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.iconAction,
                { marginTop: 12, borderColor: colors.border, backgroundColor: colors.surface },
              ]}
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel={t('common.back')}
            >
              <Ionicons name="chevron-back" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </Screen>
      );
    }

    const ayahs = Array.from({ length: selectedSurah.numberOfAyahs }, (_, i) => i + 1);

    return (
      <Screen edges={['top', 'bottom']}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            onPress={handleBack}
            style={[styles.backButton, { marginRight: 12 }]}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
          >
            <Ionicons name="chevron-back" size={20} color={colors.primary} />
          </TouchableOpacity>
          <ThemedText variant="h4" style={{ fontWeight: '600' }}>{selectedSurah.englishName}</ThemedText>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 16 }}
        >
          {ayahs.map((ayahNumber) => {
            const arabicText = getArabicText(selectedSurah.number, ayahNumber);
            const translationKey = `${selectedSurah.number}:${ayahNumber}`;
            const translation = translations[translationKey];

            return (
              <View key={ayahNumber} style={{ marginHorizontal: 16, marginVertical: 8 }}>
                <ThemedCard>
                  <View style={styles.ayahHeader}>
                    <ThemedText variant="bodySmall" color="primary" style={{ fontWeight: '600' }}>
                      {ayahNumber}
                    </ThemedText>
                    <TouchableOpacity
                      onPress={() => toggleBookmark(selectedSurah.number, ayahNumber)}
                    >
                      <Ionicons
                        name={isBookmarked(selectedSurah.number, ayahNumber) ? 'bookmark' : 'bookmark-outline'}
                        size={24}
                        color="#FFB300"
                      />
                    </TouchableOpacity>
                  </View>
                  <ThemedText
                    variant="h3"
                    style={{ textAlign: 'right', lineHeight: 40, marginBottom: 12 }}
                  >
                    {arabicText}
                  </ThemedText>
                  {translation && (
                    <ThemedText variant="body" color="textSecondary" style={{ lineHeight: 24 }}>
                      {translation}
                    </ThemedText>
                  )}
                </ThemedCard>
              </View>
            );
          })}
        </ScrollView>
      </Screen>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <HeaderActionButton
              name="search"
              onPress={openSearchOverlay}
              color={colors.primary}
              accessibilityLabel={t('quran.search')}
              style={styles.iconButton}
            />
          ),
        }}
      />
      {viewType === 'surah-list' ? renderSurahList() : renderAyahList()}
    </>
  );
}

const styles = StyleSheet.create({
  surahItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  surahNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  surahInfo: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 16,
  },
  ayahHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  iconAction: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lastReadCard: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  listItem: {
    marginBottom: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  searchPanel: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
  },
  iconButton: {
    marginRight: 12,
  },
});


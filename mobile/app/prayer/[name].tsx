import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useFontScale } from '../../src/theme/FontScaleProvider';
import { PRAYER_DETAILS } from '../../src/modules/prayerTimes/prayerDetails';
import { Screen, ThemedCard, ThemedText } from '../../src/components';

export default function PrayerDetailScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { typography } = useFontScale();
  const router = useRouter();

  const prayerDetail = name ? PRAYER_DETAILS[name.toLowerCase()] : null;

  if (!prayerDetail) {
    return (
      <Screen edges={['top', 'bottom']} style={styles.container}>
        <View style={styles.notFound}>
          <Text style={{ color: colors.text }}>Prayer not found</Text>
        </View>
      </Screen>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: t(`prayers.${name.toLowerCase()}`),
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#fff',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/settings')}
              style={{ marginRight: 16 }}
            >
              <Ionicons name="settings-outline" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
      <Screen edges={['top', 'bottom']} style={styles.container}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          <ThemedCard style={styles.card}>
            <ThemedText variant="h3" style={styles.title}>
              {t(`prayers.${name.toLowerCase()}`)}
            </ThemedText>
          </ThemedCard>

          <ThemedCard style={styles.card}>
            <ThemedText variant="h4" color="primary" style={styles.sectionTitle}>
              Rak'ah Guide
            </ThemedText>

            <View style={styles.rakahRow}>
              <ThemedText variant="body">Fard (Obligatory):</ThemedText>
              <ThemedText variant="bodyLarge" color="primary" style={styles.rakahNumber}>
                {prayerDetail.rakah.fard} rak'ah
              </ThemedText>
            </View>

            {prayerDetail.rakah.sunnah?.before && (
              <View style={styles.rakahRow}>
                <ThemedText variant="body">Sunnah (Before):</ThemedText>
                <ThemedText variant="body" color="textSecondary" style={styles.rakahNumber}>
                  {prayerDetail.rakah.sunnah.before} rak'ah
                </ThemedText>
              </View>
            )}

            {prayerDetail.rakah.sunnah?.after && (
              <View style={styles.rakahRow}>
                <ThemedText variant="body">Sunnah (After):</ThemedText>
                <ThemedText variant="body" color="textSecondary" style={styles.rakahNumber}>
                  {prayerDetail.rakah.sunnah.after} rak'ah
                </ThemedText>
              </View>
            )}
          </ThemedCard>

          <ThemedCard style={styles.card}>
            <ThemedText variant="h4" color="primary" style={styles.sectionTitle}>
              Tips & Information
            </ThemedText>
            {prayerDetail.tips.map((tip, index) => (
              <View key={index} style={styles.tipRow}>
                <ThemedText variant="body" style={{ marginRight: 8 }}>-</ThemedText>
                <ThemedText variant="body" style={{ flex: 1 }}>
                  {tip}
                </ThemedText>
              </View>
            ))}
          </ThemedCard>

          <TouchableOpacity
            style={[styles.aiButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              const prayerName = prayerDetail.name;
              const prompt = `Teach me about ${prayerName}: rak'ah, sunnah, virtues, and references.`;
              router.push(`/ai-helper?prompt=${encodeURIComponent(prompt)}`);
            }}
          >
            <Ionicons name="sparkles-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <ThemedText variant="body" style={{ color: '#fff', fontWeight: '600' }}>
              Ask AI about this prayer
            </ThemedText>
          </TouchableOpacity>

          <View style={[styles.disclaimer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ThemedText variant="caption" color="textSecondary" style={{ textAlign: 'center' }}>
              This information is for educational purposes only. Please consult qualified Islamic scholars for specific religious guidance.
            </ThemedText>
          </View>
        </ScrollView>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 8,
  },
  card: {
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  rakahRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  rakahNumber: {
    fontWeight: '600',
  },
  tipRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  disclaimer: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    marginTop: 8,
  },
});

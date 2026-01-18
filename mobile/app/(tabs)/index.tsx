import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useRouter } from 'expo-router';
import * as ExpoLocation from 'expo-location';
import * as Localization from 'expo-localization';
import { storage, STORAGE_KEYS } from '../../src/storage';
import {
  calculatePrayerTimes,
  getNextPrayer,
} from '../../src/modules/prayerTimes/calculations';
import { loadSettings } from '../../src/modules/settings/storage';
import { getDefaultSettings as getDefaultPrayerSettings } from '../../src/modules/settings/types';
import { PrayerTimes, Location, PrayerSettings } from '../../src/modules/prayerTimes/types';
import { schedulePrayerNotifications, requestNotificationPermissions } from '../../src/modules/notifications/scheduler';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useFontScale } from '../../src/theme/FontScaleProvider';
import { Screen, HeaderActionButton } from '../../src/components';

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { colors } = useTheme();
  const { typography } = useFontScale();
  const [location, setLocation] = useState<Location | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [settings, setSettings] = useState<PrayerSettings>(getDefaultPrayerSettings());
  const [loading, setLoading] = useState(true);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: Date } | null>(null);
  const [timeUntilNext, setTimeUntilNext] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [debugPanelVisible, setDebugPanelVisible] = useState(false);
  const [calculationDate, setCalculationDate] = useState<Date | null>(null);
  const devMode = __DEV__;

  const locale = useMemo(() => {
    const deviceLocale = Localization.getLocales()[0];
    return (
      i18n.language ||
      deviceLocale?.languageTag ||
      deviceLocale?.languageCode ||
      'en'
    );
  }, [i18n.language]);

  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    [locale]
  );

  const prayerList = useMemo(() => {
    if (!prayerTimes) return [];
    return Object.entries(prayerTimes)
      .filter(([name]) => name !== 'sunrise')
      .map(([name, time]) => ({ name, time }))
      .sort((a, b) => a.time.getTime() - b.time.getTime());
  }, [prayerTimes]);

  const toggleDebugPanel = () => {
    if (!devMode) return;
    setDebugPanelVisible((prev) => !prev);
  };

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const reloadSettings = async () => {
        const stored = await loadSettings();
        setSettings(stored);
      };
      reloadSettings();
    }, [])
  );

  useEffect(() => {
    if (location) {
      calculateTimes();
    }
  }, [location, settings]);

  useEffect(() => {
    if (prayerTimes) {
      updateNextPrayer(currentTime);
    }
  }, [prayerTimes, currentTime]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (prayerTimes && settings.notifications?.enabled) {
      const scheduleNotifs = async () => {
        const hasPermission = await requestNotificationPermissions();
        if (hasPermission) {
          await schedulePrayerNotifications(prayerTimes, settings.notifications);
        }
      };
      scheduleNotifs();
    }
  }, [prayerTimes, settings.notifications]);

  const loadData = async () => {
    try {
      const storedLocation = await storage.get<Location>(STORAGE_KEYS.LOCATION);
      const storedSettings = await loadSettings();
      setSettings(storedSettings);

      if (storedLocation) {
        setLocation(storedLocation);
        setLoading(false);
      } else {
        await requestLocation();
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const requestLocation = async () => {
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setLoading(false);
        return;
      }

      const loc = await ExpoLocation.getCurrentPositionAsync({});
      const newLocation: Location = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };

      setLocation(newLocation);
      await storage.set(STORAGE_KEYS.LOCATION, newLocation);
      setLoading(false);
    } catch (error) {
      console.error('Error getting location:', error);
      setLoading(false);
    }
  };

  const calculateTimes = () => {
    if (!location) return;

    const calculationDate = new Date();
    setCalculationDate(calculationDate);
    const times = calculatePrayerTimes(location, calculationDate, settings);
    setPrayerTimes(times);
  };

  const updateNextPrayer = (referenceTime: Date) => {
    if (!prayerTimes) return;

    const next = getNextPrayer(prayerTimes, referenceTime);
    setNextPrayer(next);

    if (next) {
      const diff = Math.max(next.time.getTime() - referenceTime.getTime(), 0);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeUntilNext(`${hours}h ${minutes}m ${seconds}s`);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await requestLocation();
    setRefreshing(false);
  };

  const formatTime = (date: Date): string => {
    return timeFormatter.format(date);
  };

  const timezoneName = Intl.DateTimeFormat().resolvedOptions().timeZone || 'local';
  const timezoneOffsetMinutes = -currentTime.getTimezoneOffset();

  if (loading) {
    return (
      <Screen edges={['top']} style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary, fontSize: typography.body }]}>{t('common.loading')}</Text>
      </Screen>
    );
  }

  if (!location) {
    return (
      <Screen edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.noLocationContainer}>
          <Text style={[styles.noLocationText, { color: colors.textSecondary, fontSize: typography.body }]}>{t('location.locationPermissionDenied')}</Text>
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={requestLocation}>
            <Text style={[styles.buttonText, { color: colors.surface, fontSize: typography.button }]}>{t('location.detectLocation')}</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.content, { paddingBottom: 16 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {nextPrayer && (
          <Pressable
            onLongPress={toggleDebugPanel}
            disabled={!devMode}
            style={({ pressed }) => [
              styles.nextPrayerCard,
              { backgroundColor: colors.primary, opacity: devMode && pressed ? 0.8 : 1 },
            ]}
          >
            <Text
              style={[
                styles.nextPrayerLabel,
                { fontSize: typography.label, color: colors.surface },
              ]}
            >
              {t('prayers.nextPrayer')}
            </Text>
            <Text
              style={[
                styles.nextPrayerName,
                { fontSize: typography.nextPrayerName, color: colors.surface },
              ]}
            >
              {t(`prayers.${nextPrayer.name.toLowerCase()}`)}
            </Text>
            <Text
              style={[
                styles.nextPrayerTime,
                { fontSize: typography.nextPrayerTime, color: colors.surface },
              ]}
            >
              {formatTime(nextPrayer.time)}
            </Text>
            <Text
              style={[
                styles.timeUntil,
                { fontSize: typography.bodyLarge, color: colors.surface },
              ]}
            >
              {timeUntilNext}
            </Text>
          </Pressable>
        )}

        {devMode && debugPanelVisible && location && prayerTimes && (
          <View style={[styles.debugCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.debugHeader}>
              <Text style={[styles.debugTitle, { color: colors.text, fontSize: typography.bodySmall }]}>
                Debug Info (Dev Only)
              </Text>
              <HeaderActionButton
                name="close"
                color={colors.primary}
                onPress={() => setDebugPanelVisible(false)}
                accessibilityLabel={t('common.close')}
              />
            </View>
            <View style={styles.debugRow}>
              <Text style={[styles.debugLabel, { color: colors.textSecondary }]}>Lat / Lon</Text>
              <Text style={[styles.debugValue, { color: colors.text }]}>
                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </Text>
            </View>
            <View style={styles.debugRow}>
              <Text style={[styles.debugLabel, { color: colors.textSecondary }]}>Timezone</Text>
              <Text style={[styles.debugValue, { color: colors.text }]}>
                {timezoneName} ({timezoneOffsetMinutes}m)
              </Text>
            </View>
            <View style={styles.debugRow}>
              <Text style={[styles.debugLabel, { color: colors.textSecondary }]}>Date Used</Text>
              <Text style={[styles.debugValue, { color: colors.text }]}>
                {calculationDate ? calculationDate.toLocaleString() : 'N/A'}
              </Text>
            </View>
            <View style={styles.debugRow}>
              <Text style={[styles.debugLabel, { color: colors.textSecondary }]}>Method / Rule</Text>
              <Text style={[styles.debugValue, { color: colors.text }]}>
                {settings.calculationMethod} / {settings.asrMethod} / {settings.highLatitudeRule}
              </Text>
            </View>
            <View style={styles.debugRow}>
              <Text style={[styles.debugLabel, { color: colors.textSecondary }]}>Adjustments</Text>
              <Text style={[styles.debugValue, { color: colors.text }]}>
                F:{settings.adjustments.fajr} S:{settings.adjustments.sunrise} D:{settings.adjustments.dhuhr} A:{settings.adjustments.asr} M:{settings.adjustments.maghrib} I:{settings.adjustments.isha}
              </Text>
            </View>
            <View style={styles.debugRow}>
              <Text style={[styles.debugLabel, { color: colors.textSecondary }]}>Raw ISO Times</Text>
            </View>
            <View style={styles.debugTimesList}>
              {Object.entries(prayerTimes).map(([name, time]) => (
                <Text key={name} style={[styles.debugValue, { color: colors.textSecondary }]}>
                  {name}: {time.toISOString()}
                </Text>
              ))}
            </View>
          </View>
        )}

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Pressable onLongPress={toggleDebugPanel} delayLongPress={600} disabled={!devMode}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typography.h4 }]}>{t('prayers.today')}</Text>
          </Pressable>
          {prayerList.length > 0 && (
            <View style={styles.prayersList}>
              {prayerList.map((prayer) => (
                <TouchableOpacity
                  key={prayer.name}
                  onPress={() => router.push(`/prayer/${prayer.name}`)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.prayerRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.prayerName, { color: colors.text, fontSize: typography.prayerName }]}>
                      {t(`prayers.${prayer.name.toLowerCase()}`)}
                    </Text>
                    <Text style={[styles.prayerTime, { color: colors.primary, fontSize: typography.prayerTime }]}>
                      {formatTime(prayer.time)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {location.city && (
          <View style={styles.locationInfo}>
            <Text style={[styles.locationText, { color: colors.textSecondary, fontSize: typography.bodySmall }]}>{location.city}</Text>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
  },
  noLocationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noLocationText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontWeight: '600',
  },
  nextPrayerCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  nextPrayerLabel: {
    opacity: 0.9,
    marginBottom: 8,
  },
  nextPrayerName: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  nextPrayerTime: {
    marginBottom: 12,
  },
  timeUntil: {
    opacity: 0.9,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  prayersList: {
    gap: 12,
  },
  prayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  prayerName: {
    fontWeight: '500',
  },
  prayerTime: {
    fontWeight: '600',
  },
  locationInfo: {
    alignItems: 'center',
    padding: 12,
  },
  locationText: {
    fontSize: 14,
  },
  debugCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  debugHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  debugTitle: {
    fontWeight: 'bold',
  },
  debugRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  debugLabel: {
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  debugValue: {
    fontSize: 12,
  },
  debugTimesList: {
    marginTop: 6,
  },
});

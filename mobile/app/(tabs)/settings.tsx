import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  Pressable,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { loadSettings, saveSettings } from '../../src/modules/settings/storage';
import { PrayerSettings } from '../../src/modules/settings/types';
import type { CalculationMethod, AsrMethod, HighLatitudeRule } from '../../src/modules/prayerTimes/types';
import { useTheme, ThemeMode } from '../../src/theme/ThemeProvider';
import { useFontScale, FontSize } from '../../src/theme/FontScaleProvider';
import { storage, STORAGE_KEYS } from '../../src/storage';
import { PrayerNotificationSettings, AdhanSound, DEFAULT_NOTIFICATION_SETTINGS } from '../../src/modules/notifications/types';
import { requestNotificationPermissions, createNotificationChannel } from '../../src/modules/notifications/scheduler';
import { playSound } from '../../src/modules/notifications/soundPlayer';
import { Screen } from '../../src/components';

interface ModalState {
  language: boolean;
  calculation: boolean;
  asr: boolean;
  highLatitude: boolean;
  fajrAdjust: boolean;
  dhuhAdjust: boolean;
  asrAdjust: boolean;
  maghribAdjust: boolean;
  ishaAdjust: boolean;
  theme: boolean;
  fontSize: boolean;
  notificationSound: boolean;
}

const ADJUSTMENT_PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
type AdjustmentPrayer = typeof ADJUSTMENT_PRAYERS[number];

const LANGUAGE_CODES = ['en', 'fr', 'sw', 'ar'] as const;
type LanguageCode = (typeof LANGUAGE_CODES)[number];

const normalizeLanguageCode = (lang?: string): LanguageCode => {
  if (!lang) {
    return 'en';
  }

  const candidate = lang.split('-')[0];
  const match = LANGUAGE_CODES.find((code) => code === candidate);
  return (match ?? 'en') as LanguageCode;
};

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { colors, themeMode, setThemeMode } = useTheme();
  const { fontSize, setFontSize, typography } = useFontScale();
  const [settings, setSettings] = useState<PrayerSettings | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<PrayerNotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [modals, setModals] = useState<ModalState>({
    language: false,
    calculation: false,
    asr: false,
    highLatitude: false,
    fajrAdjust: false,
    dhuhAdjust: false,
    asrAdjust: false,
    maghribAdjust: false,
    ishaAdjust: false,
    theme: false,
    fontSize: false,
    notificationSound: false,
  });

  useEffect(() => {
    loadSettingsFromStorage();
  }, []);

  const loadSettingsFromStorage = async () => {
    try {
      const loadedSettings = await loadSettings();
      setSettings(loadedSettings);

      // Load notification settings separately
      const loadedNotificationSettings = await storage.get<PrayerNotificationSettings>(STORAGE_KEYS.NOTIFICATION_SETTINGS);
      if (loadedNotificationSettings) {
        setNotificationSettings(loadedNotificationSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<PrayerSettings>) => {
    if (!settings) return;
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    try {
      await saveSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const toggleModal = (modalKey: keyof ModalState) => {
    setModals((prev) => ({
      ...prev,
      [modalKey]: !prev[modalKey],
    }));
  };

  const handleLanguageChange = async (lang: LanguageCode) => {
    await i18n.changeLanguage(lang);
    toggleModal('language');
  };

  const handleCalculationMethodChange = (method: CalculationMethod) => {
    updateSettings({ calculationMethod: method });
    toggleModal('calculation');
  };

  const handleAsrMethodChange = (method: AsrMethod) => {
    updateSettings({ asrMethod: method });
    toggleModal('asr');
  };

  const handleHighLatitudeChange = (rule: HighLatitudeRule) => {
    updateSettings({ highLatitudeRule: rule });
    toggleModal('highLatitude');
  };

  const handleAdjustmentChange = (prayer: AdjustmentPrayer, value: number) => {
    if (!settings) return;
    const adjustedValue = Math.max(-30, Math.min(30, value));
    updateSettings({
      adjustments: {
        ...settings.adjustments,
        [prayer]: adjustedValue,
      },
    });
  };

  const toggleNotificationGlobal = () => {
    if (!settings) return;
    updateSettings({
      notifications: {
        ...settings.notifications,
        enabled: !settings.notifications.enabled,
      },
    });
  };

  const togglePrayerNotification = (prayer: keyof typeof settings.notifications) => {
    if (!settings || prayer === 'enabled') return;
    updateSettings({
      notifications: {
        ...settings.notifications,
        [prayer]: !settings.notifications[prayer],
      },
    });
  };

  const currentLanguage = normalizeLanguageCode(i18n.language);
  const getLanguageLabel = (code: LanguageCode): string => {
    return t(`languageNames.${code}`);
  };

  if (loading || !settings) {
    return (
      <Screen edges={['top']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </Screen>
    );
  }


  const calculationMethods: CalculationMethod[] = ['MWL', 'ISNA', 'Egypt', 'Makkah', 'Karachi'];
  const asrMethods: AsrMethod[] = ['Standard', 'Hanafi'];
  const highLatitudeRules: HighLatitudeRule[] = ['NightMiddle', 'OneSeventh', 'AngleBased'];

  const themeModes: { value: ThemeMode; label: string }[] = [
    { value: 'system', label: t('settings.themeSystem') },
    { value: 'light', label: t('settings.themeLight') },
    { value: 'dark', label: t('settings.themeDark') },
  ];

  const fontSizes: { value: FontSize; label: string }[] = [
    { value: 'system', label: t('settings.fontSizeSystem') },
    { value: 'small', label: t('settings.fontSizeSmall') },
    { value: 'medium', label: t('settings.fontSizeMedium') },
    { value: 'large', label: t('settings.fontSizeLarge') },
  ];

  const getThemeLabel = () => {
    const mode = themeModes.find(m => m.value === themeMode);
    return mode?.label || themeModes[0].label;
  };

  const getFontSizeLabel = () => {
    const size = fontSizes.find(s => s.value === fontSize);
    return size?.label || fontSizes[0].label;
  };

  return (
    <Screen edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        {/* Appearance Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary, fontSize: typography.caption }]}>{t('settings.appearance')}</Text>

          <TouchableOpacity
            style={[styles.settingRow, { borderBottomColor: colors.border }]}
            onPress={() => toggleModal('theme')}
          >
            <Text style={[styles.settingLabel, { color: colors.text, fontSize: typography.body }]}>{t('settings.theme')}</Text>
            <Text style={[styles.settingValue, { color: colors.primary, fontSize: typography.bodySmall }]}>
              {getThemeLabel()}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingRow, styles.lastRow]}
            onPress={() => toggleModal('fontSize')}
          >
            <Text style={[styles.settingLabel, { color: colors.text, fontSize: typography.body }]}>{t('settings.fontSize')}</Text>
            <Text style={[styles.settingValue, { color: colors.primary, fontSize: typography.bodySmall }]}>
              {getFontSizeLabel()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Language Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary, fontSize: typography.caption }]}>{t('settings.language')}</Text>
          <TouchableOpacity
            style={[styles.settingRow, styles.lastRow, { borderBottomColor: colors.border }]}
            onPress={() => toggleModal('language')}
          >
            <Text style={[styles.settingLabel, { color: colors.text, fontSize: typography.body }]}>{t('settings.language')}</Text>
            <Text style={[styles.settingValue, { color: colors.primary, fontSize: typography.bodySmall }]}>
              {getLanguageLabel(currentLanguage)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Calculation Method Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary, fontSize: typography.caption }]}>{t('settings.prayerCalculation')}</Text>

          <TouchableOpacity
            style={[styles.settingRow, { borderBottomColor: colors.border }]}
            onPress={() => toggleModal('calculation')}
          >
            <Text style={[styles.settingLabel, { color: colors.text, fontSize: typography.body }]}>{t('settings.calculationMethod')}</Text>
            <Text style={[styles.settingValue, { color: colors.primary, fontSize: typography.bodySmall }]}>{settings.calculationMethod}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingRow, { borderBottomColor: colors.border }]}
            onPress={() => toggleModal('asr')}
          >
            <Text style={[styles.settingLabel, { color: colors.text, fontSize: typography.body }]}>{t('settings.asrMethod')}</Text>
            <Text style={[styles.settingValue, { color: colors.primary, fontSize: typography.bodySmall }]}>{settings.asrMethod}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingRow, styles.lastRow]}
            onPress={() => toggleModal('highLatitude')}
          >
            <Text style={[styles.settingLabel, { color: colors.text, fontSize: typography.body }]}>{t('settings.highLatitudeRule')}</Text>
            <Text style={[styles.settingValue, { color: colors.primary, fontSize: typography.bodySmall }]}>{settings.highLatitudeRule}</Text>
          </TouchableOpacity>
        </View>

        {/* Time Adjustments Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.timeAdjustments')}</Text>

          {ADJUSTMENT_PRAYERS.map((prayer, index) => (
            <View
              key={prayer}
              style={[
                styles.adjustmentRow,
                index === ADJUSTMENT_PRAYERS.length - 1 && styles.lastRow,
              ]}
            >
              <Text style={styles.settingLabel}>
                {t(`prayers.${prayer}`)}
              </Text>
              <View style={styles.adjustmentControl}>
                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() =>
                    handleAdjustmentChange(
                      prayer,
                      settings.adjustments[prayer as keyof typeof settings.adjustments] - 1
                    )
                  }
                >
                  <Text style={styles.adjustButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.adjustmentValue}>
                  {settings.adjustments[prayer as keyof typeof settings.adjustments]} min
                </Text>
                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() =>
                    handleAdjustmentChange(
                      prayer,
                      settings.adjustments[prayer as keyof typeof settings.adjustments] + 1
                    )
                  }
                >
                  <Text style={styles.adjustButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.notifications')}</Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>{t('settings.enableNotifications')}</Text>
            <Switch
              value={settings.notifications.enabled}
              onValueChange={toggleNotificationGlobal}
              trackColor={{ false: '#ccc', true: '#81C784' }}
              thumbColor={settings.notifications.enabled ? '#2E7D32' : '#f4f3f4'}
            />
          </View>

          {settings.notifications.enabled && (
            <>
              <Text style={styles.subsectionTitle}>{t('settings.prayerNotifications')}</Text>
              {(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const).map((prayer, index) => (
                <View
                  key={prayer}
                  style={[
                    styles.settingRow,
                    index === 4 && styles.lastRow,
                  ]}
                >
                  <Text style={styles.settingLabel}>
                    {t(`prayers.${prayer}`)}
                  </Text>
                  <Switch
                    value={settings.notifications[prayer]}
                    onValueChange={() => togglePrayerNotification(prayer)}
                    trackColor={{ false: '#ccc', true: '#81C784' }}
                    thumbColor={settings.notifications[prayer] ? '#2E7D32' : '#f4f3f4'}
                  />
                </View>
              ))}
            </>
          )}
        </View>

        {/* Links Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.linkButton, styles.lastRow]}
            onPress={() => router.push('/credits')}
          >
            <Text style={styles.linkButtonText}>{t('settings.credits')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Language Modal */}
      <Modal
        visible={modals.language}
        transparent
        animationType="fade"
        onRequestClose={() => toggleModal('language')}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => toggleModal('language')}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('settings.selectLanguage')}</Text>
            {LANGUAGE_CODES.map((code) => (
              <TouchableOpacity
                key={code}
                style={[
                  styles.modalOption,
                  currentLanguage === code && styles.modalOptionActive,
                ]}
                onPress={() => handleLanguageChange(code)}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    currentLanguage === code && styles.modalOptionTextActive,
                  ]}
                >
                  {getLanguageLabel(code)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Calculation Method Modal */}
      <Modal
        visible={modals.calculation}
        transparent
        animationType="fade"
        onRequestClose={() => toggleModal('calculation')}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => toggleModal('calculation')}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('settings.calculationMethod')}</Text>
            {calculationMethods.map((method) => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.modalOption,
                  settings.calculationMethod === method && styles.modalOptionActive,
                ]}
                onPress={() => handleCalculationMethodChange(method)}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    settings.calculationMethod === method && styles.modalOptionTextActive,
                  ]}
                >
                  {method}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Asr Method Modal */}
      <Modal
        visible={modals.asr}
        transparent
        animationType="fade"
        onRequestClose={() => toggleModal('asr')}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => toggleModal('asr')}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('settings.asrMethod')}</Text>
            {asrMethods.map((method) => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.modalOption,
                  settings.asrMethod === method && styles.modalOptionActive,
                ]}
                onPress={() => handleAsrMethodChange(method)}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    settings.asrMethod === method && styles.modalOptionTextActive,
                  ]}
                >
                  {method}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* High Latitude Rule Modal */}
      <Modal
        visible={modals.highLatitude}
        transparent
        animationType="fade"
        onRequestClose={() => toggleModal('highLatitude')}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => toggleModal('highLatitude')}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('settings.highLatitudeRule')}</Text>
            {highLatitudeRules.map((rule) => (
              <TouchableOpacity
                key={rule}
                style={[
                  styles.modalOption,
                  settings.highLatitudeRule === rule && styles.modalOptionActive,
                ]}
                onPress={() => handleHighLatitudeChange(rule)}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    settings.highLatitudeRule === rule && styles.modalOptionTextActive,
                  ]}
                >
                  {rule}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Theme Mode Modal */}
      <Modal
        visible={modals.theme}
        transparent
        animationType="fade"
        onRequestClose={() => toggleModal('theme')}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => toggleModal('theme')}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('settings.theme')}</Text>
            {themeModes.map((mode) => (
              <TouchableOpacity
                key={mode.value}
                style={[
                  styles.modalOption,
                  { borderColor: colors.border },
                  themeMode === mode.value && [styles.modalOptionActive, { backgroundColor: colors.primaryLight + '20', borderColor: colors.primary }],
                ]}
                onPress={() => {
                  setThemeMode(mode.value);
                  toggleModal('theme');
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    { color: colors.text },
                    themeMode === mode.value && [styles.modalOptionTextActive, { color: colors.primary }],
                  ]}
                >
                  {mode.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Font Size Modal */}
      <Modal
        visible={modals.fontSize}
        transparent
        animationType="fade"
        onRequestClose={() => toggleModal('fontSize')}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => toggleModal('fontSize')}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('settings.fontSize')}</Text>
            {fontSizes.map((size) => (
              <TouchableOpacity
                key={size.value}
                style={[
                  styles.modalOption,
                  { borderColor: colors.border },
                  fontSize === size.value && [styles.modalOptionActive, { backgroundColor: colors.primaryLight + '20', borderColor: colors.primary }],
                ]}
                onPress={() => {
                  setFontSize(size.value);
                  toggleModal('fontSize');
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    { color: colors.text },
                    fontSize === size.value && [styles.modalOptionTextActive, { color: colors.primary }],
                  ]}
                >
                  {size.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subsectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    marginTop: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  settingValue: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
    marginLeft: 12,
  },
  adjustmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  adjustmentControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adjustButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adjustButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32',
  },
  adjustmentValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'center',
  },
  linkButton: {
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  linkButtonText: {
    fontSize: 15,
    color: '#2E7D32',
    fontWeight: '600',
  },
  spacer: {
    height: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#333',
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modalOptionActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#2E7D32',
  },
  modalOptionText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  modalOptionTextActive: {
    color: '#2E7D32',
    fontWeight: '700',
  },
});











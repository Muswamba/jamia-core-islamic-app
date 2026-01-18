import { CalculationMethod, AsrMethod, HighLatitudeRule } from '../prayerTimes/types';

export interface NotificationSettings {
  enabled: boolean;
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
}

export interface PrayerSettings {
  calculationMethod: CalculationMethod;
  asrMethod: AsrMethod;
  highLatitudeRule: HighLatitudeRule;
  adjustments: {
    fajr: number;
    sunrise: number;
    dhuhr: number;
    asr: number;
    maghrib: number;
    isha: number;
  };
  notifications: NotificationSettings;
}

export const getDefaultSettings = (): PrayerSettings => ({
  calculationMethod: 'MWL',
  asrMethod: 'Standard',
  highLatitudeRule: 'NightMiddle',
  adjustments: {
    fajr: 0,
    sunrise: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
  },
  notifications: {
    enabled: false,
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
  },
});

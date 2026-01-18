export type AdhanSound = 'adhan-full' | 'adhan-short' | 'beep' | 'silent';

export interface PrayerNotificationSettings {
  enabled: boolean;
  sound: AdhanSound;
  prayerToggles: {
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
    sunrise: boolean; // OFF by default
  };
}

export interface ScheduledNotification {
  id: string;
  prayerName: string;
  time: Date;
}

export const DEFAULT_NOTIFICATION_SETTINGS: PrayerNotificationSettings = {
  enabled: false,
  sound: 'adhan-short',
  prayerToggles: {
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
    sunrise: false, // OFF by default - not a prayer
  },
};

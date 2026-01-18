import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { PrayerTimes } from '../prayerTimes/types';
import { PrayerNotificationSettings, ScheduledNotification } from './types';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Create notification channel for Android
export async function createNotificationChannel(soundName: string = 'default'): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('prayer-times', {
      name: 'Prayer Times',
      importance: Notifications.AndroidImportance.HIGH,
      sound: soundName === 'silent' ? undefined : soundName,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2E7D32',
      enableVibrate: true,
      enableLights: true,
    });
  }
}

// Request notification permissions
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

// Cancel all scheduled notifications
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Get sound file name for platform
function getSoundFileName(soundName: string): string | undefined {
  if (soundName === 'silent') return undefined;

  // For Android, reference the sound file (must be in android/app/src/main/res/raw/)
  // For iOS, custom sounds in notifications have limitations, so we use default
  if (Platform.OS === 'android') {
    return soundName; // e.g., 'adhan-full', 'adhan-short', 'beep'
  }

  return undefined; // iOS uses default notification sound
}

// Schedule notifications for all enabled prayers
export async function schedulePrayerNotifications(
  prayerTimes: PrayerTimes,
  settings: PrayerNotificationSettings
): Promise<ScheduledNotification[]> {
  // Cancel existing notifications first
  await cancelAllNotifications();

  if (!settings.enabled) {
    return [];
  }

  const scheduled: ScheduledNotification[] = [];
  const now = new Date();

  // Create notification channel with selected sound (Android)
  await createNotificationChannel(getSoundFileName(settings.sound) || 'default');

  // Map prayer names to times and settings
  const prayers: Array<{ name: keyof PrayerTimes; displayName: string }> = [
    { name: 'fajr', displayName: 'Fajr' },
    { name: 'sunrise', displayName: 'Sunrise' },
    { name: 'dhuhr', displayName: 'Dhuhr' },
    { name: 'asr', displayName: 'Asr' },
    { name: 'maghrib', displayName: 'Maghrib' },
    { name: 'isha', displayName: 'Isha' },
  ];

  for (const prayer of prayers) {
    const prayerTime = prayerTimes[prayer.name];
    const isEnabled = settings.prayerToggles[prayer.name as keyof typeof settings.prayerToggles];

    // Skip if prayer is disabled or time has passed
    if (!isEnabled || prayerTime <= now) {
      continue;
    }

    try {
      // Calculate seconds until prayer time
      const trigger = prayerTime;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `${prayer.displayName} Prayer Time`,
          body: `It's time for ${prayer.displayName} prayer`,
          sound: getSoundFileName(settings.sound),
          priority: Notifications.AndroidNotificationPriority.HIGH,
          categoryIdentifier: 'prayer-time',
        },
        trigger,
      });

      scheduled.push({
        id: notificationId,
        prayerName: prayer.name,
        time: prayerTime,
      });

      console.log(`Scheduled ${prayer.displayName} notification for`, prayerTime.toLocaleTimeString());
    } catch (error) {
      console.error(`Failed to schedule ${prayer.displayName} notification:`, error);
    }
  }

  return scheduled;
}

// Get all scheduled notifications (for debugging/status)
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync();
}

export interface AdhanSettings {
  enabled: boolean;
  prayers: {
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
  };
  sound: string;
  vibrate: boolean;
  notifyBefore: number; // minutes
}

export const getDefaultAdhanSettings = (): AdhanSettings => ({
  enabled: true,
  prayers: {
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
  },
  sound: 'default',
  vibrate: true,
  notifyBefore: 0,
});

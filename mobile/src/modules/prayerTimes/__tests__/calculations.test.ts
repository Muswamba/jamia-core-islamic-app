import { calculatePrayerTimes, getDefaultSettings } from '../calculations';
import { Location, PrayerSettings } from '../types';

class FixedOffsetDate extends Date {
  private readonly offsetMinutes: number;

  constructor(value: string, offsetMinutes: number) {
    super(value);
    this.offsetMinutes = offsetMinutes;
  }

  getTimezoneOffset(): number {
    return this.offsetMinutes;
  }
}

const baseLocation: Location = {
  latitude: 51.5074,
  longitude: -0.1278,
};

describe('PrayerTimesCalculator', () => {
  const baseSettings: PrayerSettings = getDefaultSettings();

  test('accounts for timezone offset when calculating prayer times', () => {
    const dateUtc = new FixedOffsetDate('2025-06-21T12:00:00Z', 0);
    const dateUtcMinusFive = new FixedOffsetDate('2025-06-21T12:00:00Z', -300);

    const timesUtc = calculatePrayerTimes(baseLocation, dateUtc, baseSettings);
    const timesUtcMinusFive = calculatePrayerTimes(baseLocation, dateUtcMinusFive, baseSettings);

    const offsetDiff =
      dateUtcMinusFive.getTimezoneOffset() - dateUtc.getTimezoneOffset();
    const differenceMinutes =
      (timesUtcMinusFive.dhuhr.getTime() - timesUtc.dhuhr.getTime()) / (1000 * 60);

    expect(Math.abs(differenceMinutes - offsetDiff)).toBeLessThanOrEqual(6);
  });

  test('high latitude rules keep times valid and can differ across strategies', () => {
    const highLatLocation: Location = {
      latitude: 69.6492,
      longitude: 18.9553,
    };
    const date = new FixedOffsetDate('2025-12-21T12:00:00Z', 0);
    const nightMiddleSettings: PrayerSettings = {
      ...baseSettings,
      highLatitudeRule: 'NightMiddle',
    };
    const angleSettings: PrayerSettings = {
      ...baseSettings,
      highLatitudeRule: 'AngleBased',
    };

    const timesNightMiddle = calculatePrayerTimes(
      highLatLocation,
      date,
      nightMiddleSettings
    );
    const timesAngle = calculatePrayerTimes(highLatLocation, date, angleSettings);

    expect(timesNightMiddle.fajr.getTime()).not.toBeNaN();
    expect(timesAngle.fajr.getTime()).not.toBeNaN();
    expect(Math.abs(timesNightMiddle.fajr.getTime() - timesAngle.fajr.getTime())).toBeGreaterThan(0);
  });

  test('Hanafi Asr is calculated after Standard Asr', () => {
    const date = new FixedOffsetDate('2025-09-15T12:00:00Z', 0);
    const standardSettings: PrayerSettings = {
      ...baseSettings,
      asrMethod: 'Standard',
    };
    const hanafiSettings: PrayerSettings = {
      ...baseSettings,
      asrMethod: 'Hanafi',
    };

    const standardTimes = calculatePrayerTimes(baseLocation, date, standardSettings);
    const hanafiTimes = calculatePrayerTimes(baseLocation, date, hanafiSettings);

    expect(hanafiTimes.asr.getTime()).toBeGreaterThan(standardTimes.asr.getTime());
    const deltaMinutes =
      (hanafiTimes.asr.getTime() - standardTimes.asr.getTime()) / (1000 * 60);
    expect(deltaMinutes).toBeGreaterThan(5);
  });
});

import {
  CalculationMethod,
  AsrMethod,
  HighLatitudeRule,
  PrayerTimes,
  Location,
  PrayerSettings,
  CalculationParameters,
} from './types';

const CALCULATION_METHODS: Record<CalculationMethod, CalculationParameters> = {
  MWL: { fajrAngle: 18, ishaAngle: 17 },
  ISNA: { fajrAngle: 15, ishaAngle: 15 },
  Egypt: { fajrAngle: 19.5, ishaAngle: 17.5 },
  Makkah: { fajrAngle: 18.5, ishaInterval: 90 },
  Karachi: { fajrAngle: 18, ishaAngle: 18 },
};

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;
const toDegrees = (radians: number): number => (radians * 180) / Math.PI;

const fixHour = (a: number): number => {
  a = a - 24 * Math.floor(a / 24);
  return a < 0 ? a + 24 : a;
};

const fixAngle = (a: number): number => {
  a = a - 360 * Math.floor(a / 360);
  return a < 0 ? a + 360 : a;
};

class PrayerTimesCalculator {
  private lat: number = 0;
  private lng: number = 0;
  private timezone: number = 0;
  private julian: number = 0;
  private params: CalculationParameters;
  private asrJuristic: number = 0; // 0 = Standard, 1 = Hanafi
  private highLatRule: HighLatitudeRule = 'NightMiddle';

  constructor() {
    this.params = CALCULATION_METHODS.MWL;
  }

  setMethod(method: CalculationMethod): void {
    this.params = CALCULATION_METHODS[method];
  }

  setAsrMethod(method: AsrMethod): void {
    this.asrJuristic = method === 'Hanafi' ? 1 : 0;
  }

  setHighLatitudeRule(rule: HighLatitudeRule): void {
    this.highLatRule = rule;
  }

  calculate(
    location: Location,
    date: Date,
    settings: PrayerSettings
  ): PrayerTimes {
    this.lat = location.latitude;
    this.lng = location.longitude;
    this.timezone = this.getTimezoneOffset(date) / 60;
    this.julian = this.getJulianDate(date);

    this.setMethod(settings.calculationMethod);
    this.setAsrMethod(settings.asrMethod);
    this.setHighLatitudeRule(settings.highLatitudeRule);

    const times = this.computeTimes();
    const prayerTimes = this.adjustTimes(times, date, settings.adjustments);

    return prayerTimes;
  }

  private getTimezoneOffset(date: Date): number {
    return -date.getTimezoneOffset();
  }

  private getJulianDate(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    if (month <= 2) {
      return (
        Math.floor(365.25 * (year - 1)) +
        Math.floor(30.6001 * (month + 13)) +
        day +
        1721088.5
      );
    }
    return (
      Math.floor(365.25 * year) +
      Math.floor(30.6001 * (month + 1)) +
      day +
      1721086.5
    );
  }

  private computeTimes(): number[] {
    const times = [5, 6, 12, 13, 18, 18];

    for (let i = 1; i <= 2; i++) {
      const t = this.computePrayerTimes(times);
      times[0] = t[0];
      times[1] = t[1];
      times[2] = t[2];
      times[3] = t[3];
      times[4] = t[4];
      times[5] = t[5];
    }

    return times;
  }

  private computePrayerTimes(times: number[]): number[] {
    const t = this.dayPortion(times);

    const fajr = this.computeTime(
      180 - this.params.fajrAngle,
      t[0]
    );
    const sunrise = this.computeTime(180 - 0.833, t[1]);
    const dhuhr = this.computeMidDay(t[2]);
    const asr = this.computeAsr(1 + this.asrJuristic, t[3]);
    const sunset = this.computeTime(0.833, t[4]);
    const maghrib = sunset;

    let isha: number;
    if (this.params.ishaInterval) {
      isha = sunset + this.params.ishaInterval / 60;
    } else {
      isha = this.computeTime(this.params.ishaAngle, t[5]);
    }

    return [fajr, sunrise, dhuhr, asr, maghrib, isha];
  }

  private computeTime(angle: number, time: number): number {
    const decl = this.sunDeclination(this.julian + time);
    const noon = this.computeMidDay(time);
    const t =
      (-this.sin(angle) -
        this.sin(decl) * this.sin(this.lat)) /
      (this.cos(decl) * this.cos(this.lat));

    if (t < -1 || t > 1) {
      return this.adjustHighLatitude(angle, time, decl, noon);
    }

    const v = (1 / 15) * toDegrees(Math.acos(t));
    return noon + (angle > 90 ? -v : v);
  }

  private adjustHighLatitude(
    angle: number,
    time: number,
    decl: number,
    noon: number
  ): number {
    const nightLength = this.nightLength(decl);
    let portion = 0;

    if (this.highLatRule === 'NightMiddle') {
      portion = 1 / 2;
    } else if (this.highLatRule === 'OneSeventh') {
      portion = 1 / 7;
    } else if (this.highLatRule === 'AngleBased') {
      portion = angle / 60;
    }

    const timeDiff = angle > 90 ? portion * nightLength : -portion * nightLength;
    return noon + timeDiff;
  }

  private nightLength(decl: number): number {
    const t =
      (-this.sin(-0.833) - this.sin(decl) * this.sin(this.lat)) /
      (this.cos(decl) * this.cos(this.lat));

    if (t < -1 || t > 1) return 0;

    return (2 / 15) * toDegrees(Math.acos(t));
  }

  private computeMidDay(time: number): number {
    const eqt = this.sunEquationOfTime(this.julian + time);
    const noon = fixHour(12 - eqt);
    return noon;
  }

  private computeAsr(factor: number, time: number): number {
    const decl = this.sunDeclination(this.julian + time);
    const angle = -Math.atan(factor + Math.tan(Math.abs(this.lat - decl)));
    return this.computeTime(toDegrees(angle) + 90, time);
  }

  private sunDeclination(jd: number): number {
    const n = jd - 2451545.0;
    const epsilon = 23.44 - 0.0000004 * n;
    const l = fixAngle(280.466 + 0.9856474 * n);
    const g = toRadians(fixAngle(357.528 + 0.9856003 * n));
    const lambda = l + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g);

    return toDegrees(
      Math.asin(this.sin(epsilon) * this.sin(lambda))
    );
  }

  private sunEquationOfTime(jd: number): number {
    const n = jd - 2451545.0;
    const g = toRadians(fixAngle(357.528 + 0.9856003 * n));
    const l = fixAngle(280.466 + 0.9856474 * n);
    const lambda = l + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g);
    const epsilon = 23.44 - 0.0000004 * n;
    const ra = toDegrees(
      Math.atan2(
        this.cos(epsilon) * this.sin(lambda),
        this.cos(lambda)
      )
    );

    const eqt = (l - ra) / 15;
    return fixHour(eqt + 12) - 12;
  }

  private sin(d: number): number {
    return Math.sin(toRadians(d));
  }

  private cos(d: number): number {
    return Math.cos(toRadians(d));
  }

  private dayPortion(times: number[]): number[] {
    return times.map((t) => t / 24);
  }

  private adjustTimes(
    times: number[],
    date: Date,
    adjustments: PrayerSettings['adjustments']
  ): PrayerTimes {
    const createDateTime = (hours: number, adjustment: number): Date => {
      const totalMinutes = hours * 60 + adjustment;
      const h = Math.floor(totalMinutes / 60);
      const m = Math.floor(totalMinutes % 60);

      return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        h,
        m,
        0
      );
    };

    return {
      fajr: createDateTime(times[0], adjustments.fajr),
      sunrise: createDateTime(times[1], adjustments.sunrise),
      dhuhr: createDateTime(times[2], adjustments.dhuhr),
      asr: createDateTime(times[3], adjustments.asr),
      maghrib: createDateTime(times[4], adjustments.maghrib),
      isha: createDateTime(times[5], adjustments.isha),
    };
  }
}

export const calculatePrayerTimes = (
  location: Location,
  date: Date,
  settings: PrayerSettings
): PrayerTimes => {
  const calculator = new PrayerTimesCalculator();
  return calculator.calculate(location, date, settings);
};

export const getNextPrayer = (
  prayerTimes: PrayerTimes,
  currentTime: Date
): { name: string; time: Date } | null => {
  // Only include actual prayers (not sunrise)
  const prayers = [
    { name: 'fajr', time: prayerTimes.fajr },
    { name: 'dhuhr', time: prayerTimes.dhuhr },
    { name: 'asr', time: prayerTimes.asr },
    { name: 'maghrib', time: prayerTimes.maghrib },
    { name: 'isha', time: prayerTimes.isha },
  ];

  for (const prayer of prayers) {
    if (prayer.time > currentTime) {
      return prayer;
    }
  }

  // If all prayers have passed, return tomorrow's Fajr
  const tomorrowFajr = new Date(prayerTimes.fajr);
  tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
  return { name: 'fajr', time: tomorrowFajr };
};

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
});

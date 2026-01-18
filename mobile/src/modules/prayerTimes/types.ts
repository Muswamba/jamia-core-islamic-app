export type CalculationMethod = 'MWL' | 'ISNA' | 'Egypt' | 'Makkah' | 'Karachi';
export type AsrMethod = 'Standard' | 'Hanafi';
export type HighLatitudeRule = 'NightMiddle' | 'AngleBased' | 'OneSeventh';

export interface PrayerTime {
  name: string;
  time: Date;
  enabled: boolean;
}

export interface PrayerTimes {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
}

export interface Location {
  latitude: number;
  longitude: number;
  city?: string;
  timezone?: string;
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
}

export interface CalculationParameters {
  fajrAngle: number;
  ishaAngle: number;
  ishaInterval?: number;
  maghribAngle?: number;
}

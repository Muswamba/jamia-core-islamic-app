export type FontSize = 'system' | 'small' | 'medium' | 'large';

export const fontSizeMultipliers: Record<FontSize, number> = {
  system: 1.0,
  small: 0.9,
  medium: 1.0,
  large: 1.15,
};

export interface Typography {
  // Headers
  h1: number;
  h2: number;
  h3: number;
  h4: number;

  // Body text
  body: number;
  bodySmall: number;
  bodyLarge: number;

  // UI elements
  button: number;
  caption: number;
  label: number;

  // Prayer times specific
  prayerName: number;
  prayerTime: number;
  nextPrayerName: number;
  nextPrayerTime: number;
}

const baseTypography: Typography = {
  h1: 32,
  h2: 28,
  h3: 24,
  h4: 20,
  body: 16,
  bodySmall: 14,
  bodyLarge: 18,
  button: 16,
  caption: 12,
  label: 14,
  prayerName: 16,
  prayerTime: 16,
  nextPrayerName: 32,
  nextPrayerTime: 24,
};

export const scaleTypography = (multiplier: number): Typography => {
  const scaled: any = {};
  for (const [key, value] of Object.entries(baseTypography)) {
    scaled[key] = Math.round(value * multiplier);
  }
  return scaled as Typography;
};

export const getTypography = (fontSize: FontSize): Typography => {
  const multiplier = fontSizeMultipliers[fontSize];
  return scaleTypography(multiplier);
};

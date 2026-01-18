export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  translation?: string;
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface Bookmark {
  surahNumber: number;
  ayahNumber: number;
  timestamp: number;
}

export interface LastRead {
  surahNumber: number;
  ayahNumber: number;
  timestamp: number;
}

export interface Translation {
  lang: string;
  translatorName: string;
  ayahs: Record<string, string>; // key: "surah:ayah", value: translation text
}

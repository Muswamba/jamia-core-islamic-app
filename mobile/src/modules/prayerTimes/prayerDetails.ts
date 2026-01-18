export interface PrayerDetail {
  name: string;
  rakah: {
    fard: number;
    sunnah?: {
      before?: number;
      after?: number;
    };
  };
  tips: string[];
}

export const PRAYER_DETAILS: Record<string, PrayerDetail> = {
  fajr: {
    name: 'Fajr',
    rakah: {
      fard: 2,
      sunnah: {
        before: 2,
      },
    },
    tips: [
      'Fajr begins at dawn and ends at sunrise',
      'The two sunnah rak\'ah before Fajr are highly emphasized',
      'Recitation in Fajr should be longer than other prayers',
    ],
  },
  dhuhr: {
    name: 'Dhuhr',
    rakah: {
      fard: 4,
      sunnah: {
        before: 4,
        after: 2,
      },
    },
    tips: [
      'Dhuhr begins after the sun passes its zenith',
      'The four sunnah before Dhuhr are strongly recommended',
      'Silent prayer - recitation is done quietly',
    ],
  },
  asr: {
    name: 'Asr',
    rakah: {
      fard: 4,
      sunnah: {
        before: 4,
      },
    },
    tips: [
      'Asr time begins when shadow equals object length',
      'Should not be delayed until near Maghrib',
      'Silent prayer - recitation is done quietly',
    ],
  },
  maghrib: {
    name: 'Maghrib',
    rakah: {
      fard: 3,
      sunnah: {
        after: 2,
      },
    },
    tips: [
      'Maghrib begins immediately after sunset',
      'The time for Maghrib is relatively short',
      'First two rak\'ah are recited aloud, third is silent',
    ],
  },
  isha: {
    name: 'Isha',
    rakah: {
      fard: 4,
      sunnah: {
        after: 2,
      },
    },
    tips: [
      'Isha begins after twilight disappears',
      'Can be delayed to the first third of the night',
      'Witr prayer (1-3 rak\'ah) is performed after Isha',
    ],
  },
};

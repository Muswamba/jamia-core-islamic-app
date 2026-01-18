import { Category, Lesson } from './types';

export const CATEGORIES_EN: Category[] = [
  { id: 'basics', name: 'Islamic Basics', description: 'Fundamental concepts of Islam' },
  { id: 'worship', name: 'Worship', description: 'Learn about prayer and worship' },
  { id: 'duas', name: 'Daily Duas', description: 'Supplications for daily life' },
];

export const LESSONS_EN: Lesson[] = [
  {
    id: 'pillars-of-islam',
    title: 'Five Pillars of Islam',
    category: 'basics',
    content: `The Five Pillars of Islam are the foundation of Muslim life:

1. Shahada (Faith): Declaration that there is no god but Allah, and Muhammad is His messenger.

2. Salah (Prayer): Performing the five daily prayers facing Makkah.

3. Zakat (Charity): Giving a portion of one's wealth to those in need.

4. Sawm (Fasting): Fasting during the month of Ramadan from dawn to sunset.

5. Hajj (Pilgrimage): Making a pilgrimage to Makkah at least once in a lifetime if able.

These pillars represent the core practices that every Muslim should follow.`,
    quiz: [
      {
        question: 'How many pillars of Islam are there?',
        options: ['Three', 'Five', 'Seven', 'Ten'],
        correctAnswer: 1,
      },
      {
        question: 'Which pillar involves fasting during Ramadan?',
        options: ['Shahada', 'Salah', 'Sawm', 'Hajj'],
        correctAnswer: 2,
      },
    ],
  },
  {
    id: 'wudu',
    title: 'How to Perform Wudu',
    category: 'worship',
    content: `Wudu (ablution) is the Islamic ritual washing before prayer. Here are the steps:

1. Make intention (niyyah) in your heart to perform wudu for purification.

2. Say "Bismillah" (In the name of Allah).

3. Wash both hands up to the wrists three times.

4. Rinse your mouth three times.

5. Rinse your nose three times.

6. Wash your face three times from forehead to chin and ear to ear.

7. Wash your right arm up to the elbow three times, then the left arm.

8. Wipe your head with wet hands once.

9. Wipe your ears inside and out once.

10. Wash your right foot up to the ankle three times, then the left foot.

Your wudu is now complete and you are ready for prayer.`,
    quiz: [
      {
        question: 'How many times should you wash your hands in wudu?',
        options: ['Once', 'Twice', 'Three times', 'Four times'],
        correctAnswer: 2,
      },
    ],
  },
  {
    id: 'salah-steps',
    title: 'Steps of Salah',
    category: 'worship',
    content: `Here are the basic steps for performing Salah (prayer):

1. Face the Qibla (direction of Kaaba in Makkah).

2. Make intention (niyyah) for the specific prayer.

3. Raise hands to ears and say "Allahu Akbar" (Takbir).

4. Recite Surah Al-Fatihah and another surah.

5. Bow (ruku) and glorify Allah.

6. Stand up from ruku and say "Sami Allahu liman hamidah".

7. Prostrate (sujud) with forehead, nose, hands, knees, and toes on the ground.

8. Sit between prostrations briefly.

9. Perform second prostration.

10. After completing units (rakat), sit for Tashahhud.

11. Give salams to the right and left to complete the prayer.

The number of units varies by prayer time (Fajr: 2, Dhuhr: 4, Asr: 4, Maghrib: 3, Isha: 4).`,
    quiz: [
      {
        question: 'How many rakat are in Fajr prayer?',
        options: ['2', '3', '4', '5'],
        correctAnswer: 0,
      },
    ],
  },
  {
    id: 'morning-dua',
    title: 'Morning Supplications',
    category: 'duas',
    content: `Important duas to recite in the morning:

1. Upon waking:
"Alhamdu lillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushur"
(All praise is for Allah who gave us life after having taken it from us and unto Him is the resurrection)

2. General morning remembrance:
"Asbahna wa asbahal-mulku lillah"
(We have reached the morning and with it the whole kingdom belongs to Allah)

3. Protection dua:
"Bismillahil-ladhi la yadurru ma'as-mihi shay'un fil-ardi wa la fis-sama'i wa huwas-sami'ul-'alim"
(In the name of Allah with whose name nothing is harmed on earth nor in the heavens, and He is The All-Hearing, The All-Knowing)

Reciting these duas brings blessings and protection to your day.`,
  },
  {
    id: 'eating-dua',
    title: 'Duas for Eating',
    category: 'duas',
    content: `Important duas related to eating:

Before eating:
"Bismillah"
(In the name of Allah)

Or the longer version:
"Bismillahi wa 'ala barakatillah"
(In the name of Allah and with the blessings of Allah)

After eating:
"Alhamdu lillahil-ladhi at'amana wa saqana wa ja'alana muslimin"
(All praise is due to Allah who gave us food and drink and made us Muslims)

These simple supplications remind us to be grateful for Allah's provisions.`,
  },
];

export const CATEGORIES_FR: Category[] = [
  { id: 'basics', name: 'Bases de l Islam', description: 'Concepts fondamentaux de l Islam' },
  { id: 'worship', name: 'Adoration', description: 'Apprendre la prière et l adoration' },
  { id: 'duas', name: 'Duas quotidiennes', description: 'Supplications pour la vie quotidienne' },
];

export const LESSONS_FR: Lesson[] = [
  {
    id: 'pillars-of-islam',
    title: 'Cinq piliers de l Islam',
    category: 'basics',
    content: `Les cinq piliers de l'Islam sont le fondement de la vie musulmane :

1. Shahada (Foi) : Déclaration qu'il n'y a de dieu qu'Allah, et que Muhammad est Son messager.

2. Salah (Prière) : Accomplir les cinq prières quotidiennes en direction de La Mecque.

3. Zakat (Charité) : Donner une partie de sa richesse aux nécessiteux.

4. Sawm (Jeûne) : Jeûner pendant le mois de Ramadan de l'aube au coucher du soleil.

5. Hajj (Pèlerinage) : Faire un pèlerinage à La Mecque au moins une fois dans sa vie si possible.

Ces piliers représentent les pratiques essentielles que tout musulman devrait suivre.`,
    quiz: [
      {
        question: "Combien y a-t-il de piliers de l Islam ?",
        options: ['Trois', 'Cinq', 'Sept', 'Dix'],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: 'wudu',
    title: 'Comment effectuer le wudu',
    category: 'worship',
    content: `Le wudu (ablution) est le lavage rituel islamique avant la prière. Voici les étapes :

1. Faire l'intention (niyyah) dans votre coeur d'effectuer le wudu pour la purification.

2. Dire "Bismillah" (Au nom d'Allah).

3. Laver les deux mains jusqu'aux poignets trois fois.

4. Se rincer la bouche trois fois.

5. Se rincer le nez trois fois.

6. Laver le visage trois fois du front au menton et d'oreille à oreille.

7. Laver le bras droit jusqu'au coude trois fois, puis le bras gauche.

8. Essuyer la tête avec les mains mouillées une fois.

9. Essuyer les oreilles à l'intérieur et à l'extérieur une fois.

10. Laver le pied droit jusqu'à la cheville trois fois, puis le pied gauche.

Votre wudu est maintenant complet et vous êtes prêt pour la prière.`,
  },
];

export const CATEGORIES_SW: Category[] = [
  { id: 'basics', name: 'Misingi ya Kiislamu', description: 'Dhana za msingi za Uislamu' },
  { id: 'worship', name: 'Ibada', description: 'Jifunze kuhusu sala na ibada' },
  { id: 'duas', name: 'Dua za Kila Siku', description: 'Maombi kwa maisha ya kila siku' },
];

export const LESSONS_SW: Lesson[] = [
  {
    id: 'pillars-of-islam',
    title: 'Nguzo Tano za Uislamu',
    category: 'basics',
    content: `Nguzo Tano za Uislamu ni msingi wa maisha ya Kiislamu:

1. Shahada (Imani): Kushuhudia kuwa hakuna mungu isipokuwa Allah, na Muhammad ni Mtume wake.

2. Salah (Sala): Kuswali sala tano za kila siku kuelekea Makka.

3. Zakat (Sadaka): Kutoa sehemu ya mali yako kwa wanaohitaji.

4. Sawm (Kufunga): Kufunga wakati wa mwezi wa Ramadhan kutoka alfajiri hadi magharibi.

5. Hajj (Hija): Kufanya ibada ya hija huko Makka angalau mara moja maishani ikiwa unaweza.

Nguzo hizi zinawakilisha matendo muhimu ambayo kila Mwislamu anapaswa kufuata.`,
    quiz: [
      {
        question: 'Kuna nguzo ngapi za Uislamu?',
        options: ['Tatu', 'Tano', 'Saba', 'Kumi'],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: 'wudu',
    title: 'Jinsi ya Kufanya Wudhu',
    category: 'worship',
    content: `Wudhu (utakaso) ni desturi ya Kiislamu ya kunawa kabla ya sala. Hapa kuna hatua:

1. Fanya nia (niyyah) moyoni mwako ya kufanya wudhu kwa ajili ya utakaso.

2. Sema "Bismillah" (Kwa jina la Allah).

3. Osha mikono yote miwili hadi kwenye vifundo vya mikono mara tatu.

4. Sukutua mdomo mara tatu.

5. Sukutua pua mara tatu.

6. Osha uso mara tatu kutoka kipajini hadi kidevu na kutoka sikio hadi sikio.

7. Osha mkono wa kulia hadi kwenye kiko mara tatu, kisha mkono wa kushoto.

8. Pangusa kichwa kwa mikono yenye maji mara moja.

9. Pangusa masikio ndani na nje mara moja.

10. Osha mguu wa kulia hadi kwenye kifundo cha mguu mara tatu, kisha mguu wa kushoto.

Wudhu yako sasa imekamilika na uko tayari kwa sala.`,
  },
];

export const getCategories = (lang: string): Category[] => {
  switch (lang) {
    case 'fr':
      return CATEGORIES_FR;
    case 'sw':
      return CATEGORIES_SW;
    default:
      return CATEGORIES_EN;
  }
};

export const getLessons = (lang: string): Lesson[] => {
  switch (lang) {
    case 'fr':
      return LESSONS_FR;
    case 'sw':
      return LESSONS_SW;
    default:
      return LESSONS_EN;
  }
};

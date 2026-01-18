<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TranslationCatalog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuranController extends Controller
{
    public function getTranslationCatalog(): JsonResponse
    {
        $catalogs = TranslationCatalog::all();

        return response()->json([
            'success' => true,
            'data' => $catalogs->map(function ($catalog) {
                return [
                    'identifier' => $catalog->identifier,
                    'language' => $catalog->language,
                    'translatorName' => $catalog->translator_name,
                    'sourceUrl' => $catalog->source_url,
                ];
            }),
        ]);
    }

    public function getTranslation(Request $request): JsonResponse
    {
        $lang = $request->input('lang', 'en');
        $surah = $request->input('surah');

        if (!$surah || $surah < 1 || $surah > 114) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid surah number. Must be between 1 and 114.',
            ], 400);
        }

        if (!in_array($lang, ['en', 'fr', 'sw'])) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid language. Supported: en, fr, sw',
            ], 400);
        }

        // For MVP, return sample translations for Surah 1
        $translations = $this->getSampleTranslations($lang, $surah);

        return response()->json([
            'success' => true,
            'data' => $translations,
        ]);
    }

    private function getSampleTranslations(string $lang, int $surah): array
    {
        if ($surah !== 1) {
            return [];
        }

        $translations = [
            'en' => [
                '1:1' => 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
                '1:2' => 'All praise is due to Allah, Lord of the worlds.',
                '1:3' => 'The Entirely Merciful, the Especially Merciful,',
                '1:4' => 'Sovereign of the Day of Recompense.',
                '1:5' => 'It is You we worship and You we ask for help.',
                '1:6' => 'Guide us to the straight path.',
                '1:7' => 'The path of those upon whom You have bestowed favor, not of those who have evoked Your anger or of those who are astray.',
            ],
            'fr' => [
                '1:1' => 'Au nom d\'Allah, le Tout Miséricordieux, le Très Miséricordieux.',
                '1:2' => 'Louange à Allah, Seigneur de l\'univers.',
                '1:3' => 'Le Tout Miséricordieux, le Très Miséricordieux,',
                '1:4' => 'Maître du Jour de la rétribution.',
                '1:5' => 'C\'est Toi que nous adorons, et c\'est Toi dont nous implorons secours.',
                '1:6' => 'Guide-nous dans le droit chemin.',
                '1:7' => 'Le chemin de ceux que Tu as comblés de faveurs, non pas de ceux qui ont encouru Ta colère, ni des égarés.',
            ],
            'sw' => [
                '1:1' => 'Kwa jina la Mwenyezi Mungu, Mwingi wa Rehema, Mwenye Kurehemu.',
                '1:2' => 'Sifa njema zote ni za Mwenyezi Mungu, Mola Mlezi wa walimwengu wote.',
                '1:3' => 'Mwingi wa Rehema, Mwenye kurehemu.',
                '1:4' => 'Mfalme wa siku ya malipo.',
                '1:5' => 'Wewe tu tunaye abudu, na Wewe tu tunaye omba msaada.',
                '1:6' => 'Tuongoze njia iliyo nyooka.',
                '1:7' => 'Njia ya ulio waneemesha, siyo ya walio kasirikiwa wala walio potea.',
            ],
        ];

        return $translations[$lang] ?? [];
    }
}


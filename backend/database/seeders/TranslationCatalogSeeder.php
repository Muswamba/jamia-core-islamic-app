<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TranslationCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $translations = [
            [
                'identifier' => 'en.sahih',
                'language' => 'en',
                'translator_name' => 'Sahih International',
                'source_url' => 'https://tanzil.net',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'identifier' => 'en.pickthall',
                'language' => 'en',
                'translator_name' => 'Mohammed Marmaduke William Pickthall',
                'source_url' => 'https://tanzil.net',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'identifier' => 'ar.jalalayn',
                'language' => 'ar',
                'translator_name' => 'Tafsir al-Jalalayn',
                'source_url' => 'https://tanzil.net',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('translation_catalogs')->insert($translations);
    }
}

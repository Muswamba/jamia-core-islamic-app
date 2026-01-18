<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LearnPackSeeder extends Seeder
{
    public function run(): void
    {
        $learnPacks = [
            [
                'lang' => 'en',
                'version' => '1.0',
                'categories' => [
                    ['id' => 'basics', 'name' => 'Islamic Basics', 'description' => 'Fundamental concepts of Islam'],
                    ['id' => 'worship', 'name' => 'Worship', 'description' => 'Learn about prayer and worship'],
                    ['id' => 'duas', 'name' => 'Daily Duas', 'description' => 'Supplications for daily life'],
                ],
                'lessons' => [
                    [
                        'id' => 'pillars-of-islam',
                        'title' => 'Five Pillars of Islam',
                        'category' => 'basics',
                        'content' => 'The Five Pillars are Shahada, Salah, Zakat, Sawm, and Hajj.',
                        'quiz' => [
                            [
                                'question' => 'How many pillars of Islam are there?',
                                'options' => ['Three', 'Five', 'Seven', 'Ten'],
                                'correctAnswer' => 1,
                            ],
                        ],
                    ],
                    [
                        'id' => 'wudu',
                        'title' => 'How to Perform Wudu',
                        'category' => 'worship',
                        'content' => 'Wudu is the ritual washing before prayer: hands, mouth, nose, face, arms, head, and feet.',
                        'quiz' => [
                            [
                                'question' => 'How many times should you wash your hands in wudu?',
                                'options' => ['Once', 'Twice', 'Three times', 'Four times'],
                                'correctAnswer' => 2,
                            ],
                        ],
                    ],
                ],
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'lang' => 'fr',
                'version' => '1.0',
                'categories' => [
                    ['id' => 'basics', 'name' => 'Bases de l Islam', 'description' => 'Concepts fondamentaux de l Islam'],
                    ['id' => 'worship', 'name' => 'Adoration', 'description' => 'Apprendre la priere et l adoration'],
                    ['id' => 'duas', 'name' => 'Duas Quotidiennes', 'description' => 'Supplications pour la vie quotidienne'],
                ],
                'lessons' => [
                    [
                        'id' => 'pillars-of-islam',
                        'title' => 'Cinq Piliers de l Islam',
                        'category' => 'basics',
                        'content' => 'Les cinq piliers sont: Shahada, Salah, Zakat, Sawm et Hajj.',
                        'quiz' => [
                            [
                                'question' => 'Combien y a-t-il de piliers de l Islam?',
                                'options' => ['Trois', 'Cinq', 'Sept', 'Dix'],
                                'correctAnswer' => 1,
                            ],
                        ],
                    ],
                    [
                        'id' => 'wudu',
                        'title' => 'Comment effectuer le wudu',
                        'category' => 'worship',
                        'content' => 'Le wudu est le lavage rituel avant la priere: mains, bouche, nez, visage, bras, tete, puis pieds.',
                    ],
                ],
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'lang' => 'sw',
                'version' => '1.0',
                'categories' => [
                    ['id' => 'basics', 'name' => 'Misingi ya Kiislamu', 'description' => 'Dhana za msingi za Uislamu'],
                    ['id' => 'worship', 'name' => 'Ibada', 'description' => 'Jifunze kuhusu sala na ibada'],
                    ['id' => 'duas', 'name' => 'Dua za Kila Siku', 'description' => 'Maombi kwa maisha ya kila siku'],
                ],
                'lessons' => [
                    [
                        'id' => 'pillars-of-islam',
                        'title' => 'Nguzo Tano za Uislamu',
                        'category' => 'basics',
                        'content' => 'Nguzo tano ni: Shahada, Sala, Zakat, Sawm na Hajj.',
                        'quiz' => [
                            [
                                'question' => 'Kuna nguzo ngapi za Uislamu?',
                                'options' => ['Tatu', 'Tano', 'Saba', 'Kumi'],
                                'correctAnswer' => 1,
                            ],
                        ],
                    ],
                    [
                        'id' => 'wudu',
                        'title' => 'Jinsi ya Kufanya Wudhu',
                        'category' => 'worship',
                        'content' => 'Wudhu ni utaratibu wa kunawa kabla ya sala: mikono, mdomo, pua, uso, mikono, kichwa, kisha miguu.',
                    ],
                ],
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('learn_packs')->insert($learnPacks);
    }
}

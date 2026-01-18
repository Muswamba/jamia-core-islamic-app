<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LearnPack;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContentController extends Controller
{
    public function getLearnContent(Request $request): JsonResponse
    {
        $lang = $request->input('lang', 'en');

        if (!in_array($lang, ['en', 'fr', 'sw'])) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid language. Supported: en, fr, sw',
            ], 400);
        }

        $learnPack = LearnPack::where('lang', $lang)
            ->orderBy('updated_at', 'desc')
            ->first();

        if (!$learnPack) {
            return response()->json([
                'success' => false,
                'message' => 'Content not found for this language',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'lang' => $learnPack->lang,
                'version' => $learnPack->version,
                'categories' => $learnPack->categories,
                'lessons' => $learnPack->lessons,
                'updated_at' => $learnPack->updated_at,
            ],
        ]);
    }
}

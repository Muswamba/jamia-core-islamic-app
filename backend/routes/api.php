<?php

use App\Http\Controllers\Api\AIController;
use App\Http\Controllers\Api\ContentController;
use App\Http\Controllers\Api\QuranController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // Content endpoints
    Route::get('content/learn', [ContentController::class, 'getLearnContent']);

    // Quran endpoints
    Route::get('quran/translations/catalog', [QuranController::class, 'getTranslationCatalog']);
    Route::get('quran/translation', [QuranController::class, 'getTranslation']);

    // AI endpoints
    Route::post('ai/chat', [AIController::class, 'chat']);
    Route::post('ai/explain-ayah', [AIController::class, 'explainAyah']);
});

// Health check
Route::get('health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
    ]);
});

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AIChatRequest;
use App\Http\Requests\AIExplainAyahRequest;
use App\Jobs\LogAIRequestJob;
use App\Services\OpenAIService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;

class AIController extends Controller
{
    private OpenAIService $openAIService;

    public function __construct(OpenAIService $openAIService)
    {
        $this->openAIService = $openAIService;
    }

    public function chat(AIChatRequest $request): JsonResponse
    {
        $deviceId = $request->input('device_id');
        $message = $request->input('message');

        // Rate limiting per device
        $key = 'ai_chat:' . $deviceId;
        $maxAttempts = config('services.ai.rate_limit_per_device', 10);
        $decayMinutes = config('services.ai.rate_limit_decay_minutes', 60);

        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            $seconds = RateLimiter::availableIn($key);

            LogAIRequestJob::dispatch([
                'device_id' => $deviceId,
                'endpoint' => 'chat',
                'allowed' => false,
                'reason' => 'Rate limit exceeded',
                'request_data' => ['message' => substr($message, 0, 100)],
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Rate limit exceeded. Please try again in ' . ceil($seconds / 60) . ' minutes.',
            ], 429);
        }

        RateLimiter::hit($key, $decayMinutes * 60);

        $result = $this->openAIService->chat($message, $deviceId);

        LogAIRequestJob::dispatch([
            'device_id' => $deviceId,
            'endpoint' => 'chat',
            'allowed' => $result['success'] ?? false,
            'reason' => $result['message'] ?? null,
            'request_data' => ['message' => substr($message, 0, 100)],
        ]);

        return response()->json($result);
    }

    public function explainAyah(AIExplainAyahRequest $request): JsonResponse
    {
        $deviceId = $request->input('device_id');
        $surah = $request->input('surah');
        $ayah = $request->input('ayah');
        $text = $request->input('text');

        // Rate limiting per device
        $key = 'ai_explain:' . $deviceId;
        $maxAttempts = config('services.ai.rate_limit_per_device', 10);
        $decayMinutes = config('services.ai.rate_limit_decay_minutes', 60);

        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            $seconds = RateLimiter::availableIn($key);

            LogAIRequestJob::dispatch([
                'device_id' => $deviceId,
                'endpoint' => 'explain_ayah',
                'allowed' => false,
                'reason' => 'Rate limit exceeded',
                'request_data' => ['surah' => $surah, 'ayah' => $ayah],
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Rate limit exceeded. Please try again in ' . ceil($seconds / 60) . ' minutes.',
            ], 429);
        }

        RateLimiter::hit($key, $decayMinutes * 60);

        $result = $this->openAIService->explainAyah($surah, $ayah, $text, $deviceId);

        LogAIRequestJob::dispatch([
            'device_id' => $deviceId,
            'endpoint' => 'explain_ayah',
            'allowed' => $result['success'] ?? false,
            'reason' => $result['message'] ?? null,
            'request_data' => ['surah' => $surah, 'ayah' => $ayah],
        ]);

        return response()->json($result);
    }
}

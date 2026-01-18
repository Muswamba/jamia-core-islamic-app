<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenAIService
{
    private string $apiKey;
    private string $baseUrl = 'https://api.openai.com/v1';
    private AIGuardrailService $guardrailService;

    public function __construct(AIGuardrailService $guardrailService)
    {
        $this->apiKey = config('services.openai.api_key');
        $this->guardrailService = $guardrailService;
    }

    public function chat(string $message, string $deviceId): array
    {
        try {
            // Check guardrails
            $guardrailCheck = $this->guardrailService->isRequestAllowed($message);

            if (!$guardrailCheck['allowed']) {
                return [
                    'success' => false,
                    'blocked' => true,
                    'message' => $guardrailCheck['reason'],
                    'disclaimer' => $this->guardrailService->getDisclaimerText(),
                ];
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(30)->post($this->baseUrl . '/chat/completions', [
                'model' => 'gpt-3.5-turbo',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => $this->guardrailService->getSystemPrompt(),
                    ],
                    [
                        'role' => 'user',
                        'content' => $message,
                    ],
                ],
                'max_tokens' => 500,
                'temperature' => 0.7,
            ]);

            if (!$response->successful()) {
                Log::error('OpenAI API error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return [
                    'success' => false,
                    'message' => 'Failed to get response from AI service',
                    'disclaimer' => $this->guardrailService->getDisclaimerText(),
                ];
            }

            $data = $response->json();
            $aiResponse = $data['choices'][0]['message']['content'] ?? '';

            return [
                'success' => true,
                'data' => [
                    'response' => $aiResponse,
                ],
                'disclaimer' => $this->guardrailService->getDisclaimerText(),
            ];

        } catch (\Exception $e) {
            Log::error('OpenAI service exception', [
                'message' => $e->getMessage(),
                'device_id' => $deviceId,
            ]);

            return [
                'success' => false,
                'message' => 'An error occurred while processing your request',
                'disclaimer' => $this->guardrailService->getDisclaimerText(),
            ];
        }
    }

    public function explainAyah(int $surah, int $ayah, string $text, string $deviceId): array
    {
        try {
            $message = "Please provide a brief educational explanation of this Quranic verse:\n\nSurah {$surah}, Ayah {$ayah}:\n{$text}\n\nProvide historical context, general meaning, and key lessons. Remember: this is educational only, not a religious ruling.";

            return $this->chat($message, $deviceId);

        } catch (\Exception $e) {
            Log::error('OpenAI explainAyah exception', [
                'message' => $e->getMessage(),
                'device_id' => $deviceId,
            ]);

            return [
                'success' => false,
                'message' => 'An error occurred while processing your request',
                'disclaimer' => $this->guardrailService->getDisclaimerText(),
            ];
        }
    }
}

<?php

namespace App\Services;

class AIGuardrailService
{
    private array $forbiddenKeywords = [
        'fatwa',
        'fatwas',
        'religious ruling',
        'legal ruling',
        'islamic law ruling',
        'halal or haram',
        'permissible or not',
        'allowed or forbidden',
        'is this halal',
        'is this haram',
        'give me a fatwa',
        'issue a fatwa',
    ];

    public function isRequestAllowed(string $message): array
    {
        $lowerMessage = strtolower($message);

        foreach ($this->forbiddenKeywords as $keyword) {
            if (strpos($lowerMessage, $keyword) !== false) {
                return [
                    'allowed' => false,
                    'reason' => 'Request appears to be asking for a religious ruling (fatwa). This AI is for educational purposes only. Please consult qualified Islamic scholars for religious rulings.',
                ];
            }
        }

        // Check for direct questions about specific religious rulings
        if (preg_match('/\b(is|are)\s+\w+\s+(halal|haram|permissible|forbidden|allowed)\b/i', $message)) {
            return [
                'allowed' => false,
                'reason' => 'Specific questions about halal/haram require consultation with qualified scholars. This AI cannot provide religious rulings.',
            ];
        }

        return [
            'allowed' => true,
            'reason' => null,
        ];
    }

    public function getSystemPrompt(): string
    {
        return "You are an educational assistant for Muslims learning about Islam. Your role is strictly educational and informational.

CRITICAL RULES:
1. NEVER provide religious rulings (fatwas) or legal opinions
2. NEVER answer questions about whether specific things are halal or haram
3. NEVER answer questions about permissibility of specific actions
4. If asked for a fatwa or religious ruling, politely decline and encourage the user to consult qualified Islamic scholars
5. Focus on explaining concepts, history, practices, and general Islamic knowledge
6. When discussing Islamic practices, present them as general information, not personal rulings
7. Always encourage users to verify important religious matters with qualified scholars

You can help with:
- Explaining Islamic concepts and terminology
- Discussing the history of Islam
- Explaining how to perform worship practices (wudu, salah, etc.)
- Sharing general knowledge about the Quran and Hadith
- Answering questions about Islamic culture and traditions
- Providing educational context about Islamic teachings

Always be respectful, accurate, and humble. Make it clear that for specific religious guidance, users should consult qualified scholars.";
    }

    public function getDisclaimerText(): string
    {
        return "This AI assistant is for educational purposes only. It cannot provide religious rulings (fatwas) or legal opinions. For religious guidance, please consult qualified Islamic scholars.";
    }
}

<?php

return [
    'openai' => [
        'api_key' => env('OPENAI_API_KEY'),
    ],

    'ai' => [
        'rate_limit_per_device' => env('RATE_LIMIT_AI_PER_DEVICE', 10),
        'rate_limit_decay_minutes' => env('RATE_LIMIT_AI_DECAY_MINUTES', 60),
    ],
];

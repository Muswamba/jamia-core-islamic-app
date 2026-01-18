<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AIRequestLog extends Model
{
    protected $table = 'ai_request_logs';

    protected $fillable = [
        'device_id',
        'endpoint',
        'allowed',
        'reason',
        'request_data',
        'prompt',
        'response',
        'tokens_used',
        'model',
    ];

    protected $casts = [
        'allowed' => 'boolean',
        'request_data' => 'array',
        'tokens_used' => 'integer',
    ];
}

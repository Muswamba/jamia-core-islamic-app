<?php

namespace App\Jobs;

use App\Models\AIRequestLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class LogAIRequestJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private array $logData;

    public function __construct(array $logData)
    {
        $this->logData = $logData;
    }

    public function handle(): void
    {
        AIRequestLog::create([
            'device_id' => $this->logData['device_id'],
            'endpoint' => $this->logData['endpoint'],
            'allowed' => $this->logData['allowed'],
            'reason' => $this->logData['reason'] ?? null,
            'request_data' => $this->logData['request_data'] ?? [],
            'created_at' => now(),
        ]);
    }
}

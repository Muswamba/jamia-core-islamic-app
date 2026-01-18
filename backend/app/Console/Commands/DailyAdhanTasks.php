<?php

namespace App\Console\Commands;

use App\Jobs\LogAIRequestJob;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class DailyAdhanTasks extends Command
{
    protected $signature = 'adhan:daily-tasks';
    protected $description = 'Run daily tasks for Adhan app (cleanup, maintenance, etc.)';

    public function handle(): int
    {
        $this->info('Running daily Adhan tasks...');

        // Example: Clean up old AI request logs (older than 90 days)
        try {
            $deletedCount = \App\Models\AIRequestLog::where('created_at', '<', now()->subDays(90))->delete();
            $this->info("Cleaned up {$deletedCount} old AI request logs");
        } catch (\Exception $e) {
            Log::error('Error cleaning up AI logs: ' . $e->getMessage());
            $this->error('Error cleaning up AI logs');
        }

        // Example: Future tasks could include:
        // - Scheduling daily notification preparation
        // - Updating prayer times cache
        // - Generating daily content

        $this->info('Daily tasks completed successfully');

        return 0;
    }
}

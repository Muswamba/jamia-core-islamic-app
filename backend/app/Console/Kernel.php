<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected $commands = [
        Commands\DailyAdhanTasks::class,
    ];

    protected function schedule(Schedule $schedule): void
    {
        // Run daily tasks every day at 2:00 AM
        $schedule->command('adhan:daily-tasks')
            ->dailyAt('02:00')
            ->withoutOverlapping()
            ->onOneServer();
    }

    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}

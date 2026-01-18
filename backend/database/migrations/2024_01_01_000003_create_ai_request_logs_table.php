<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_request_logs', function (Blueprint $table) {
            $table->id();
            $table->string('device_id', 100)->index();
            $table->string('endpoint', 100);
            $table->boolean('allowed')->default(true);
            $table->string('reason')->nullable();
            $table->json('request_data')->nullable();
            $table->text('prompt')->nullable();
            $table->text('response')->nullable();
            $table->integer('tokens_used')->nullable();
            $table->string('model', 50)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_request_logs');
    }
};

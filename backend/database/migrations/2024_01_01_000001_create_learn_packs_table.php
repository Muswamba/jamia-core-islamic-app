<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('learn_packs', function (Blueprint $table) {
            $table->id();
            $table->string('lang', 5)->index();
            $table->string('version', 20)->default('1.0');
            $table->json('categories');
            $table->json('lessons');
            $table->timestamps();

            $table->unique(['lang', 'version']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('learn_packs');
    }
};

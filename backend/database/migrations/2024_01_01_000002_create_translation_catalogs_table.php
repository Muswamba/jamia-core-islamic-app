<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('translation_catalogs', function (Blueprint $table) {
            $table->id();
            $table->string('identifier', 100)->unique();
            $table->string('language', 50);
            $table->string('translator_name', 200);
            $table->string('source_url')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('translation_catalogs');
    }
};

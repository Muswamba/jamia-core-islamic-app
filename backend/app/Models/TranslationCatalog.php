<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TranslationCatalog extends Model
{
    protected $table = 'translation_catalogs';

    protected $fillable = [
        'identifier',
        'language',
        'translator_name',
        'source_url',
    ];
}

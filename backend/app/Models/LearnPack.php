<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LearnPack extends Model
{
    protected $table = 'learn_packs';

    protected $fillable = [
        'lang',
        'version',
        'categories',
        'lessons',
    ];

    protected $casts = [
        'categories' => 'array',
        'lessons' => 'array',
    ];
}

<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AIExplainAyahRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'device_id' => 'required|string|max:255',
            'surah' => 'required|integer|min:1|max:114',
            'ayah' => 'required|integer|min:1',
            'text' => 'required|string|max:5000',
        ];
    }
}

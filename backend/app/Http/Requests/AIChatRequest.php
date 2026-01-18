<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AIChatRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'device_id' => 'required|string|max:255',
            'message' => 'required|string|max:1000',
        ];
    }
}

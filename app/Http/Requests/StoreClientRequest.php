<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreClientRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'nom' => ['required', 'string', 'max:255'],
            'cin' => ['nullable', 'string', 'regex:/^[A-Z]{1,2}\d{5,6}$/'],
            'telephone' => ['nullable', 'string', 'regex:/^(05|06|07)\d{8}$/'],
            'email' => ['nullable', 'email', 'max:255'],
            'mode_paiement_prefere' => ['nullable', 'string'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'cin.regex' => 'The CIN format is invalid (e.g., AB123456).',
            'telephone.regex' => 'The telephone must be a valid Moroccan number (starting with 05, 06, or 07).',
        ];
    }
}

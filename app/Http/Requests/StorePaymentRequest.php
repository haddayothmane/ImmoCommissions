<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'client_id'     => 'required|uuid|exists:clients,id',
            'contract_id'   => 'nullable|uuid|exists:contracts,id',
            'milestone_id'  => 'nullable|uuid|exists:payment_milestones,id',
            'montant'       => 'required|numeric|min:0.01',
            'mode_paiement' => 'required|in:cheque,virement,especes,cash,effet',
            'date_paiement' => 'required|date',
            'reference'     => 'nullable|string|max:100',
            'description'   => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'montant.required'       => 'Le montant est obligatoire.',
            'montant.min'            => 'Le montant doit être supérieur à 0.',
            'mode_paiement.required' => 'Le mode de règlement est obligatoire.',
            'mode_paiement.in'       => 'Mode de règlement invalide.',
            'date_paiement.required' => 'La date de paiement est obligatoire.',
        ];
    }
}

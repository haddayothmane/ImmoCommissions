<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreContractRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'client_id'                   => 'required|uuid|exists:clients,id',
            'target_id'                   => 'required|string',
            'target_type'                 => 'required|in:App\Models\Terrain,App\Models\Immeuble,App\Models\Appartement',
            'total_sale_price'            => 'required|numeric|min:1',
            'status'                      => 'required|in:draft,active,completed,cancelled',
            'payment_config.mode'         => 'sometimes|in:cheque,virement,especes,cash',
            'payment_config.type'         => 'sometimes|in:totalite,tranches',
            'payment_config.installments' => 'sometimes|integer|min:1|max:120',
            'payment_config.interval'     => 'sometimes|integer|min:1',
            // Custom schedule rows (when type = tranches and user defines them manually)
            'schedules'                   => 'nullable|array',
            'schedules.*.label'           => 'required_with:schedules|string|max:255',
            'schedules.*.amount'          => 'required_with:schedules|numeric|min:0',
            'schedules.*.due_date'        => 'required_with:schedules|date',
            'schedules.*.description'     => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'client_id.required'          => 'Le client est obligatoire.',
            'target_id.required'          => 'Le bien est obligatoire.',
            'total_sale_price.required'   => 'Le prix total est obligatoire.',
            'total_sale_price.min'        => 'Le prix total doit être supérieur à 0.',
        ];
    }
}

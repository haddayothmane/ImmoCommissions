<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\BelongsToAgency;
use App\Traits\HasUuid;

class Paiement extends Model
{
    use HasFactory, BelongsToAgency, HasUuid;

    protected $fillable = [
        'agence_id',
        'created_by',
        'appartement_id',
        'contract_id',
        'milestone_id',
        'client_id',
        'montant',
        'date_paiement',
        'echeance',
        'mode_reglement',
        'reference',
        'description',
        'statut',
    ];

    public function contract()
    {
        return $this->belongsTo(Contract::class);
    }

    public function milestone()
    {
        return $this->belongsTo(PaymentMilestone::class);
    }

    public function appartement()
    {
        return $this->belongsTo(Appartement::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }
}

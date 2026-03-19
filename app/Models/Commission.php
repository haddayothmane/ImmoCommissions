<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\BelongsToAgency;
use App\Traits\HasUuid;

class Commission extends Model
{
    use HasFactory, BelongsToAgency, HasUuid;

    protected $fillable = [
        'agence_id',
        'created_by',
        'appartement_id',
        'agent_id',
        'client_id',
        'pourcentage',
        'montant_total',
        'montant_paye',
        'montant_restant',
        'prix_vente',
        'statut',
    ];

    public function appartement()
    {
        return $this->belongsTo(Appartement::class);
    }

    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function payments()
    {
        return $this->hasMany(CommissionPayment::class);
    }
}

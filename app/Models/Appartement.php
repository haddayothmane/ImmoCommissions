<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\BelongsToAgency;

class Appartement extends Model
{
    use HasFactory, BelongsToAgency;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'agence_id',
        'immeuble_id',
        'created_by',
        'client_id',
        'numero',
        'etage',
        'surface',
        'chambres',
        'prix_total',
        'statut',
        'description',
        'documents',
    ];

    public function immeuble()
    {
        return $this->belongsTo(Immeuble::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function paiements()
    {
        return $this->hasMany(Paiement::class);
    }

    public function commissions()
    {
        return $this->hasMany(Commission::class);
    }

    public function contracts()
    {
        return $this->morphMany(Contract::class, 'target');
    }
}

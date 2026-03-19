<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\BelongsToAgency;
use App\Traits\HasUuid;

class Client extends Model
{
    use HasFactory, BelongsToAgency, HasUuid;

    protected $fillable = [
        'agence_id',
        'created_by',
        'nom',
        'cin',
        'telephone',
        'email',
        'mode_paiement_prefere',
    ];

    public function contracts()
    {
        return $this->hasMany(Contract::class);
    }

    public function appartements()
    {
        return $this->hasMany(Appartement::class);
    }

    public function paiements()
    {
        return $this->hasMany(Paiement::class);
    }
}

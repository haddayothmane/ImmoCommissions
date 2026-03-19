<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\BelongsToAgency;

class Immeuble extends Model
{
    use HasFactory, BelongsToAgency;

    public $incrementing = false;
    protected $keyType = 'string';
    protected $appends = ['created_by_name'];

    protected $fillable = [
        'agence_id',
        'terrain_id',
        'created_by',
        'nom',
        'nombre_etages',
        'statut',
        'date_debut',
        'date_livraison',
        'description',
        'documents',
    ];

    /**
     * The user who created this immeuble.
     */
    public function creator()
    {
        return $this->belongsTo(\App\Models\User::class, "created_by");
    }

    /**
     * Accessor for created_by_name.
     */
    public function getCreatedByNameAttribute()
    {
        return $this->creator ? $this->creator->name : null;
    }

    public function terrain()
    {
        return $this->belongsTo(Terrain::class);
    }

    public function appartements()
    {
        return $this->hasMany(Appartement::class);
    }

    public function contracts()
    {
        return $this->morphMany(Contract::class, 'target');
    }
}

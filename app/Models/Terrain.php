<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\BelongsToAgency;

class Terrain extends Model
{
    use HasFactory, BelongsToAgency;

    public $incrementing = false;
    protected $keyType = "string";
    protected $appends = ["created_by_name"];

    protected $fillable = [
        "agence_id",
        "created_by",
        "nom_projet",
        "ville",
        "quartier",
        "surface",
        "prix_achat",
        "statut",
        "created_at",
        "created_by_name",
        // New optional fields
        "description",
        "documents",
    ];

    /**
     * The user who created this terrain.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function creator()
    {
        return $this->belongsTo(\App\Models\User::class, "created_by");
    }

    /**
     * Convenience accessor to expose the creator's full name.
     *
     * @return string|null
     */
    public function getCreatedByNameAttribute()
    {
        return $this->creator ? $this->creator->name : null;
    }

    public function immeubles()
    {
        return $this->hasMany(Immeuble::class);
    }

    public function contracts()
    {
        return $this->morphMany(Contract::class, 'target');
    }
}

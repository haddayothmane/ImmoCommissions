<?php

namespace App\Traits;

use App\Scopes\TenantScope;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

trait BelongsToAgency
{
    /**
     * The "booted" method of the model.
     */
    protected static function bootBelongsToAgency(): void
    {
        static::addGlobalScope(new TenantScope());

        static::creating(function ($model) {
            // Ensure ID is UUID if not set
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }

            if (Auth::check()) {
                if (empty($model->agence_id)) {
                    $model->agence_id = Auth::user()->agence_id;
                }
                if (empty($model->created_by)) {
                    $model->created_by = Auth::id();
                }
            }
        });
    }

    /**
     * Get the agency that owns the model.
     */
    public function agency()
    {
        return $this->belongsTo(\App\Models\Agency::class, 'agence_id');
    }

    /**
     * Get the user who created the model.
     */
    public function creator()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }
}

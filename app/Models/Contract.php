<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\BelongsToAgency;
use App\Traits\HasUuid;

class Contract extends Model
{
    use HasFactory, BelongsToAgency, HasUuid;

    protected $fillable = [
        'agence_id',
        'client_id',
        'created_by',
        'target_id',
        'target_type',
        'total_sale_price',
        'status',
        'payment_mode',
        'payment_type',
        'installments',
        'interval_days',
        'delivery_date',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the target asset (Terrain, Immeuble, or Appartement).
     */
    public function target()
    {
        return $this->morphTo();
    }

    public function milestones()
    {
        return $this->hasMany(PaymentMilestone::class);
    }

    public function payments()
    {
        return $this->hasMany(Paiement::class);
    }
}

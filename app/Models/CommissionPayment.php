<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\BelongsToAgency;
use App\Traits\HasUuid;

class CommissionPayment extends Model
{
    use HasFactory, BelongsToAgency, HasUuid;

    protected $fillable = [
        'agence_id',
        'commission_id',
        'montant',
        'date_paiement',
        'mode_paiement',
        'reference',
        'created_by',
    ];

    public function commission()
    {
        return $this->belongsTo(Commission::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}

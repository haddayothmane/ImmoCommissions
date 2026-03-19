<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\HasUuid;

class PaymentMilestone extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'contract_id',
        'label',
        'percentage',
        'amount',
        'due_date',
        'status',
    ];

    public function contract()
    {
        return $this->belongsTo(Contract::class);
    }

    public function payments()
    {
        return $this->hasMany(Paiement::class, 'milestone_id');
    }
}

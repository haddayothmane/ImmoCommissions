<?php

namespace App\Services;

use App\Models\Commission;
use App\Models\CommissionPayment;
use App\Models\Appartement;
use App\Models\Contract;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class CommissionService
{
    /**
     * Create a commission for an apartment sale.
     */
    public function createCommission(Appartement $appartement, Contract $contract)
    {
        // Default rate could be from agency settings, here we use a default of 2%
        $rate = 2.0; 
        $salePrice = $contract->total_sale_price;
        $amount = ($salePrice * $rate) / 100;

        return Commission::create([
            'agence_id'       => $appartement->agence_id,
            'created_by'      => $contract->created_by,
            'appartement_id'  => $appartement->id,
            'agent_id'        => $contract->created_by, // Assuming creator is the agent
            'client_id'       => $contract->client_id,
            'pourcentage'     => $rate,
            'prix_vente'      => $salePrice,
            'montant_total'   => $amount,
            'montant_paye'    => 0,
            'montant_restant' => $amount,
            'statut'          => 'non payé',
        ]);
    }

    /**
     * Record a payment for a commission.
     */
    public function addPayment(Commission $commission, array $data)
    {
        return DB::transaction(function () use ($commission, $data) {
            $payment = CommissionPayment::create([
                'agence_id'     => $commission->agence_id,
                'commission_id' => $commission->id,
                'montant'       => $data['montant'],
                'date_paiement' => $data['date_paiement'],
                'mode_paiement' => $data['mode_paiement'],
                'reference'     => $data['reference'] ?? null,
                'created_by'    => Auth::id(),
            ]);

            $this->updateCommissionStatus($commission);

            return $payment;
        });
    }

    /**
     * Update commission totals and status.
     */
    public function updateCommissionStatus(Commission $commission)
    {
        $paid = $commission->payments()->sum('montant');
        $total = $commission->montant_total;
        $remaining = $total - $paid;

        $status = 'non payé';
        if ($paid >= $total) {
            $status = 'payé';
        } elseif ($paid > 0) {
            $status = 'partiellement payé';
        }

        $commission->update([
            'montant_paye'    => $paid,
            'montant_restant' => max(0, $remaining),
            'statut'          => $status
        ]);
    }
}

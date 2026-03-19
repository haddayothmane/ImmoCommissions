<?php

namespace App\Services;

use App\Models\Contract;
use App\Models\PaymentMilestone;
use Illuminate\Support\Facades\DB;
use App\Services\CommissionService;

class ContractService
{
    protected $commissionService;

    public function __construct(CommissionService $commissionService)
    {
        $this->commissionService = $commissionService;
    }

    /**
     * Create a new contract and generate payment milestones based on target type.
     */
    public function createContract(array $data)
    {
        return DB::transaction(function () use ($data) {
            $contract = Contract::create($data);

            // Sync asset status
            $this->syncAssetStatus($contract);

            // Generate milestones
            $this->generateMilestones($contract, $data['schedules'] ?? []);

            return $contract;
        });
    }

    /**
     * Update asset status based on contract status.
     */
    public function syncAssetStatus(Contract $contract)
    {
        $target = $contract->target;
        if (!$target) return;

        $newStatus = match ($contract->status) {
            'active' => 'reserve',
            'completed' => 'vendu',
            'cancelled' => 'disponible',
            default => $target->statut,
        };

        $target->update(['statut' => $newStatus]);
    }

    /**
     * Generate payment milestones based on the contract's payment configuration.
     */
    public function generateMilestones(Contract $contract, array $schedules = [])
    {
        $price        = (float) $contract->total_sale_price;
        $paymentType  = $contract->payment_type ?? 'tranches';
        $installments = max(1, (int) ($contract->installments ?? 1));
        $intervalDays = max(1, (int) ($contract->interval_days ?? 30));

        $milestones = [];

        if ($paymentType === 'totalite' || $paymentType === 'cash') {
            // Single lump-sum payment — due today (immediate)
            $milestones[] = [
                'label'      => 'Paiement en totalité',
                'percentage' => 100,
                'amount'     => $price,
                'due_date'   => now(),
            ];
        } elseif (!empty($schedules)) {
            // User provided custom manual schedules directly
            foreach ($schedules as $s) {
                $milestones[] = [
                    'label'      => $s['label'],
                    'percentage' => round(($s['amount'] / $price) * 100, 2),
                    'amount'     => $s['amount'],
                    'due_date'   => \Carbon\Carbon::parse($s['due_date']),
                ];
            }
        } else {
            // Equal installments
            $baseAmount  = round($price / $installments, 2);
            $remainder   = round($price - ($baseAmount * ($installments - 1)), 2);

            for ($i = 1; $i <= $installments; $i++) {
                $amount = ($i === $installments) ? $remainder : $baseAmount;
                $milestones[] = [
                    'label'      => "Tranche {$i} / {$installments}",
                    'percentage' => round(($amount / $price) * 100, 2),
                    'amount'     => $amount,
                    'due_date'   => now()->addDays($intervalDays * ($i - 1)),
                ];
            }
        }

        foreach ($milestones as $m) {
            PaymentMilestone::create([
                'contract_id' => $contract->id,
                'label'       => $m['label'],
                'percentage'  => $m['percentage'],
                'amount'      => $m['amount'],
                'status'      => 'pending',
                'due_date'    => $m['due_date'],
            ]);
        }
    }

    /**
     * Calculate global revenue cross asset types.
     */
    public function getGlobalAgencyRevenue()
    {
        return Contract::whereIn('status', ['active', 'completed'])
            ->sum('total_sale_price');
    }

    /**
     * Check if contract is fully paid and update status.
     */
    public function checkCompletion(Contract $contract)
    {
        $totalPaid = \App\Models\Paiement::where('contract_id', $contract->id)->sum('montant');
        if ($totalPaid >= $contract->total_sale_price && $contract->status !== 'completed') {
            $contract->update(['status' => 'completed']);
            $this->syncAssetStatus($contract);

            // Auto-create commission if target is an Appartement
            if ($contract->target_type === 'App\Models\Appartement') {
                $this->commissionService->createCommission($contract->target, $contract);
            }
        }
    }
}

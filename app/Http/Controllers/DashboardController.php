<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use App\Models\Paiement;
use App\Models\PaymentMilestone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function stats()
    {
        $agenceId = Auth::user()->agence_id;

        // All active/completed contracts for this agency
        $query = Contract::where('agence_id', $agenceId)
            ->whereIn('status', ['active', 'completed']);

        if (Auth::user()->hasRole('agent')) {
            $query->where('created_by', Auth::id());
        }

        $contracts = $query->get();

        $contractIds = $contracts->pluck('id');

        $totalSales    = $contracts->sum('total_sale_price');
        $totalPaid     = Paiement::whereIn('contract_id', $contractIds)->sum('montant');
        $remaining     = $totalSales - $totalPaid;

        // Late milestones details
        $lateMilestonesDetails = PaymentMilestone::with(['contract.client', 'contract.target'])
            ->whereIn('contract_id', $contractIds)
            ->where('status', 'pending')
            ->where('due_date', '<', now())
            ->get()
            ->map(function ($m) {
                return [
                    'id' => $m->id,
                    'contract_id' => $m->contract_id,
                    'label' => $m->label,
                    'due_date' => $m->due_date,
                    'amount' => (float) $m->amount,
                    'client_name' => $m->contract->client->nom ?? 'Inconnu',
                    'client_phone' => $m->contract->client->telephone ?? 'N/A',
                ];
            });

        $lateMilestones = $lateMilestonesDetails->count();

        // Total contracts breakdown
        $activeContracts    = $contracts->where('status', 'active')->count();
        $completedContracts = $contracts->where('status', 'completed')->count();

        // Daily payments (last 30 days)
        $dailyPayments = Paiement::whereIn('contract_id', $contractIds)
            ->where('date_paiement', '>=', now()->subDays(30)->startOfDay())
            ->selectRaw("DATE_FORMAT(date_paiement, '%Y-%m-%d') as period, SUM(montant) as total")
            ->groupBy('period')
            ->orderBy('period')
            ->get()
            ->map(fn($r) => [
                'period' => $r->period,
                'total' => (float) $r->total,
            ]);

        // Monthly payments (last 12 months)
        $monthlyPayments = Paiement::whereIn('contract_id', $contractIds)
            ->where('date_paiement', '>=', now()->subMonths(12)->startOfMonth())
            ->selectRaw("DATE_FORMAT(date_paiement, '%Y-%m') as period, SUM(montant) as total")
            ->groupBy('period')
            ->orderBy('period')
            ->get()
            ->map(fn($r) => [
                'period' => $r->period,
                'total' => (float) $r->total,
            ]);

        // Yearly payments (all time)
        $yearlyPayments = Paiement::whereIn('contract_id', $contractIds)
            ->selectRaw("DATE_FORMAT(date_paiement, '%Y') as period, SUM(montant) as total")
            ->groupBy('period')
            ->orderBy('period')
            ->get()
            ->map(fn($r) => [
                'period' => $r->period,
                'total' => (float) $r->total,
            ]);

        return response()->json([
            'total_sales'         => $totalSales,
            'total_paid'          => $totalPaid,
            'remaining'           => $remaining,
            'late_milestones'     => $lateMilestones,
            'late_milestones_list' => $lateMilestonesDetails,
            'active_contracts'    => $activeContracts,
            'completed_contracts' => $completedContracts,
            'daily_payments'      => $dailyPayments,
            'monthly_payments'    => $monthlyPayments,
            'yearly_payments'     => $yearlyPayments,
        ]);
    }
}

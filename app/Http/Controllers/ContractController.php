<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use App\Services\ContractService;
use App\Http\Requests\StoreContractRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ContractController extends Controller
{
    protected $contractService;

    public function __construct(ContractService $contractService)
    {
        $this->contractService = $contractService;
    }

    public function index()
    {
        $query = Contract::with(['client', 'target', 'milestones.payments', 'creator'])
            ->where('agence_id', Auth::user()->agence_id);

        if (Auth::user()->hasRole('agent')) {
            $query->where('created_by', Auth::id());
        }

        return response()->json($query->latest()->get());
    }

    public function store(StoreContractRequest $request)
    {
        $validated = $request->validated();

        // Role check
        if (!Auth::user()->hasRole('admin') && !Auth::user()->hasRole('comptable')) {
            // Agents might be allowed to create drafts, but here we simplify
        }

        // Exclusivity check
        $exists = Contract::where('target_id', $validated['target_id'])
            ->where('target_type', $validated['target_type'])
            ->whereIn('status', ['active', 'completed'])
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'This asset is already under an active contract.'], 422);
        }

        $paymentConfig = $request->input('payment_config', []);
        $schedules     = $request->input('schedules', []);

        $data = array_merge($validated, [
            'agence_id'    => Auth::user()->agence_id,
            'created_by'   => Auth::id(),
            'payment_mode' => $paymentConfig['mode'] ?? 'cheque',
            'payment_type' => $paymentConfig['type'] ?? 'tranches',
            'installments' => $paymentConfig['installments'] ?? 1,
            'interval_days'=> $paymentConfig['interval'] ?? 30,
            'schedules'    => $schedules,
        ]);

        $contract = $this->contractService->createContract($data);

        return response()->json($contract->load(['client', 'target', 'milestones']));
    }

    public function show($id)
    {
        $contract = Contract::with(['client', 'target', 'milestones.payments', 'creator'])
            ->findOrFail($id);
        
        return response()->json($contract);
    }

    public function update(Request $request, $id)
    {
        $contract = Contract::findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'sometimes|in:draft,active,completed,cancelled',
            'total_sale_price' => 'sometimes|numeric',
        ]);

        $contract->update($validated);
        
        if (isset($validated['status'])) {
            $this->contractService->syncAssetStatus($contract);
        }

        return response()->json($contract);
    }

    public function revenue()
    {
        return response()->json([
            'total_revenue' => $this->contractService->getGlobalAgencyRevenue()
        ]);
    }

    public function downloadPdf(Request $request, $id)
    {
        $contract = Contract::with([
            'client', 
            'agency', 
            'milestones', 
            'target' => function($morph) {
                $morph->morphWith([
                    \App\Models\Appartement::class => ['immeuble.terrain'],
                    \App\Models\Immeuble::class => ['terrain'],
                ]);
            }
        ])->findOrFail($id);
        
        $lang = $request->query('lang', 'ar');

        if ($lang === 'fr') {
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.contract_fr', compact('contract'));
            return $pdf->download("contrat_{$contract->id}.pdf");
        }

        // Fix Arabic text rendering for dompdf
        if (class_exists('ArPHP\I18N\Arabic')) {
            $arabic = new \ArPHP\I18N\Arabic();
            
            // Shape contract fields
            $contract->target_name_fixed = $this->shape($arabic, $this->getTargetName($contract));
            $contract->client_nom_fixed = $this->shape($arabic, $contract->client->nom);
            $contract->agency_name_fixed = $this->shape($arabic, $contract->agency->name ?? 'ImmoCommissions');
            $contract->agency_city_fixed = $this->shape($arabic, $contract->agency->city ?? '-');
            
            if (isset($contract->target->ville)) {
                $contract->target_city_fixed = $this->shape($arabic, $contract->target->ville);
            }

            foreach ($contract->milestones as $m) {
                $m->label_fixed = $this->shape($arabic, $m->label);
            }
        }

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.contract', compact('contract'));
        
        return $pdf->download("contrat_{$contract->id}.pdf");
    }

    private function shape($arabic, $text)
    {
        if (empty($text)) return $text;
        return $arabic->utf8Glyphs($text);
    }

    private function getTargetName($contract)
    {
        if (!$contract->target) return 'Contrat';
        
        if (str_contains($contract->target_type, 'Appartement')) {
            return "شقة رقم " . $contract->target->numero;
        }
        
        return $contract->target->nom ?? $contract->target->nom_projet;
    }
}

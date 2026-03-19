<?php

namespace App\Http\Controllers;

use App\Models\Commission;
use App\Services\CommissionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommissionController extends Controller
{
    protected $commissionService;

    public function __construct(CommissionService $commissionService)
    {
        $this->commissionService = $commissionService;
    }

    public function index(Request $request)
    {
        $query = Commission::with(['appartement', 'agent', 'client']);

        if (Auth::user()->hasRole('agent')) {
            $query->where('agent_id', Auth::id());
        }

        if ($request->agent_id) {
            $query->where('agent_id', $request->agent_id);
        }

        if ($request->statut) {
            $query->where('statut', $request->statut);
        }

        return response()->json($query->latest()->paginate(10));
    }

    public function show(Commission $commission)
    {
        return response()->json(
            $commission->load(['appartement', 'agent', 'client', 'payments.creator'])
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'agent_id' => 'required|uuid|exists:users,id',
            'appartement_id' => 'required|uuid|exists:appartements,id',
            'client_id' => 'nullable|uuid|exists:clients,id',
            'prix_vente' => 'required|numeric|min:0',
            'pourcentage' => 'required|numeric|min:0|max:100',
        ]);

        $montant = ($validated['prix_vente'] * $validated['pourcentage']) / 100;

        $commission = Commission::create([
            'agence_id' => Auth::user()->agence_id,
            'created_by' => Auth::id(),
            'agent_id' => $validated['agent_id'],
            'appartement_id' => $validated['appartement_id'],
            'client_id' => $validated['client_id'],
            'pourcentage' => $validated['pourcentage'],
            'prix_vente' => $validated['prix_vente'],
            'montant_total' => $montant,
            'montant_restant' => $montant,
            'montant_paye' => 0,
            'statut' => 'non payé',
        ]);

        return response()->json($commission->load(['appartement', 'agent', 'client']), 201);
    }

    public function storePayment(Request $request, Commission $commission)
    {
        $validated = $request->validate([
            'montant'       => 'required|numeric|min:0.01',
            'date_paiement' => 'required|date',
            'mode_paiement' => 'required|string',
            'reference'     => 'nullable|string',
        ]);

        $payment = $this->commissionService->addPayment($commission, $validated);

        return response()->json($payment, 201);
    }

    public function destroy(Commission $commission)
    {
        $commission->delete();
        return response()->json(null, 204);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        $query = Client::with(['contracts.milestones', 'contracts.target']);

        if (Auth::user()->hasRole('agent')) {
            $query->where('created_by', Auth::id());
        }

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%")
                  ->orWhere('cin', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $clients = $query->latest()->get();
        return response()->json($clients);
    }

    public function store(Request $request)
    {
        $agenceId = Auth::user()->agence_id;

        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'cin' => [
                'required',
                'string',
                'max:20',
                \Illuminate\Validation\Rule::unique('clients', 'cin')->where('agence_id', $agenceId),
            ],
            'telephone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'mode_paiement_prefere' => 'nullable|string',
        ], [
            'cin.unique' => 'Un client avec ce numéro CIN existe déjà dans votre agence.',
        ]);

        $validated['created_by'] = Auth::id();
        $validated['agence_id'] = Auth::user()->agence_id;

        $client = Client::create($validated);

        return response()->json($client, 201);
    }

    public function show(Client $client)
    {
        $client->load(['contracts.milestones.payments', 'contracts.target']);
        return response()->json($client);
    }

    public function update(Request $request, Client $client)
    {
        $validated = $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'cin' => 'sometimes|required|string|max:20',
            'telephone' => 'sometimes|required|string|max:20',
            'email' => 'nullable|email|max:255',
            'mode_paiement_prefere' => 'nullable|string',
        ]);

        $client->update($validated);

        return response()->json($client);
    }

    public function destroy(Client $client)
    {
        if (!Auth::user()->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $client->delete();

        return response()->json(null, 204);
    }
}

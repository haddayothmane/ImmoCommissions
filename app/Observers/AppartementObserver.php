<?php

namespace App\Observers;

use App\Models\Appartement;
use App\Models\Commission;

class AppartementObserver
{
    /**
     * Handle the Appartement "updated" event.
     */
    public function updated(Appartement $appartement): void
    {
        if ($appartement->isDirty('statut') && in_array(strtolower($appartement->statut), ['vendu', 'sold'])) {
            // Check if there is a contract for this appartement
            $contract = $appartement->contracts()->latest()->first();
            
            // Only create if a commission doesn't already exist for this appartement
            $exists = Commission::where('appartement_id', $appartement->id)->exists();
            
            if (!$exists) {
                // Default agent is the creator of the appartement, or the one assigned
                $agent_id = $appartement->created_by;
                
                $prix_vente = $contract ? $contract->total_sale_price : ($appartement->prix_total ?? 0);
                $client_id = $contract ? $contract->client_id : $appartement->client_id;
                
                // Assuming default commission rate is 2.5% if not specified elsewhere
                $taux = 2.5; 
                $montant = ($prix_vente * $taux) / 100;
                
                Commission::create([
                    'agence_id' => $appartement->agence_id,
                    'created_by' => $appartement->created_by,
                    'agent_id' => $agent_id,
                    'appartement_id' => $appartement->id,
                    'client_id' => $client_id,
                    'pourcentage' => $taux,
                    'prix_vente' => $prix_vente,
                    'montant_total' => $montant,
                    'montant_restant' => $montant,
                    'montant_paye' => 0,
                    'statut' => 'non payé',
                ]);
            }
        }
    }
}

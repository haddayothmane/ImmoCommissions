<?php

namespace App\Http\Controllers;

use App\Models\Paiement;
use App\Models\PaymentMilestone;
use App\Http\Requests\StorePaymentRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PaiementController extends Controller
{
    public function index()
    {
        $query = Paiement::query()
            ->where('agence_id', Auth::user()->agence_id)
            ->with(['client', 'contract.target', 'milestone', 'appartement.immeuble']);

        if (Auth::user()->hasRole('agent')) {
            $query->where('created_by', Auth::id());
        }

        return response()->json($query->latest()->get());
    }

    public function store(StorePaymentRequest $request)
    {
        $validated = $request->validated();

        return DB::transaction(function () use ($validated, $request) {
            $data = array_merge($validated, [
                'created_by'    => Auth::id(),
                'agence_id'     => Auth::user()->agence_id,
                'mode_reglement'=> $validated['mode_paiement'] ?? 'virement',
            ]);
            unset($data['mode_paiement']);

            $paiement = Paiement::create($data);

            // If linked to a milestone, update milestone status
            if ($paiement->milestone_id) {
                $milestone = PaymentMilestone::find($paiement->milestone_id);
                $totalPaidForMilestone = Paiement::where('milestone_id', $milestone->id)->sum('montant');
                
                if ($totalPaidForMilestone >= $milestone->amount) {
                    $milestone->update(['status' => 'paid']);
                }
            }

            // Always check if the contract is now fully paid
            if ($paiement->contract_id) {
                $contract = \App\Models\Contract::find($paiement->contract_id);
                if ($contract) {
                    app(\App\Services\ContractService::class)->checkCompletion($contract);
                }
            }

            return response()->json($paiement, 201);
        });
    }

    public function show(Paiement $paiement)
    {
        $paiement->load(['client', 'contract.target', 'milestone', 'creator', 'appartement.immeuble', 'agency']);
        return response()->json($paiement);
    }

    public function downloadPdf(Request $request, $id)
    {
        $paiement = Paiement::where('agence_id', Auth::user()->agence_id)
            ->with(['client', 'contract.target', 'milestone', 'appartement.immeuble', 'agency'])
            ->findOrFail($id);
        
        $lang = $request->query('lang', 'fr');

        $paiement->montant_lettres = $this->numberToFrenchWords($paiement->montant);
        
        $view = 'pdf.receipt_fr';
        // Add logic for other languages if necessary
        
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView($view, compact('paiement'));
        $filename = "recu_" . ($paiement->reference ?? $paiement->id) . ".pdf";
        
        return $pdf->download($filename);
    }

    private function numberToFrenchWords($number)
    {
        $hyphen      = '-';
        $conjunction = ' et ';
        $separator   = ', ';
        $negative    = 'moins ';
        $decimal     = ' point ';
        $dictionary  = array(
            0                   => 'zéro',
            1                   => 'un',
            2                   => 'deux',
            3                   => 'trois',
            4                   => 'quatre',
            5                   => 'cinq',
            6                   => 'six',
            7                   => 'sept',
            8                   => 'huit',
            9                   => 'neuf',
            10                  => 'dix',
            11                  => 'onze',
            12                  => 'douze',
            13                  => 'treize',
            14                  => 'quatorze',
            15                  => 'quinze',
            16                  => 'seize',
            17                  => 'dix-sept',
            18                  => 'dix-huit',
            19                  => 'dix-neuf',
            20                  => 'vingt',
            30                  => 'trente',
            40                  => 'quarante',
            50                  => 'cinquante',
            60                  => 'soixante',
            70                  => 'soixante-dix',
            80                  => 'quatre-vingt',
            90                  => 'quatre-vingt-dix',
            100                 => 'cent',
            1000                => 'mille',
            1000000             => 'million',
            1000000000          => 'milliard'
        );

        if (!is_numeric($number)) return false;

        $number = (int) $number; // Handle only integers for now for simplicity on receipt

        if ($number < 0) return $negative . $this->numberToFrenchWords(abs($number));

        $string = null;

        switch (true) {
            case $number < 21:
                $string = $dictionary[$number];
                break;
            case $number < 100:
                $tens   = ((int) ($number / 10)) * 10;
                $units  = $number % 10;
                
                if ($tens == 70) {
                    $string = 'soixante';
                    if ($units == 1) $string .= $conjunction . 'onze';
                    else $string .= $hyphen . $dictionary[10 + $units];
                } elseif ($tens == 80) {
                    $string = 'quatre-vingt';
                    if ($units) $string .= $hyphen . $dictionary[$units];
                    else $string .= 's'; // quatre-vingts only if no units
                } elseif ($tens == 90) {
                    $string = 'quatre-vingt';
                    if ($units == 1) $string .= $hyphen . 'onze';
                    else $string .= $hyphen . $dictionary[10 + $units];
                } else {
                    $string = $dictionary[$tens];
                    if ($units) {
                        $string .= ($units == 1 ? $conjunction : $hyphen) . $dictionary[$units];
                    }
                }
                break;
            case $number < 1000:
                $hundreds  = (int) ($number / 100);
                $remainder = $number % 100;
                
                $string = ($hundreds >= 2 ? $dictionary[$hundreds] . ' ' : '') . $dictionary[100];
                if ($hundreds >= 2 && !$remainder) $string .= 's';
                
                if ($remainder) {
                    $string .= ' ' . $this->numberToFrenchWords($remainder);
                }
                break;
            default:
                $baseUnit     = pow(1000, floor(log($number, 1000)));
                $numBaseUnits = (int) ($number / $baseUnit);
                $remainder    = $number % $baseUnit;
                
                if ($baseUnit == 1000 && $numBaseUnits == 1) {
                    $string = $dictionary[1000];
                } else {
                    $string = $this->numberToFrenchWords($numBaseUnits) . ' ' . $dictionary[$baseUnit];
                    if ($numBaseUnits > 1 && $baseUnit >= 1000000) $string .= 's';
                }
                
                if ($remainder) {
                    $string .= ' ' . $this->numberToFrenchWords($remainder);
                }
                break;
        }

        return $string;
    }
}

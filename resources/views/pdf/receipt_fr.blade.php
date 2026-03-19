<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>REÇU DE PAIEMENT - {{ $paiement->reference ?? $paiement->id }}</title>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 13px; line-height: 1.4; color: #1f2937; margin: 0; padding: 0; }
        .container { width: 100%; max-width: 800px; margin: auto; padding: 40px; }
        
        .header { border-bottom: 2px solid #059669; padding-bottom: 20px; margin-bottom: 30px; }
        .header-table { width: 100%; }
        .logo { font-size: 24px; font-weight: 900; color: #064e3b; text-transform: uppercase; margin-bottom: 5px; }
        .agency-info { color: #4b5563; font-size: 11px; }

        .receipt-title { font-size: 26px; font-weight: 800; color: #111827; text-align: center; margin: 20px 0; text-transform: uppercase; letter-spacing: 1px; }

        .section-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
        .section-header { background: #f9fafb; padding: 8px 12px; font-weight: 800; text-transform: uppercase; font-size: 10px; color: #374151; letter-spacing: 0.5px; border: 1px solid #e5e7eb; }
        .section-content { padding: 12px; border: 1px solid #e5e7eb; vertical-align: top; }
        
        .label { font-weight: 700; color: #6b7280; font-size: 11px; text-transform: uppercase; width: 120px; display: inline-block; }
        .value { font-weight: 600; color: #111827; }

        .item-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .item-table th { background: #f3f4f6; padding: 10px; text-align: left; border: 1px solid #e5e7eb; font-size: 10px; text-transform: uppercase; }
        .item-table td { padding: 12px; border: 1px solid #e5e7eb; }
        .amount-col { text-align: right; width: 150px; font-weight: 700; }

        .total-box { margin-top: 20px; text-align: right; }
        .total-row { display: inline-block; background: #ecfdf5; border: 2px solid #059669; padding: 10px 20px; border-radius: 8px; }
        .total-label { font-size: 12px; font-weight: 800; color: #065f46; margin-right: 15px; }
        .total-amount { font-size: 20px; font-weight: 900; color: #064e3b; }

        .in-words { margin-top: 15px; font-style: italic; color: #4b5563; font-size: 11px; }

        .signature-grid { width: 100%; margin-top: 50px; }
        .signature-box { width: 50%; text-align: center; vertical-align: top; padding: 20px; border: 1px dashed #e5e7eb; border-radius: 12px; }
        .signature-label { font-weight: 800; text-transform: uppercase; font-size: 10px; margin-bottom: 60px; display: block; }
        .signature-line { border-bottom: 1px solid #d1d5db; width: 80%; margin: 10px auto; }

        .watermark { position: fixed; top: 40%; left: 15%; font-size: 60px; color: rgba(5, 150, 105, 0.03); transform: rotate(-45deg); z-index: -1; font-weight: 900; }
        .footer-note { margin-top: 40px; text-align: center; color: #9ca3af; font-size: 10px; }
    </style>
</head>
<body>
    <div class="watermark">IMMOCOMMISSIONS DOCUMENT OFFICIEL</div>
    
    <div class="container">
        <!-- Header: Agency Info -->
        <table class="header-table">
            <tr>
                <td style="width: 60%;">
                    <div class="logo">{{ $paiement->agency->name ?? 'HAB SOLUTIONS' }}</div>
                    <div class="agency-info">
                        {{ $paiement->agency->address ?? 'Adresse de l\'agence non définie' }}<br>
                        Tél : {{ $paiement->agency->phone ?? 'N/A' }}
                    </div>
                </td>
                <td style="text-align: right; vertical-align: top;">
                    <div style="font-weight: 800; font-size: 14px;">N° REÇU : <span style="color: #059669;">{{ $paiement->reference ?? substr($paiement->id, 0, 8) }}</span></div>
                    <div style="color: #6b7280; font-weight: 600;">Date : {{ \Carbon\Carbon::parse($paiement->date_paiement)->format('d/m/Y') }}</div>
                </td>
            </tr>
        </table>

        <div class="receipt-title">REÇU DE PAIEMENT</div>

        <!-- Sections: Client & Property -->
        <table class="section-table">
            <tr>
                <td style="width: 50%; padding-right: 10px; vertical-align: top;">
                    <div class="section-header">INFORMATIONS CLIENT</div>
                    <div class="section-content">
                        <div><span class="label">Client :</span> <span class="value">{{ $paiement->client->nom }}</span></div>
                        <div><span class="label">CIN :</span> <span class="value">{{ $paiement->client->cin ?? 'N/A' }}</span></div>
                        <div><span class="label">Téléphone :</span> <span class="value">{{ $paiement->client->telephone ?? 'N/A' }}</span></div>
                    </div>
                </td>
                <td style="width: 50%; padding-left: 10px; vertical-align: top;">
                    <div class="section-header">BIEN IMMOBILIER</div>
                    <div class="section-content">
                        <div><span class="label">Projet :</span> <span class="value">
                            @if($paiement->appartement && $paiement->appartement->immeuble && $paiement->appartement->immeuble->terrain)
                                {{ $paiement->appartement->immeuble->terrain->nom_projet }}
                            @elseif($paiement->contract && $paiement->contract->target_type === 'App\\Models\\Appartement')
                                {{ $paiement->contract->target->immeuble->terrain->nom_projet ?? 'N/A' }}
                            @else
                                {{ $paiement->contract->target->nom_projet ?? $paiement->contract->target->nom ?? 'N/A' }}
                            @endif
                        </span></div>
                        <div><span class="label">Unité :</span> <span class="value">
                            @if($paiement->appartement)
                                App. {{ $paiement->appartement->numero }} ({{ $paiement->appartement->immeuble->nom }})
                            @elseif($paiement->contract && $paiement->contract->target_type === 'App\\Models\\Appartement')
                                App. {{ $paiement->contract->target->numero }}
                            @else
                                {{ $paiement->contract->target->numero ?? 'N/A' }}
                            @endif
                        </span></div>
                        <div><span class="label">Type :</span> <span class="value">Appartement</span></div>
                    </div>
                </td>
            </tr>
        </table>

        <!-- Payment Details Table -->
        <div class="section-header">DÉTAILS DU RÈGLEMENT</div>
        <table class="item-table">
            <thead>
                <tr>
                    <th>Description de l'opération</th>
                    <th class="amount-col">Montant (MAD)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <div style="font-weight: 700; margin-bottom: 4px;">{{ $paiement->milestone->label ?? $paiement->description ?? 'Versement sur contrat' }}</div>
                        <div style="font-size: 10px; color: #6b7280;">
                            Mode : {{ strtoupper($paiement->mode_reglement) }} 
                            @if($paiement->reference) | Réf : {{ $paiement->reference }} @endif
                        </div>
                    </td>
                    <td class="amount-col">{{ number_format($paiement->montant, 2, ',', ' ') }}</td>
                </tr>
            </tbody>
        </table>

        <div class="total-box">
            <div class="total-row">
                <span class="total-label">TOTAL RÉGLÉ :</span>
                <span class="total-amount">{{ number_format($paiement->montant, 2, ',', ' ') }} MAD</span>
            </div>
            <div class="in-words">
                Arrêté le présent reçu à la somme de : <br>
                <span style="font-weight: 800; color: #111827; text-transform: capitalize;">{{ $paiement->montant_lettres ?? '...................' }} Dirhams.</span>
            </div>
        </div>

        <!-- Signatures -->
        <table class="signature-grid">
            <tr>
                <td class="signature-box" style="margin-right: 15px;">
                    <span class="signature-label">Signature du Client</span>
                    <div style="color: #d1d5db; font-size: 10px; margin-top: 40px;">(Lu et approuvé)</div>
                </td>
                <td class="signature-box" style="margin-left: 15px;">
                    <span class="signature-label">Cachet et Signature Agence</span>
                    <div style="border: 1px solid #f3f4f6; height: 80px; width: 120px; margin: auto; border-radius: 8px;"></div>
                </td>
            </tr>
        </table>

        <div class="footer-note">
            Ce document est une preuve de paiement officielle délivrée par {{ $paiement->agency->name ?? 'l\'agence' }}.<br>
            Tout paiement par chèque n'est libératoire qu'après encaissement effectif.
        </div>
    </div>
</body>
</html>

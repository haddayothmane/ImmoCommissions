<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>CONTRAT DE VENTE IMMOBILIÈRE</title>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 13px; line-height: 1.5; color: #333; margin: 0; padding: 0; }
        .container { width: 100%; margin: auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #10b981; padding-bottom: 10px; }
        .header h1 { font-size: 22px; font-weight: bold; color: #065f46; margin-bottom: 5px; text-transform: uppercase; }
        .section { margin-bottom: 20px; }
        .section-title { font-size: 15px; font-weight: bold; margin-bottom: 10px; color: #065f46; border-left: 4px solid #10b981; padding-left: 10px; background: #f0fdf4; padding-top: 5px; padding-bottom: 5px; }
        .article-title { font-weight: bold; margin-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        table th, table td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
        table th { background-color: #f9fafb; font-weight: bold; color: #374151; }
        .signatures { margin-top: 40px; }
        .signatures table { border: none; }
        .signatures td { border: none; padding: 20px; text-align: left; width: 50%; vertical-align: top; }
        .footer { margin-top: 40px; font-size: 10px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 10px; }
        .info-grid { display: block; width: 100%; }
        .info-item { margin-bottom: 5px; }
        .info-label { font-weight: bold; width: 150px; display: inline-block; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>CONTRAT DE VENTE IMMOBILIÈRE</h1>
            <p>Référence : {{ $contract->id }} | Date : {{ $contract->created_at->format('d/m/Y') }}</p>
        </div>

        <div class="section">
            <p><strong>Entre les soussignés :</strong></p>
            <div style="margin-top: 10px;">
                <p><strong>La Société / Agence :</strong><br>
                Nom de l'agence : <strong>{{ $contract->agency->name ?? 'HAB Solutions' }}</strong><br>
                Adresse : {{ $contract->agency->address ?? 'N/A' }}<br>
                Téléphone : {{ $contract->agency->phone ?? 'N/A' }}</p>
                <p>Ci-après dénommée <strong>"Le Vendeur"</strong></p>
            </div>
            
            <div style="margin-top: 15px;">
                <p><strong>Et :</strong></p>
                <p><strong>L'Acheteur :</strong><br>
                Nom : <strong>{{ $contract->client->nom }}</strong><br>
                CIN : {{ $contract->client->cin ?? 'N/A' }}<br>
                Téléphone : {{ $contract->client->telephone ?? 'N/A' }}<br>
                Adresse : {{ $contract->client->adresse ?? 'N/A' }}</p>
                <p>Ci-après dénommé <strong>"L'Acheteur"</strong></p>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Article 1 – Objet du contrat</div>
            <p>Le présent contrat a pour objet la vente d’un bien immobilier appartenant au projet :</p>
            <div class="info-grid">
                <div class="info-item"><span class="info-label">Projet :</span> {{ $contract->target->immeuble->terrain->nom_projet ?? 'Non spécifié' }}</div>
                <div class="info-item"><span class="info-label">Ville :</span> {{ $contract->target->immeuble->terrain->ville ?? 'Non spécifié' }}</div>
            </div>
            
            <p style="margin-top: 10px;"><strong>Description du bien vendu :</strong></p>
            <div class="info-grid">
                <div class="info-item"><span class="info-label">Type :</span> 
                    @if(str_contains($contract->target_type, 'Appartement')) Appartement 
                    @elseif(str_contains($contract->target_type, 'Immeuble')) Immeuble
                    @else Terrain @endif
                </div>
                <div class="info-item"><span class="info-label">Numéro :</span> {{ $contract->target->numero ?? 'N/A' }}</div>
                <div class="info-item"><span class="info-label">Étage :</span> {{ $contract->target->etage ?? 'N/A' }}</div>
                <div class="info-item"><span class="info-label">Surface :</span> {{ $contract->target->surface ?? 'N/A' }} m²</div>
                <div class="info-item"><span class="info-label">Nombre de chambres :</span> {{ $contract->target->chambres ?? 'N/A' }}</div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Article 2 – Prix de vente</div>
            <p>Le prix total du bien immobilier est fixé à :</p>
            <p style="font-size: 18px; font-weight: bold; color: #10b981;">{{ number_format($contract->total_sale_price, 2, ',', ' ') }} MAD</p>
            <p><em>(En toutes lettres : {{ $contract->total_sale_price_words ?? '..................................................................' }})</em></p>
        </div>

        <div class="section">
            <div class="section-title">Article 3 – Mode de paiement</div>
            <p>Le paiement du prix sera effectué selon l’échéancier suivant :</p>
            <table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Date d'échéance</th>
                        <th>Montant (MAD)</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($contract->milestones as $milestone)
                    <tr>
                        <td>{{ $milestone->label }}</td>
                        <td>{{ \Carbon\Carbon::parse($milestone->due_date)->format('d/m/Y') }}</td>
                        <td>{{ number_format($milestone->amount, 2, ',', ' ') }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
            <p style="margin-top: 10px;">Le paiement peut être effectué par : <strong>{{ $contract->payment_mode ?? 'Virement/Chèque' }}</strong>.</p>
        </div>

        <div class="section">
            <div class="section-title">Article 4 – Obligations de l’acheteur</div>
            <p>L’acheteur s’engage à respecter les échéances de paiement définies dans le présent contrat. En cas de retard de paiement, le vendeur se réserve le droit d’appliquer les pénalités prévues par la loi ou de résilier le présent contrat de plein droit.</p>
        </div>

        <div class="section">
            <div class="section-title">Article 5 – Livraison du bien</div>
            <p>Le vendeur s’engage à livrer le bien immobilier au plus tard le : <strong>{{ $contract->delivery_date ? \Carbon\Carbon::parse($contract->delivery_date)->format('d/m/Y') : 'À définir' }}</strong>, sauf cas de force majeure ou retard imputable à des tiers.</p>
        </div>

        <div class="section">
            <div class="section-title">Article 6 – Transfert de propriété</div>
            <p>La propriété du bien sera transférée à l’acheteur après paiement intégral du prix convenu et signature de l’acte authentique devant notaire.</p>
        </div>

        <div class="section">
            <div class="section-title">Article 7 – Juridiction</div>
            <p>Tout litige relatif à l’interprétation ou à l’exécution du présent contrat sera de la compétence exclusive des tribunaux du Royaume du Maroc.</p>
        </div>

        <div class="signatures">
            <table style="width: 100%;">
                <tr>
                    <td style="width: 50%;">
                        <strong>Le Vendeur (Cachet et Signature)</strong>
                        <br><br><br><br>
                        ___________________________
                    </td>
                    <td style="width: 50%;">
                        <strong>L'Acheteur (Signature précédée de la mention "Lu et approuvé")</strong>
                        <br><br><br><br>
                        ___________________________
                    </td>
                </tr>
            </table>
        </div>

        <div class="footer">
            Fait à : {{ $contract->agency->city ?? 'Casablanca' }}, le {{ now()->format('d/m/Y') }}<br>
            Document généré par la plateforme <strong>ImmoCommissions</strong>
        </div>
    </div>
</body>
</html>

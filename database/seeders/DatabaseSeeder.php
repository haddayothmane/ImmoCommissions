<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\Agency;
use App\Models\User;
use App\Models\Terrain;
use App\Models\Immeuble;
use App\Models\Appartement;
use App\Models\Client;
use App\Models\Contract;
use App\Models\PaymentMilestone;
use App\Models\Paiement;
use Faker\Factory as Faker;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $faker = Faker::create('fr_FR');

        // Moroccan data lists
        $moroccanFirstNames = ['Mohammed', 'Ahmed', 'Youssef', 'Othmane', 'Mehdi', 'Karim', 'Amine', 'Omar', 'Fatima', 'Khadija', 'Meriem', 'Salma', 'Sara', 'Zineb', 'Imane', 'Hassan', 'Rachid', 'Hicham', 'Yassine', 'Adil'];
        $moroccanLastNames = ['El Amrani', 'Bennis', 'Bennani', 'Benjelloun', 'El Fassi', 'Tazi', 'Chraibi', 'El Mansouri', 'El Idrissi', 'Alaoui', 'Lahlou', 'Guessous', 'Berrada', 'Iraqi', 'Sqalli', 'Ouazzani'];
        $moroccanCities = ['Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Fès', 'Agadir', 'Kénitra', 'Oujda'];
        
        $neighborhoods = [
            'Casablanca' => ['Maarif', 'Gauthier', 'Ain Diab', 'Anfa', 'Sidi Maarouf', 'Bourgogne', 'Californie', 'Roches Noires', 'CIL', 'Bouskoura'],
            'Rabat' => ['Agdal', 'Hassan', 'Hay Riad', 'Souissi', 'Les Orangers', 'Akkari', 'Yacoub El Mansour'],
            'Marrakech' => ['Gueliz', 'Hivernage', 'Palmeraie', 'Medina', 'Targa', 'Victor Hugo'],
            'Tanger' => ['Malabata', 'Iberia', 'Centre Ville', 'Boubana', 'Marchan'],
            'Fès' => ['Akkar', 'Atlas', 'Médina', 'Narjiss', 'Ville Nouvelle'],
            'Agadir' => ['Sonaba', 'Founty', 'Talborjt', 'Haut Founty', 'Salam'],
            'Kénitra' => ['Mehdia', 'Mimosa', 'Oulad Oujih', 'Maghreb Arabe', 'Bir Rami'],
            'Oujda' => ['Lazaret', 'Sidi Yahya', 'Village Toiba', 'Boulevard Mohammed V', 'Al Qods'],
        ];

        $streetNames = ['Boulevard Mohammed V', 'Avenue Hassan II', 'Boulevard Zerktouni', 'Avenue des FAR', 'Boulevard d\'Anfa', 'Rue Ibn Batouta', 'Avenue Mohammed VI', 'Boulevard Moulay Youssef', 'Boulevard Massira Khadra'];

        // 1. Create an Agency
        $agencyId = (string) Str::uuid();
        $agency = Agency::create([
            'id' => $agencyId,
            'name' => 'Dar & Co Immobilier',
            'city' => 'Casablanca',
            'phone' => '+212 661 ' . $faker->numerify('## ## ##'),
            'address' => '74 Boulevard Massira Khadra, Maarif, Casablanca',
            'plan_type' => 'pro',
            'subscription_status' => 'active',
        ]);

        // 2. Create Users (Agents/Admins)
        $adminId = (string) Str::uuid();
        $admin = User::create([
            'id' => $adminId,
            'agence_id' => $agency->id,
            'name' => 'Mehdi Alaoui',
            'email' => 'admin@darandco.ma',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'active' => true,
        ]);

        $employeeId = (string) Str::uuid();
        $employee = User::create([
            'id' => $employeeId,
            'agence_id' => $agency->id,
            'name' => 'Sara Bennani',
            'email' => 'sara@darandco.ma',
            'password' => Hash::make('password'),
            'role' => 'agent',
            'active' => true,
        ]);

        // 3. Create Terrains
        $terrains = [];
        $projetNames = ['Jardins', 'Résidences', 'Villas', 'Les Terrasses', 'Les Tours', 'Palmerais'];
        
        for ($i = 0; $i < 14; $i++) {
            $tId = (string) Str::uuid();
            $city = $faker->randomElement(['Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Fès', 'Agadir', 'Kénitra', 'Oujda']);
            $quartier = $faker->randomElement($neighborhoods[$city]);
            
            $terrains[] = Terrain::create([
                'id' => $tId,
                'agence_id' => $agency->id,
                'created_by' => $admin->id,
                'nom_projet' => "Projet " . $faker->randomElement($projetNames) . " de " . $quartier,
                'ville' => $city,
                'quartier' => $quartier,
                'surface' => $faker->numberBetween(500, 5000),
                'prix_achat' => $faker->numberBetween(2000000, 15000000),
                'statut' => 'en_cours',
                'description' => "Un excellent projet résidentiel situé au cœur de $quartier à $city. " . $faker->paragraph,
            ]);
        }

        // 4. Create Immeubles for each Terrain
        $immeubles = [];
        foreach ($terrains as $terrain) {
            for ($i = 0; $i < rand(1, 13); $i++) {
                $iId = (string) Str::uuid();
                $immeubles[] = Immeuble::create([
                    'id' => $iId,
                    'agence_id' => $agency->id,
                    'terrain_id' => $terrain->id,
                    'created_by' => $admin->id,
                    'nom' => "Immeuble " . strtoupper($faker->bothify('?#')) . " - " . $terrain->quartier,
                    'nombre_etages' => $faker->numberBetween(2, 6),
                    'statut' => 'en_construction',
                    'date_debut' => now()->subMonths(rand(2, 12)),
                    'date_livraison' => now()->addMonths(rand(6, 24)),
                    'description' => "Immeuble moderne avec ascenseur et parking souterrain. " . $faker->paragraph,
                ]);
            }
        }

        // 5. Create Appartements for each Immeuble
        $appartements = [];
        foreach ($immeubles as $immeuble) {
            $etages = range(1, $immeuble->nombre_etages);
            for ($i = 0; $i < rand(4, 16); $i++) {
                $appId = (string) Str::uuid();
                $appartements[] = Appartement::create([
                    'id' => $appId,
                    'agence_id' => $agency->id,
                    'immeuble_id' => $immeuble->id,
                    'created_by' => $employee->id,
                    'numero' => $faker->numberBetween(1, 40),
                    'etage' => $faker->randomElement($etages),
                    'surface' => $faker->numberBetween(60, 200),
                    'chambres' => $faker->numberBetween(1, 4),
                    'prix_total' => $faker->numberBetween(800000, 3500000), // MAD
                    'statut' => 'disponible',
                    'description' => "Superbe appartement orienté " . $faker->randomElement(['Sud', 'Nord', 'Est', 'Ouest']) . " avec de belles finitions. " . $faker->paragraph,
                ]);
            }
        }

        // 6. Create Clients
        $clients = [];
        for ($i = 0; $i < 15; $i++) {
            $cId = (string) Str::uuid();
            $firstName = $faker->randomElement($moroccanFirstNames);
            $lastName = $faker->randomElement($moroccanLastNames);
            
            $clients[] = Client::create([
                'id' => $cId,
                'agence_id' => $agency->id,
                'created_by' => $admin->id,
                'nom' => $firstName . ' ' . $lastName,
                'cin' => strtoupper($faker->bothify('??######')), // e.g. AB123456
                'telephone' => '+212 6' . $faker->numerify('## ## ## ##'),
                'email' => strtolower($firstName) . '.' . strtolower(str_replace(' ', '', $lastName)) . '@' . $faker->freeEmailDomain,
                'mode_paiement_prefere' => $faker->randomElement(['virement', 'cheque', 'especes']),
            ]);
        }

        // 7. Create Contracts & Payments for some Appartements
        // We will sell 8 appartements
        for ($i = 0; $i < 8; $i++) {
            $appartement = $appartements[$i];
            $client = $faker->randomElement($clients);
            
            // Mark appartement as sold
            $appartement->update(['statut' => 'vendu', 'client_id' => $client->id]);

            $contractId = (string) Str::uuid();
            $totalSalePrice = $appartement->prix_total;
            
            $contract = Contract::create([
                'id' => $contractId,
                'agence_id' => $agency->id,
                'client_id' => $client->id,
                'created_by' => $admin->id,
                'target_id' => $appartement->id,
                'target_type' => Appartement::class,
                'total_sale_price' => $totalSalePrice,
                'status' => 'active',
                'payment_mode' => 'cheque',
                'payment_type' => 'tranches',
                'installments' => rand(3, 6),
                'interval_days' => 30,
            ]);

            // Create Milestones
            $numInstallments = $contract->installments;
            $milestoneAmount = $totalSalePrice / $numInstallments;
            $milestones = [];
            for ($j = 0; $j < $numInstallments; $j++) {
                $mId = (string) Str::uuid();
                // We'll make one of them overdue by setting due date in the past
                $dueDate = $j === 0 ? now()->subDays(10) : now()->addDays(30 * $j);
                
                $milestone = PaymentMilestone::create([
                    'id' => $mId,
                    'contract_id' => $contract->id,
                    'label' => "Tranche " . ($j + 1) . " / " . $numInstallments,
                    'amount' => $milestoneAmount,
                    'due_date' => $dueDate,
                    'status' => 'pending',
                    'percentage' => round(100 / $numInstallments, 2),
                ]);
                $milestones[] = $milestone;
            }

            // Create a Paiement for the first milestone (Compromis/Avance)
            if (isset($milestones[0])) {
                $firstMilestone = $milestones[0];
                $firstMilestone->update(['status' => 'paid']);

                $pId = (string) Str::uuid();
                Paiement::create([
                    'id' => $pId,
                    'agence_id' => $agency->id,
                    'contract_id' => $contract->id,
                    'milestone_id' => $firstMilestone->id,
                    'client_id' => $client->id,
                    'created_by' => $admin->id,
                    'montant' => $milestoneAmount,
                    'date_paiement' => now()->subDays(rand(15, 60)), // Actually paid in the past
                    'mode_reglement' => $faker->randomElement(['virement', 'cheque', 'especes']),
                    'statut' => 'valide',
                    'reference' => 'REG-' . strtoupper($faker->bothify('######')),
                ]);
            }

            // Create a partial paiement for the second milestone, and mark an overdue milestone
            if (isset($milestones[1])) {
                $secondMilestone = $milestones[1];
                Paiement::create([
                    'id' => (string) Str::uuid(),
                    'agence_id' => $agency->id,
                    'contract_id' => $contract->id,
                    'milestone_id' => $secondMilestone->id,
                    'client_id' => $client->id,
                    'created_by' => $admin->id,
                    'montant' => $milestoneAmount / 2,
                    'date_paiement' => now()->subDays(rand(1, 10)),
                    'mode_reglement' => 'cheque',
                    'statut' => 'valide',
                    'reference' => 'CHQ-' . strtoupper($faker->bothify('######')),
                ]);
                
                if ($i == 1 || $i == 3) {
                    $secondMilestone->update([
                        'due_date' => now()->subDays(rand(3, 10)) // Overdue!
                    ]);
                }
            }
        }
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('paiements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('agence_id')->constrained('agencies')->onDelete('cascade');
            $table->foreignUuid('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignUuid('appartement_id')->constrained('appartements')->onDelete('cascade');
            $table->foreignUuid('client_id')->constrained('clients')->onDelete('cascade');
            $table->decimal('montant', 15, 2);
            $table->date('date_paiement')->nullable();
            $table->date('echeance')->nullable();
            $table->string('mode_reglement')->nullable(); // Cheque, Virement, Especes
            $table->string('statut')->default('en_attente'); // en_attente, paye
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('paiements');
    }
};

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
        Schema::table('commissions', function (Blueprint $table) {
            $table->foreignUuid('client_id')->nullable()->constrained('clients')->onDelete('set null');
            $table->decimal('prix_vente', 15, 2)->default(0);
            $table->decimal('montant_restant', 15, 2)->default(0);
            $table->string('statut')->default('non payé'); // non payé, partiellement payé, payé
        });

        Schema::create('commission_payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('agence_id')->constrained('agencies')->onDelete('cascade');
            $table->foreignUuid('commission_id')->constrained('commissions')->onDelete('cascade');
            $table->decimal('montant', 15, 2);
            $table->date('date_paiement');
            $table->string('mode_paiement'); // cash, virement, cheque
            $table->string('reference')->nullable();
            $table->foreignUuid('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commission_payments');
        if (Schema::hasTable('commissions')) {
            Schema::table('commissions', function (Blueprint $table) {
                $table->dropColumn(['client_id', 'prix_vente', 'montant_restant', 'statut']);
            });
        }
    }
};

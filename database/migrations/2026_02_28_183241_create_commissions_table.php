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
        Schema::create('commissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('agence_id')->constrained('agencies')->onDelete('cascade');
            $table->foreignUuid('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignUuid('appartement_id')->constrained('appartements')->onDelete('cascade');
            $table->foreignUuid('agent_id')->constrained('users')->onDelete('cascade');
            $table->decimal('pourcentage', 5, 2);
            $table->decimal('montant_total', 15, 2);
            $table->decimal('montant_paye', 15, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commissions');
    }
};

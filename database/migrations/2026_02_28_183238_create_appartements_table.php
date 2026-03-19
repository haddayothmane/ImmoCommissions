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
        Schema::create('appartements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('agence_id')->constrained('agencies')->onDelete('cascade');
            $table->foreignUuid('immeuble_id')->constrained('immeubles')->onDelete('cascade');
            $table->foreignUuid('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignUuid('client_id')->nullable()->constrained('clients')->onDelete('set null');
            $table->string('numero');
            $table->integer('etage')->nullable();
            $table->decimal('surface', 15, 2)->nullable();
            $table->integer('chambres')->nullable();
            $table->decimal('prix_total', 15, 2)->nullable();
            $table->string('statut')->default('disponible');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appartements');
    }
};

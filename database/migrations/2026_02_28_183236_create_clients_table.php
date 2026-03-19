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
        Schema::create('clients', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('agence_id')->constrained('agencies')->onDelete('cascade');
            $table->foreignUuid('created_by')->constrained('users')->onDelete('cascade');
            $table->string('nom');
            $table->string('cin')->unique()->nullable();
            $table->string('telephone')->nullable();
            $table->string('email')->nullable();
            $table->string('mode_paiement_prefere')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};

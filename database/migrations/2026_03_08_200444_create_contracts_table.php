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
        Schema::create('contracts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('agence_id');
            $table->uuid('client_id');
            $table->uuid('created_by');
            
            // Polymorphic target (Terrain, Immeuble, Appartement)
            $table->uuid('target_id');
            $table->string('target_type');
            
            $table->decimal('total_sale_price', 15, 2);
            $table->enum('status', ['draft', 'active', 'completed', 'cancelled'])->default('draft');
            
            $table->timestamps();

            $table->foreign('agence_id')->references('id')->on('agencies')->onDelete('cascade');
            $table->foreign('client_id')->references('id')->on('clients')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};

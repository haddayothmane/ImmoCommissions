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
        Schema::table('paiements', function (Blueprint $table) {
            $table->uuid('appartement_id')->nullable()->change();
            $table->uuid('contract_id')->nullable()->after('client_id');
            $table->uuid('milestone_id')->nullable()->after('contract_id');

            $table->foreign('contract_id')->references('id')->on('contracts')->onDelete('set null');
            $table->foreign('milestone_id')->references('id')->on('payment_milestones')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};

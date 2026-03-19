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
        Schema::table('immeubles', function (Blueprint $table) {
            $table->uuid('terrain_id')->nullable()->change();
            $table->text('description')->nullable()->after('statut');
            $table->json('documents')->nullable()->after('description');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('immeubles', function (Blueprint $table) {
            $table->uuid('terrain_id')->nullable(false)->change();
            $table->dropColumn(['description', 'documents']);
        });
    }
};

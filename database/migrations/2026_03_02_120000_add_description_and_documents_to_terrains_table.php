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
        Schema::table('terrains', function (Blueprint $table) {
            // Optional textual description of the terrain
            $table->text('description')->nullable()->after('statut');

            // JSON column to store an array of document file paths (pdf, images, etc.)
            $table->json('documents')->nullable()->after('description');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('terrains', function (Blueprint $table) {
            $table->dropColumn(['description', 'documents']);
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            $table->enum('payment_mode', ['cheque', 'virement', 'especes'])->default('cheque')->after('status');
            $table->enum('payment_type', ['totalite', 'tranches'])->default('tranches')->after('payment_mode');
            $table->unsignedSmallInteger('installments')->default(1)->after('payment_type');
            $table->unsignedSmallInteger('interval_days')->default(30)->after('installments');
        });
    }

    public function down(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            $table->dropColumn(['payment_mode', 'payment_type', 'installments', 'interval_days']);
        });
    }
};

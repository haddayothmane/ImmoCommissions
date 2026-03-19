<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use App\Models\PaymentMilestone;
use Illuminate\Http\Request;

class PaymentMilestoneController extends Controller
{
    /**
     * Add a new milestone to a contract.
     */
    public function store(Request $request, Contract $contract)
    {
        $validated = $request->validate([
            'label'      => 'required|string|max:255',
            'amount'     => 'required|numeric|min:0',
            'due_date'   => 'required|date',
        ]);

        $totalPrice = $contract->total_sale_price;

        $milestone = PaymentMilestone::create([
            'contract_id' => $contract->id,
            'label'       => $validated['label'],
            'amount'      => $validated['amount'],
            'percentage'  => $totalPrice > 0 ? round(($validated['amount'] / $totalPrice) * 100, 2) : 0,
            'due_date'    => $validated['due_date'],
            'status'      => 'pending',
        ]);

        return response()->json($milestone->load('payments'), 201);
    }

    /**
     * Update an existing milestone (label, amount, due_date).
     */
    public function update(Request $request, PaymentMilestone $milestone)
    {
        $validated = $request->validate([
            'label'    => 'sometimes|required|string|max:255',
            'amount'   => 'sometimes|required|numeric|min:0',
            'due_date' => 'sometimes|required|date',
        ]);

        // Recalculate percentage if amount changed
        if (isset($validated['amount'])) {
            $totalPrice = $milestone->contract->total_sale_price;
            $validated['percentage'] = $totalPrice > 0
                ? round(($validated['amount'] / $totalPrice) * 100, 2)
                : 0;
        }

        $milestone->update($validated);

        return response()->json($milestone->load('payments'));
    }

    /**
     * Delete a milestone (only if not yet paid).
     */
    public function destroy(PaymentMilestone $milestone)
    {
        if ($milestone->status === 'paid') {
            return response()->json(['message' => 'Cannot delete a paid milestone.'], 422);
        }

        $milestone->delete();

        return response()->json(null, 204);
    }
}

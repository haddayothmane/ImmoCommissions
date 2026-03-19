<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

/**
 * EmployeeController
 *
 * In this application an "employee" is simply a user that belongs to the same
 * agency (`agence_id`) and has a role of admin / agent / comptable.
 * This controller therefore operates directly on the User model.
 *
 * All routes are protected by `auth:sanctum`. Additionally, every method
 * checks that the authenticated user has the `admin` role; otherwise a
 * 403 response is returned.
 *
 * The global `TenantScope` used by other models is not applied to User,
 * so we explicitly filter queries by the authenticated user's `agence_id`.
 */
class EmployeeController extends Controller
{
    /**
     * Return a list of all employees (users) belonging to the current agency.
     */
    public function index()
    {
        if (!Auth::user()->hasRole('admin')) {
            return response()->json(['message' => 'Accès réservé aux administrateurs.'], 403);
        }

        $agencyId = Auth::user()->agence_id;

        $employees = User::with('role')->where('agence_id', $agencyId)
            ->orderByDesc('created_at')
            ->get()
            ->map(function (User $u) {
                return [
                    'id'         => $u->id,
                    'full_name' => $u->name,
                    'email'      => $u->email,
                    'role'       => $u->role, // Now returns the role object
                    'active'    => $u->active,
                    'created_at' => $u->created_at,
                ];
            });

        return response()->json($employees);
    }

    /**
     * Create a new employee (user) and return the generated password once.
     */
    public function store(Request $request)
    {
        if (!Auth::user()->hasRole('admin')) {
            return response()->json(['message' => 'Seul un administrateur peut créer un employé.'], 403);
        }

        $validated = $request->validate([
            'name'   => 'required|string|max:255',
            'email'  => 'required|email|unique:users,email',
            'role'   => 'required|in:admin,agent,comptable',
            'active' => 'sometimes|boolean',
        ]);

        // Generate a secure random password (12 characters)
        $plainPassword = Str::random(12);

        $roleMeta = \App\Models\Role::where('slug', $validated['role'])->first();

        DB::beginTransaction();
        try {
            $user = User::create([
                'agence_id' => Auth::user()->agence_id,
                'name'      => $validated['name'],
                'email'     => $validated['email'],
                'password'  => $plainPassword,
                'role_id'   => $roleMeta->id,
                'active'    => $validated['active'] ?? true,
                'created_by'=> Auth::id(),
            ]);

            DB::commit();

            return response()->json([
                'employee' => [
                    'id'         => $user->id,
                    'full_name' => $user->name,
                    'email'      => $user->email,
                    'role'       => $user->role,
                    'active'     => $user->active,
                    'created_at' => $user->created_at,
                ],
                // This plain password is only returned once.
                'plain_password' => $plainPassword,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => "Erreur lors de la création de l'employé.",
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Show a single employee (user) details.
     */
    public function show(User $user)
    {
        if (!Auth::user()->hasRole('admin')) {
            return response()->json(['message' => 'Accès réservé aux administrateurs.'], 403);
        }

        // Ensure the requested user belongs to the same agency
        if ($user->agence_id !== Auth::user()->agence_id) {
            return response()->json(['message' => 'Employé introuvable dans votre agence.'], 404);
        }

        return response()->json([
            'id'         => $user->id,
            'full_name'  => $user->name,
            'email'      => $user->email,
            'role'       => $user->role,
            'active'     => $user->active,
            'created_at' => $user->created_at,
        ]);
    }

    /**
     * Update an employee's role or activation status.
     */
    public function update(Request $request, User $user)
    {
        if (!Auth::user()->hasRole('admin')) {
            return response()->json(['message' => 'Seul un administrateur peut modifier un employé.'], 403);
        }

        if ($user->agence_id !== Auth::user()->agence_id) {
            return response()->json(['message' => 'Employé hors de votre agence.'], 404);
        }

        $validated = $request->validate([
            'role'   => 'sometimes|in:admin,agent,comptable',
            'active' => 'sometimes|boolean',
        ]);

        DB::beginTransaction();
        try {
            if (isset($validated['role'])) {
                $roleMeta = \App\Models\Role::where('slug', $validated['role'])->first();
                $user->role_id = $roleMeta->id;
            }
            if (array_key_exists('active', $validated)) {
                $user->active = $validated['active'];
            }

            $user->save();

            DB::commit();

            return response()->json([
                'id'         => $user->id,
                'full_name'  => $user->name,
                'email'      => $user->email,
                'role'       => $user->role,
                'active'     => $user->active,
                'updated_at' => $user->updated_at,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la mise à jour.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete an employee (user) permanently.
     */
    public function destroy(User $user)
    {
        if (!Auth::user()->hasRole('admin')) {
            return response()->json(['message' => 'Seul un administrateur peut supprimer un employé.'], 403);
        }

        if ($user->agence_id !== Auth::user()->agence_id) {
            return response()->json(['message' => 'Employé hors de votre agence.'], 404);
        }

        DB::beginTransaction();
        try {
            $user->delete();

            DB::commit();

            return response()->json(null, 204);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la suppression.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}

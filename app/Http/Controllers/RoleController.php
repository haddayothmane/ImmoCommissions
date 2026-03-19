<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Role::with('permissions')->get();
        return response()->json($roles);
    }

    public function updatePermissions(Request $request, $id)
    {
        $role = Role::findOrFail($id);
        
        $validated = $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role->permissions()->sync($validated['permissions']);

        return response()->json($role->load('permissions'));
    }

    public function listPermissions()
    {
        return response()->json(Permission::all());
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;
use App\Models\User;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            ['slug' => 'manage_users', 'name' => 'Manage Employees', 'description' => 'Add, edit, delete employees'],
            ['slug' => 'manage_terrains', 'name' => 'Manage Terrains', 'description' => 'View and edit terrains'],
            ['slug' => 'manage_immeubles', 'name' => 'Manage Immeubles', 'description' => 'View and edit buildings'],
            ['slug' => 'manage_clients', 'name' => 'Manage Clients', 'description' => 'View and edit clients'],
            ['slug' => 'manage_contracts', 'name' => 'Manage Contracts', 'description' => 'Generate and edit contracts'],
            ['slug' => 'manage_payments', 'name' => 'Manage Payments', 'description' => 'Collect and view payments'],
            ['slug' => 'view_reports', 'name' => 'View Reports', 'description' => 'Financial and activity reports'],
            ['slug' => 'manage_roles', 'name' => 'Manage Roles', 'description' => 'Manage system roles and permissions'],
        ];

        $perms = [];
        foreach ($permissions as $p) {
            $perms[$p['slug']] = Permission::updateOrCreate(['slug' => $p['slug']], $p);
        }

        // Admin Role
        $admin = Role::updateOrCreate(['slug' => 'admin'], [
            'name' => 'Admin',
            'description' => 'Full system access',
        ]);
        $admin->permissions()->sync(array_values(array_map(fn($p) => $p->id, $perms)));

        // Agent Role
        $agent = Role::updateOrCreate(['slug' => 'agent'], [
            'name' => 'Agent',
            'description' => 'Sales and client management',
        ]);
        $agent->permissions()->sync([
            $perms['manage_clients']->id,
            $perms['manage_contracts']->id,
            $perms['manage_terrains']->id,
            $perms['manage_immeubles']->id,
        ]);

        // Comptable Role
        $comptable = Role::updateOrCreate(['slug' => 'comptable'], [
            'name' => 'Comptable',
            'description' => 'Financial monitoring',
        ]);
        $comptable->permissions()->sync([
            $perms['manage_payments']->id,
            $perms['view_reports']->id,
            $perms['manage_contracts']->id,
        ]);

        // Update existing users to assign role_id based on old role string
        \Illuminate\Support\Facades\DB::table('users')->get()->each(function ($user) use ($admin, $agent, $comptable) {
            $roleId = null;
            if (isset($user->role)) {
                $roleId = match ($user->role) {
                    'admin' => $admin->id,
                    'agent' => $agent->id,
                    'comptable' => $comptable->id,
                    default => $agent->id,
                };
            }
            
            if ($roleId) {
                \App\Models\User::where('id', $user->id)->update(['role_id' => $roleId]);
            }
        });
    }
}

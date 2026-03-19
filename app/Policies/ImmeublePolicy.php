<?php

namespace App\Policies;

use App\Models\Immeuble;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ImmeublePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Immeuble $immeuble): bool
    {
        return $user->agence_id === $immeuble->agence_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'agent']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Immeuble $immeuble): bool
    {
        return $user->agence_id === $immeuble->agence_id && in_array($user->role, ['admin', 'agent']);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Immeuble $immeuble): bool
    {
        return $user->agence_id === $immeuble->agence_id && $user->role === 'admin';
    }
}

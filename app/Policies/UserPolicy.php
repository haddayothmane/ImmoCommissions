<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

/**
 * UserPolicy
 *
 * Only users with the `admin` role are allowed to perform any CRUD
 * operation on other users (employees). All other roles receive a 403
 * response when the Gate checks this policy.
 */
class UserPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any users.
     */
    public function viewAny(User $user)
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can view a specific user.
     */
    public function view(User $user, User $model)
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can create new users.
     */
    public function create(User $user)
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can update a user.
     */
    public function update(User $user, User $model)
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can delete a user.
     */
    public function delete(User $user, User $model)
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can restore a soft‑deleted user.
     */
    public function restore(User $user, User $model)
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can permanently delete a user.
     */
    public function forceDelete(User $user, User $model)
    {
        return $user->role === 'admin';
    }
}

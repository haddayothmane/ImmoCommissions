<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    public $incrementing = false;
    protected $keyType = 'string';

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::creating(function ($user) {
            if (empty($user->id)) {
                $user->id = (string) \Illuminate\Support\Str::uuid();
            }
        });
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'agence_id',
        'name',
        'email',
        'password',
        'role_id',
        'active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function agency()
    {
        return $this->belongsTo(Agency::class, 'agence_id');
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function hasPermission(string $permissionSlug): bool
    {
        if (!$this->role) return false;
        return $this->role->permissions->contains('slug', $permissionSlug);
    }

    public function hasRole(string $roleSlug): bool
    {
        if (!$this->role) return false;
        return $this->role->slug === $roleSlug;
    }

    /**
     * Get the user's full name.
     */
    public function getFullNameAttribute(): string
    {
        return $this->name;
    }

    /**
     * The accessors to append to the model's array form.
     */
    protected $appends = ['full_name'];
}

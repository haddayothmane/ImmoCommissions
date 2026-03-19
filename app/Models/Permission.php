<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasUuid;

class Permission extends Model
{
    use HasFactory, HasUuid;

    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['name', 'slug', 'description'];

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_permissions');
    }
}

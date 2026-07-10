<?php

namespace App\Providers;

use Illuminate\Support\Facades\Facade;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Register DomPDF alias
        $this->app->alias(\Barryvdh\DomPDF\PDF::class, 'PDF');

        // Register Excel alias
        $this->app->alias(\Maatwebsite\Excel\Facades\Excel::class, 'Excel');
    }

    public function boot(): void
    {
        //
    }
}

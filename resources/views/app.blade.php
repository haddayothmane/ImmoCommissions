<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ config('app.name', 'ImmoCommissions') }} - Modern Real Estate Agency Management</title>
    <meta name="description" content="Immocommissions is the ultimate multi-tenant CRM for real estate agencies. Manage inventory, terrains, clients, and automate agent commissions with ease.">
    <meta name="keywords" content="real estate crm, agency management, commission tracking, property inventory, multi-tenant saas">
    <meta property="og:title" content="Immocommissions - Modern Real Estate CRM">
    <meta property="og:description" content="Streamline your real estate agency with our comprehensive CRM and financial tracking system.">
    <meta property="og:type" content="website">
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
</head>
<body class="h-full bg-slate-50 font-outfit">
    <div id="root"></div>
</body>
</html>

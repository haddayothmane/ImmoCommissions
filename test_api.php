<?php
require __DIR__ . '/vendor/autoload.php';

use GuzzleHttp\Client;

$base_uri = 'http://127.0.0.1:8000';
$client = new Client([
    'base_uri' => $base_uri,
    'http_errors' => false,
    'headers' => [
        'Accept' => 'application/json',
    ]
]);

echo "1. Registering new user (Token Auth)...\n";
$email = 'jwt_test_' . time() . '@example.com';
$password = 'password123';
$name = 'JWT Test User';

$response = $client->post('/api/register', [
    'json' => [
        'name' => $name,
        'email' => $email,
        'password' => $password,
        'password_confirmation' => $password,
    ]
]);

echo "Status: " . $response->getStatusCode() . "\n";
$data = json_decode($response->getBody(), true);
$token = $data['access_token'] ?? null;

if (!$token) {
    die("Failed to retrieve token from registration.\nBody: " . $response->getBody() . "\n");
}
echo "Token retrieved successfully.\n";

echo "\n2. Fetching User with Token...\n";
$response = $client->get('/api/user', [
    'headers' => [
        'Authorization' => "Bearer $token",
    ]
]);
echo "Status: " . $response->getStatusCode() . "\n";
echo "Body: " . $response->getBody() . "\n";

echo "\n3. Logging in (Token Auth)...\n";
$response = $client->post('/api/login', [
    'json' => [
        'email' => $email,
        'password' => $password,
    ]
]);
echo "Status: " . $response->getStatusCode() . "\n";
$data = json_decode($response->getBody(), true);
$token = $data['access_token'] ?? null;

if (!$token) {
    die("Failed to retrieve token from login.\n");
}
echo "New Token retrieved successfully.\n";

echo "\n4. Logging out...\n";
$response = $client->post('/api/logout', [
    'headers' => [
        'Authorization' => "Bearer $token",
    ]
]);
echo "Status: " . $response->getStatusCode() . "\n";

echo "\n5. Verifying token is revoked...\n";
$response = $client->get('/api/user', [
    'headers' => [
        'Authorization' => "Bearer $token",
    ]
]);
echo "Status: " . $response->getStatusCode() . " (Expected 401)\n";

echo "\nAPI Token Test Complete.\n";

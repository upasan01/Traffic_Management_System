<?php
// Start the built-in PHP server
$host = 'localhost';
$port = 8000;
$root = __DIR__;

echo "Starting PHP server at http://{$host}:{$port}\n";
echo "Press Ctrl+C to stop the server\n";

// Start the server
exec("php -S {$host}:{$port} -t {$root}");
?> 
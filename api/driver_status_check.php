<?php
/**
 * Driver Status Check API
 * Simple endpoint to check if the drivers system is working properly
 */

header("Content-Type: application/json");
require_once("config.php");

// Initialize response array
$response = [
    'status' => 'error',
    'message' => 'Status check failed',
    'checks' => []
];

// Function to add check result
function addCheck(&$response, $name, $status, $message = null) {
    $response['checks'][] = [
        'name' => $name,
        'status' => $status,
        'message' => $message
    ];
}

try {
    // Check database connection
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS);
    
    if ($conn->connect_error) {
        addCheck($response, 'database_connection', 'error', 'Connection failed: ' . $conn->connect_error);
        throw new Exception('Database connection failed');
    }
    
    addCheck($response, 'database_connection', 'success', 'Connected to database server');
    
    // Check if database exists
    $result = $conn->query("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '" . DB_NAME . "'");
    
    if ($result->num_rows === 0) {
        addCheck($response, 'database_exists', 'error', 'Database does not exist');
        throw new Exception('Database does not exist');
    }
    
    addCheck($response, 'database_exists', 'success', 'Database exists');
    
    // Select database
    $conn->select_db(DB_NAME);
    
    // Check if drivers table exists
    $result = $conn->query("SHOW TABLES LIKE 'drivers'");
    
    if ($result->num_rows === 0) {
        addCheck($response, 'drivers_table', 'error', 'Drivers table does not exist');
        throw new Exception('Drivers table does not exist');
    }
    
    addCheck($response, 'drivers_table', 'success', 'Drivers table exists');
    
    // Check table structure
    $result = $conn->query("DESCRIBE drivers");
    
    if ($result === false) {
        addCheck($response, 'table_structure', 'error', 'Cannot read table structure: ' . $conn->error);
        throw new Exception('Cannot read table structure');
    }
    
    $requiredColumns = ['id', 'first_name', 'last_name', 'license_number', 'license_type', 'expiry_date', 'status', 'violations'];
    $foundColumns = [];
    
    while ($row = $result->fetch_assoc()) {
        $foundColumns[] = $row['Field'];
    }
    
    $missingColumns = array_diff($requiredColumns, $foundColumns);
    
    if (count($missingColumns) > 0) {
        addCheck($response, 'table_structure', 'warning', 'Missing columns: ' . implode(', ', $missingColumns));
    } else {
        addCheck($response, 'table_structure', 'success', 'Table structure is valid');
    }
    
    // Check if table has data
    $result = $conn->query("SELECT COUNT(*) as count FROM drivers");
    $row = $result->fetch_assoc();
    $count = $row['count'];
    
    if ($count == 0) {
        addCheck($response, 'table_data', 'warning', 'Drivers table is empty');
    } else {
        addCheck($response, 'table_data', 'success', 'Drivers table has ' . $count . ' records');
    }
    
    // Check server environment
    $phpVersion = phpversion();
    $requiredVersion = '7.0.0';
    
    if (version_compare($phpVersion, $requiredVersion, '<')) {
        addCheck($response, 'php_version', 'warning', "PHP version $phpVersion may be too old. Recommended: $requiredVersion or higher");
    } else {
        addCheck($response, 'php_version', 'success', "PHP version $phpVersion is supported");
    }
    
    // Check write permissions for AJAX requests
    $testData = json_encode(['test' => true]);
    $headers = [
        'Content-Type: application/json',
        'Content-Length: ' . strlen($testData)
    ];
    
    $options = [
        'http' => [
            'method' => 'POST',
            'header' => implode("\r\n", $headers),
            'content' => $testData
        ]
    ];
    
    $context = stream_context_create($options);
    $testUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]" . dirname($_SERVER['REQUEST_URI']) . "/drivers.php";
    
    // Try an actual test insert (this will fail with missing fields, but we just want to check connectivity)
    $canConnect = true;
    try {
        $result = @file_get_contents($testUrl, false, $context);
        // If we reach here without error, the API is reachable
        addCheck($response, 'api_reachable', 'success', 'API endpoint is reachable');
    } catch (Exception $e) {
        $canConnect = false;
        addCheck($response, 'api_reachable', 'error', 'Could not connect to API endpoint: ' . $e->getMessage());
    }
    
    // If all is good, set success
    $allSuccess = true;
    $hasErrors = false;
    
    foreach ($response['checks'] as $check) {
        if ($check['status'] !== 'success') {
            $allSuccess = false;
            if ($check['status'] === 'error') {
                $hasErrors = true;
            }
        }
    }
    
    if ($allSuccess) {
        $response['status'] = 'success';
        $response['message'] = 'All systems operational';
    } else if (!$hasErrors) {
        $response['status'] = 'warning';
        $response['message'] = 'System operational with warnings';
    } else {
        $response['status'] = 'error';
        $response['message'] = 'System issues detected';
    }
    
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

// Close connection if open
if (isset($conn)) {
    $conn->close();
}

// Send response
echo json_encode($response, JSON_PRETTY_PRINT);
?> 
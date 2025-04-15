<?php
/**
 * Database setup script for drivers
 * This script ensures the drivers table is properly set up and populated with sample data
 */

// Include database configuration
require_once 'api/config.php';

// Create connection using constants from config.php
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "<h1>Setting up drivers database</h1>";

// Create database if it doesn't exist
$sql = "CREATE DATABASE IF NOT EXISTS " . DB_NAME;
if ($conn->query($sql) === TRUE) {
    echo "<p>Database created successfully or already exists</p>";
} else {
    die("<p>Error creating database: " . $conn->error . "</p>");
}

// Select the database
$conn->select_db(DB_NAME);

// Create drivers table if it doesn't exist
$sql = "CREATE TABLE IF NOT EXISTS drivers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    license_type ENUM('A', 'B', 'C', 'D') NOT NULL,
    expiry_date DATE NOT NULL,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    violations INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)";

if ($conn->query($sql) === TRUE) {
    echo "<p>Drivers table created successfully or already exists</p>";
} else {
    die("<p>Error creating drivers table: " . $conn->error . "</p>");
}

// Create indices for faster queries
$indices = [
    "CREATE INDEX idx_driver_status ON drivers(status)",
    "CREATE INDEX idx_driver_license ON drivers(license_number)",
    "CREATE INDEX idx_driver_expiry ON drivers(expiry_date)"
];

foreach ($indices as $indexSql) {
    // Try to create index - will fail silently if already exists
    if ($conn->query($indexSql) === TRUE) {
        echo "<p>Index created successfully</p>";
    } else {
        // Ignore "Duplicate key name" errors as this means the index already exists
        if (strpos($conn->error, 'Duplicate') !== false) {
            echo "<p>Index already exists</p>";
        } else {
            echo "<p>Warning: " . $conn->error . "</p>";
        }
    }
}

// Check if there's already data in the drivers table
$result = $conn->query("SELECT COUNT(*) as count FROM drivers");
$row = $result->fetch_assoc();

if ($row['count'] == 0) {
    // Add sample drivers if the table is empty
    $sampleDrivers = [
        "INSERT INTO drivers (first_name, last_name, license_number, license_type, expiry_date, status, violations) VALUES
        ('John', 'Smith', 'DL12345678', 'B', DATE_ADD(CURDATE(), INTERVAL 2 YEAR), 'active', 0)",
        
        "INSERT INTO drivers (first_name, last_name, license_number, license_type, expiry_date, status, violations) VALUES
        ('Jane', 'Doe', 'DL87654321', 'C', DATE_ADD(CURDATE(), INTERVAL 1 YEAR), 'active', 1)",
        
        "INSERT INTO drivers (first_name, last_name, license_number, license_type, expiry_date, status, violations) VALUES
        ('Michael', 'Johnson', 'DL11223344', 'A', DATE_ADD(CURDATE(), INTERVAL 6 MONTH), 'active', 2)",
        
        "INSERT INTO drivers (first_name, last_name, license_number, license_type, expiry_date, status, violations) VALUES
        ('Emily', 'Williams', 'DL55667788', 'D', DATE_ADD(CURDATE(), INTERVAL 3 YEAR), 'active', 0)",
        
        "INSERT INTO drivers (first_name, last_name, license_number, license_type, expiry_date, status, violations) VALUES
        ('Robert', 'Brown', 'DL99001122', 'B', DATE_ADD(CURDATE(), INTERVAL -1 MONTH), 'inactive', 3)",
        
        "INSERT INTO drivers (first_name, last_name, license_number, license_type, expiry_date, status, violations) VALUES
        ('Sarah', 'Miller', 'DL33445566', 'C', DATE_ADD(CURDATE(), INTERVAL 15 DAY), 'active', 0)",
        
        "INSERT INTO drivers (first_name, last_name, license_number, license_type, expiry_date, status, violations) VALUES
        ('David', 'Wilson', 'DL77889900', 'A', DATE_ADD(CURDATE(), INTERVAL 2 YEAR), 'suspended', 5)"
    ];
    
    $successCount = 0;
    foreach ($sampleDrivers as $driverSql) {
        if ($conn->query($driverSql) === TRUE) {
            $successCount++;
        } else {
            echo "<p>Warning when adding sample driver: " . $conn->error . "</p>";
        }
    }
    
    echo "<p>Added $successCount sample drivers to the database</p>";
} else {
    echo "<p>Sample drivers already exist in the database. Total drivers: " . $row['count'] . "</p>";
}

// Close connection
$conn->close();

echo "<p>Setup complete! <a href='drivers.html'>Go to Drivers Page</a></p>";
?> 
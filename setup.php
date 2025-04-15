<?php
// Database configuration
$host = 'localhost';
$user = 'root';
$pass = '';
$dbname = 'traffic_management';

// Create connection
$conn = new mysqli($host, $user, $pass);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "Connected to MySQL server successfully.\n";

// Create database
$sql = "CREATE DATABASE IF NOT EXISTS $dbname";
if ($conn->query($sql) === TRUE) {
    echo "Database created or already exists successfully.\n";
} else {
    echo "Error creating database: " . $conn->error . "\n";
}

// Select the database
$conn->select_db($dbname);

// Create users table
$sql = "CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    fullname VARCHAR(100) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    token VARCHAR(64),
    token_expiry DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)";

if ($conn->query($sql) === TRUE) {
    echo "Users table created or already exists successfully.\n";
} else {
    echo "Error creating users table: " . $conn->error . "\n";
}

// Create vehicles table
$sql = "CREATE TABLE IF NOT EXISTS vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_type ENUM('car', 'truck', 'bus', 'motorcycle') NOT NULL,
    speed FLOAT NOT NULL,
    location_lat DECIMAL(10, 8) NOT NULL,
    location_lng DECIMAL(11, 8) NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if ($conn->query($sql) === TRUE) {
    echo "Vehicles table created or already exists successfully.\n";
} else {
    echo "Error creating vehicles table: " . $conn->error . "\n";
}

// Create incidents table
$sql = "CREATE TABLE IF NOT EXISTS incidents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    status ENUM('Active', 'Pending', 'Resolved') DEFAULT 'Active',
    description TEXT,
    reported_by INT,
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (reported_by) REFERENCES users(id)
)";

if ($conn->query($sql) === TRUE) {
    echo "Incidents table created or already exists successfully.\n";
} else {
    echo "Error creating incidents table: " . $conn->error . "\n";
}

// Create indexes
$sql = "CREATE INDEX IF NOT EXISTS idx_vehicle_status ON vehicles(status)";
$conn->query($sql);

$sql = "CREATE INDEX IF NOT EXISTS idx_incident_status ON incidents(status)";
$conn->query($sql);

$sql = "CREATE INDEX IF NOT EXISTS idx_user_token ON users(token)";
$conn->query($sql);

// Insert default admin user if not exists
$sql = "INSERT INTO users (username, password, email, fullname, role) 
        VALUES ('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@example.com', 'System Admin', 'admin')
        ON DUPLICATE KEY UPDATE id=id";

if ($conn->query($sql) === TRUE) {
    echo "Default admin user created or already exists.\n";
} else {
    echo "Error creating admin user: " . $conn->error . "\n";
}

// Verify tables
echo "\nVerifying tables:\n";
$tables = ['users', 'vehicles', 'incidents'];
foreach ($tables as $table) {
    $result = $conn->query("SHOW TABLES LIKE '$table'");
    if ($result->num_rows > 0) {
        echo "✓ $table table exists\n";
    } else {
        echo "✗ $table table does not exist\n";
    }
}

$conn->close();
?> 
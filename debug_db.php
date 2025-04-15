<?php
/**
 * Database debug script
 * Tests the database connection and checks if the drivers table exists
 */

// Include database configuration
require_once 'api/config.php';

// Set header for better readability in browser
header('Content-Type: text/html; charset=utf-8');

echo "<h1>Traffic Management Database Connection Debug</h1>";

echo "<h2>Database Configuration</h2>";
echo "<ul>";
echo "<li>Host: " . DB_HOST . "</li>";
echo "<li>User: " . DB_USER . "</li>";
echo "<li>Database: " . DB_NAME . "</li>";
echo "</ul>";

// Test database connection
echo "<h2>Database Connection Test</h2>";

try {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS);
    if ($conn->connect_error) {
        echo "<p style='color: red;'>Connection to MySQL server failed: " . $conn->connect_error . "</p>";
        echo "<p>Please check your database server is running and credentials are correct.</p>";
        exit();
    }
    
    echo "<p style='color: green;'>Successfully connected to MySQL server.</p>";
    
    // Test if database exists
    $result = $conn->query("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '" . DB_NAME . "'");
    
    if ($result->num_rows > 0) {
        echo "<p style='color: green;'>Database '" . DB_NAME . "' exists.</p>";
        
        // Select the database
        $conn->select_db(DB_NAME);
        
        // Test if drivers table exists
        $result = $conn->query("SHOW TABLES LIKE 'drivers'");
        
        if ($result->num_rows > 0) {
            echo "<p style='color: green;'>Table 'drivers' exists.</p>";
            
            // Count records in drivers table
            $result = $conn->query("SELECT COUNT(*) as count FROM drivers");
            $row = $result->fetch_assoc();
            echo "<p>There are " . $row['count'] . " records in the drivers table.</p>";
            
            // Show first 5 records
            $result = $conn->query("SELECT * FROM drivers LIMIT 5");
            
            if ($result->num_rows > 0) {
                echo "<h3>First 5 records:</h3>";
                echo "<table border='1' cellpadding='5'>";
                echo "<tr><th>ID</th><th>First Name</th><th>Last Name</th><th>License</th><th>Status</th></tr>";
                
                while($row = $result->fetch_assoc()) {
                    echo "<tr>";
                    echo "<td>" . $row['id'] . "</td>";
                    echo "<td>" . $row['first_name'] . "</td>";
                    echo "<td>" . $row['last_name'] . "</td>";
                    echo "<td>" . $row['license_number'] . "</td>";
                    echo "<td>" . $row['status'] . "</td>";
                    echo "</tr>";
                }
                
                echo "</table>";
            } else {
                echo "<p>No records found in drivers table.</p>";
            }
            
            // Display table structure
            $result = $conn->query("DESCRIBE drivers");
            
            echo "<h3>Table Structure:</h3>";
            echo "<table border='1' cellpadding='5'>";
            echo "<tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
            
            while($row = $result->fetch_assoc()) {
                echo "<tr>";
                foreach($row as $key => $value) {
                    echo "<td>" . ($value === NULL ? "NULL" : $value) . "</td>";
                }
                echo "</tr>";
            }
            
            echo "</table>";
            
        } else {
            echo "<p style='color: red;'>Table 'drivers' does not exist.</p>";
            echo "<p>To create the drivers table, run the <a href='setup_drivers.php'>setup script</a>.</p>";
        }
        
    } else {
        echo "<p style='color: red;'>Database '" . DB_NAME . "' does not exist.</p>";
        echo "<p>To create the database and tables, run the <a href='setup_drivers.php'>setup script</a>.</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>Error: " . $e->getMessage() . "</p>";
}

echo "<h2>API Connection Test</h2>";
echo "<p>Testing connection to drivers API endpoint...</p>";

echo "<div id='apiResponse' style='background-color: #f5f5f5; padding: 10px; border: 1px solid #ddd;'>";
echo "Loading...";
echo "</div>";

echo "<script>
    // Test API endpoint
    fetch('api/drivers.php?page=1&limit=1')
        .then(response => {
            document.getElementById('apiResponse').innerHTML += '<p>Response status: ' + response.status + '</p>';
            return response.json();
        })
        .then(data => {
            document.getElementById('apiResponse').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
        })
        .catch(error => {
            document.getElementById('apiResponse').innerHTML = '<p style=\"color: red;\">Error: ' + error.message + '</p>';
        });
</script>";

echo "<p><a href='drivers.html'>Go to Drivers Page</a> | <a href='setup_drivers.php'>Run Setup Script</a></p>";
?> 
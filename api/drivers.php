<?php
/**
 * Driver Management API
 * Provides CRUD operations for driver information
 */

header("Content-Type: application/json");
require_once("config.php");

// Initialize response array
$response = [
    'status' => 'error',
    'message' => 'Invalid request',
    'data' => null
];

// Connect to database using constants from config.php
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Check connection
if ($conn->connect_error) {
    $response['message'] = "Connection failed: " . $conn->connect_error;
    echo json_encode($response);
    exit();
}

// Check if drivers table exists
function checkDriversTableExists($conn) {
    $result = $conn->query("SHOW TABLES LIKE 'drivers'");
    return $result->num_rows > 0;
}

if (!checkDriversTableExists($conn)) {
    $response['message'] = "Drivers table does not exist. Please run setup_drivers.php to create the table.";
    echo json_encode($response);
    exit();
}

// Check request method
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Retrieve driver(s)
        if (isset($_GET['id'])) {
            // Get specific driver
            $id = $conn->real_escape_string($_GET['id']);
            $sql = "SELECT * FROM drivers WHERE id = '$id'";
            $result = $conn->query($sql);
            
            if ($result->num_rows > 0) {
                $response['status'] = 'success';
                $response['message'] = 'Driver found';
                $response['data'] = $result->fetch_assoc();
            } else {
                $response['message'] = 'Driver not found';
            }
        } else {
            // Get all drivers with pagination
            $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
            $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
            $offset = ($page - 1) * $limit;
            
            // Add filters if provided
            $whereClause = "";
            $params = [];
            
            if (isset($_GET['status']) && $_GET['status'] !== '') {
                $status = $conn->real_escape_string($_GET['status']);
                $whereClause .= " WHERE status = '$status'";
            }
            
            if (isset($_GET['license_type']) && $_GET['license_type'] !== '') {
                $licenseType = $conn->real_escape_string($_GET['license_type']);
                if ($whereClause === "") {
                    $whereClause .= " WHERE license_type = '$licenseType'";
                } else {
                    $whereClause .= " AND license_type = '$licenseType'";
                }
            }
            
            if (isset($_GET['search']) && $_GET['search'] !== '') {
                $search = $conn->real_escape_string($_GET['search']);
                if ($whereClause === "") {
                    $whereClause .= " WHERE (first_name LIKE '%$search%' OR last_name LIKE '%$search%' OR license_number LIKE '%$search%')";
                } else {
                    $whereClause .= " AND (first_name LIKE '%$search%' OR last_name LIKE '%$search%' OR license_number LIKE '%$search%')";
                }
            }
            
            // Get total count for pagination
            $countSql = "SELECT COUNT(*) as total FROM drivers" . $whereClause;
            $countResult = $conn->query($countSql);
            $totalCount = $countResult->fetch_assoc()['total'];
            
            // Get filtered drivers
            $sql = "SELECT * FROM drivers" . $whereClause . " ORDER BY id DESC LIMIT $offset, $limit";
            $result = $conn->query($sql);
            
            $drivers = [];
            if ($result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $drivers[] = $row;
                }
            }
            
            $response['status'] = 'success';
            $response['message'] = count($drivers) . ' drivers found';
            $response['data'] = [
                'drivers' => $drivers,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $totalCount,
                    'total_pages' => ceil($totalCount / $limit)
                ]
            ];
            
            // Get summary statistics
            $statsSql = "SELECT 
                COUNT(*) as total_drivers,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_drivers,
                SUM(CASE WHEN expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND status = 'active' THEN 1 ELSE 0 END) as expiring_licenses,
                SUM(CASE WHEN violations > 0 THEN 1 ELSE 0 END) as incident_involved
                FROM drivers";
            
            $statsResult = $conn->query($statsSql);
            if ($statsResult->num_rows > 0) {
                $response['data']['stats'] = $statsResult->fetch_assoc();
            }
        }
        break;
        
    case 'POST':
        // Create new driver
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Check if JSON is valid
        if (json_last_error() !== JSON_ERROR_NONE) {
            $response['message'] = 'Invalid JSON data: ' . json_last_error_msg();
            break;
        }
        
        if (
            isset($data['first_name']) && 
            isset($data['last_name']) && 
            isset($data['license_number']) && 
            isset($data['license_type']) && 
            isset($data['expiry_date']) && 
            isset($data['status'])
        ) {
            // Validate input
            $firstName = trim($conn->real_escape_string($data['first_name']));
            $lastName = trim($conn->real_escape_string($data['last_name']));
            $licenseNumber = trim($conn->real_escape_string($data['license_number']));
            $licenseType = trim($conn->real_escape_string($data['license_type']));
            $expiryDate = trim($conn->real_escape_string($data['expiry_date']));
            $status = trim($conn->real_escape_string($data['status']));
            $violations = isset($data['violations']) ? intval($data['violations']) : 0;
            
            // Validate fields
            if (empty($firstName) || empty($lastName) || empty($licenseNumber)) {
                $response['message'] = 'First name, last name, and license number cannot be empty';
                break;
            }
            
            // Validate license type
            if (!in_array($licenseType, ['A', 'B', 'C', 'D'])) {
                $response['message'] = 'Invalid license type. Must be A, B, C, or D';
                break;
            }
            
            // Validate status
            if (!in_array($status, ['active', 'inactive', 'suspended'])) {
                $response['message'] = 'Invalid status. Must be active, inactive, or suspended';
                break;
            }
            
            // Validate expiry date format
            if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $expiryDate)) {
                $response['message'] = 'Invalid date format. Use YYYY-MM-DD';
                break;
            }
            
            // Check if license number already exists
            $checkSql = "SELECT * FROM drivers WHERE license_number = '$licenseNumber'";
            $checkResult = $conn->query($checkSql);
            
            if ($checkResult === false) {
                $response['message'] = 'Database error when checking license: ' . $conn->error;
                break;
            }
            
            if ($checkResult->num_rows > 0) {
                $response['message'] = 'Driver with this license number already exists';
                break;
            }
            
            // Insert new driver
            $sql = "INSERT INTO drivers (first_name, last_name, license_number, license_type, expiry_date, status, violations) 
                    VALUES ('$firstName', '$lastName', '$licenseNumber', '$licenseType', '$expiryDate', '$status', $violations)";
            
            if ($conn->query($sql) === TRUE) {
                $response['status'] = 'success';
                $response['message'] = 'Driver created successfully';
                $response['data'] = [
                    'id' => $conn->insert_id,
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'license_number' => $licenseNumber,
                    'license_type' => $licenseType,
                    'expiry_date' => $expiryDate,
                    'status' => $status,
                    'violations' => $violations
                ];
            } else {
                $response['message'] = 'Error creating driver: ' . $conn->error;
                // Log the error for debugging
                error_log("DB Error in drivers.php: " . $conn->error);
            }
        } else {
            $response['message'] = 'Missing required fields';
            // Log which fields are missing
            $missingFields = [];
            if (!isset($data['first_name'])) $missingFields[] = 'first_name';
            if (!isset($data['last_name'])) $missingFields[] = 'last_name';
            if (!isset($data['license_number'])) $missingFields[] = 'license_number';
            if (!isset($data['license_type'])) $missingFields[] = 'license_type';
            if (!isset($data['expiry_date'])) $missingFields[] = 'expiry_date';
            if (!isset($data['status'])) $missingFields[] = 'status';
            
            $response['missing_fields'] = $missingFields;
        }
        break;
        
    case 'PUT':
        // Update existing driver
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (isset($data['id'])) {
            $id = $conn->real_escape_string($data['id']);
            
            // Build update query
            $updates = [];
            if (isset($data['first_name'])) {
                $firstName = $conn->real_escape_string($data['first_name']);
                $updates[] = "first_name = '$firstName'";
            }
            
            if (isset($data['last_name'])) {
                $lastName = $conn->real_escape_string($data['last_name']);
                $updates[] = "last_name = '$lastName'";
            }
            
            if (isset($data['license_number'])) {
                $licenseNumber = $conn->real_escape_string($data['license_number']);
                $updates[] = "license_number = '$licenseNumber'";
            }
            
            if (isset($data['license_type'])) {
                $licenseType = $conn->real_escape_string($data['license_type']);
                $updates[] = "license_type = '$licenseType'";
            }
            
            if (isset($data['expiry_date'])) {
                $expiryDate = $conn->real_escape_string($data['expiry_date']);
                $updates[] = "expiry_date = '$expiryDate'";
            }
            
            if (isset($data['status'])) {
                $status = $conn->real_escape_string($data['status']);
                $updates[] = "status = '$status'";
            }
            
            if (isset($data['violations'])) {
                $violations = intval($data['violations']);
                $updates[] = "violations = $violations";
            }
            
            if (count($updates) > 0) {
                $sql = "UPDATE drivers SET " . implode(", ", $updates) . " WHERE id = '$id'";
                
                if ($conn->query($sql) === TRUE) {
                    // Get updated driver
                    $getSql = "SELECT * FROM drivers WHERE id = '$id'";
                    $result = $conn->query($getSql);
                    
                    $response['status'] = 'success';
                    $response['message'] = 'Driver updated successfully';
                    $response['data'] = $result->fetch_assoc();
                } else {
                    $response['message'] = 'Error updating driver: ' . $conn->error;
                }
            } else {
                $response['message'] = 'No fields to update';
            }
        } else {
            $response['message'] = 'Missing driver ID';
        }
        break;
        
    case 'DELETE':
        // Delete driver
        if (isset($_GET['id'])) {
            $id = $conn->real_escape_string($_GET['id']);
            
            $sql = "DELETE FROM drivers WHERE id = '$id'";
            
            if ($conn->query($sql) === TRUE) {
                $response['status'] = 'success';
                $response['message'] = 'Driver deleted successfully';
                $response['data'] = ['id' => $id];
            } else {
                $response['message'] = 'Error deleting driver: ' . $conn->error;
            }
        } else {
            $response['message'] = 'Missing driver ID';
        }
        break;
        
    default:
        $response['message'] = 'Unsupported request method';
        break;
}

// Close connection
$conn->close();

// Send response
echo json_encode($response);
?> 
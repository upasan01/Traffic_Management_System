<?php
/**
 * Personnel Management API
 * Provides CRUD operations for personnel information
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

// Check if personnel table exists
function checkPersonnelTableExists($conn) {
    $result = $conn->query("SHOW TABLES LIKE 'personnel'");
    return $result->num_rows > 0;
}

if (!checkPersonnelTableExists($conn)) {
    // Create the personnel table if it doesn't exist
    $sql = "CREATE TABLE personnel (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        employee_id VARCHAR(20) NOT NULL UNIQUE,
        department VARCHAR(50) NOT NULL,
        role VARCHAR(50) NOT NULL,
        join_date DATE NOT NULL,
        status ENUM('active', 'leave', 'training', 'inactive') NOT NULL DEFAULT 'active',
        certifications TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    
    if ($conn->query($sql) === TRUE) {
        // Add sample data
        $sampleData = [
            [
                'first_name' => 'John',
                'last_name' => 'Anderson',
                'employee_id' => 'TC001',
                'department' => 'traffic',
                'role' => 'Traffic Controller',
                'join_date' => '2018-05-15',
                'status' => 'active',
                'certifications' => 'traffic_management,leadership'
            ],
            [
                'first_name' => 'Jane',
                'last_name' => 'Smith',
                'employee_id' => 'ER002',
                'department' => 'emergency',
                'role' => 'Emergency Responder',
                'join_date' => '2019-02-10',
                'status' => 'active',
                'certifications' => 'emergency_response,first_aid'
            ],
            [
                'first_name' => 'Michael',
                'last_name' => 'Johnson',
                'employee_id' => 'AD003',
                'department' => 'admin',
                'role' => 'Administrator',
                'join_date' => '2017-11-20',
                'status' => 'active',
                'certifications' => 'leadership'
            ],
            [
                'first_name' => 'Sarah',
                'last_name' => 'Williams',
                'employee_id' => 'TC004',
                'department' => 'traffic',
                'role' => 'Senior Controller',
                'join_date' => '2016-08-05',
                'status' => 'active',
                'certifications' => 'traffic_management,leadership,first_aid'
            ],
            [
                'first_name' => 'David',
                'last_name' => 'Brown',
                'employee_id' => 'TS005',
                'department' => 'tech',
                'role' => 'Systems Analyst',
                'join_date' => '2020-01-15',
                'status' => 'training',
                'certifications' => 'technical'
            ]
        ];
        
        foreach ($sampleData as $item) {
            $insertSql = "INSERT INTO personnel (first_name, last_name, employee_id, department, role, join_date, status, certifications) 
                        VALUES ('{$item['first_name']}', '{$item['last_name']}', '{$item['employee_id']}', '{$item['department']}', 
                                '{$item['role']}', '{$item['join_date']}', '{$item['status']}', '{$item['certifications']}')";
            $conn->query($insertSql);
        }
    } else {
        $response['message'] = "Error creating personnel table: " . $conn->error;
        echo json_encode($response);
        exit();
    }
}

// Check request method
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Retrieve personnel
        if (isset($_GET['id'])) {
            // Get specific personnel
            $id = $conn->real_escape_string($_GET['id']);
            $sql = "SELECT * FROM personnel WHERE id = '$id'";
            $result = $conn->query($sql);
            
            if ($result->num_rows > 0) {
                $response['status'] = 'success';
                $response['message'] = 'Personnel found';
                $response['data'] = $result->fetch_assoc();
            } else {
                $response['message'] = 'Personnel not found';
            }
        } else {
            // Get all personnel with pagination
            $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
            $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
            $offset = ($page - 1) * $limit;
            
            // Add filters if provided
            $whereClause = "";
            
            if (isset($_GET['status']) && $_GET['status'] !== '') {
                $status = $conn->real_escape_string($_GET['status']);
                $whereClause .= " WHERE status = '$status'";
            }
            
            if (isset($_GET['department']) && $_GET['department'] !== '') {
                $department = $conn->real_escape_string($_GET['department']);
                if ($whereClause === "") {
                    $whereClause .= " WHERE department = '$department'";
                } else {
                    $whereClause .= " AND department = '$department'";
                }
            }
            
            if (isset($_GET['search']) && $_GET['search'] !== '') {
                $search = $conn->real_escape_string($_GET['search']);
                if ($whereClause === "") {
                    $whereClause .= " WHERE (first_name LIKE '%$search%' OR last_name LIKE '%$search%' OR employee_id LIKE '%$search%' OR role LIKE '%$search%')";
                } else {
                    $whereClause .= " AND (first_name LIKE '%$search%' OR last_name LIKE '%$search%' OR employee_id LIKE '%$search%' OR role LIKE '%$search%')";
                }
            }
            
            // Get total count for pagination
            $countSql = "SELECT COUNT(*) as total FROM personnel" . $whereClause;
            $countResult = $conn->query($countSql);
            $totalCount = $countResult->fetch_assoc()['total'];
            
            // Get filtered personnel
            $sql = "SELECT * FROM personnel" . $whereClause . " ORDER BY id DESC LIMIT $offset, $limit";
            $result = $conn->query($sql);
            
            $personnel = [];
            if ($result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    // Calculate experience based on join date
                    $joinDate = new DateTime($row['join_date']);
                    $now = new DateTime();
                    $interval = $joinDate->diff($now);
                    $yearsExperience = $interval->y;
                    $monthsExperience = $interval->m;
                    
                    $row['experience'] = $yearsExperience > 0 
                        ? $yearsExperience . ($yearsExperience == 1 ? ' year' : ' years') 
                        : $monthsExperience . ' months';
                        
                    $personnel[] = $row;
                }
            }
            
            $response['status'] = 'success';
            $response['message'] = count($personnel) . ' personnel found';
            $response['data'] = [
                'personnel' => $personnel,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $totalCount,
                    'total_pages' => ceil($totalCount / $limit)
                ]
            ];
            
            // Get summary statistics
            $statsSql = "SELECT 
                COUNT(*) as total_personnel,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_personnel,
                AVG(TIMESTAMPDIFF(YEAR, join_date, CURDATE())) as avg_experience,
                COUNT(DISTINCT id) as certified_count
                FROM personnel";
                
            $statsResult = $conn->query($statsSql);
            if ($statsResult->num_rows > 0) {
                $stats = $statsResult->fetch_assoc();
                
                // Calculate certification rate
                $certificationRateSql = "SELECT COUNT(*) as cert_count FROM personnel WHERE certifications != ''";
                $certResult = $conn->query($certificationRateSql);
                $certCount = $certResult->fetch_assoc()['cert_count'];
                
                $stats['certification_rate'] = round(($certCount / $stats['total_personnel']) * 100);
                $stats['avg_experience'] = round($stats['avg_experience'], 1);
                
                $response['data']['stats'] = $stats;
            }
        }
        break;
        
    case 'POST':
        // Create new personnel
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Check if JSON is valid
        if (json_last_error() !== JSON_ERROR_NONE) {
            $response['message'] = 'Invalid JSON data: ' . json_last_error_msg();
            break;
        }
        
        if (
            isset($data['first_name']) && 
            isset($data['last_name']) && 
            isset($data['employee_id']) && 
            isset($data['department']) && 
            isset($data['role']) && 
            isset($data['join_date']) && 
            isset($data['status'])
        ) {
            // Validate input
            $firstName = trim($conn->real_escape_string($data['first_name']));
            $lastName = trim($conn->real_escape_string($data['last_name']));
            $employeeId = trim($conn->real_escape_string($data['employee_id']));
            $department = trim($conn->real_escape_string($data['department']));
            $role = trim($conn->real_escape_string($data['role']));
            $joinDate = trim($conn->real_escape_string($data['join_date']));
            $status = trim($conn->real_escape_string($data['status']));
            $certifications = isset($data['certifications']) ? trim($conn->real_escape_string($data['certifications'])) : '';
            
            // Validate fields
            if (empty($firstName) || empty($lastName) || empty($employeeId)) {
                $response['message'] = 'First name, last name, and employee ID cannot be empty';
                break;
            }
            
            // Validate department
            if (!in_array($department, ['traffic', 'emergency', 'admin', 'tech'])) {
                $response['message'] = 'Invalid department';
                break;
            }
            
            // Validate status
            if (!in_array($status, ['active', 'leave', 'training', 'inactive'])) {
                $response['message'] = 'Invalid status';
                break;
            }
            
            // Validate date format
            if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $joinDate)) {
                $response['message'] = 'Invalid date format. Use YYYY-MM-DD';
                break;
            }
            
            // Check if employee ID already exists
            $checkSql = "SELECT * FROM personnel WHERE employee_id = '$employeeId'";
            $checkResult = $conn->query($checkSql);
            
            if ($checkResult === false) {
                $response['message'] = 'Database error when checking employee ID: ' . $conn->error;
                break;
            }
            
            if ($checkResult->num_rows > 0) {
                $response['message'] = 'Personnel with this employee ID already exists';
                break;
            }
            
            // Insert new personnel
            $sql = "INSERT INTO personnel (first_name, last_name, employee_id, department, role, join_date, status, certifications) 
                    VALUES ('$firstName', '$lastName', '$employeeId', '$department', '$role', '$joinDate', '$status', '$certifications')";
            
            if ($conn->query($sql) === TRUE) {
                $response['status'] = 'success';
                $response['message'] = 'Personnel created successfully';
                $response['data'] = [
                    'id' => $conn->insert_id,
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'employee_id' => $employeeId,
                    'department' => $department,
                    'role' => $role,
                    'join_date' => $joinDate,
                    'status' => $status,
                    'certifications' => $certifications
                ];
            } else {
                $response['message'] = 'Error creating personnel: ' . $conn->error;
                // Log the error for debugging
                error_log("DB Error in personnel.php: " . $conn->error);
            }
        } else {
            $response['message'] = 'Missing required fields';
            // Log which fields are missing
            $missingFields = [];
            if (!isset($data['first_name'])) $missingFields[] = 'first_name';
            if (!isset($data['last_name'])) $missingFields[] = 'last_name';
            if (!isset($data['employee_id'])) $missingFields[] = 'employee_id';
            if (!isset($data['department'])) $missingFields[] = 'department';
            if (!isset($data['role'])) $missingFields[] = 'role';
            if (!isset($data['join_date'])) $missingFields[] = 'join_date';
            if (!isset($data['status'])) $missingFields[] = 'status';
            
            $response['missing_fields'] = $missingFields;
        }
        break;
        
    case 'PUT':
        // Update existing personnel
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
            
            if (isset($data['employee_id'])) {
                $employeeId = $conn->real_escape_string($data['employee_id']);
                
                // Check if employee ID already exists but not belonging to this record
                $checkSql = "SELECT * FROM personnel WHERE employee_id = '$employeeId' AND id != '$id'";
                $checkResult = $conn->query($checkSql);
                
                if ($checkResult === false) {
                    $response['message'] = 'Database error when checking employee ID: ' . $conn->error;
                    break;
                }
                
                if ($checkResult->num_rows > 0) {
                    $response['message'] = 'Another personnel with this employee ID already exists';
                    break;
                }
                
                $updates[] = "employee_id = '$employeeId'";
            }
            
            if (isset($data['department'])) {
                $department = $conn->real_escape_string($data['department']);
                
                if (!in_array($department, ['traffic', 'emergency', 'admin', 'tech'])) {
                    $response['message'] = 'Invalid department';
                    break;
                }
                
                $updates[] = "department = '$department'";
            }
            
            if (isset($data['role'])) {
                $role = $conn->real_escape_string($data['role']);
                $updates[] = "role = '$role'";
            }
            
            if (isset($data['join_date'])) {
                $joinDate = $conn->real_escape_string($data['join_date']);
                
                if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $joinDate)) {
                    $response['message'] = 'Invalid date format. Use YYYY-MM-DD';
                    break;
                }
                
                $updates[] = "join_date = '$joinDate'";
            }
            
            if (isset($data['status'])) {
                $status = $conn->real_escape_string($data['status']);
                
                if (!in_array($status, ['active', 'leave', 'training', 'inactive'])) {
                    $response['message'] = 'Invalid status';
                    break;
                }
                
                $updates[] = "status = '$status'";
            }
            
            if (isset($data['certifications'])) {
                $certifications = $conn->real_escape_string($data['certifications']);
                $updates[] = "certifications = '$certifications'";
            }
            
            if (count($updates) > 0) {
                $sql = "UPDATE personnel SET " . implode(", ", $updates) . " WHERE id = '$id'";
                
                if ($conn->query($sql) === TRUE) {
                    $response['status'] = 'success';
                    $response['message'] = 'Personnel updated successfully';
                    
                    // Get updated personnel data
                    $selectSql = "SELECT * FROM personnel WHERE id = '$id'";
                    $result = $conn->query($selectSql);
                    if ($result->num_rows > 0) {
                        $response['data'] = $result->fetch_assoc();
                    }
                } else {
                    $response['message'] = 'Error updating personnel: ' . $conn->error;
                }
            } else {
                $response['message'] = 'No fields to update';
            }
        } else {
            $response['message'] = 'Missing ID parameter';
        }
        break;
        
    case 'DELETE':
        // Delete personnel
        if (isset($_GET['id'])) {
            $id = $conn->real_escape_string($_GET['id']);
            
            $sql = "DELETE FROM personnel WHERE id = '$id'";
            
            if ($conn->query($sql) === TRUE) {
                if ($conn->affected_rows > 0) {
                    $response['status'] = 'success';
                    $response['message'] = 'Personnel deleted successfully';
                } else {
                    $response['message'] = 'Personnel not found';
                }
            } else {
                $response['message'] = 'Error deleting personnel: ' . $conn->error;
            }
        } else {
            $response['message'] = 'Missing ID parameter';
        }
        break;
        
    default:
        $response['message'] = 'Unsupported request method';
}

// Close connection
$conn->close();

// Send response
echo json_encode($response);
?> 
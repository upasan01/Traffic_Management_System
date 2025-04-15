<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Database connection
$db = new PDO('mysql:host=localhost;dbname=incident_management', 'root', '');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

// Handle different request methods
switch ($method) {
    case 'GET':
        handleGetRequest();
        break;
    case 'POST':
        handlePostRequest();
        break;
    case 'PUT':
        handlePutRequest();
        break;
    case 'DELETE':
        handleDeleteRequest();
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

function handleGetRequest() {
    global $db;
    
    try {
        $query = "SELECT * FROM incidents ORDER BY created_at DESC";
        $stmt = $db->query($query);
        $incidents = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($incidents);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

function handlePostRequest() {
    global $db;
    
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        if (!validateIncidentData($data)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid data']);
            return;
        }
        
        $query = "INSERT INTO incidents (victim_name, type, location, status, description) 
                 VALUES (:victim_name, :type, :location, :status, :description)";
        
        $stmt = $db->prepare($query);
        $stmt->execute([
            'victim_name' => $data['victim_name'],
            'type' => $data['type'],
            'location' => $data['location'],
            'status' => $data['status'],
            'description' => $data['description']
        ]);
        
        $id = $db->lastInsertId();
        echo json_encode(['id' => $id, 'message' => 'Incident created successfully']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

function handlePutRequest() {
    global $db;
    
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        if (!validateIncidentData($data) || !isset($data['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid data']);
            return;
        }
        
        $query = "UPDATE incidents 
                 SET victim_name = :victim_name,
                     type = :type,
                     location = :location,
                     status = :status,
                     description = :description
                 WHERE id = :id";
        
        $stmt = $db->prepare($query);
        $stmt->execute([
            'id' => $data['id'],
            'victim_name' => $data['victim_name'],
            'type' => $data['type'],
            'location' => $data['location'],
            'status' => $data['status'],
            'description' => $data['description']
        ]);
        
        echo json_encode(['message' => 'Incident updated successfully']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

function handleDeleteRequest() {
    global $db;
    
    try {
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID is required']);
            return;
        }
        
        $query = "DELETE FROM incidents WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->execute(['id' => $id]);
        
        echo json_encode(['message' => 'Incident deleted successfully']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

function validateIncidentData($data) {
    $requiredFields = ['victim_name', 'type', 'location', 'status', 'description'];
    
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            return false;
        }
    }
    
    // Validate status
    $validStatuses = ['active', 'pending', 'resolved'];
    if (!in_array($data['status'], $validStatuses)) {
        return false;
    }
    
    // Validate type
    $validTypes = ['accident', 'traffic_jam', 'road_block', 'weather'];
    if (!in_array($data['type'], $validTypes)) {
        return false;
    }
    
    return true;
}
?> 
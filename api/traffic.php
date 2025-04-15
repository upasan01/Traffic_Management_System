<?php
require_once 'config.php';

// Get database connection
$conn = getDBConnection();

// Get traffic data
$query = "SELECT 
            COUNT(*) as totalVehicles,
            SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as incidents,
            AVG(speed) as avgSpeed
          FROM vehicles";

$result = $conn->query($query);
$data = $result->fetch_assoc();

// Determine traffic flow based on average speed
if ($data['avgSpeed'] > 40) {
    $flow = 'Normal';
} elseif ($data['avgSpeed'] > 20) {
    $flow = 'Slow';
} else {
    $flow = 'Heavy';
}

// Prepare response
$response = [
    'totalVehicles' => $data['totalVehicles'],
    'incidents' => $data['incidents'],
    'flow' => $flow,
    'avgSpeed' => round($data['avgSpeed'], 2)
];

// Send response
echo json_encode($response);

// Close connection
$conn->close();
?> 
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Database connection
$db = new PDO('mysql:host=localhost;dbname=incident_management', 'root', '');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Get time range from request
$timeRange = isset($_GET['range']) ? $_GET['range'] : 'day';
$startDate = date('Y-m-d H:i:s', strtotime("-1 $timeRange"));

// Get overview data
$overview = [
    'total' => getTotalIncidents($db),
    'resolved' => getResolvedIncidents($db, $startDate),
    'pending' => getPendingIncidents($db, $startDate),
    'active' => getActiveIncidents($db, $startDate)
];

// Get chart data
$charts = [
    'type' => getTypeChartData($db, $startDate),
    'status' => getStatusChartData($db, $startDate),
    'hourly' => getHourlyChartData($db, $startDate)
];

// Return JSON response
echo json_encode([
    'overview' => $overview,
    'charts' => $charts
]);

// Helper functions
function getTotalIncidents($db) {
    $stmt = $db->query('SELECT COUNT(*) FROM incidents');
    return $stmt->fetchColumn();
}

function getResolvedIncidents($db, $startDate) {
    $stmt = $db->prepare('SELECT COUNT(*) FROM incidents WHERE status = "resolved" AND created_at >= ?');
    $stmt->execute([$startDate]);
    return $stmt->fetchColumn();
}

function getPendingIncidents($db, $startDate) {
    $stmt = $db->prepare('SELECT COUNT(*) FROM incidents WHERE status = "pending" AND created_at >= ?');
    $stmt->execute([$startDate]);
    return $stmt->fetchColumn();
}

function getActiveIncidents($db, $startDate) {
    $stmt = $db->prepare('SELECT COUNT(*) FROM incidents WHERE status = "active" AND created_at >= ?');
    $stmt->execute([$startDate]);
    return $stmt->fetchColumn();
}

function getTypeChartData($db, $startDate) {
    $stmt = $db->prepare('
        SELECT type, COUNT(*) as count 
        FROM incidents 
        WHERE created_at >= ? 
        GROUP BY type
    ');
    $stmt->execute([$startDate]);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $labels = [];
    $values = [];
    $colors = [];
    
    foreach ($data as $row) {
        $labels[] = $row['type'];
        $values[] = $row['count'];
        $colors[] = getRandomColor();
    }
    
    return [
        'labels' => $labels,
        'datasets' => [[
            'data' => $values,
            'backgroundColor' => $colors,
            'borderWidth' => 1
        ]]
    ];
}

function getStatusChartData($db, $startDate) {
    $stmt = $db->prepare('
        SELECT status, COUNT(*) as count 
        FROM incidents 
        WHERE created_at >= ? 
        GROUP BY status
    ');
    $stmt->execute([$startDate]);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $labels = [];
    $values = [];
    $colors = [];
    
    foreach ($data as $row) {
        $labels[] = $row['status'];
        $values[] = $row['count'];
        $colors[] = getStatusColor($row['status']);
    }
    
    return [
        'labels' => $labels,
        'datasets' => [[
            'data' => $values,
            'backgroundColor' => $colors,
            'borderWidth' => 1
        ]]
    ];
}

function getHourlyChartData($db, $startDate) {
    $stmt = $db->prepare('
        SELECT HOUR(created_at) as hour, COUNT(*) as count 
        FROM incidents 
        WHERE created_at >= ? 
        GROUP BY HOUR(created_at)
        ORDER BY hour
    ');
    $stmt->execute([$startDate]);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $labels = [];
    $values = [];
    
    // Initialize all hours
    for ($i = 0; $i < 24; $i++) {
        $labels[] = sprintf('%02d:00', $i);
        $values[$i] = 0;
    }
    
    // Fill in actual values
    foreach ($data as $row) {
        $values[$row['hour']] = $row['count'];
    }
    
    return [
        'labels' => $labels,
        'datasets' => [[
            'data' => array_values($values),
            'borderColor' => '#3B82F6',
            'backgroundColor' => 'rgba(59, 130, 246, 0.1)',
            'fill' => true,
            'tension' => 0.4
        ]]
    ];
}

function getRandomColor() {
    return sprintf('#%06X', mt_rand(0, 0xFFFFFF));
}

function getStatusColor($status) {
    $colors = [
        'resolved' => '#10B981',
        'pending' => '#F59E0B',
        'active' => '#EF4444'
    ];
    return $colors[$status] ?? getRandomColor();
}
?> 
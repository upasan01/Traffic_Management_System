-- Create the database
CREATE DATABASE IF NOT EXISTS traffic_management;
USE traffic_management;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
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
);

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_type ENUM('car', 'truck', 'bus', 'motorcycle') NOT NULL,
    speed FLOAT NOT NULL,
    location_lat DECIMAL(10, 8) NOT NULL,
    location_lng DECIMAL(11, 8) NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create incidents table
CREATE TABLE IF NOT EXISTS incidents (
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
);

-- Create drivers table
CREATE TABLE IF NOT EXISTS drivers (
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
);

-- Insert default admin user
INSERT INTO users (username, password, email, fullname, role) 
VALUES ('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@example.com', 'System Admin', 'admin')
ON DUPLICATE KEY UPDATE id=id;

-- Insert sample drivers data
INSERT INTO drivers (first_name, last_name, license_number, license_type, expiry_date, status, violations) VALUES
('John', 'Smith', 'DL12345678', 'B', DATE_ADD(CURDATE(), INTERVAL 2 YEAR), 'active', 0),
('Jane', 'Doe', 'DL87654321', 'C', DATE_ADD(CURDATE(), INTERVAL 1 YEAR), 'active', 1),
('Michael', 'Johnson', 'DL11223344', 'A', DATE_ADD(CURDATE(), INTERVAL 6 MONTH), 'active', 2),
('Emily', 'Williams', 'DL55667788', 'D', DATE_ADD(CURDATE(), INTERVAL 3 YEAR), 'active', 0),
('Robert', 'Brown', 'DL99001122', 'B', DATE_ADD(CURDATE(), INTERVAL -1 MONTH), 'inactive', 3),
('Sarah', 'Miller', 'DL33445566', 'C', DATE_ADD(CURDATE(), INTERVAL 15 DAY), 'active', 0),
('David', 'Wilson', 'DL77889900', 'A', DATE_ADD(CURDATE(), INTERVAL 2 YEAR), 'suspended', 5);

-- Create index for faster queries
CREATE INDEX idx_vehicle_status ON vehicles(status);
CREATE INDEX idx_incident_status ON incidents(status);
CREATE INDEX idx_user_token ON users(token);
CREATE INDEX idx_driver_status ON drivers(status);
CREATE INDEX idx_driver_license ON drivers(license_number);
CREATE INDEX idx_driver_expiry ON drivers(expiry_date); 
-- ============================================
-- Movie Ticket Booking System - Database Setup
-- Run this in phpMyAdmin or MySQL CLI
-- ============================================

CREATE DATABASE IF NOT EXISTS movie_booking;
USE movie_booking;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('manager', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Movies Table
CREATE TABLE IF NOT EXISTS movies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    genre VARCHAR(100),
    duration INT COMMENT 'Duration in minutes',
    language VARCHAR(50) DEFAULT 'English',
    rating VARCHAR(10),
    poster_url VARCHAR(500),
    description TEXT,
    show_date DATE,
    show_time TIME,
    price_upper DECIMAL(10,2) DEFAULT 300.00,
    price_middle DECIMAL(10,2) DEFAULT 200.00,
    price_lower DECIMAL(10,2) DEFAULT 150.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seats Table
CREATE TABLE IF NOT EXISTS seats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    movie_id INT NOT NULL,
    seat_level ENUM('upper', 'middle', 'lower') NOT NULL,
    seat_number VARCHAR(10) NOT NULL,
    is_booked BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    UNIQUE KEY unique_seat (movie_id, seat_level, seat_number)
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    seat_id INT NOT NULL,
    booking_reference VARCHAR(20) UNIQUE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('confirmed', 'cancelled') DEFAULT 'confirmed',
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (movie_id) REFERENCES movies(id),
    FOREIGN KEY (seat_id) REFERENCES seats(id)
);

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Insert Manager
INSERT INTO users (name, email, password, role) VALUES
('Cinema Manager', 'manager@cinema.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'manager');
-- Manager password: password

-- Insert Sample Users
INSERT INTO users (name, email, password, role) VALUES
('John Doe', 'john@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
('Jane Smith', 'jane@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');
-- User password: password

-- Insert Movies
INSERT INTO movies (title, genre, duration, language, rating, description, show_date, show_time, price_upper, price_middle, price_lower) VALUES
('Interstellar: Reborn', 'Sci-Fi / Thriller', 169, 'English', 'U/A', 'A breathtaking journey through wormholes and black holes to save humanity from extinction.', '2026-04-22', '10:00:00', 350.00, 250.00, 180.00),
('The Dark Horizon', 'Action / Drama', 148, 'English', 'U/A', 'A vigilante must confront a rising criminal empire threatening to consume the entire city.', '2026-04-22', '13:30:00', 320.00, 220.00, 160.00),
('Chennai Express 2', 'Comedy / Romance', 135, 'Tamil', 'U', 'A hilarious cross-country adventure filled with unexpected twists and heartwarming moments.', '2026-04-22', '17:00:00', 280.00, 200.00, 150.00),
('Phantom Protocol', 'Action / Spy', 142, 'English', 'A', 'Elite agents race against time to dismantle a global terror network before it strikes.', '2026-04-23', '11:00:00', 330.00, 230.00, 170.00),
('Kalki Rising', 'Mythology / Action', 175, 'Telugu', 'U/A', 'An epic mythological saga where ancient prophecy meets modern warfare in spectacular fashion.', '2026-04-23', '14:30:00', 360.00, 260.00, 190.00);

-- Generate Seats for each movie (Upper: A1-A30, Middle: B1-B40, Lower: C1-C50)
DROP PROCEDURE IF EXISTS generate_seats;
DELIMITER //
CREATE PROCEDURE generate_seats()
BEGIN
    DECLARE movie_cursor INT DEFAULT 1;
    DECLARE seat_num INT;
    DECLARE total_movies INT;
    
    SELECT COUNT(*) INTO total_movies FROM movies;
    
    WHILE movie_cursor <= total_movies DO
        -- Upper Level: Rows A-C, 10 seats each = 30 seats
        SET seat_num = 1;
        WHILE seat_num <= 10 DO
            INSERT IGNORE INTO seats (movie_id, seat_level, seat_number) VALUES (movie_cursor, 'upper', CONCAT('A', seat_num));
            INSERT IGNORE INTO seats (movie_id, seat_level, seat_number) VALUES (movie_cursor, 'upper', CONCAT('B', seat_num));
            INSERT IGNORE INTO seats (movie_id, seat_level, seat_number) VALUES (movie_cursor, 'upper', CONCAT('C', seat_num));
            SET seat_num = seat_num + 1;
        END WHILE;
        
        -- Middle Level: Rows D-G, 10 seats each = 40 seats
        SET seat_num = 1;
        WHILE seat_num <= 10 DO
            INSERT IGNORE INTO seats (movie_id, seat_level, seat_number) VALUES (movie_cursor, 'middle', CONCAT('D', seat_num));
            INSERT IGNORE INTO seats (movie_id, seat_level, seat_number) VALUES (movie_cursor, 'middle', CONCAT('E', seat_num));
            INSERT IGNORE INTO seats (movie_id, seat_level, seat_number) VALUES (movie_cursor, 'middle', CONCAT('F', seat_num));
            INSERT IGNORE INTO seats (movie_id, seat_level, seat_number) VALUES (movie_cursor, 'middle', CONCAT('G', seat_num));
            SET seat_num = seat_num + 1;
        END WHILE;
        
        -- Lower Level: Rows H-L, 10 seats each = 50 seats
        SET seat_num = 1;
        WHILE seat_num <= 10 DO
            INSERT IGNORE INTO seats (movie_id, seat_level, seat_number) VALUES (movie_cursor, 'lower', CONCAT('H', seat_num));
            INSERT IGNORE INTO seats (movie_id, seat_level, seat_number) VALUES (movie_cursor, 'lower', CONCAT('I', seat_num));
            INSERT IGNORE INTO seats (movie_id, seat_level, seat_number) VALUES (movie_cursor, 'lower', CONCAT('J', seat_num));
            INSERT IGNORE INTO seats (movie_id, seat_level, seat_number) VALUES (movie_cursor, 'lower', CONCAT('K', seat_num));
            INSERT IGNORE INTO seats (movie_id, seat_level, seat_number) VALUES (movie_cursor, 'lower', CONCAT('L', seat_num));
            SET seat_num = seat_num + 1;
        END WHILE;
        
        SET movie_cursor = movie_cursor + 1;
    END WHILE;
END //
DELIMITER ;

CALL generate_seats();
DROP PROCEDURE IF EXISTS generate_seats;

SELECT 'Database setup complete! Total seats created:' AS message, COUNT(*) AS count FROM seats;

-- Create purchases table
CREATE TABLE IF NOT EXISTS `purchases` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `items` JSON,
  `total` DECIMAL(10, 2),
  `payment_method` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `vrp_users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create user_vehicles table
CREATE TABLE IF NOT EXISTS `user_vehicles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `vehicle` VARCHAR(100),
  `plate` VARCHAR(10) UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `vrp_users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create delivery_queue table (for async item delivery)
CREATE TABLE IF NOT EXISTS `delivery_queue` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `data` JSON,
  `status` VARCHAR(20) DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `processed_at` TIMESTAMP NULL,
  FOREIGN KEY (`user_id`) REFERENCES `vrp_users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indices for performance
CREATE INDEX idx_user_id ON purchases(user_id);
CREATE INDEX idx_user_vehicles ON user_vehicles(user_id);
CREATE INDEX idx_delivery_status ON delivery_queue(status);

-- Insert system user if not exists
INSERT IGNORE INTO `vrp_users` (id, username, faction, adminLvl, userLevel) 
VALUES (0, 'SYSTEM', 'SYSTEM', 0, 0);

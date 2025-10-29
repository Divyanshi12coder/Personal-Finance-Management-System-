CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255)
);

CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  amount DECIMAL(10,2),
  category VARCHAR(100),
  type ENUM('income', 'expense'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
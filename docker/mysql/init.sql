-- Initialize development and test databases with utf8mb4 encoding
CREATE DATABASE IF NOT EXISTS `expense_system_development`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

CREATE DATABASE IF NOT EXISTS `expense_system_test`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

-- Grant expense_user full privileges on all expense_system_* databases
GRANT ALL PRIVILEGES ON `expense_system_%`.* TO 'expense_user'@'%';

FLUSH PRIVILEGES;

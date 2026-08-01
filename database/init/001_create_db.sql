-- ============================================================================
-- InnoQuest - local development database bootstrap (MySQL 8.0)
-- ============================================================================
-- HOW TO RUN
--   1. Open MySQL Workbench (or the mysql CLI) and connect to your local
--      MySQL 8.0 instance as root.
--   2. Open this file and run the whole script (Ctrl+Shift+Enter in Workbench).
--   3. Confirm: a database `innoquest` and user `innoquest` are created.
--
-- DEV ONLY
--   The app-user password below is a DEVELOPMENT default that matches
--   backend/.env.example. In production the database is managed by the
--   cloud provider and real credentials are injected via environment
--   variables - never through a committed script.
-- ============================================================================

CREATE DATABASE IF NOT EXISTS innoquest
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- App user reachable from localhost, 127.0.0.1, and the Docker bridge (if used later).
CREATE USER IF NOT EXISTS 'innoquest'@'localhost' IDENTIFIED BY 'innoquest';
CREATE USER IF NOT EXISTS 'innoquest'@'127.0.0.1' IDENTIFIED BY 'innoquest';
CREATE USER IF NOT EXISTS 'innoquest'@'%' IDENTIFIED BY 'innoquest';

GRANT ALL PRIVILEGES ON innoquest.* TO 'innoquest'@'localhost';
GRANT ALL PRIVILEGES ON innoquest.* TO 'innoquest'@'127.0.0.1';
GRANT ALL PRIVILEGES ON innoquest.* TO 'innoquest'@'%';

FLUSH PRIVILEGES;

-- Verify
SHOW DATABASES LIKE 'innoquest';

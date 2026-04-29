-- ══════════════════════════════════════════════════════════════
--  ClinicFlow Lite — Inicialización de base de datos
--  Esquema + datos de prueba
--
--  Cuentas de demo:
--    admin@clinicflow.com   / Password123!  (admin)
--    recep@clinicflow.com   / Password123!  (receptionist)
--    carlos@clinicflow.com  / Password123!  (professional)
-- ══════════════════════════════════════════════════════════════

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE DATABASE IF NOT EXISTS clinicflow_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE clinicflow_db;

-- ── Tablas ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100)  NOT NULL,
  email      VARCHAR(150)  UNIQUE NOT NULL,
  password   VARCHAR(255)  NOT NULL,
  role       ENUM('admin','receptionist','professional') NOT NULL DEFAULT 'professional',
  createdAt  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patients (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  dni          VARCHAR(20),
  email        VARCHAR(150),
  phone        VARCHAR(20),
  birthDate    DATE,
  gender       ENUM('male','female','other'),
  address      TEXT,
  medicalNotes TEXT,
  status       ENUM('active','inactive','discharged') NOT NULL DEFAULT 'active',
  createdAt    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointments (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  patientId       INT NOT NULL,
  professionalId  INT NOT NULL,
  appointmentDate DATETIME NOT NULL,
  duration        INT DEFAULT 30,
  status          ENUM('scheduled','confirmed','completed','cancelled','no_show') DEFAULT 'scheduled',
  type            VARCHAR(100),
  notes           TEXT,
  createdAt       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patientId)      REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (professionalId) REFERENCES users(id)    ON DELETE CASCADE,
  INDEX idx_patientId      (patientId),
  INDEX idx_professionalId (professionalId),
  INDEX idx_appointmentDate(appointmentDate),
  INDEX idx_status         (status)
);

CREATE TABLE IF NOT EXISTS clinical_notes (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  patientId      INT NOT NULL,
  professionalId INT NOT NULL,
  content        TEXT NOT NULL,
  type           ENUM('observation','follow_up','diagnosis','internal') NOT NULL DEFAULT 'observation',
  createdAt      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patientId)      REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (professionalId) REFERENCES users(id)    ON DELETE CASCADE,
  INDEX idx_patientId      (patientId),
  INDEX idx_professionalId (professionalId)
);

CREATE TABLE IF NOT EXISTS access_logs (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  userId       INT NOT NULL,
  userRole     VARCHAR(50) NOT NULL,
  action       VARCHAR(100) NOT NULL,
  resourceType VARCHAR(50) NOT NULL,
  resourceId   INT,
  ipAddress    VARCHAR(45),
  createdAt    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_userId      (userId),
  INDEX idx_resource    (resourceType, resourceId),
  INDEX idx_createdAt   (createdAt)
);

-- ── Datos de prueba ────────────────────────────────────────────
-- Contraseña de todos: Password123!
-- Hash bcrypt (saltRounds=10): $2b$10$rwvwGYq7Q3SnPHka7dHLNeIeRTG0Xow9xspt3A9OmvTD62VCWh9zK

INSERT INTO users (id, name, email, password, role) VALUES
(1, 'Dr. Carlos Méndez',    'carlos@clinicflow.com', '$2b$10$rwvwGYq7Q3SnPHka7dHLNeIeRTG0Xow9xspt3A9OmvTD62VCWh9zK', 'professional'),
(2, 'Admin Sistema',        'admin@clinicflow.com',  '$2b$10$rwvwGYq7Q3SnPHka7dHLNeIeRTG0Xow9xspt3A9OmvTD62VCWh9zK', 'admin'),
(3, 'Laura Recepción',      'recep@clinicflow.com',  '$2b$10$rwvwGYq7Q3SnPHka7dHLNeIeRTG0Xow9xspt3A9OmvTD62VCWh9zK', 'receptionist')
ON DUPLICATE KEY UPDATE role = VALUES(role), name = VALUES(name);

INSERT INTO patients (id, name, email, phone, birthDate, gender, status) VALUES
(1, 'Ana García López',      'ana.garcia@email.com',  '600111222', '1985-03-15', 'female', 'active'),
(2, 'Pedro Martínez Ruiz',  'pedro.m@email.com',     '600333444', '1972-07-22', 'male',   'active'),
(3, 'María Fernández Gil',  'maria.fg@email.com',    '600555666', '1990-11-08', 'female', 'active'),
(4, 'Carlos López Vega',    'carlos.lv@email.com',   '600777888', '1968-05-30', 'male',   'active'),
(5, 'Laura Sánchez Torres', 'laura.st@email.com',    '600999000', '1995-09-12', 'female', 'active'),
(6, 'Roberto Jiménez Mora', 'roberto.jm@email.com',  '601111222', '1980-01-25', 'male',   'active')
ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone);

INSERT INTO appointments (id, patientId, professionalId, appointmentDate, duration, status, type, notes) VALUES
(1,  1, 1, CONCAT(CURDATE(), ' 09:00:00'), 30, 'confirmed',  'Consulta general',   'Revisión anual rutinaria'),
(2,  2, 1, CONCAT(CURDATE(), ' 10:00:00'), 45, 'scheduled',  'Seguimiento',        'Control tensión arterial'),
(3,  3, 1, CONCAT(CURDATE(), ' 11:30:00'), 30, 'confirmed',  'Consulta general',   NULL),
(4,  4, 1, CONCAT(CURDATE(), ' 12:00:00'), 60, 'scheduled',  'Primera visita',     'Paciente derivado del hospital'),
(5,  5, 1, CONCAT(CURDATE(), ' 16:00:00'), 30, 'confirmed',  'Revisión analítica', 'Resultados en espera'),
(6,  6, 1, CONCAT(CURDATE(), ' 17:00:00'), 45, 'cancelled',  'Seguimiento',        'Canceló por enfermedad'),
(7,  1, 1, DATE_SUB(CONCAT(CURDATE(), ' 10:00:00'), INTERVAL 8 DAY),  30, 'completed', 'Consulta general',   'Todo correcto'),
(8,  3, 1, DATE_SUB(CONCAT(CURDATE(), ' 11:00:00'), INTERVAL 13 DAY), 30, 'completed', 'Revisión analítica', 'Valores normales'),
(9,  2, 1, DATE_SUB(CONCAT(CURDATE(), ' 09:30:00'), INTERVAL 18 DAY), 45, 'completed', 'Seguimiento',        'Medicación ajustada'),
(10, 5, 1, DATE_SUB(CONCAT(CURDATE(), ' 16:00:00'), INTERVAL 23 DAY), 30, 'completed', 'Revisión analítica', 'Colesterol alto')
ON DUPLICATE KEY UPDATE
  patientId       = VALUES(patientId),
  professionalId  = VALUES(professionalId),
  appointmentDate = VALUES(appointmentDate),
  status          = VALUES(status),
  notes           = VALUES(notes);

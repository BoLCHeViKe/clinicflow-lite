-- Datos de prueba para ClinicFlow Lite
-- Ejecutar DESPUÉS de database.sql
-- Contraseña de prueba para el usuario: "Password123!"
-- (hash bcrypt generado con saltRounds=10)

USE clinicflow_db;

INSERT INTO users (id, name, email, password) VALUES
(1, 'Dr. Carlos Méndez', 'carlos@clinicflow.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO patients (id, name, email, phone, birthDate, gender, status) VALUES
(1, 'Ana García López',    'ana.garcia@email.com',   '600111222', '1985-03-15', 'female', 'active'),
(2, 'Pedro Martínez Ruiz', 'pedro.m@email.com',      '600333444', '1972-07-22', 'male',   'active'),
(3, 'María Fernández Gil', 'maria.fg@email.com',     '600555666', '1990-11-08', 'female', 'active')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO appointments (patientId, professionalId, appointmentDate, duration, status, type, notes) VALUES
(1, 1, '2026-05-05 10:00:00', 30, 'scheduled',  'consulta',  'Primera visita'),
(2, 1, '2026-05-05 11:00:00', 45, 'confirmed',  'seguimiento', 'Control mensual')
ON DUPLICATE KEY UPDATE status = VALUES(status);

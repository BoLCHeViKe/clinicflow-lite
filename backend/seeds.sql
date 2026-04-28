-- Datos de prueba para ClinicFlow Lite
-- Ejecutar DESPUÉS de database.sql
-- Contraseña de prueba para todos los usuarios: "Password123!"
-- (hash bcrypt generado con saltRounds=10)

USE clinicflow_db;

-- Usuarios profesionales
INSERT INTO users (id, name, email, password) VALUES
(1, 'Dr. Carlos Méndez',    'carlos@clinicflow.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Pacientes
INSERT INTO patients (id, name, email, phone, birthDate, gender, status) VALUES
(1, 'Ana García López',       'ana.garcia@email.com',   '600111222', '1985-03-15', 'female', 'active'),
(2, 'Pedro Martínez Ruiz',   'pedro.m@email.com',      '600333444', '1972-07-22', 'male',   'active'),
(3, 'María Fernández Gil',   'maria.fg@email.com',     '600555666', '1990-11-08', 'female', 'active'),
(4, 'Carlos López Vega',     'carlos.lv@email.com',    '600777888', '1968-05-30', 'male',   'active'),
(5, 'Laura Sánchez Torres',  'laura.st@email.com',     '600999000', '1995-09-12', 'female', 'active'),
(6, 'Roberto Jiménez Mora',  'roberto.jm@email.com',   '601111222', '1980-01-25', 'male',   'active')
ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone);

-- Reasignar todas las citas al usuario logueado (id=2)
UPDATE appointments SET professionalId = 2 WHERE professionalId = 1;

-- Citas de HOY (usa CURDATE()) y citas históricas — todas para professionalId=2
INSERT INTO appointments (id, patientId, professionalId, appointmentDate, duration, status, type, notes) VALUES
(1,  1, 2, CONCAT(CURDATE(), ' 09:00:00'), 30, 'confirmed',  'Consulta general',   'Revisión anual rutinaria'),
(2,  2, 2, CONCAT(CURDATE(), ' 10:00:00'), 45, 'scheduled',  'Seguimiento',        'Control tensión arterial'),
(3,  3, 2, CONCAT(CURDATE(), ' 11:30:00'), 30, 'confirmed',  'Consulta general',   NULL),
(4,  4, 2, CONCAT(CURDATE(), ' 12:00:00'), 60, 'scheduled',  'Primera visita',     'Paciente derivado del hospital'),
(5,  5, 2, CONCAT(CURDATE(), ' 16:00:00'), 30, 'confirmed',  'Revisión analítica', 'Resultados en espera'),
(6,  6, 2, CONCAT(CURDATE(), ' 17:00:00'), 45, 'cancelled',  'Seguimiento',        'Canceló por enfermedad'),
(7,  1, 2, DATE_SUB(CONCAT(CURDATE(), ' 10:00:00'), INTERVAL 8 DAY),  30, 'completed', 'Consulta general',   'Todo correcto'),
(8,  3, 2, DATE_SUB(CONCAT(CURDATE(), ' 11:00:00'), INTERVAL 13 DAY), 30, 'completed', 'Revisión analítica', 'Valores normales'),
(9,  2, 2, DATE_SUB(CONCAT(CURDATE(), ' 09:30:00'), INTERVAL 18 DAY), 45, 'completed', 'Seguimiento',        'Medicación ajustada'),
(10, 5, 2, DATE_SUB(CONCAT(CURDATE(), ' 16:00:00'), INTERVAL 23 DAY), 30, 'completed', 'Revisión analítica', 'Colesterol alto')
ON DUPLICATE KEY UPDATE
  patientId      = VALUES(patientId),
  professionalId = VALUES(professionalId),
  appointmentDate = VALUES(appointmentDate),
  status         = VALUES(status),
  notes          = VALUES(notes);

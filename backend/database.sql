-- Crear y seleccionar la base de datos
CREATE DATABASE IF NOT EXISTS clinicflow_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE clinicflow_db;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla secundaria: patients
CREATE TABLE IF NOT EXISTS patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150),
  phone VARCHAR(20),
  birthDate DATE,
  gender ENUM('male','female','other'),
  address TEXT,
  medicalNotes TEXT,
  status ENUM('active','inactive') DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla principal: appointments
CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patientId INT NOT NULL,
  professionalId INT NOT NULL,
  appointmentDate DATETIME NOT NULL,
  duration INT DEFAULT 30,
  status ENUM('scheduled','confirmed','completed','cancelled','no_show') DEFAULT 'scheduled',
  type VARCHAR(100),
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (professionalId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_patientId (patientId),
  INDEX idx_professionalId (professionalId),
  INDEX idx_appointmentDate (appointmentDate),
  INDEX idx_status (status)
);

-- Tabla adicional: clinical_notes
CREATE TABLE IF NOT EXISTS clinical_notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  appointmentId INT NOT NULL,
  content TEXT NOT NULL,
  type ENUM('observation','follow_up','diagnosis','internal') DEFAULT 'observation',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (appointmentId) REFERENCES appointments(id) ON DELETE CASCADE,
  INDEX idx_appointmentId (appointmentId)
);

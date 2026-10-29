CREATE DATABASE IF NOT EXISTS footfisio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE footfisio;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(150) NOT NULL UNIQUE,
  contrasena_hash VARCHAR(255) NOT NULL,
  rol ENUM('admin','recepcionista','fisioterapeuta') NOT NULL DEFAULT 'recepcionista',
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pacientes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  dni VARCHAR(15) UNIQUE,
  telefono VARCHAR(20),
  correo VARCHAR(150),
  fecha_nacimiento DATE,
  condicion VARCHAR(255),
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS citas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  paciente_id INT UNSIGNED NOT NULL,
  fecha_hora DATETIME NOT NULL,
  motivo VARCHAR(255),
  especialista VARCHAR(150),
  duracion_minutos SMALLINT UNSIGNED NOT NULL DEFAULT 60,
  estado ENUM('pendiente','confirmada','cancelada','completada') NOT NULL DEFAULT 'pendiente',
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_citas_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE RESTRICT,
  INDEX idx_citas_fecha (fecha_hora), INDEX idx_citas_paciente (paciente_id)
);

CREATE TABLE IF NOT EXISTS tratamientos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  paciente_id INT UNSIGNED NOT NULL,
  descripcion TEXT NOT NULL,
  fecha_inicio DATE,
  fecha_fin DATE,
  observaciones TEXT,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tratamientos_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE RESTRICT
);

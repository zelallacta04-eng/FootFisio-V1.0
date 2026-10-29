# Arquitectura de Software — FootFisio

## Componentes
- **Vista:** aplicación React + TypeScript ubicada en `src/`.
- **Controladores:** `backend/src/controllers/`; traducen solicitudes HTTP a respuestas.
- **DAO:** `backend/src/dao/`; encapsula SQL parametrizado para persistencia.
- **Servicios:** `backend/src/services/`; validación y reglas de negocio reutilizables.
- **Base de datos:** `database/schema.sql`; define usuarios, pacientes, citas y tratamientos.
- **Pruebas:** `backend/test/`; pruebas automáticas con el test runner nativo de Node.js.

## MVC
React actúa como la vista. Los controladores de Express reciben las peticiones y devuelven respuestas; los DAO y servicios gestionan datos y reglas. Es una adaptación MVC para una aplicación con frontend separado.

## DAO
`backend/src/dao/patientDao.js` concentra las operaciones SQL de pacientes (listar, consultar, crear, actualizar y eliminar). El resto de la aplicación no necesita conocer las consultas SQL.

## SOLID aplicado
- **S — Responsabilidad única:** rutas, controladores, validación y persistencia están separados.
- **O — Abierto/cerrado:** se pueden añadir nuevas rutas/DAO sin mezclar responsabilidades existentes.
- **L — Sustitución de Liskov:** el controlador usa el contrato asíncrono del DAO; una implementación compatible puede sustituirlo.
- **I — Segregación de interfaces:** el controlador de pacientes depende solo de las operaciones de paciente que utiliza.
- **D — Inversión de dependencias:** `createPatientController(dao)` y `createPatientDao(poolProvider)` aceptan dependencias inyectadas, lo que facilita pruebas y sustituciones.

## TDD
Las pruebas en `backend/test/patientValidation.test.js` cubren campos obligatorios, correo inválido y normalización. Ejecutar `npm test` desde `backend`. Estas pruebas son un punto de partida; deben ampliarse con pruebas de API e integración MySQL.

## Nota de estado
El backend de pacientes y el esquema SQL están implementados. La interfaz React existente aún usa datos de ejemplo y no está conectada a la API. Antes de producción, añadir autenticación/autorización, protección de datos personales, validaciones ampliadas, migraciones y pruebas de integración.

# Arquitectura de Software — FootFisio

<<<<<<< HEAD
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
=======
## Objetivo
Organizar el sistema de gestión clínica para que la interfaz, las reglas de negocio y el acceso a datos puedan evolucionar por separado.

## MVC
- **Modelo:** entidades y reglas del dominio (`Patient`, `Appointment`, `Payment`).
- **Vista:** componentes React y pantallas que muestran la información y reciben acciones.
- **Controlador:** coordina las acciones del usuario y llama a los casos de uso/servicios.

En la versión actual, React funciona como capa de vista, pero parte de la lógica y del estado sigue concentrada en `src/App.tsx`. La separación completa es una mejora arquitectónica propuesta.

## DAO (Data Access Object)
Definir contratos para acceder a los datos sin acoplar la lógica de negocio a una base de datos concreta. Por ejemplo, `PatientDAO` podría exponer `findAll()`, `findById(id)`, `create(patient)` y `update(patient)`. Una implementación podría usar una API REST o una base de datos. Actualmente, los datos de ejemplo se almacenan en el estado de React; aún no hay una base de datos conectada.

## SOLID
1. **S — Responsabilidad única:** cada clase o módulo tiene una responsabilidad principal.
2. **O — Abierto/cerrado:** se amplía el comportamiento mediante nuevas implementaciones sin modificar código estable innecesariamente.
3. **L — Sustitución de Liskov:** una implementación puede sustituir a otra respetando el contrato.
4. **I — Segregación de interfaces:** contratos pequeños y específicos para cada consumidor.
5. **D — Inversión de dependencias:** los servicios dependen de abstracciones, no de detalles concretos de almacenamiento.

## TDD (Test-Driven Development)
Ciclo recomendado:
1. **Rojo:** escribir una prueba que describa un comportamiento y comprobar que falla.
2. **Verde:** implementar el mínimo código para superar la prueba.
3. **Refactorizar:** mejorar el diseño y volver a ejecutar las pruebas.

Ejemplos de pruebas para este sistema: rechazar pacientes sin nombre, impedir citas sin fecha/hora válida y comprobar que un pago pendiente no se muestre como pagado.

## Estructura objetivo
```text
src/
  views/          # Componentes y pantallas React
  controllers/    # Coordinación de acciones/casos de uso
  models/         # Entidades, tipos y reglas de dominio
  dao/            # Contratos e implementaciones de acceso a datos
  services/       # Lógica de negocio
  tests/          # Pruebas unitarias y de integración
```

## Estado de implementación
La pantalla **Arquitectura de software** ya está integrada en el menú del administrador y explica MVC, DAO, SOLID y TDD con ejemplos orientados a FootFisio. Es una guía de diseño; para disponer de DAO real y TDD ejecutable, el siguiente paso es extraer la lógica de `App.tsx`, conectar persistencia y añadir un framework de pruebas como Vitest.
>>>>>>> 1c27fd06566463f5cdc3dd43eb2b8d766f66e1ad

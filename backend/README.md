# Backend de FootFisio

API REST con Node.js, Express y MySQL. La API de pacientes está implementada con separación Controller/DAO y validación de entrada.

## Requisitos
- Node.js 20 o superior
- MySQL Server 8 o compatible

## Configuración
1. En MySQL Workbench, abre y ejecuta `database/schema.sql` desde la carpeta raíz del proyecto.
2. Entra a esta carpeta `backend` en la terminal.
3. Instala dependencias: `npm install`.
4. Copia `.env.example` como `.env` y cambia `DB_USER` y `DB_PASSWORD` por las credenciales locales. No subas `.env` a GitHub.
5. Inicia la API con `npm run dev`.
6. Comprueba `http://localhost:3001/api/health`.

## Endpoints de pacientes
- `GET /api/pacientes` — listar; acepta `?search=texto`
- `GET /api/pacientes/:id` — consultar uno
- `POST /api/pacientes` — crear
- `PUT /api/pacientes/:id` — actualizar
- `DELETE /api/pacientes/:id` — eliminar (si no tiene citas/tratamientos asociados)

Ejemplo de JSON para POST/PUT:
```json
{
  "nombres": "Ana",
  "apellidos": "Pérez",
  "dni": "12345678",
  "telefono": "999111222",
  "correo": "ana@example.com",
  "fecha_nacimiento": "1995-03-10",
  "condicion": "Dolor lumbar"
}
```

## Pruebas
Ejecuta `npm test` dentro de `backend`. Las pruebas actuales verifican validación de datos sin necesitar conexión MySQL.

## Arquitectura y seguridad
- **MVC (adaptado a API):** `controllers/` gestiona solicitudes y respuestas; `services/` contiene validación; `dao/` encapsula SQL; React permanece como vista.
- **DAO:** `patientDao.js` centraliza las consultas preparadas de pacientes.
- **SOLID:** dependencias inyectables en `createPatientController` y `createPatientDao` facilitan sustituir implementaciones y probarlas.
- **TDD:** `test/patientValidation.test.js` contiene pruebas ejecutables de validación.
- Usa consultas parametrizadas; limita CORS al frontend configurado; las credenciales viven en `.env`.

La interfaz React existente todavía usa datos de ejemplo y no está conectada automáticamente a estos endpoints. Para que el módulo de pacientes guarde/lea datos en MySQL, hay que sustituir su estado local por llamadas HTTP a `/api/pacientes`. La autenticación y autorización de usuarios también deben implementarse antes de usar datos reales de pacientes.

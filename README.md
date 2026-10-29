# FootFisio

Aplicación frontend React + TypeScript + Vite y backend opcional Node.js/Express con MySQL.

## Frontend
Desde la carpeta raíz:
```bash
npm install
npm run dev
```

## Base de datos y API
1. Ejecuta `database/schema.sql` en MySQL Workbench.
2. Sigue `backend/README.md` para configurar y arrancar la API.
3. Pruebas de backend: entra en `backend` y ejecuta `npm install` y `npm test`.

**Nota:** la API REST de pacientes está lista como base, pero la interfaz actual aún utiliza datos de ejemplo y no guarda automáticamente en MySQL. No uses datos personales reales hasta implementar conexión de la interfaz, autenticación y autorización.


## Autenticación y MySQL
1. Ejecuta `database/schema.sql` en MySQL Workbench.
2. En `backend`, copia `.env.example` a `.env` y completa las credenciales de MySQL y un `JWT_SECRET` largo y aleatorio.
3. Ejecuta `npm install` y luego `npm run dev` dentro de `backend`.
4. En otra terminal, en la raíz del proyecto, ejecuta `npm install` y `npm run dev`.
5. En la pantalla de acceso puedes iniciar sesión o crear una cuenta. El registro público asigna el rol de recepcionista; no permite autoasignarse administrador.

Nota: los roles y el token se validan en el backend para autenticación; protege `.env` y no uses credenciales reales en repositorios públicos.

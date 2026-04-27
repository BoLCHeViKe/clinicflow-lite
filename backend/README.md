# ClinicFlow Backend

Backend del sistema de gestión de citas clínicas ClinicFlow Lite.

## Variables de entorno

Copia `.env.example` a `.env` y configura tus valores:

```env
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=clinicflow_db
JWT_SECRET=tu_clave_secreta
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:4200
```

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

## Producción

```bash
npm start
```

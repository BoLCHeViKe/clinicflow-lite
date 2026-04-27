# ClinicFlow Lite

> Sistema de gestión de citas clínicas con autenticación JWT, CRUD completo y dashboard de métricas.

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Angular 21 (Standalone Components), Angular Material, RxJS, Signals |
| Backend | Node.js 20, Express 5, express-validator |
| Base de datos | MySQL 8 |
| Autenticación | JWT + bcrypt |

## Funcionalidades

- Autenticación completa: registro, login y logout con JWT
- CRUD de citas: crear, listar, editar y eliminar
- Filtros en tiempo real por estado y búsqueda de texto
- Dashboard con métricas: total de citas, próximos 7 días, desglose por estado y actividad reciente
- Validaciones en frontend (Angular Reactive Forms) y backend (express-validator)
- Interceptor JWT: el token se adjunta automáticamente a todas las peticiones
- Auth Guard: rutas protegidas redirigen al login si no hay sesión

## Estructura del proyecto

```
clinicflow-lite/
├── backend/                  # API REST con Express
│   ├── src/
│   │   ├── controllers/      # Lógica de negocio
│   │   ├── routes/           # Definición de endpoints
│   │   ├── middleware/       # Auth JWT
│   │   ├── validators/       # Validaciones con express-validator
│   │   └── db/               # Pool de conexiones MySQL
│   ├── database.sql          # Schema completo de la BD
│   ├── seeds.sql             # Datos de prueba
│   └── .env.example          # Variables de entorno documentadas
└── frontend/
    └── clinicflow-lite-frontend/   # Aplicación Angular
        └── src/app/
            ├── core/         # Servicios, modelos, guards, interceptor
            ├── features/     # Componentes por funcionalidad
            └── shared/       # Componentes reutilizables
```

## Instalación local

### Requisitos previos

- Node.js 20+
- MySQL 8+
- Angular CLI (`npm install -g @angular/cli`)

### Base de datos

```bash
mysql -u root -p < backend/database.sql
mysql -u root -p < backend/seeds.sql   # opcional: datos de prueba
```

### Backend

```bash
cd backend
npm install
cp .env.example .env        # edita con tus credenciales
npm run dev                 # http://localhost:3001
```

### Frontend

```bash
cd frontend/clinicflow-lite-frontend
npm install
ng serve                    # http://localhost:4200
```

## Variables de entorno

Ver `backend/.env.example` para la lista completa documentada.

## API — Endpoints principales

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Registrar usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| GET | `/api/auth/me` | Perfil del usuario | Sí |
| GET | `/api/appointments` | Listar citas (filtros, búsqueda, paginación) | Sí |
| POST | `/api/appointments` | Crear cita | Sí |
| PUT | `/api/appointments/:id` | Actualizar cita | Sí |
| DELETE | `/api/appointments/:id` | Eliminar cita | Sí |
| GET | `/api/appointments/stats/summary` | Métricas del dashboard | Sí |

## Decisiones técnicas

- **JWT en localStorage**: elegido por simplicidad para el MVP. En producción se usaría httpOnly cookies.
- **mysql2/promise + pool de conexiones**: rendimiento suficiente para aplicaciones de tamaño medio sin ORM.
- **Angular Signals**: estado reactivo moderno sin NgRx para este tamaño de aplicación.
- **express-validator**: validaciones declarativas que mantienen los controllers limpios.
- **Standalone Components**: arquitectura Angular moderna sin NgModules.

## Cómo presentar este proyecto

1. **El problema**: gestión de citas clínicas con autenticación real y validaciones en ambas capas.
2. **La solución técnica**: Angular + Express + MySQL con JWT para stateless auth.
3. **El reto más difícil**: coordinar validaciones en frontend y backend sin duplicar lógica.
4. **Lo aprendido**: diseñar la arquitectura antes de programar evita refactorizaciones costosas.
5. **Lo que mejoraría**: roles de usuario (admin/profesional/paciente), notificaciones por email, Docker.

## Autor

**Julio** — AccioSoft Dev Academy, Sprint 5

# ClinicFlow Lite

> **Sistema de gestión de citas clínicas** con control de acceso por rol, historial de pacientes, notas clínicas y dashboard de métricas en tiempo real.

Desarrollado como proyecto de portafolio en AccioSoft Dev Academy — Sprint 6.

---

## Propuesta de valor

Las clínicas pequeñas y medianas gestionan su agenda en papel, en hojas de cálculo o con herramientas genéricas que no entienden el flujo de una consulta médica. ClinicFlow Lite resuelve ese problema con una aplicación web moderna, rápida y segura, diseñada específicamente para equipos clínicos:

- **Recepción** ve y gestiona todas las citas sin acceder a notas médicas.
- **Profesionales** ven solo sus pacientes y pueden dejar notas clínicas privadas.
- **Administración** tiene visión global: métricas, ranking de profesionales y gestión completa.

---

## Demo: los 3 roles

### Credenciales de prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@clinicflow.com | Password123! |
| Recepcionista | receptionist@clinicflow.com | Password123! |
| Profesional | dr.mendez@clinicflow.com | Password123! |

### ¿Qué ve cada rol?

#### 🔴 Admin
- Dashboard completo: KPIs de hoy, alerta de próximas 2h, ranking de profesionales, tasa de cancelación.
- Acceso a **todos** los pacientes y todas las citas.
- Puede crear, editar y eliminar pacientes y citas.
- Páginas exclusivas: **Informes** y **Ajustes** (bloqueadas para otros roles).
- Si un profesional o recepcionista intenta acceder a `/reports` o `/settings`, es redirigido a la página de acceso denegado.

#### 🟡 Recepcionista
- Ve y gestiona todos los pacientes y citas (crear, editar).
- No puede eliminar citas (requiere admin).
- No tiene acceso a las páginas de Informes ni Ajustes.
- Puede añadir notas clínicas a los pacientes con los que trabaja.

#### 🔵 Profesional (Dr. Méndez)
- Solo ve **sus propias citas** y **sus propios pacientes** (el backend filtra automáticamente por `professionalId`).
- Puede ver el detalle completo de un paciente solo si tiene al menos una cita con él.
- Puede crear y editar notas clínicas; no puede ver ni editar las de otros profesionales.
- No tiene botones de eliminar ni de gestión de usuarios.

---

## Mejoras Sprint 5 → Sprint 6

| Área | Sprint 5 | Sprint 6 |
|------|----------|----------|
| **Seguridad** | Guard básico por roles | Guards específicos `adminGuard` + `professionalGuard`; `errorInterceptor` para 401/403 |
| **Pacientes** | Lista simple sin búsqueda | Búsqueda en tiempo real por nombre, DNI y teléfono |
| **Pacientes** | Estado: activo / inactivo | Estado: activo / inactivo / **dado de alta** |
| **Pacientes** | Sin DNI | Campo DNI opcional en ficha y formulario |
| **Pacientes** | Sin detalle | Página de detalle con historial de citas y notas de seguimiento |
| **Pacientes** | Sin última visita | Fecha de última visita calculada con subquery `MAX(appointmentDate)` |
| **Arquitectura Angular** | Un solo interceptor | `authInterceptor` (token) + `errorInterceptor` (401/403) separados |
| **Reutilización** | `@if (canManage())` repetido | Directiva estructural `*hasRole` para mostrar/ocultar por rol |
| **Lazy loading** | `loadComponent` en rutas | Todas las features lazy-loaded; `/forbidden` fuera del shell |
| **Menú dinámico** | Filtro básico por rol | Items de menú con `roles[]` + páginas admin que redirijen al 403 |

---

## Stack tecnológico

| Capa | Tecnología | Decisión clave |
|------|-----------|----------------|
| Frontend | Angular 21 — Standalone + Signals + `@if`/`@for` | Sin NgModules, estado reactivo moderno sin NgRx |
| Estilos | Angular Material + CSS custom | Material para inputs/botones, CSS propio para layout |
| Backend | Node.js 20 + Express 5 | Ligero, sin ORM, fácil de inspeccionar |
| Validaciones | express-validator | Declarativas, separadas del controller |
| Base de datos | MySQL 8 | Relacional, con FK y ON DELETE CASCADE |
| Autenticación | JWT + bcrypt | Stateless; payload `{id, email, name, role}` |
| DevOps | Docker Compose (3 servicios) | Un solo comando para arrancar todo el stack |

---

## Arquitectura de seguridad

```
HTTP Request
    │
    ▼
authInterceptor          → Adjunta Bearer token a todas las peticiones
    │
    ▼
errorInterceptor         → 401 → logout + redirect /auth/login
                         → 403 → redirect /forbidden
    │
    ▼
authGuard (Angular)      → Protege rutas del shell (sesión requerida)
    │
    ▼
adminGuard               → roleGuard(['admin']) — Informes, Ajustes
roleGuard(['admin','receptionist']) → crear/editar/borrar pacientes y citas
    │
    ▼
Backend middleware
authMiddleware           → Verifica JWT en todas las rutas /api
requireRole(...)         → Bloquea por rol en el servidor
effectiveProfessionalId  → Profesionales siempre ven solo sus datos
```

**Principio clave:** la seguridad real está en el backend. Los guards de Angular son UX, no seguridad.

---

## Estructura del proyecto

```
clinicflow-lite/
├── backend/
│   └── src/
│       ├── controllers/          # Lógica de negocio
│       ├── routes/               # Endpoints REST
│       ├── middleware/           # auth, role, access-log
│       ├── validators/           # express-validator rules
│       └── db/connection.js      # Pool mysql2/promise
├── frontend/
│   └── src/app/
│       ├── core/
│       │   ├── auth/             # authGuard, adminGuard, professionalGuard, interceptors
│       │   ├── models/           # Patient, Appointment, ClinicalNote, User
│       │   └── services/         # HTTP services (Patients, Appointments, etc.)
│       ├── features/
│       │   ├── dashboard/        # KPIs + alertas 2h + ranking profesionales
│       │   ├── patients/         # Lista, formulario, detalle del paciente
│       │   ├── appointments/     # Agenda día a día con navegación por fechas
│       │   ├── clinical-notes/   # Notas clínicas por paciente/profesional
│       │   ├── admin/            # Informes y Ajustes (solo admin)
│       │   └── forbidden/        # Página 403
│       ├── shared/
│       │   └── directives/       # HasRoleDirective (*hasRole)
│       └── layout/shell/         # Shell con sidebar dinámico por rol
└── mysql-init/01-init.sql        # Schema + seeds iniciales
```

---

## Despliegue local (Docker)

```bash
git clone <repo>
cd clinicflow-lite

cp .env.example .env          # Ajusta APP_HOST_IP a tu IP local
docker compose up -d          # Arranca db + backend + frontend

# Primera vez tarda ~60s mientras Angular compila
open http://localhost:4200
```

### Variables de entorno (`.env`)

| Variable | Ejemplo | Descripción |
|----------|---------|-------------|
| `APP_HOST_IP` | `192.168.1.100` | IP de la máquina host para CORS y proxy |
| `DB_PASSWORD` | `ClinicFlow2024` | Contraseña MySQL |
| `JWT_SECRET` | `supersecret` | Clave de firma JWT |
| `NODE_ENV` | `development` | Entorno |

---

## API — Endpoints principales

| Método | Endpoint | Descripción | Roles permitidos |
|--------|----------|-------------|-----------------|
| POST | `/api/auth/login` | Iniciar sesión | Público |
| GET | `/api/appointments/stats/summary` | Métricas dashboard | Todos |
| GET | `/api/appointments` | Listar citas (filtros, paginación) | Todos* |
| POST | `/api/appointments` | Crear cita | Todos |
| DELETE | `/api/appointments/:id` | Eliminar cita | Admin, Recepcionista |
| GET | `/api/patients` | Listar pacientes (búsqueda, filtro status) | Todos* |
| GET | `/api/patients/:id` | Detalle paciente | Todos* |
| GET | `/api/patients/:id/history` | Historial de citas del paciente | Todos* |
| POST | `/api/patients` | Crear paciente | Admin, Recepcionista |
| GET | `/api/clinical-notes/patient/:id` | Notas clínicas | Profesional (propias) |
| GET | `/api/access-logs` | Registro de auditoría | — |

\* Los profesionales reciben automáticamente solo sus propios datos.

---

## Cómo presentar este proyecto (8 minutos)

### Guión sugerido

**0:00 – 1:00 · El problema**
*"Las clínicas pequeñas usan papel o Excel para gestionar citas. Eso genera errores, doble trabajo y falta de visibilidad. ClinicFlow Lite es una alternativa web moderna, específica para equipos clínicos."*

**1:00 – 2:30 · Demo como admin**
- Mostrar el dashboard: KPIs de hoy, alerta de próximas 2h, ranking de profesionales.
- Buscar un paciente por nombre → abrir su ficha completa → ver historial de citas.
- Intentar acceder a /reports para mostrar la página de Informes (solo admin).

**2:30 – 4:00 · Demo como profesional**
- Iniciar sesión como Dr. Méndez.
- Mostrar que la agenda solo muestra SUS citas.
- Abrir un paciente → añadir una nota clínica de tipo "seguimiento".
- Intentar navegar a /reports → redirige a "Acceso denegado" (errorInterceptor → 403).

**4:00 – 5:30 · Decisiones técnicas**
- *"Uso Angular Signals en lugar de NgRx porque el estado de esta app no justifica un store complejo."*
- *"Los guards de Angular son UX, no seguridad. La seguridad real está en el middleware de Express."*
- *"Un interceptor para token y otro para errores — separación de responsabilidades."*
- *"La directiva `*hasRole` encapsula la lógica de rol en un solo lugar, en lugar de repetir `@if (canManage())` en cada template."*

**5:30 – 7:00 · Retos y soluciones**
- Timezone bug en la navegación de agenda (`toISOString()` → `getFullYear/getMonth/getDate()`).
- El profesional nunca puede ver citas ajenas, ni si pasa el `professionalId` en la query: `effectiveProfessionalId` en el controller.
- La ruta `/stats/summary` debe ir antes de `/:id` en Express para que "summary" no se interprete como un ID.

**7:00 – 8:00 · Visión de producto y modelo de negocio**
*"Modelo SaaS: suscripción mensual por clínica (19–49 €/mes según tamaño). El diferenciador es la simplicidad: en 5 minutos cualquier recepcionista está operativa. Las mejoras de Sprint 7 serían: notificaciones por email, módulo de facturación y app móvil para profesionales."*

---

## Decisiones técnicas documentadas

- **JWT en localStorage**: elegido por simplicidad para el MVP. En producción se usaría `httpOnly` cookies para mitigar XSS.
- **mysql2/promise + pool**: rendimiento suficiente para consultas sin ORM. Queries parametrizadas para prevenir SQL injection.
- **Angular Signals vs NgRx**: los signals de Angular son suficientes para este tamaño de app. NgRx añadiría complejidad sin beneficio real.
- **Standalone Components**: arquitectura Angular moderna sin NgModules. Lazy loading nativo con `loadComponent`.
- **`effectiveProfessionalId` pattern**: garantiza que un profesional nunca vea datos ajenos aunque manipule la query string.
- **Fire-and-forget en access_logs**: el log de auditoría no bloquea la respuesta con `.catch()` silencioso.
- **`HasRoleDirective`**: directiva estructural reutilizable que encapsula la comprobación de rol en el template, evitando lógica repetida.

---

## Autor

**Julio** — AccioSoft Dev Academy, Sprint 6

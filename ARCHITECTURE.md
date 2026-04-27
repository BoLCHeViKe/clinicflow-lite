# ClinicFlow Lite - Arquitectura del Proyecto

## Descripción del Producto

**ClinicFlow Lite** es un sistema de gestión de citas clínicas que permite a profesionales de salud y pacientes gestionar sus citas de forma completa y segura. La aplicación ofrece autenticación con JWT, validaciones robustas en frontend y backend, y un dashboard con métricas en tiempo real. Es una solución real con valor de mercado diseñada para clínicas pequeñas y medianas.

## Stack Tecnológico

### Frontend
- **Angular** 17+ (Framework principal)
- **Angular Material** (Componentes UI)
- **Angular Signals** (Gestión de estado reactivo)
- **RxJS** (Streams de datos)
- **Angular Reactive Forms** (Validaciones en frontend)
- **TypeScript** 5.2+
- **Node.js** 20+ (entorno de desarrollo)
- **npm** 10+ (gestor de paquetes)

### Backend
- **Node.js** 20+
- **Express** 4.x (framework web)
- **express-validator** (validaciones)
- **jsonwebtoken** (autenticación JWT)
- **bcryptjs** (hash de contraseñas)
- **mysql2/promise** (cliente MySQL async)
- **cors** (política CORS)
- **helmet** (cabeceras de seguridad HTTP)
- **dotenv** (variables de entorno)

### Base de Datos
- **MySQL** 8.0+

## Funcionalidades del MVP

1. **Autenticación**: Registro y login con JWT + bcrypt, gestión de tokens y sesiones
2. **CRUD completo**: Crear, leer, actualizar y eliminar citas sin restricciones
3. **Filtros y búsqueda**: Filtrar por estado, categoría y buscar por texto en tiempo real
4. **Dashboard**: Resumen con métricas, estadísticas y visualización de datos
5. **Validaciones**: Validaciones en frontend (Angular Reactive Forms) y backend (express-validator)
6. **Manejo de errores**: Estados de carga, vacío y error en todos los componentes
7. **Seguridad**: Autenticación JWT, contraseñas encriptadas, cabeceras seguras

## Esquema de la Base de Datos

### Tabla: users
Almacena información de autenticación y perfiles de usuarios (profesionales y administradores).

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Tabla: patients
Almacena información de los pacientes.

```sql
CREATE TABLE patients (
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
```

### Tabla: appointments
Recurso principal - almacena todas las citas clínicas.

```sql
CREATE TABLE appointments (
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
```

### Tabla: clinical_notes
Almacena notas clínicas adicionales asociadas a citas.

```sql
CREATE TABLE clinical_notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  appointmentId INT NOT NULL,
  content TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (appointmentId) REFERENCES appointments(id) ON DELETE CASCADE,
  INDEX idx_appointmentId (appointmentId)
);
```

## Estructura de Carpetas

### Frontend (Angular)
```
clinicflow-lite-frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── auth/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   ├── auth.interceptor.ts
│   │   │   │   └── auth.service.ts
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── appointments.service.ts
│   │   │   │   ├── patients.service.ts
│   │   │   │   └── api.service.ts
│   │   │   └── models/
│   │   │       ├── user.model.ts
│   │   │       ├── appointment.model.ts
│   │   │       ├── patient.model.ts
│   │   │       └── response.model.ts
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   │   ├── login.component.ts
│   │   │   │   │   └── login.component.html
│   │   │   │   └── register/
│   │   │   │       ├── register.component.ts
│   │   │   │       └── register.component.html
│   │   │   ├── appointments/
│   │   │   │   ├── appointments-list/
│   │   │   │   │   ├── appointments-list.component.ts
│   │   │   │   │   └── appointments-list.component.html
│   │   │   │   ├── appointments-form/
│   │   │   │   │   ├── appointments-form.component.ts
│   │   │   │   │   └── appointments-form.component.html
│   │   │   │   └── appointments-detail/
│   │   │   │       ├── appointments-detail.component.ts
│   │   │   │       └── appointments-detail.component.html
│   │   │   └── dashboard/
│   │   │       ├── dashboard.component.ts
│   │   │       └── dashboard.component.html
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── navbar/
│   │   │   │   ├── loading/
│   │   │   │   └── error-alert/
│   │   │   └── pipes/
│   │   ├── app.routes.ts
│   │   ├── app.config.ts
│   │   └── app.component.ts
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   ├── styles.scss
│   ├── main.ts
│   └── index.html
├── angular.json
├── package.json
└── tsconfig.json
```

### Backend (Node.js + Express)
```
clinicflow-lite-backend/
├── src/
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── appointments.routes.js
│   │   ├── patients.routes.js
│   │   └── index.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── appointments.controller.js
│   │   └── patients.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── validate.middleware.js
│   ├── validators/
│   │   ├── auth.validators.js
│   │   ├── appointments.validators.js
│   │   └── patients.validators.js
│   ├── db/
│   │   └── connection.js
│   ├── app.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE (Angular)                         │
│  Component → Service → HTTP Client → Express Router         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   SERVIDOR (Express)                         │
│  ├─ Middleware CORS                                         │
│  ├─ Middleware Auth (si requerido)                          │
│  ├─ Route Handler                                           │
│  ├─ Validator Middleware                                    │
│  ├─ Controller Logic                                        │
│  └─ Database Query                                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   BASE DE DATOS (MySQL)                      │
│  Query → Execute → Return Results                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    JSON Response
                            ↓
                  Angular Service
                            ↓
                   Component (UI)
```

## Variables de Entorno - Backend

```env
# Puerto del servidor
PORT=3001

# Configuración de Base de Datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_segura
DB_NAME=clinicflow_db
DB_PORT=3306

# Configuración JWT
JWT_SECRET=clave_secreta_muy_larga_y_aleatoria_min_32_chars
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:4200

# Entorno
NODE_ENV=development
```

## Variables de Entorno - Frontend

```env
# environment.ts
API_URL=http://localhost:3001/api

# environment.prod.ts
API_URL=https://api.clinicflow.com
```

## Convenciones de Desarrollo

### Endpoints del Backend

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registro de nuevo usuario |
| POST | `/api/auth/login` | Login de usuario |
| GET | `/api/appointments` | Listar todas las citas |
| GET | `/api/appointments/:id` | Obtener detalle de una cita |
| POST | `/api/appointments` | Crear nueva cita |
| PUT | `/api/appointments/:id` | Actualizar cita |
| DELETE | `/api/appointments/:id` | Eliminar cita |
| GET | `/api/patients` | Listar pacientes |
| POST | `/api/patients` | Crear paciente |

### Respuestas API

**Success (200/201)**
```json
{
  "success": true,
  "data": { /* datos */ },
  "message": "Operación completada exitosamente"
}
```

**Error (400/401/403/500)**
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Descripción del error",
  "details": { /* detalles adicionales */ }
}
```

## Principios de Arquitectura

1. **Separación de responsabilidades**: Cada capa tiene su propio propósito (routing, validation, business logic, data access)
2. **DRY (Don't Repeat Yourself)**: Reutilizar código mediante servicios y utilidades
3. **SOLID principles**: Especialmente Single Responsibility y Open/Closed
4. **Seguridad**: JWT para autenticación, bcrypt para contraseñas, helmet para cabeceras
5. **Escalabilidad**: Estructura lista para crecer sin refactorización mayor
6. **Testing**: Código preparado para testing unitario e integración

## Próximos Pasos

1. ✅ Arquitectura definida
2. ⏳ Inicializar repositorio Git
3. ⏳ Configurar proyecto Frontend (Angular)
4. ⏳ Configurar proyecto Backend (Express)
5. ⏳ Configurar base de datos MySQL
6. ⏳ Implementar autenticación
7. ⏳ Implementar CRUD de citas
8. ⏳ Implementar validaciones
9. ⏳ Implementar dashboard
10. ⏳ Deploy y testing

---

**Fecha de creación**: 2026-04-27  
**Versión**: 1.0  
**Estado**: Diseño completado - Listo para implementación
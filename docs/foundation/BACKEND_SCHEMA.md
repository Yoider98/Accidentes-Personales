---
doc_type: BACKEND_SCHEMA
app_type: fullstack
status: approved
---

# Backend Schema - Plataforma de Accidentes Personales

## 1. Entidades de Datos

### E-01: Tabla `users`
Almacena las cuentas de usuarios para autenticación y propiedad de siniestros.

| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PRIMARY KEY, DEFAULT gen_random_uuid() | Identificador único del usuario |
| `email` | `VARCHAR(255)` | UNIQUE, NOT NULL | Correo electrónico institucional o personal |
| `password_hash` | `VARCHAR(255)` | NOT NULL | Hash Bcrypt (nunca texto plano) |
| `full_name` | `VARCHAR(255)` | NOT NULL | Nombre y apellidos del usuario |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | DEFAULT NOW(), NOT NULL | Fecha de registro |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | DEFAULT NOW(), NOT NULL | Fecha de última actualización |

### E-02: Tabla `accidents`
Almacena los reportes de accidentes personales vinculados a cada usuario.

| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PRIMARY KEY, DEFAULT gen_random_uuid() | Identificador único del siniestro |
| `user_id` | `UUID` | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | Propietario del siniestro (para control Anti-IDOR) |
| `affected_name` | `VARCHAR(255)` | NOT NULL | Nombre de la persona afectada |
| `affected_phone` | `VARCHAR(50)` | NOT NULL | Teléfono de contacto |
| `accident_type` | `VARCHAR(100)` | NOT NULL | Tipo (Tránsito, Laboral, Hogar, Deporte, etc.) |
| `accident_date` | `TIMESTAMP WITH TIME ZONE` | NOT NULL | Fecha y hora de ocurrencia |
| `location` | `TEXT` | NOT NULL | Lugar exacto o referencia del siniestro |
| `description` | `TEXT` | NOT NULL | Narrativa de los hechos |
| `status` | `VARCHAR(50)` | NOT NULL, DEFAULT 'Registrado' | 'Registrado', 'En revisión', 'Cerrado' |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | DEFAULT NOW(), NOT NULL | Fecha de registro del reporte |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | DEFAULT NOW(), NOT NULL | Fecha de última actualización |

## 2. Restricciones e Índices
- `CREATE INDEX idx_accidents_user_id ON accidents(user_id);`
- `CREATE INDEX idx_accidents_status ON accidents(status);`
- Restricción Check de estados: `status IN ('Registrado', 'En revisión', 'Cerrado')`

## 3. Endpoints de la API REST

### Autenticación
- `POST /api/auth/register` -> Crea cuenta y retorna token JWT.
- `POST /api/auth/login` -> Valida credenciales y retorna token JWT.
- `GET /api/auth/me` -> Retorna información del usuario autenticado actual.

### Accidentes (Todos protegidos con JWT Middleware)
- `POST /api/accidents` -> Crea un nuevo accidente asignándolo al `req.user.id`.
- `GET /api/accidents` -> Lista únicamente los accidentes donde `user_id = req.user.id`.
- `GET /api/accidents/:id` -> Obtiene el detalle verificando `id = :id AND user_id = req.user.id`.
- `PATCH /api/accidents/:id/status` -> Transición de estado validada en backend.

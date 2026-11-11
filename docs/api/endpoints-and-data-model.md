# Documentación de Endpoints y Modelo de Datos

---

## 1. Modelo de Datos (PostgreSQL)

### Diagrama Entidad-Relación Lógico
```text
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│              USERS              │           │            ACCIDENTS            │
├─────────────────────────────────┤           ├─────────────────────────────────┤
│ id: UUID [PK]                   │ 1       N │ id: UUID [PK]                   │
│ email: VARCHAR(255) [UNIQUE]    │──────────<│ user_id: UUID [FK -> users.id]  │
│ password_hash: VARCHAR(255)     │           │ affected_name: VARCHAR(255)     │
│ full_name: VARCHAR(255)         │           │ affected_phone: VARCHAR(50)     │
│ created_at: TIMESTAMPTZ         │           │ accident_type: VARCHAR(100)     │
│ updated_at: TIMESTAMPTZ         │           │ accident_date: TIMESTAMPTZ      │
└─────────────────────────────────┘           │ location: TEXT                  │
                                              │ description: TEXT               │
                                              │ status: VARCHAR(50) [CHECK]     │
                                              │ created_at: TIMESTAMPTZ         │
                                              │ updated_at: TIMESTAMPTZ         │
                                              └─────────────────────────────────┘
```

### Restricciones e Integridad Referencial
- **Llave Foránea:** `accidents.user_id` referencia `users.id` con `ON DELETE CASCADE`.
- **Restricción Check:** `status IN ('Registrado', 'En revisión', 'Cerrado')`.
- **Índices de Búsqueda:**
  - `idx_accidents_user_id` en `accidents(user_id)` (acelera consultas protegidas por usuario).
  - `idx_accidents_status` en `accidents(status)`.
  - `idx_users_email` en `users(email)`.

---

## 2. Especificación de Endpoints REST

### Base URL: `/api`

### A. Módulo de Autenticación (`/api/auth`)

#### 1. Registrar Nuevo Usuario
* **Ruta:** `POST /api/auth/register`
* **Acceso:** Público
* **Cuerpo de la Petición:**
  ```json
  {
    "fullName": "Carlos Mendoza",
    "email": "carlos.mendoza@ejemplo.com",
    "password": "PasswordSegura123!"
  }
  ```
* **Respuesta Exitosa (`201 Created`):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "b3f2e1a0-7c8d-4f1e-9a2b-3c4d5e6f7a8b",
      "email": "carlos.mendoza@ejemplo.com",
      "fullName": "Carlos Mendoza"
    }
  }
  ```
* **Errores:**
  * `400 Bad Request`: Formato de email inválido o contraseña menor a 6 caracteres.
  * `409 Conflict`: Ya existe un usuario registrado con ese correo.

#### 2. Iniciar Sesión
* **Ruta:** `POST /api/auth/login`
* **Acceso:** Público
* **Cuerpo de la Petición:**
  ```json
  {
    "email": "carlos.mendoza@ejemplo.com",
    "password": "PasswordSegura123!"
  }
  ```
* **Respuesta Exitosa (`200 OK`):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "b3f2e1a0-7c8d-4f1e-9a2b-3c4d5e6f7a8b",
      "email": "carlos.mendoza@ejemplo.com",
      "fullName": "Carlos Mendoza"
    }
  }
  ```
* **Errores:**
  * `401 Unauthorized`: Credenciales inválidas (correo no encontrado o contraseña incorrecta).

#### 3. Consultar Perfil en Sesión
* **Ruta:** `GET /api/auth/me`
* **Acceso:** Protegido (`Authorization: Bearer <TOKEN>`)
* **Respuesta Exitosa (`200 OK`):**
  ```json
  {
    "id": "b3f2e1a0-7c8d-4f1e-9a2b-3c4d5e6f7a8b",
    "email": "carlos.mendoza@ejemplo.com",
    "fullName": "Carlos Mendoza"
  }
  ```

---

### B. Módulo de Accidentes (`/api/accidents`)
*Todos los endpoints requieren el encabezado `Authorization: Bearer <TOKEN>`.*

#### 1. Registrar Accidente
* **Ruta:** `POST /api/accidents`
* **Cuerpo de la Petición:**
  ```json
  {
    "affectedName": "Carlos Mendoza",
    "affectedPhone": "+573105556677",
    "accidentType": "Tránsito",
    "accidentDate": "2026-11-10T14:30:00Z",
    "location": "Carrera 7 con Calle 72, Bogotá",
    "description": "Colisión lateral leve con motocicleta al girar a la derecha."
  }
  ```
* **Regla Anti-IDOR:** El backend ignora cualquier `userId` enviado en el cuerpo. El siniestro se asocia automáticamente al `req.user.userId` extraído del token JWT validado.
* **Respuesta Exitosa (`201 Created`):**
  ```json
  {
    "id": "9a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d",
    "userId": "b3f2e1a0-7c8d-4f1e-9a2b-3c4d5e6f7a8b",
    "affectedName": "Carlos Mendoza",
    "affectedPhone": "+573105556677",
    "accidentType": "Tránsito",
    "accidentDate": "2026-11-10T14:30:00.000Z",
    "location": "Carrera 7 con Calle 72, Bogotá",
    "description": "Colisión lateral leve con motocicleta al girar a la derecha.",
    "status": "Registrado",
    "createdAt": "2026-11-11T17:00:00.000Z",
    "updatedAt": "2026-11-11T17:00:00.000Z"
  }
  ```

#### 2. Listar Mis Accidentes
* **Ruta:** `GET /api/accidents`
* **Respuesta Exitosa (`200 OK`):**
  Retorna un arreglo con los accidentes pertenecientes al usuario autenticado, ordenados cronológicamente descendente.
  ```json
  [
    {
      "id": "9a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d",
      "userId": "b3f2e1a0-7c8d-4f1e-9a2b-3c4d5e6f7a8b",
      "affectedName": "Carlos Mendoza",
      "affectedPhone": "+573105556677",
      "accidentType": "Tránsito",
      "accidentDate": "2026-11-10T14:30:00.000Z",
      "location": "Carrera 7 con Calle 72, Bogotá",
      "description": "Colisión lateral leve...",
      "status": "Registrado",
      "createdAt": "2026-11-11T17:00:00.000Z",
      "updatedAt": "2026-11-11T17:00:00.000Z"
    }
  ]
  ```

#### 3. Consultar Detalle de Accidente
* **Ruta:** `GET /api/accidents/:id`
* **Respuesta Exitosa (`200 OK`):** Retorna el objeto del accidente si pertenece al usuario.
* **Respuesta de Seguridad Anti-IDOR (`403 Forbidden`):**
  Si el accidente existe pero pertenece a otro usuario, el backend responde:
  ```json
  {
    "error": "Acceso denegado",
    "message": "No tiene autorización para consultar o modificar este accidente."
  }
  ```

#### 4. Actualizar Estado de Accidente
* **Ruta:** `PATCH /api/accidents/:id/status`
* **Cuerpo de la Petición:**
  ```json
  {
    "status": "En revisión"
  }
  ```
* **Validación de Transiciones:**
  * `Registrado` $\rightarrow$ `En revisión` (Permitido)
  * `En revisión` $\rightarrow$ `Cerrado` o `Registrado` (Permitido)
  * `Cerrado` $\rightarrow$ Cualquier estado (Rechazado con `400 Bad Request`)


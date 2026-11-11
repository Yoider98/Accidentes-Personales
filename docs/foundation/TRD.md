---
doc_type: TRD
app_type: fullstack
status: approved
---

# Technical Requirements Document (TRD) - Plataforma de Accidentes Personales

## 1. Arquitectura y Stack Tecnológico

### T-01: Arquitectura Hexagonal en Backend
- **Dominio:** Contiene entidades (`Accident`, `User`), Value Objects (`AccidentStatus`, `Email`) y reglas de negocio. Independiente de cualquier librería de infraestructura.
- **Aplicación:** Casos de uso (`RegisterAccidentUseCase`, `ListUserAccidentsUseCase`, etc.) y contratos/interfaces (puertos).
- **Infraestructura:** Adaptadores HTTP con Express, Adaptadores de persistencia con PostgreSQL / pg/prisma, adaptadores de seguridad con Bcrypt y JsonWebToken.

### T-02: Stack Tecnológico
- **Runtime:** Node.js v20+ / TypeScript 5+
- **Backend Framework:** Express.js
- **Frontend Framework:** React 18+ con TypeScript y Vite
- **Base de Datos:** PostgreSQL 16
- **Testing:** Vitest / Supertest
- **Validación de Datos:** Zod en Frontend y Backend

## 2. Requerimientos de Seguridad

### T-03: Mitigación IDOR (Insecure Direct Object Reference)
- Ninguna operación de consulta o mutación (`GET /accidents/:id`, etc.) utilizará parámetros enviados por el cliente para determinar el propietario.
- El `userId` provendrá del token JWT verificado por el middleware de autenticación.
- Las consultas en base de datos incluirán obligatoriamente el filtro de pertenencia:
  ```sql
  SELECT * FROM accidents WHERE id = $1 AND user_id = $2
  ```

### T-04: Gestión Segura de Credenciales y Secretos
- Prohibición de credenciales en repositorios.
- Exclusión estricta de `.env` en `.gitignore`.
- Archivo `.env.example` versionado con valores ficticios.

---
doc_type: IMPL_PLAN
app_type: fullstack
status: approved
---

# Implementation Plan (IMPL_PLAN) - Plataforma de Accidentes Personales

## P-01: Preparación y Andamio Inicial (Scaffolding & Foundation)
- [x] Inicialización del repositorio Git y ramas base (`main`, `develop`).
- [x] Configuración preventiva de `.gitignore` para bloquear credenciales y `.env`.
- [x] Creación de `.env.example` con variables de entorno simuladas.
- [x] Configuración de `docker-compose.yml` para PostgreSQL local.
- [x] Creación de especificaciones de gobernanza AFS v1 en `docs/foundation/`.
- [x] Creación de bitácora BMAD Method en `bmad/`.
- [x] Registro del primer ADR (`docs/adrs/0001-arquitectura-hexagonal-desde-cero.md`).

## P-02: Backend Core & Arquitectura Hexagonal (Domain & Ports)
- [ ] Inicializar proyecto Node.js + TypeScript en `backend/`.
- [ ] Modelos de Dominio puros: `User`, `Accident`, Value Objects (`AccidentStatus`, `Email`).
- [ ] Puertos e Interfaces (Application): `AccidentRepository`, `UserRepository`, `PasswordHasher`, `TokenService`.
- [ ] Casos de uso de autenticación: `RegisterUserUseCase`, `LoginUserUseCase`.
- [ ] Casos de uso de siniestros: `RegisterAccidentUseCase`, `ListUserAccidentsUseCase`, `GetAccidentDetailUseCase`.
- [ ] Pruebas unitarias de dominio con Vitest (0 dependencias de infraestructura).

## P-03: Backend Infrastructure & Adaptadores (PostgreSQL & Express)
- [ ] Configuración de persistencia PostgreSQL (migraciones / cliente SQL / Prisma / pg).
- [ ] Adaptador de repositorio PostgreSQL implementando los puertos.
- [ ] Adaptadores de seguridad: Bcrypt (hasher) y JWT (token).
- [ ] Middleware de autenticación y aislamiento IDOR (`authMiddleware`).
- [ ] Controladores HTTP y routers Express.
- [ ] Pruebas de integración HTTP y seguridad anti-IDOR.

## P-04: Frontend Client (React + TypeScript + Vite)
- [ ] Inicializar proyecto Vite React + TS en `frontend/`.
- [ ] Configuración de estilos y cliente HTTP (Axios / Fetch) con interceptor de token JWT.
- [ ] `AuthContext` para manejo de sesión en el cliente.
- [ ] Componente Landing pública con CTAs y redirecciones.
- [ ] Vistas de Login y Registro con validaciones.
- [ ] Formulario de Reporte de Accidente con validaciones visuales y estados de carga.
- [ ] Dashboard de "Mis Accidentes" con listado y estado vacío amigable.
- [ ] Vista de detalle de accidente.

## P-05: Validación Integral, Docker & Documentación Final
- [ ] Verificación de arranque limpio siguiendo el README.
- [ ] Ejecución y reporte de la suite de pruebas requeridas (sección 10 del enunciado).
- [ ] Documentación completa en `README.md` (requisitos, instalación, ejecución).
- [ ] Verificación final con linter de arquitectura y seguridad de ASAF.


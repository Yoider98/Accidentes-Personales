# Plataforma de Gestión de Accidentes Personales (MVP)

> **Prueba Técnica:** Ingeniero(a) Semi-Senior de Desarrollo Agéntico con IA  
> **Metodología:** BMAD Method + ASAF Framework (AFS v1)  
> **Arquitectura:** Arquitectura Hexagonal (Puertos y Adaptadores) en Backend y SPA en Frontend

---

## 1. Descripción del Proyecto

Aplicación web para el registro, consulta y seguimiento de accidentes personales con aislamiento riguroso de cuentas de usuario y mitigación estricta de vulnerabilidades IDOR (*Insecure Direct Object References*) y prevención de enumeración de recursos.

### Funcionalidades Principales:
* **Landing Page Pública:** Presentación del servicio y accesos directos a reporte de siniestros y consulta privada.
* **Autenticación Segura:** Registro e inicio de sesión con tokens JWT, contraseñas hasheadas con Bcrypt (10 salt rounds) y protección con Rate Limiting en endpoints de login/registro.
* **Registro de Siniestros:** Captura de datos del afectado, tipo de evento, fecha, lugar y narrativa de los hechos. El siniestro se asocia **exclusivamente con la identidad autenticada verificada en el servidor** (prevención de manipulación de payloads).
* **Panel Privado ("Mis Accidentes"):** Consulta exclusiva de los accidentes pertenecientes al usuario en sesión, con badges de estado (`Registrado`, `En revisión`, `Cerrado`).
* **Vista de Detalle Blindada (Anti-IDOR):** Búsqueda restringida en base de datos (`WHERE id = $1 AND user_id = $2`) respondiendo `404 Not Found` en caso de no pertenencia para evitar ataques de enumeración (ver `docs/adrs/0002-seguridad-jwt-y-migraciones-automaticas.md`).

---

## 2. Requisitos Previos

* **Node.js:** Versión 20.x o superior.
* **npm:** Versión 10.x o superior.
* **Docker & Docker Compose:** Para la instancia de base de datos PostgreSQL 16.

---

## 3. Configuración y Variables de Entorno

El proyecto incluye plantillas `.env.example` con valores ficticios para desarrollo local:

1. **Configurar variables para Docker Compose (raíz):**
   ```bash
   cp .env.example .env
   ```

2. **Configurar variables para el Backend (`backend/`):**
   ```bash
   cp .env.example backend/.env
   ```

*(Nota: En Windows PowerShell puede utilizar `Copy-Item .env.example .env`)*.

---

## 4. Guía de Arranque Limpio (Paso a Paso - Sección 10.9)

### Paso 1: Levantar la Base de Datos PostgreSQL
Desde la raíz del proyecto, ejecute Docker Compose:
```bash
docker compose up -d
```
Verifique el estado del contenedor mediante:
```bash
docker compose ps
```
Debe observar el servicio `db` en estado `Up` exponiendo el puerto `5432:5432`.

### Paso 2: Instalar y Compilar el Backend
```bash
cd backend
npm install
npm run build
```

### Paso 3: Ejecutar Migraciones de Base de Datos
Las migraciones se ejecutan automáticamente de forma transaccional e idempotente al iniciar el servidor (justificado en ADR-0002), o manualmente mediante:
```bash
node dist/infrastructure/database/migrator.js
```

### Paso 4: Iniciar el Servidor Backend
* **Modo Producción (Build compilado - Requerimiento 10.9):**
  ```bash
  npm start
  ```
  *(Nota: `npm start` compila automáticamente TypeScript mediante el hook `prestart`).*
* **Modo Desarrollo (Recarga en caliente con tsx):**
  ```bash
  npm run dev
  ```
El backend quedará disponible en `http://localhost:3000` (Healthcheck: `http://localhost:3000/api/health`).

### Paso 5: Instalar, Compilar y Ejecutar el Frontend desde Build (Requerimiento 10.9)
En una nueva terminal:
```bash
cd frontend
npm install
npm run build
npm run preview
```
La aplicación web de producción compilada quedará sirviéndose en `http://localhost:4173` (o en `http://localhost:5173` si usa `npm run dev`).

**Flujo básico de prueba a verificar:**
1. Crear una cuenta nueva desde `/register`.
2. Registrar un accidente en `/accidents/new`.
3. Consultar el accidente en el listado privado `/dashboard` y abrir su vista de detalle `/accidents/:id`.

---

## 5. Pruebas Automatizadas y Validación Arquitectónica

### A. Ejecución de la Suite de Pruebas (Vitest - 24 Tests):
```bash
cd backend
npm test
```
* **Requerimientos cubiertos:** 10.1 (validaciones), 10.2 (auth), 10.3 (Anti-IDOR y no enumeración con 404), 10.4 (datos inválidos), 10.5 (lista vacía), 10.6 (persistencia en volumen pgdata), 10.7 (ausencia de secretos en repo y bundle) y 10.8 (dominio puro).
* El registro verbatim de la ejecución está guardado en `docs/evidence/test-execution-report.md`.

### B. Creación de Base de Pruebas de Integración (Opcional):
Para crear la base secundaria `accidentes_test`:
```bash
docker compose exec db psql -U accidentes_app -d postgres -c "CREATE DATABASE accidentes_test;"
```

### C. Verificación de Arquitectura con `dependency-cruiser` (Rúbrica: 18 Puntos):
Para validar de forma automatizada que el Dominio no dependa de librerías externas ni infraestructura:
```bash
cd backend
npm run arch:check
```
Salida esperada:
```text
✔ no dependency violations found (44 modules, 107 dependencies cruised)
```
Reporte completo guardado en `docs/architecture/dependency-cruiser-report.txt`.

### D. Verificación de Seguridad y Ausencia de Secretos (Requerimiento 10.7):
```bash
node scripts/verify-security.js
```

---

## 6. Arquitectura Hexagonal y Ciclo de Vida de Estados

### Estructura de Capas
```text
backend/src/
├── domain/                      # NÚCLEO PURO: 0 dependencias externas ni de Node.js
│   ├── entities/                # User, Accident (validaciones y pertenencia)
│   ├── value-objects/           # AccidentStatus (matriz de transiciones válidas)
│   └── exceptions/              # Excepciones semánticas del negocio
├── application/                 # CASOS DE USO Y PUERTOS
│   ├── ports/                   # UserRepositoryPort, AccidentRepositoryPort, IdGeneratorPort...
│   └── use-cases/               # RegisterAccident, ListUserAccidents, GetAccidentDetail...
└── infrastructure/              # ADAPTADORES (Entrada / Salida)
    ├── database/                # Migrador SQL y Pool PostgreSQL
    ├── persistence/             # PostgresUserRepository, PostgresAccidentRepository
    ├── security/                # BcryptPasswordHasher, JwtTokenService, UuidGenerator
    └── http/                    # Express controllers, routers, authMiddleware, rateLimiter
```

### Ciclo de Vida y Transiciones de Estado
Los accidentes cuentan con tres estados estrictos gestionados por el Value Object `AccidentStatus`:
1. `Registrado` (Estado inicial automático al crear el siniestro).
2. `En revisión` (Estado intermedio de análisis).
3. `Cerrado` (Estado terminal).

* **Transiciones Permitidas:**
  * `Registrado` $\rightarrow$ `En revisión`
  * `En revisión` $\rightarrow$ `Cerrado` o `Registrado` (para subsanación de información)
  * `Cerrado` $\rightarrow$ Estado terminal inmutable.
* **Endpoint de Transición:**
  `PATCH /api/accidents/:id/status` con payload `{ "status": "En revisión" }`. Valida pertenencia de la cuenta y aplica la regla de transición en el dominio.

---

## 7. Registro de Decisiones de Arquitectura (ADRs) y Metodología BMAD

### Decisiones Arquitectónicas Registradas:
* **[ADR-0001: Implementación de Arquitectura Hexagonal desde Cero](docs/adrs/0001-arquitectura-hexagonal-desde-cero.md):** Justificación de adopción de arquitectura hexagonal pura frente a plantillas obsoletas (Guilhiz / MVC).
* **[ADR-0002: Mitigación Anti-IDOR, Almacenamiento de Tokens y Migraciones](docs/adrs/0002-seguridad-jwt-y-migraciones-automaticas.md):** Adopción de respuesta `404 Not Found` para evitar enumeración de identificadores, mitigaciones de seguridad para almacenamiento JWT en SPA y migraciones idempotentes al inicio.
* **[ADR-0003: Gestión de Transición de Estados y Segregación de Funciones (RBAC)](docs/adrs/0003-gestion-estados-y-segregacion-funciones.md):** Decisión de restringir transiciones de estado exclusivamente a roles administrativos/analistas para prevenir fraude y garantizar control interno asegurador.

### Metodología Agéntica y Control de Desvíos (BMAD Framework):
* **[Flujo de Trabajo y Roles BMAD (v2.x)](bmad/methodology-bmad-workflow.md):** Desglose del ciclo de vida agéntico, matriz RACI de agentes especializados y protocolos de verificación técnica.
* **[Historial de Prompts, Artefactos y Supervisión Humana](bmad/prompts-and-agent-history.md):** Registro de todas las sesiones de trabajo con agentes IA (P-01 a P-06), transcripción de prompts enviados, artefactos producidos, desvíos detectados y correcciones críticas implementadas por el ingeniero.
* **[Informe Integral de Pruebas y Cobertura (Vitest v8)](docs/evidence/test-execution-report.md):** Registro de 24 pruebas aprobadas al 100%, cumplimiento de la sección 10 del enunciado y desglose de cobertura (100% funciones de casos de uso).

---

## 8. Limitaciones Conocidas y Mejoras Futuras

* **Adjuntos Multimedia:** En siguientes versiones se integrará un bucket compatible con S3 para adjuntar fotografías y actas policiales.
* **Notificaciones en Tiempo Real:** El MVP no incluye servicio de mensajería SMS/Email en tiempo real, priorizando la persistencia e integridad de datos.

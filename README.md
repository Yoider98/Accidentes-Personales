# Plataforma de Gestión de Accidentes Personales (MVP)

> **Prueba Técnica:** Ingeniero(a) Semi-Senior de Desarrollo Agéntico con IA  
> **Metodología:** BMAD Method + ASAF Framework (AFS v1)  
> **Arquitectura:** Arquitectura Hexagonal (Puertos y Adaptadores) en Backend y SPA en Frontend

---

## 1. Descripción del Proyecto

Aplicación web completa para el registro, gestión y seguimiento de accidentes personales con aislamiento riguroso de cuentas de usuario y mitigación estricta de vulnerabilidades IDOR (*Insecure Direct Object References*).

### Funcionalidades Principales:
* **Landing Page Pública:** Presentación del servicio y accesos directos a reporte de siniestros y consulta privada.
* **Autenticación Segura:** Registro e inicio de sesión con tokens JWT y contraseñas hasheadas criptográficamente con Bcrypt (mínimo 10 salt rounds).
* **Registro de Siniestros:** Captura de datos del afectado, tipo de evento, fecha, lugar y narrativa de los hechos. El siniestro se asocia **exclusivamente con la identidad autenticada verificada en el servidor**.
* **Panel Privado ("Mis Accidentes"):** Consulta exclusiva de los accidentes pertenecientes al usuario en sesión, con badges de estado (`Registrado`, `En revisión`, `Cerrado`).
* **Vista de Detalle:** Inspección detallada con validación de propiedad en el backend.

---

## 2. Requisitos Previos

* **Node.js:** Versión 20.x o superior.
* **npm:** Versión 10.x o superior.
* **Docker & Docker Compose:** Para la instancia de base de datos PostgreSQL 16.

---

## 3. Configuración y Variables de Entorno

El proyecto incluye plantillas `.env.example` con valores ficticios para desarrollo local:

1. **Copiar variables para Docker Compose (raíz):**
   ```bash
   cp .env.example .env
   ```

2. **Copiar variables para el Backend (`backend/`):**
   ```bash
   cp .env.example backend/.env
   ```

*(Nota: En Windows PowerShell puede utilizar `Copy-Item .env.example .env`)*.

---

## 4. Guía de Arranque Limpio (Paso a Paso)

### Paso 1: Levantar la Base de Datos PostgreSQL
Desde la raíz del proyecto, ejecute Docker Compose:
```bash
docker compose up -d
```
Verifique que el contenedor `pruebatecnica-db-1` esté activo en el puerto `5432`.

### Paso 2: Instalar y Compilar el Backend
```bash
cd backend
npm install
npm run build
```

### Paso 3: Ejecutar Migraciones de Base de Datos
Las migraciones se ejecutan automáticamente al iniciar el servidor, o manualmente mediante:
```bash
node dist/infrastructure/database/migrator.js
```

### Paso 4: Iniciar el Servidor Backend
* **Modo Producción (Build compilado):**
  ```bash
  npm start
  ```
* **Modo Desarrollo (Recarga en caliente):**
  ```bash
  npm run dev
  ```
El backend quedará disponible en `http://localhost:3000` (Healthcheck: `http://localhost:3000/api/health`).

### Paso 5: Instalar y Ejecutar el Frontend
En una nueva terminal:
```bash
cd frontend
npm install
npm run dev
```
La aplicación web quedará disponible en su navegador en `http://localhost:5173`.

---

## 5. Ejecución de Pruebas Automatizadas

El proyecto cuenta con una suite completa de pruebas unitarias y de integración que cubren los requisitos obligatorios de la Sección 10:

```bash
cd backend
npm test
```

### Cobertura de Pruebas:
* `tests/unit/domain/accident-status.test.ts`: Validación de Value Object y transiciones permitidas.
* `tests/unit/domain/accident.test.ts`: Reglas de negocio del dominio y aserción de propiedad.
* `tests/unit/use-cases/auth.test.ts`: Hasheo de contraseñas y prevención de texto plano.
* `tests/unit/use-cases/accident.test.ts`: Asociación forzada de usuario y pruebas unitarias Anti-IDOR.
* `tests/integration/api.test.ts`:
  * `10.1`: Rechazo de registro sin campos requeridos (`400 Bad Request`).
  * `10.2`: Rechazo de consulta sin token (`401 Unauthorized`).
  * `10.3 [CRÍTICO IDOR]`: Rechazo de acceso a datos de terceros alterando IDs (`403 Forbidden`).
  * `10.4`: Validación de formatos de datos inválidos (`400 Bad Request`).
  * `10.5`: Manejo de cuenta sin accidentes previos (`200 OK` con `[]`).

---

## 6. Arquitectura Hexagonal (Estructura de Capas)

```text
backend/src/
├── domain/                      # NÚCLEO: Entidades puras y reglas de negocio
│   ├── entities/                # User, Accident
│   ├── value-objects/           # AccidentStatus
│   └── exceptions/              # DomainException, UnauthorizedAccidentAccessException
├── application/                 # CASOS DE USO Y PUERTOS
│   ├── ports/                   # UserRepositoryPort, AccidentRepositoryPort, Hasher, Token
│   └── use-cases/               # RegisterAccident, ListUserAccidents, AuthUseCases
└── infrastructure/              # ADAPTADORES (Entrada / Salida)
    ├── database/                # Migraciones y Pool pg
    ├── persistence/             # PostgresUserRepository, PostgresAccidentRepository
    ├── security/                # BcryptPasswordHasher, JwtTokenService
    └── http/                    # Express controllers, routers, middlewares (Auth, Error)
```

---

## 7. Decisiones Técnicas y Supuestos Asumidos

1. **Construcción Hexagonal desde Cero (ADR-001):**
   * Se decidió implementar Express + TypeScript desde cero para evitar el código muerto y la falta de arquitectura hexagonal presentes en las plantillas de referencia de la comunidad.
2. **Mitigación Estricta de IDOR:**
   * Ningún endpoint de mutación o lectura confía en identificadores de usuario enviados por el cliente. Las consultas SQL imponen la cláusula `WHERE id = $1 AND user_id = $2`.
3. **Persistencia e Integridad:**
   * Esquema relacional con llaves foráneas en cascada e índices sobre `user_id` y `status`.

---

## 8. Limitaciones Conocidas y Mejoras Futuras

* **Frecuencia de Notificaciones:** En esta versión MVP no se incluye pasarela de mensajería SMS/Email en tiempo real para eventos de cambio de estado.
* **Adjuntos Multimedia:** En siguientes versiones se recomienda integrar almacenamiento de objetos (ej. AWS S3 / MinIO) para adjuntar evidencias fotográficas al reporte de accidente.

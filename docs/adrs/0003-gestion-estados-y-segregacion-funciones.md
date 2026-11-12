# ADR 0003: Gestión de Transición de Estados y Segregación de Funciones (RBAC)

- **Estado:** Aceptado (Accepted)
- **Fecha:** 2026-11-11
- **Decisores:** Ingeniero(a) Semi-Senior de Desarrollo Agéntico & ASAF MCP

---

## 1. Contexto

En la plataforma de accidentes personales, un siniestro pasa por tres estados definidos por el Value Object de dominio `AccidentStatus`:
1. `Registrado` (Estado inicial al reportar el siniestro).
2. `En revisión` (Estado intermedio de auditoría y análisis técnico).
3. `Cerrado` (Estado terminal tras resolución o dictamen).

Se requiere formalizar la decisión arquitectónica sobre **quién, cómo y desde dónde** deben gestionarse las transiciones entre estos estados, evaluando si el propio usuario afectado puede cambiar el estado o si debe ser responsabilidad de un perfil administrativo / soporte.

---

## 2. Opciones Evaluadas

### Opción 1: Auto-gestión por el usuario creador (Rechazada)
* **Descripción:** Permitir al usuario que registró el accidente cambiar el estado a través de sus endpoints habituales.
* **Motivo de Rechazo:**
  * **Violación de Segregación de Funciones (SoD - Segregation of Duties):** En la industria de seguros y gestión de riesgos, el asegurado/afectado es parte interesada. Permitirle auto-aprobarse o cerrar un caso genera un conflicto de interés directo y riesgo de fraude.
  * **Inconsistencia de Negocio:** El estado `En revisión` denota una evaluación pericial o administrativa; el usuario final no tiene la competencia ni atribución para declararse "en revisión" o "cerrado".

### Opción 2: Rol Administrativo / Analista en la Plataforma (RBAC) (Opción Seleccionada)
* **Descripción:** Implementar un esquema de Control de Acceso Basado en Roles (RBAC) en el backend.
  * Los usuarios finales tienen el rol `asegurado` (solo pueden radicar y consultar sus propios accidentes).
  * Los operadores o auditores tienen el rol `analista` o `admin`.
* **Ventajas:**
  * **Coherencia Arquitectónica:** Encaja naturalmente en la Arquitectura Hexagonal actual mediante un caso de uso especializado (`ChangeAccidentStatusByAdminUseCase`) y un puerto de auditoría.
  * **Trazabilidad y Auditoría:** Permite registrar qué analista ejecutó la transición (`reviewed_by`), la fecha exacta (`reviewed_at`) y el dictamen/motivo.
  * **Superficie de Ataque Reducida:** Los endpoints administrativos se protegen mediante middleware de autorización (`requireRole(['admin', 'analista'])`), desacoplados de los endpoints públicos del asegurado.

### Opción 3: Sistema de Soporte Externo / Backoffice Desacoplado (Consideración Futura)
* **Descripción:** Exponer endpoints protegidos por API Key de servicio (M2M / Webhooks) consumidos por un sistema CRM o ERP externo (ej. Salesforce, Jira Service Desk).
* **Evaluación:** Es una excelente alternativa para fases maduras empresariales, pero introduce complejidad accidental innecesaria para el alcance actual del MVP.

---

## 3. Decisión Adoptada

1. **Principio de Mínimo Privilegio para el Asegurado:**
   * El usuario autenticado habitual (`asegurado`) **únicamente tiene permisos para:**
     * Registrar un nuevo siniestro (`POST /api/accidents`).
     * Consultar sus propios siniestros (`GET /api/accidents` y `GET /api/accidents/:id`).
   * No puede alterar estados de ningún accidente.

2. **Gobierno de Estados mediante Perfil Administrativo (RBAC):**
   * Las transiciones de estado (`Registrado` $\rightarrow$ `En revisión` $\rightarrow$ `Cerrado`) son potestad exclusiva de usuarios con rol `analista` o `admin`.
   * En el MVP, el dominio ya contiene las invariantes y validaciones de transición en `AccidentStatus` (`canTransitionTo`), preparado para la habilitación de la interfaz administrativa o consumo por el caso de uso administrativo.

3. **Invariantes del Dominio Preservadas:**
   * La entidad `Accident` rechaza cualquier transición inválida (por ejemplo, intentar reabrir un accidente `Cerrado` hacia `Registrado`) independientemente de si la solicitud proviene de un admin o un proceso automatizado.

---

## 4. Consecuencias y Roadmap de Implementación

* **Positivas:**
  * Se garantiza el cumplimiento de normas de control interno y prevención de fraude asegurador.
  * Se mantiene la pureza del modelo de dominio, encapsulando las transiciones válidas en el Value Object.
* **Próximos Pasos (Fase 2 / Backoffice):**
  * Añadir el claim `role` en la firma de tokens JWT.
  * Incorporar la ruta protegida `PATCH /api/admin/accidents/:id/status`.
  * Persistir campos de trazabilidad (`reviewed_by`, `reviewed_at`) en la tabla `accidents`.

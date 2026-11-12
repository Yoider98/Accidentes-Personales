# Metodología de Desarrollo Agéntico (BMAD Method & ASAF Governance)

> **Versión del Framework:** BMAD Method v2.x (Breakthrough Method for Agile AI Development) & ASAF (Automated Software Architecture Framework v1)  
> **Rol Evaluado:** Ingeniero(a) Semi-Senior de Desarrollo Agéntico con IA  
> **Proyecto:** Plataforma de Accidentes Personales  

---

## 1. Fundamentos del Método BMAD (Breakthrough Method for Agile AI Development)

El método BMAD es un marco de trabajo de ingeniería de software orientado a maximizar la productividad y precisión técnica mediante la orquestación de **agentes de Inteligencia Artificial especializados**, bajo la estricta **goberanza y dirección de un ingeniero de software responsable** (Human-in-the-loop).

A diferencia del uso ingenuo de modelos de lenguaje (donde se solicita código monolítico sin supervisión), BMAD descompone el ciclo de desarrollo en fases rigurosas:

```text
+-----------------------------------------------------------------------------------+
|                            BMAD Lifecycle Workflow                                |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [ Fase 1: Discovery & Strategy ]                                                 |
|     * Análisis de requerimientos y riesgos eliminatorios (IDOR, Secretos, Hasher) |
|     * Selección arquitectónica fundamentada (ADR-0001: Hexagonal desde cero)      |
|                                     │                                             |
|                                     ▼                                             |
|  [ Fase 2: Specialized Agent Delegation ]                                         |
|     * DDD Architect -> Entidades y Value Objects puros                            |
|     * Application Engineer -> Puertos y Casos de Uso                              |
|     * Infrastructure/AppSec Engineer -> Adaptadores, Rutas y Prevención Anti-IDOR |
|     * Frontend Specialist -> React 18 SPA y flujos desde Build                    |
|                                     │                                             |
|                                     ▼                                             |
|  [ Fase 3: Critical Human Supervision & Linter Gates ]                            |
|     * ASAF Governance check (asaf_check_governance)                                |
|     * Dependency Cruiser check (npm run arch:check -> 0 violaciones)              |
|     * Detección y corrección de desvíos (Ej: node:crypto -> IdGeneratorPort)      |
|                                     │                                             |
|                                     ▼                                             |
|  [ Fase 4: Rigorous Verification & Evidence Capture ]                             |
|     * Vitest suite completa (24 tests pasando)                                    |
|     * Cobertura de código v8 (100% funciones de casos de uso)                     |
|     * Auditoría de secretos en repo y bundle (scripts/verify-security.js)         |
|     * Documentación y registro de decisiones (ADRs)                               |
+-----------------------------------------------------------------------------------+
```

---

## 2. Roles de Agentes Especializados y Matriz RACI

En el marco BMAD, cada agente actúa dentro de un contexto acotado y con directivas precisas:

| Rol de Agente | Responsabilidad Principal | Artefactos Producidos | Control de Calidad Humano |
| :--- | :--- | :--- | :--- |
| **Cognitive Orchestrator (ASAF)** | Análisis de requerimientos, topología de impacto y límites arquitectónicos. | Reportes de gobernanza, plan de cambios estructurado. | Aprobación previa a la ejecución de código. |
| **Domain Architect (DDD)** | Modelado del núcleo del negocio sin dependencias tecnológicas. | `src/domain/entities/`, `src/domain/value-objects/`. | Verificación de 0 dependencias en package.json en dominio. |
| **Application Engineer** | Orquestación de lógica de negocio mediante casos de uso y definición de contratos (puertos). | `src/application/use-cases/`, `src/application/ports/`. | Eliminación de dependencias del runtime (`node:crypto`). |
| **Security / AppSec Specialist** | Análisis de vectores de ataque (IDOR, enumeración de IDs, fuerza bruta, secretos). | Adaptador Anti-IDOR en base de datos (`WHERE id = $1 AND user_id = $2`), rate limiters, validadores de entorno. | Decisión de retornar `404 Not Found` en lugar de `403` para evitar enumeración. |
| **Frontend Engineer** | Construcción de interfaz de usuario reactiva, accesible y orientada a la experiencia. | Aplicación React 18 + TypeScript + Vite (`frontend/`). | Validación de funcionamiento desde bundle compilado (`npm run build && npm run preview`). |
| **QA / Compliance Agent** | Generación de suites de prueba unitarias, integración y análisis estático. | Tests en Vitest (`backend/tests/`), script `scripts/verify-security.js`, regla `dependency-cruiser`. | Inspección verbatim de logs de ejecución y matriz de requerimientos del PDF. |

---

## 3. Protocolo de Handoff y Control de Desvíos de Agentes

Uno de los postulados clave de BMAD es que **los agentes de IA son propensos a desviaciones sutiles**:
1. *Tendencia al sobre-acoplamiento:* El agente tiende a importar librerías donde le resulte más rápido (por ejemplo, usar `node:crypto` dentro de la capa de aplicación).
2. *Tendencia a atajos arquitectónicos:* El agente tiende a acceder a repositorios directamente desde controladores HTTP en endpoints sencillos como `/me`.
3. *Vulnerabilidades lógicas contextuales:* El agente puede asumir que un `403 Forbidden` es suficiente para IDOR, sin anticipar que el atacante usará esa respuesta para enumerar qué registros existen.

### Protocolo de Intervención Aplicado en este Proyecto:
1. **Auditoría Mecánica:** Se ejecuta `dependency-cruiser` y `asaf_check_governance`. Si una regla falla, el artefacto no se fusiona.
2. **Revisión de Seguridad Contextual:** Todo acceso a datos que involucre un `id` proveniente de la URL debe estar atado al `userId` del JWT extraído del token de servidor.
3. **Validación de Secretos en Build:** Todo artefacto generado para distribución en frontend se escanea con expresiones regulares contra claves privadas, JWTs y cadenas de conexión.

---

## 4. Evidencias y Trazabilidad del Proyecto

Los siguientes artefactos respaldan la aplicación metódica de BMAD en este repositorio:

* **Prompts e Historial de Sesiones:** [`bmad/prompts-and-agent-history.md`](file:///d:/GitHub/Prueba%20Tecnica/bmad/prompts-and-agent-history.md) (Sesiones P-01 a P-06, matrices de desvíos y transcripciones).
* **Informe Completo de Pruebas y Cobertura:** [`docs/evidence/test-execution-report.md`](file:///d:/GitHub/Prueba%20Tecnica/docs/evidence/test-execution-report.md) (24 pruebas Vitest, matriz Sección 10 del PDF, reporte v8).
* **Verificación de Dependencias Arquitectónicas:** [`docs/architecture/dependency-cruiser-report.txt`](file:///d:/GitHub/Prueba%20Tecnica/docs/architecture/dependency-cruiser-report.txt) (0 violaciones en 44 módulos).
* **Registro de Decisiones Arquitectónicas (ADRs):**
  * [`ADR-0001: Implementación de Arquitectura Hexagonal desde Cero`](file:///d:/GitHub/Prueba%20Tecnica/docs/adrs/0001-arquitectura-hexagonal-desde-cero.md)
  * [`ADR-0002: Mitigación Anti-IDOR (404), Almacenamiento de Tokens y Migraciones`](file:///d:/GitHub/Prueba%20Tecnica/docs/adrs/0002-seguridad-jwt-y-migraciones-automaticas.md)

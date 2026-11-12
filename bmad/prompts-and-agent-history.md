# Historial de Prompts, Sesiones y Supervisión de Agentes (BMAD Method)

> **Candidato:** Ingeniero(a) Semi-Senior de Desarrollo Agéntico con IA  
> **Marco Metodológico:** BMAD Method (Breakthrough Method for Agile AI Development) & ASAF Framework (AFS v1)  
> **Objetivo:** Demostrar criterio técnico en la dirección, supervisión crítica, detección de desvíos y validación de software producido con agentes de IA.

---

## 1. Filosofía de Supervisión Agéntica
En cumplimiento de la **Sección 6 del enunciado**, el postulante asume la responsabilidad total del código. Los agentes de IA fueron dirigidos bajo el patrón:
`Especificación Estricta` $\rightarrow$ `Generación Agéntica` $\rightarrow$ `Revisión Crítica y Linter de Capas (ASAF)` $\rightarrow$ `Prueba Automatizada` $\rightarrow$ `Aceptación o Refactorización Humana`.

---

## 2. Registro Cronológico de Prompts y Supervisiones Críticas

### Sesión P-01: Análisis del Problema y Decisión Arquitectónica
* **Rol del Agente:** Arquitecto de Software Principal / Cognitive Orchestrator (ASAF).
* **Prompt Enviado:**
  > "Analizar el caso de negocio de la plataforma de accidentes personales y evaluar los repositorios de referencia de la sección 2.1 (guilhiz/Node-Boilerplate y eriksonwilliam/reference-architecture-node). Determinar si se debe adaptar una plantilla o construir desde cero, considerando la obligatoriedad de la Arquitectura Hexagonal y la recomendación oficial de Express."
* **Propuesta Inicial del Agente:**
  Sugirió adaptar `guilhiz/Node-Boilerplate` por tener Express ya instalado.
* **Supervisión Crítica del Ingeniero (Detección de Desvío):**
  *Se rechazó la sugerencia del agente.* La plantilla de Guilhiz tiene arquitectura MVC tradicional fuertemente acoplada a Prisma y Express, sin puertos ni adaptadores, además de dependencias con versiones obsoletas. Reestructurarla implicaba riesgo de código muerto y posibles violaciones de dependencias.
* **Decisión e Instrucción de Corrección:**
  Se instruyó generar una base limpia desde cero en Express + TypeScript con dominio 100% puro y puertos explícitos (registrado en `docs/adrs/0001-arquitectura-hexagonal-desde-cero.md`).

---

### Sesión P-02: Modelado del Dominio y Puertos de Aplicación
* **Rol del Agente:** Ingeniero Backend / DDD Specialist.
* **Prompt Enviado:**
  > "Implementar la capa de dominio pura de Accidentes y Usuarios. Diseñar la entidad Accident, el Value Object AccidentStatus con transiciones permitidas ('Registrado', 'En revisión', 'Cerrado') y los puertos de repositorio y seguridad. Ninguna entidad ni caso de uso debe depender de librerías de infraestructura."
* **Artefacto Generado:**
  `backend/src/domain/entities/accident.entity.ts`, `backend/src/domain/value-objects/accident-status.vo.ts`, `backend/src/application/ports/`.
* **Supervisión Crítica del Ingeniero:**
  El agente implementó correctamente los estados y las transiciones. Sin embargo, en `RegisterAccidentUseCase` y `RegisterUserUseCase`, el agente utilizó `import crypto from 'node:crypto';` para generar identificadores.
* **Intervención y Refactorización del Ingeniero:**
  Se detectó que importar la API nativa `node:crypto` dentro de la capa de aplicación violaba el principio de independencia tecnológica. Se ordenó la creación del puerto abstracto `IdGeneratorPort` en `src/application/ports/id-generator.port.ts` y su implementación `UuidGenerator` en infraestructura.

---

### Sesión P-03: Mitigación Anti-IDOR y Prevención de Enumeración
* **Rol del Agente:** Especialista en Ciberseguridad / AppSec.
* **Prompt Enviado:**
  > "Evaluar el endpoint GET /api/accidents/:id. El caso de uso actual valida la pertenencia con accident.assertOwnership() y lanza 403 Forbidden si el accidente pertenece a otro usuario. Analizar el impacto de seguridad de esta respuesta."
* **Análisis de Vulnerabilidad Detectado:**
  Responder `403 Forbidden` confirma implícitamente al atacante que el ID consultado existe en la base de datos de la compañía y pertenece a un tercero, abriendo la puerta a ataques de **enumeración de identificadores y recolección de información**.
* **Instrucción de Corrección:**
  1. Modificar `GetAccidentDetailUseCase` y `UpdateAccidentStatusUseCase` para utilizar `accidentRepository.findUserAccidentById(userId, accidentId)`.
  2. Si el registro no se encuentra para ese usuario autenticado, lanzar `EntityNotFoundException`, traduciéndose en **`404 Not Found`**.
  3. De esta forma, el sistema no revela ninguna pista sobre la existencia o inexistencia del registro ajeno.

---

### Sesión P-04: Desacople de Controladores HTTP
* **Rol del Agente:** Revisor de Arquitectura de Software.
* **Prompt Enviado:**
  > "Auditar backend/src/infrastructure/http/controllers/auth.controller.ts en búsqueda de violaciones a la arquitectura hexagonal."
* **Hallazgo:**
  El método `me()` del controlador llamaba directamente a `UserRepositoryPort.findById(userId)`. Aunque `UserRepositoryPort` es una interfaz, un controlador de infraestructura debe interactuar con casos de uso, no directamente con repositorios.
* **Corrección Aplicada:**
  Se construyó el caso de uso `GetAuthenticatedUserUseCase` (`src/application/use-cases/get-authenticated-user.use-case.ts`) e inyectó en el controlador.

---

### Sesión P-05: Verificación Mecánica de Dependencias (dependency-cruiser)
* **Rol del Agente:** QA / Arquitecto de Gobernanza.
* **Prompt Enviado:**
  > "Configurar dependency-cruiser con reglas estrictas que garanticen que src/domain no importe librerías externas ni adaptadores, que src/application no importe infraestructura y que no existan ciclos. Crear script npm run arch:check."
* **Resultado Obtenido:**
  Configuración en `.dependency-cruiser.cjs` y ejecución exitosa:
  `✔ no dependency violations found (44 modules, 107 dependencies cruised)`. Reporte exportado a `docs/architecture/dependency-cruiser-report.txt`.

---

### Sesión P-06: Frontend SPA y Flujo desde Build
* **Rol del Agente:** Frontend Developer (React + TypeScript).
* **Prompt Enviado:**
  > "Construir la aplicación React con Vite respetando el DESIGN_BRIEF.md. La Landing debe ofrecer 'Registrar un accidente' e 'Ingresar para consultar mis accidentes'. Si el usuario no tiene sesión activa, redirigir a login preservando el parámetro de retorno. Crear el panel privado con listado, badges de estado y vista de detalle protegida."
* **Supervisión Crítica del Ingeniero:**
  Se verificó que el frontend compile con 0 errores de TypeScript y que funcione tanto en modo desarrollo como sirviéndose desde el build de producción (`npm run build && npm run preview` en el puerto 4173), dando estricto cumplimiento al requerimiento 10.9.

---

## 3. Matriz de Control de Desvíos de Agentes

| Componente | Código Sugerido por el Agente | Desvío Detectado por el Ingeniero | Solución Definitiva Implementada |
| :--- | :--- | :--- | :--- |
| **Plantilla Backend** | Usar `Node-Boilerplate` | Falta de arquitectura hexagonal y dependencias viejas | Construcción desde cero en Express con arquitectura hexagonal pura |
| **Generación de IDs** | `import crypto from 'node:crypto'` en Application | Acoplamiento a Node.js dentro de Casos de Uso | Creación del puerto `IdGeneratorPort` y adaptador `UuidGenerator` |
| **Respuesta Anti-IDOR** | `403 Forbidden` al consultar ID de tercero | Confirmaba existencia del ID ajeno (Enumeración) | Cambio a `404 Not Found` mediante `findUserAccidentById` |
| **Endpoint /auth/me** | Controlador consultaba `UserRepositoryPort` | Acoplamiento directo de controlador a repositorio | Creación de `GetAuthenticatedUserUseCase` |
| **Auditoría de Secretos** | Validación manual de variables | Riesgo de filtración en bundles | Creación de `scripts/verify-security.js` y prueba 10.7 |

# ADR 0002: Decisiones de Seguridad, Manejo de Tokens, Migraciones y Mitigación de Enumeración

- **Estado:** Aceptado (Accepted)
- **Fecha:** 2026-11-11
- **Decisores:** Ingeniero(a) Semi-Senior de Desarrollo Agéntico & ASAF MCP

---

## 1. Almacenamiento de Tokens JWT en Frontend: `localStorage` vs `httpOnly Cookies`

### Contexto
Se requirió definir el mecanismo de almacenamiento del token de autenticación en la SPA React.

### Decisión
Se decidió utilizar `localStorage` para el almacenamiento del token JWT en esta versión MVP, inyectándolo como encabezado `Authorization: Bearer <token>` en las peticiones HTTP.

### Justificación y Análisis de Riesgos:
- **Trade-offs:** 
  - Las cookies `httpOnly` protegen contra ataques XSS al impedir el acceso desde JavaScript. Sin embargo, en arquitecturas desacopladas (Frontend en Vite:5173 y Backend en Express:3000 o dominios separados), requieren configuración de `SameSite`, HTTPS y gestión de proxies/CORS con credenciales `withCredentials: true`.
  - El uso de `localStorage` simplifica la integración y desacopla completamente el cliente de la infraestructura de transporte.
- **Riesgo Aceptado y Mitigaciones:**
  - *Riesgo:* Exposición a vulnerabilidades XSS.
  - *Mitigación:* Se implementó `helmet()` en Express con políticas CSP (*Content Security Policy*), sanitización de entradas con `zod`, cero dependencias vulnerables (verificado con `npm audit`), y React escapa de forma nativa todo el contenido renderizado en JSX.

---

## 2. Mitigación Anti-IDOR y Prevención de Enumeración (Respuesta 404 vs 403)

### Contexto
Cuando un usuario intenta acceder a un accidente que no le pertenece alterando el ID en la URL (`GET /api/accidents/:id`), existían dos alternativas: responder `403 Forbidden` o `404 Not Found`.

### Decisión
El backend responde estrictamente con **`404 Not Found`** (`EntityNotFoundException`) mediante la consulta `findUserAccidentById(userId, accidentId)`.

### Justificación:
- Responder `403 Forbidden` confirmaría al atacante que el ID consultado efectivamente existe en la base de datos de la compañía y que pertenece a otra persona, permitiendo ataques de **enumeración de registros y fuerza bruta de IDs**.
- Responder `404 Not Found` no revela ninguna información sobre la existencia previa del identificador, blindando la privacidad de otros usuarios.

---

## 3. Migraciones Automáticas al Arrancar el Servidor

### Contexto
Para garantizar el requerimiento de "Arranque limpio (10.9)" donde cualquier evaluador pueda clonar el repositorio y ejecutar el proyecto siguiendo exclusivamente el `README.md` sin pasos manuales complejos.

### Decisión
El servidor ejecuta `runMigrations()` de forma idempotente en el arranque antes de escuchar peticiones en el puerto HTTP.

### Justificación y Riesgos:
- **Beneficio:** Cero fricción en entornos de evaluación, CI/CD y despliegue rápido. La base de datos siempre tiene el esquema al día.
- **Riesgo Identificado:** En entornos de producción con alta concurrencia o múltiples réplicas horizontales (clustering), dos instancias podrían competir ejecutando migraciones simultáneamente.
- **Mitigación:** La migración se ejecuta dentro de una transacción transaccional explícita (`BEGIN ... COMMIT`) con sentencias idempotentes (`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`). Para producción a gran escala, se provee el script desacoplado `node dist/infrastructure/database/migrator.js`.

---

## 4. Contradicciones entre Repositorios de Referencia y Lineamientos de la Organización

### Contexto
La sección 2.1 sugería `guilhiz/Node-Boilerplate` (Express no hexagonal) y `eriksonwilliam/reference-architecture-node` (Fastify hexagonal).

### Resolución Documentada:
1. `guilhiz/Node-Boilerplate` violaba la regla de **Arquitectura Hexagonal obligatoria** (sección 5), mezclando controladores y persistencia.
2. `eriksonwilliam` implementaba Fastify en lugar de Express (recomendado formalmente en la sección 5).
3. **Resolución:** Se adoptaron las mejores prácticas de Express + Hexagonal construidas desde cero y supervisadas por el linter estático de ASAF, cumpliendo simultáneamente el framework oficial y el aislamiento total del dominio.

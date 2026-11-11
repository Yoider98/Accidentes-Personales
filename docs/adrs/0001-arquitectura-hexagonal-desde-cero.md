# ADR 0001: Adopción de Arquitectura Hexagonal y Construcción Limpia desde Cero

- **Estado:** Aceptado (Accepted)
- **Fecha:** 2026-11-11
- **Decisores:** Ingeniero(a) Semi-Senior de Desarrollo Agéntico & ASAF MCP

---

## Contexto y Planteamiento del Problema

La prueba técnica requiere la construcción de una plataforma de accidentes personales con arquitectura hexagonal estricta (puertos y adaptadores) en Node.js + TypeScript, frontend en React + TypeScript y persistencia en PostgreSQL. 

La sección 2.1 del enunciado ofrecía dos opciones de partida para backend:
1. `guilhiz/Node-Boilerplate`: Usa Express y PostgreSQL, pero NO está estructurado en arquitectura hexagonal (requiere reestructuración total y limpieza de dependencias innecesarias).
2. `eriksonwilliam/reference-architecture-node`: Usa arquitectura hexagonal, pero implementa Fastify en lugar del framework recomendado (Express).

## Decisión Arquitectónica

Se decide **construir la base del backend desde cero con Express + TypeScript**, aplicando rigurosamente los principios de **Arquitectura Hexagonal (Puertos y Adaptadores)** supervisados mediante el MCP de ASAF.

### Justificación:
1. **Aislamiento Puro del Dominio:** Al construir el núcleo desde cero, se garantiza que la capa de Dominio no tenga acoplamiento con Express, PostgreSQL, Prisma o librerías externas de transporte o persistencia.
2. **Framework Oficial Recomendado:** Se utiliza **Express**, cumpliendo con la recomendación directa del enunciado sin introducir fricciones de migración desde Fastify.
3. **Minimización de Riesgos y Dependencias Ocultas:** Se eliminan dependencias superfluas de plantillas comunitarias, garantizando control total de vulnerabilidades y seguridad desde el primer commit.
4. **Validación Continua:** Cada puerto, caso de uso y adaptador es validado mediante gobernanza estática de ASAF (`asaf_check_governance`).

## Consecuencias

### Positivas:
- Cero código muerto o dependencias heredadas con vulnerabilidades.
- Cumplimiento verificable de la dirección de dependencias (hacia el núcleo).
- Trazabilidad limpia en commits y ramas de Git.
- Facilidad para escribir pruebas unitarias de dominio sin dependencias de infraestructura.

### Mitigaciones / Compromisos:
- Se requiere configurar manualmente el build de TypeScript, linter y suite de tests (Vitest/Jest).


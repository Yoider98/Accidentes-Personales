# Validación y Evidencia de Arquitectura Hexagonal

Este documento demuestra el estricto cumplimiento de los lineamientos de **Arquitectura Hexagonal (Puertos y Adaptadores)** exigidos en la Sección 5 de la prueba técnica.

---

## 1. Diagrama de Dirección de Dependencias

```text
                  INFRASTRUCTURE LAYER (Adaptadores)
       ┌──────────────────────────────────────────────────────┐
       │   [HTTP / Express]         [Persistence / PostgreSQL]│
       │   - AuthController         - PostgresUserRepository  │
       │   - AccidentController     - PostgresAccidentRepo    │
       │   - AuthMiddleware         - PostgresPool            │
       │             │                         │              │
       └─────────────┼─────────────────────────┼──────────────┘
                     │ (Usa)                   │ (Implementa)
                     ▼                         ▼
            APPLICATION LAYER (Casos de Uso y Puertos)
       ┌──────────────────────────────────────────────────────┐
       │   [Casos de Uso]           [Puertos / Interfaces]    │
       │   - RegisterUserUseCase    - UserRepositoryPort      │
       │   - LoginUserUseCase       - AccidentRepositoryPort  │
       │   - RegisterAccident       - PasswordHasherPort      │
       │   - ListUserAccidents      - TokenServicePort        │
       │             │                         │              │
       └─────────────┼─────────────────────────┼──────────────┘
                     │ (Usa)                   │ (Referencias)
                     ▼                         ▼
                  DOMAIN LAYER (Núcleo Puro del Negocio)
       ┌──────────────────────────────────────────────────────┐
       │   - User (Entity)                                    │
       │   - Accident (Entity con aserción de propiedad)      │
       │   - AccidentStatus (Value Object con transiciones)   │
       │   - DomainExceptions (Sin dependencias externas)     │
       └──────────────────────────────────────────────────────┘
```

---

## 2. Verificación de Criterios de Evaluación (Sección 5)

| Criterio Exigido | Cumplimiento en el Código | Archivos de Evidencia |
| :--- | :--- | :--- |
| **1. Dominio Puro:** No depende de React, Express, PostgreSQL ni librerías de infraestructura. | La capa `backend/src/domain/` tiene **cero imports** de librerías de terceros (únicamente tipos puros de TypeScript). | `backend/src/domain/entities/accident.entity.ts`, `backend/src/domain/value-objects/accident-status.vo.ts` |
| **2. Separación de Lógica de Aplicación:** Los controladores HTTP no contienen reglas de negocio. | Los controladores (`AuthController`, `AccidentController`) se limitan a parsear DTOs con Zod, invocar el caso de uso correspondiente y retornar el código HTTP adecuado. | `backend/src/infrastructure/http/controllers/accident.controller.ts` |
| **3. Puertos e Interfaces:** Dependencias externas abstraídas mediante interfaces en la capa de aplicación. | Existen contratos explícitos para repositorios (`UserRepositoryPort`, `AccidentRepositoryPort`) y servicios criptográficos (`PasswordHasherPort`, `TokenServicePort`). | `backend/src/application/ports/` |
| **4. Dirección de Dependencias hacia el Núcleo:** La infraestructura depende del dominio y de los puertos, nunca al revés. | Los adaptadores de infraestructura (`PostgresUserRepository`, `BcryptPasswordHasher`, etc.) implementan los puertos definidos en la capa de aplicación. | `backend/src/infrastructure/persistence/`, `backend/src/infrastructure/security/` |
| **5. Testeabilidad sin Infraestructura:** Las reglas de negocio se pueden probar sin base de datos ni Express. | La suite de pruebas unitarias (`tests/unit/`) prueba todas las entidades y casos de uso con repositorios en memoria (`InMemoryAccidentRepository`), sin requerir Docker ni PostgreSQL. | `backend/tests/unit/use-cases/accident.test.ts`, `backend/tests/unit/domain/accident.test.ts` |

---

## 3. Verificación con Linter Estático de Gobernanza ASAF

El MCP de ASAF ejecuta de forma estática la validación de cumplimiento de capas DDD / Clean:
```bash
asaf_check_governance
```
**Resultado:** `✓ No se detectaron violaciones arquitectónicas. La estructura cumple las capas.`

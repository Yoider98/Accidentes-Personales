---
doc_type: DESIGN_BRIEF
app_type: fullstack
status: approved
---

# Design Brief - Plataforma de Accidentes Personales

## 1. Identidad Visual y Estilo
- **Tono:** Confiable, profesional, accesible y sobrio (ideal para situaciones de emergencia y gestión de siniestros).
- **Paleta de Colores:**
  - Primario: Azul marino institucional (`#1e3a8a` / `#2563eb`) para confianza y solidez.
  - Secundario / Acento: Ámbar / Naranja suave (`#f59e0b`) para alertas y estados "En revisión".
  - Éxito / Registro: Esmeralda (`#10b981`) para confirmaciones y estado "Registrado".
  - Neutros: Fondos limpios en blanco/gris claro (`#f8fafc`) con tipografía oscura de alto contraste (`#0f172a`).
- **Tipografía:** Sans-serif moderna y legible (Inter o System UI).

## 2. Componentes UI Clave
- **Botones y Formularios:** Estados claros (hover, active, disabled, loading).
- **Badges de Estado:**
  - `Registrado`: Fondo azul claro / texto azul marino.
  - `En revisión`: Fondo ámbar claro / texto marrón oscuro.
  - `Cerrado`: Fondo gris neutro / texto pizarra.
- **Feedback:** Mensajes de error en campos inválidos con texto comprensible y notificaciones toast de éxito.

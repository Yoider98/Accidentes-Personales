---
doc_type: PRD
app_type: fullstack
status: approved
---

# Product Requirements Document (PRD) - Plataforma de Accidentes Personales

## 1. Visión del Producto
Proveer una plataforma web intuitiva, confiable y segura que permita a cualquier persona registrar un accidente personal y realizar el seguimiento de su estado en un área privada, garantizando la privacidad absoluta de los datos de cada usuario mediante controles estrictos en el backend.

## 2. Requerimientos Funcionales (F-xx)

### F-01: Landing Pública
- Presentación concisa del propósito de la plataforma.
- Botones de llamado a la acción (CTA): "Registrar un accidente" e "Ingresar para consultar mis accidentes".
- Redirección automática al flujo de autenticación si el usuario no tiene una sesión activa al intentar registrar un accidente.

### F-02: Gestión de Cuentas y Autenticación
- Registro de nuevo usuario (nombre completo, correo electrónico, contraseña segura).
- Inicio de sesión con generación de token JWT.
- Cierre de sesión y revocación del estado de cliente.
- Validación de contraseñas con hashing criptográfico (Bcrypt). Prohibición absoluta de almacenamiento en texto plano.

### F-03: Registro de Accidente Personal
- Formulario de captura con validación en frontend y backend:
  - Nombre y teléfono de contacto del afectado.
  - Tipo de accidente (Tránsito, Laboral, Hogar, Deporte, Otro).
  - Fecha y hora del siniestro.
  - Ubicación/Lugar.
  - Descripción de los hechos.
- Asociación inequívoca del siniestro al usuario autenticado mediante el contexto del servidor (prevención de IDOR).
- Asignación de estado inicial: `Registrado`.

### F-04: Consulta Privada de Accidentes
- Listado privado paginado o completo de los accidentes pertenecientes al usuario logueado.
- Indicador visual de fecha y estado de cada registro.
- Mensaje informativo cuando el usuario aún no posee accidentes registrados.

### F-05: Detalle de Accidente y Estados
- Vista detallada del registro con todos los campos informados.
- Estados permitidos: `Registrado`, `En revisión`, `Cerrado`.
- Rechazo explícito de visualización de accidentes pertenecientes a terceros.

## 3. Requerimientos Fuera de Alcance (Out of Scope)
- Pasarelas de pago o indemnización monetaria directa.
- Notificaciones SMS/WhatsApp externas en esta primera fase.
- Multi-tenancy complejo.


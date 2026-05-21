---
tipo: nodo-api
proyecto: C-Book Web
---

# Relaciones API Backend

## Nodos

- [[Backend]]
- [[Archivo - back - app.js]]
- [[Archivo - back - src - routes - Rutas.js]]
- [[Archivo - frontend - src - api - client.js]]
- [[Archivo - frontend - src - api - auth.js]]
- [[Archivo - frontend - src - api - recursos.js]]
- [[Archivo - frontend - src - api - admin.js]]
- [[Archivo - frontend - src - api - analytics.js]]

## Flujo de endpoints

```mermaid
graph TD
  Client[client.js agrega /auth] --> AuthApi[auth.js]
  Client --> RecursosApi[recursos.js]
  Client --> AdminApi[admin.js]
  Client --> AnalyticsApi[analytics.js]
  AuthApi --> Usuario[ControladorUsuario]
  RecursosApi --> Recursos[ControladorRecursos]
  RecursosApi --> Solicitudes[ControladorSolicitudes]
  AdminApi --> Administrador[ControladorAdministrador]
  AnalyticsApi --> Analytics[ControladorAnalytics]
  Usuario --> ModeloUsuario
  Recursos --> ModeloRecursos
  Solicitudes --> ModeloSolicitudes
  Administrador --> ModeloAdministrador
  Analytics --> ModeloAnalytics
  ModeloUsuario --> Supabase
  ModeloRecursos --> Supabase
  ModeloSolicitudes --> Supabase
  ModeloAdministrador --> Supabase
  ModeloAnalytics --> Supabase
```

## Flujo especifico: recuperacion de contrasena

```mermaid
flowchart TD
  Login[Login.jsx] --> ForgotLink[/forgot-password/]
  ForgotLink --> ForgotPage[ForgotPassword.jsx]
  ForgotPage --> AuthApiForgot[authApi.forgotPassword]
  AuthApiForgot --> EndpointForgot[POST /auth/forgot-password]
  EndpointForgot --> Solicitar[ControladorUsuario.solicitarRecuperacion]
  Solicitar --> BuscarCorreo[ModeloUsuario.buscarCorreoPorBoleta]
  Solicitar --> Recovery[ModeloUsuario.cambiarContrasenaRecovery]
  Recovery --> Jwt[JWT propio: purpose=password_recovery, email, exp 30m]
  Recovery --> Mail[servicioCorreo.enviarCorreo via nodemailer]
  Mail --> ResetUrl[/reset-password?token=JWT/]
  ResetUrl --> ResetPage[ResetPassword.jsx]
  ResetPage --> AuthApiReset[authApi.resetPassword]
  AuthApiReset --> EndpointReset[POST /auth/reset-password]
  EndpointReset --> Actualizar[ControladorUsuario.actualizarContrasena]
  Actualizar --> ValidarToken[ModeloUsuario.actualizarContrasenaConToken]
  ValidarToken --> BuscarAuth[buscarUsuarioAuthPorCorreo]
  BuscarAuth --> AdminUpdate[Supabase auth.admin.updateUserById]
```

Notas:

- No se usa `supabase.auth.resetPasswordForEmail` ni el email template nativo de Supabase para este flujo.
- Supabase Auth si almacena la credencial final; el cambio se hace desde backend con `auth.admin.updateUserById`.
- El secreto del token propio sale de `RESET_PASSWORD_SECRET`; si no existe, cae a `SESSION_SECRET`.

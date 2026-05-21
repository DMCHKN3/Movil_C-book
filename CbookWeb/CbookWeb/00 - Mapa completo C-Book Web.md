---
tipo: mapa-proyecto
proyecto: C-Book Web
actualizado: 2026-05-16
ruta_codigo: C:\Users\jbeto\OneDrive\Escritorio\C-book-Proyecto
---

# C-Book Web - Mapa completo del proyecto

Este documento resume la estructura real del proyecto para que futuras sesiones puedan ubicarse rapido sin tener que reexplorar todo desde cero.

## Rutas principales

- Codigo fuente: `C:\Users\jbeto\OneDrive\Escritorio\C-book-Proyecto`
- Nota de contexto Obsidian: `C:\Users\jbeto\OneDrive\Documentos\Obsidian Vault\CbookWeb\00 - Mapa completo C-Book Web.md`
- Frontend React/Vite: `C:\Users\jbeto\OneDrive\Escritorio\C-book-Proyecto\frontend`
- Backend Express: `C:\Users\jbeto\OneDrive\Escritorio\C-book-Proyecto\back`
- Funcion serverless Vercel: `C:\Users\jbeto\OneDrive\Escritorio\C-book-Proyecto\api\index.js`
- Documentacion API existente: `C:\Users\jbeto\OneDrive\Escritorio\C-book-Proyecto\API_DOCUMENTATION.md`

## Resumen tecnico

- Monorepo JavaScript con frontend y backend separados.
- Frontend: React 19, Vite 7, React Router, Tailwind CSS via plugin Vite, Framer Motion, Recharts, lucide-react, jsPDF, xlsx.
- Backend: Express 5 CommonJS, Supabase JS, JWT en cookie firmada, CORS, cookie-parser, multer para carga masiva, node-cron, nodemailer.
- Base de datos/servicio externo: Supabase desde `back/src/config/db.js`.
- Despliegue principal detectado: Vercel. `vercel.json` construye `frontend/dist` y reescribe `/auth/*`, `/api/*`, `/debug/*` hacia `api/index.js`, que delega a `back/app.js`.
- Tambien existe configuracion Render en `back/render.yaml`.

## Comandos utiles

Desde la raiz del proyecto:

```powershell
npm run dev:back
npm run start:back
```

Desde `frontend`:

```powershell
npm run dev
npm run build
npm run lint
npm run preview
```

Desde `back`:

```powershell
npm run dev
npm start
```

Notas:

- Backend local escucha en `PORT` o `3000` por defecto.
- Frontend Vite escucha en `5173` y proxya `/auth` a `http://localhost:3000`.
- En produccion, Vercel sirve el frontend y manda `/auth/*` a la funcion serverless.

## Variables de entorno relevantes

No guardar valores secretos en notas. Variables detectadas por codigo/configuracion:

- Backend: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_ANON_KEY`, `SUPABASE_KEY`, `SESSION_SECRET`, `RESET_PASSWORD_SECRET`, `SESSION_COOKIE_SAME_SITE`, `SESSION_COOKIE_SECURE`, `SESSION_REFRESH_THRESHOLD_MS`, `CORS_ALLOWED_ORIGINS`, `FRONTEND_URL`, `NODE_ENV`, `PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `SMTP_SERVICE`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`.
- Frontend: `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

## Estructura de carpetas relevante

```text
C-book-Proyecto/
  .env
  .gitignore
  .mcp.json
  API_DOCUMENTATION.md
  API_DOCUMENTATION.docx
  cambios-realizados.md
  capture-ui.js
  msg.md
  package.json
  package-lock.json
  vercel.json
  api/
    index.js
  back/
    app.js
    cron.js
    render.yaml
    package.json
    README.md
    jobs/
      VerificacionAsistencia.js
      verificacionCorreo.js
    src/
      config/
        db.js
      controllers/
        ControladorAdministrador.js
        ControladorAnalytics.js
        ControladorRecursos.js
        ControladorSolicitudes.js
        ControladorSoporte.js
        ControladorUsuario.js
      middleware/
        sessionGuard.js
        validacionUsuario.js
        verificacionPeticiones.js
      models/
        ModeloAdministrador.js
        ModeloAnalytics.js
        ModeloRecursos.js
        ModeloSolicitudes.js
        ModeloUsuario.js
        modeloVerificacionRecursos.js
      routes/
        Rutas.js
      test/
        controllersTest.js
        midlewaretests.js
        modelsTest.js
        parserAlumnos.test.js
      utils/
        fechaUtils.js
        parserAlumnos.js
        servicioCorreo.js
  cssGeneral/
    styleIndex.css
  frontend/
    index.html
    package.json
    vite.config.js
    vercel.json
    README.md
    src/
      App.jsx
      main.jsx
      api/
        admin.js
        analytics.js
        auth.js
        client.js
        recursos.js
      components/
        layout/
          AnimatedPage.jsx
          DashboardLayout.jsx
          Navbar.jsx
          ProtectedRoute.jsx
          Sidebar.jsx
        ui/
          CommandPalette.jsx
          ErrorBoundary.jsx
          ExportButtons.jsx
          Feedback.jsx
          Modal.jsx
          PageLoader.jsx
          Pagination.jsx
          Skeleton.jsx
          StatCard.jsx
          ThemeToggle.jsx
      context/
        AuthContext.jsx
        ThemeContext.jsx
      lib/
        supabaseClient.js
      pages/
        Login.jsx
        EmailVerification.jsx
        ForgotPassword.jsx
        ResetPassword.jsx
        NotFound.jsx
        admin/
          AdminHome.jsx
          AltaAlumnos.jsx
          AltaLibros.jsx
          Analytics.jsx
          Documentos.jsx
          PrestamosLibros.jsx
          Reportes.jsx
          SolicitudesLibros.jsx
          Usuarios.jsx
        support/
          BandejaTickets.jsx
          ConfiguracionSoporte.jsx
          DetalleTicket.jsx
          MisReportes.jsx
          ReportarError.jsx
          SoporteDashboard.jsx
        user/
          CambiarCorreo.jsx
          EditarPerfil.jsx
          MisSolicitudes.jsx
          MisSolicitudesLibros.jsx
          ModificarCuenta.jsx
          SolicitudLibros.jsx
          UserHome.jsx
          UserProfile.jsx
      styles/
        globals.css
        globals-original.css
        globals.css.bak
        support.css
      utils/
        exportExcel.js
        exportPDF.js
```

Excluidos del mapa: `.git`, `node_modules`, `dist`, `build`, `coverage` y otros generados.

## Flujo de entrada backend

- `api/index.js`: entrypoint serverless de Vercel. Importa `../back/app` y ejecuta `app(req, res)`.
- `back/app.js`: crea Express app, configura JSON/urlencoded, cookies, CORS, ajustes de cookie de sesion y monta `app.use('/auth', authRoutes)`.
- `back/src/routes/Rutas.js`: router principal de API. Todos sus endpoints quedan bajo prefijo `/auth`.
- `back/src/config/db.js`: crea cliente Supabase singleton con `createClient(url, key)`.
- `back/cron.js`: ejecuta `verificarAsistencia` cada 10 segundos cuando `back/app.js` corre como servidor local directo.

## Flujo de entrada frontend

- `frontend/src/main.jsx`: monta React.
- `frontend/src/App.jsx`: define rutas publicas, rutas protegidas de alumno y rutas protegidas de admin.
- `frontend/src/context/AuthContext.jsx`: mantiene `user`, `loading`, `login`, `register`, `logout`, `checkSession`.
- `frontend/src/components/layout/ProtectedRoute.jsx`: redirige a `/` si no hay sesion; valida `user.rol` contra `alumno` o `Admin`.
- `frontend/src/components/layout/DashboardLayout.jsx`: layout comun autenticado con `Navbar`, `ThemeToggle`, `CommandPalette` y `Outlet`.
- `frontend/src/components/layout/Sidebar.jsx`: menu segun rol.

## Cliente API frontend

Archivo central: `frontend/src/api/client.js`.

- Base: `const API_BASE = import.meta.env.VITE_API_URL || ''`.
- Toda llamada usa URL final: `${API_BASE}/auth${endpoint}`.
- Usa `credentials: 'include'`, por lo que depende de cookies de sesion.
- Si recibe `401` fuera de `/login`, dispara evento `auth:unauthorized` para limpiar sesion.

Wrappers:

- `frontend/src/api/auth.js`: login, registro, verificacion, sesion, logout, password reset, cambios de cuenta.
- `frontend/src/api/recursos.js`: recursos, libros mas solicitados, crear/cancelar solicitudes, solicitudes del usuario.
- `frontend/src/api/admin.js`: CRUD de libros/materiales, usuarios, solicitudes, prestamos, boletas y carga masiva.
- `frontend/src/api/analytics.js`: estadisticas, tendencias y actividad.

## Rutas frontend publicas

| Ruta | Componente | Archivo |
|---|---|---|
| `/` | `Login` | `frontend/src/pages/Login.jsx` |
| `/verificar` | `EmailVerification` | `frontend/src/pages/EmailVerification.jsx` |
| `/forgot-password` | `ForgotPassword` | `frontend/src/pages/ForgotPassword.jsx` |
| `/reset-password` | `ResetPassword` | `frontend/src/pages/ResetPassword.jsx` |
| `*` | `NotFound` | `frontend/src/pages/NotFound.jsx` |

## Rutas frontend alumno

Protegidas por `ProtectedRoute role="alumno"` y `DashboardLayout`.

| Ruta | Componente | Archivo |
|---|---|---|
| `/user` | `UserHome` | `frontend/src/pages/user/UserHome.jsx` |
| `/user/libros` | `SolicitudLibros` | `frontend/src/pages/user/SolicitudLibros.jsx` |
| `/user/mis-solicitudes` | `MisSolicitudes` | `frontend/src/pages/user/MisSolicitudes.jsx` |
| `/user/mis-solicitudes-libros` | `MisSolicitudesLibros` | `frontend/src/pages/user/MisSolicitudesLibros.jsx` |
| `/user/perfil` | `UserProfile` | `frontend/src/pages/user/UserProfile.jsx` |
| `/user/cuenta` | `ModificarCuenta` | `frontend/src/pages/user/ModificarCuenta.jsx` |
| `/user/soporte/reportar` | `ReportarError` | `frontend/src/pages/support/ReportarError.jsx` |
| `/user/soporte/mis-reportes` | `MisReportes` | `frontend/src/pages/support/MisReportes.jsx` |

## Rutas frontend admin

Protegidas por `ProtectedRoute role="Admin"` y `DashboardLayout`.

| Ruta | Componente | Archivo |
|---|---|---|
| `/admin` | `AdminHome` | `frontend/src/pages/admin/AdminHome.jsx` |
| `/admin/alumnos` | `AltaAlumnos` | `frontend/src/pages/admin/AltaAlumnos.jsx` |
| `/admin/libros` | `AltaLibros` | `frontend/src/pages/admin/AltaLibros.jsx` |
| `/admin/usuarios` | `Usuarios` | `frontend/src/pages/admin/Usuarios.jsx` |
| `/admin/documentos` | `Documentos` | `frontend/src/pages/admin/Documentos.jsx` |
| `/admin/solicitudes-libros` | `SolicitudesLibros` | `frontend/src/pages/admin/SolicitudesLibros.jsx` |
| `/admin/prestamos-libros` | `PrestamosLibros` | `frontend/src/pages/admin/PrestamosLibros.jsx` |
| `/admin/analytics` | `Analytics` | `frontend/src/pages/admin/Analytics.jsx` |
| `/admin/reportes` | `Reportes` | `frontend/src/pages/admin/Reportes.jsx` |
| `/admin/soporte` | `SoporteDashboard` | `frontend/src/pages/support/SoporteDashboard.jsx` |
| `/admin/soporte/tickets` | `BandejaTickets` | `frontend/src/pages/support/BandejaTickets.jsx` |
| `/admin/soporte/tickets/:id` | `DetalleTicket` | `frontend/src/pages/support/DetalleTicket.jsx` |
| `/admin/soporte/reportar` | `ReportarError` | `frontend/src/pages/support/ReportarError.jsx` |
| `/admin/soporte/mis-reportes` | `MisReportes` | `frontend/src/pages/support/MisReportes.jsx` |
| `/admin/soporte/config` | `ConfiguracionSoporte` | `frontend/src/pages/support/ConfiguracionSoporte.jsx` |

## Endpoints backend bajo `/auth`

| Metodo | Endpoint | Middleware | Controlador |
|---|---|---|---|
| POST | `/auth/registro` | - | `ControladorUsuario.registro` |
| POST | `/auth/forgot-password` | - | `ControladorUsuario.solicitarRecuperacion` |
| POST | `/auth/reset-password` | - | `ControladorUsuario.actualizarContraseÃ±a` |
| POST | `/auth/verificar` | - | `ControladorUsuario.verificarCorreo` |
| POST | `/auth/login` | - | `ControladorUsuario.login` |
| GET | `/auth/session` | - | `ControladorUsuario.verificarSesion` |
| POST | `/auth/logout` | `sessionGuard` | `ControladorUsuario.cerrarSesion` |
| GET | `/auth/recursos` | - | `ControladorRecursos.obtenerRecursosPorTipo` |
| GET | `/auth/libros/mas-solicitados` | `sessionGuard` | `ControladorRecursos.obtenerLibrosMasSolicitados` |
| GET | `/auth/recursos/usuario` | `sessionGuard` | `ControladorSolicitudes.obtencionSolicitudesUsuario` |
| POST | `/auth/solicitud` | `sessionGuard`, `verificarDisponibilidad` | `ControladorSolicitudes.crearSolicitud` |
| DELETE | `/auth/solicitud/:tipo/:id` | `sessionGuard` | `ControladorSolicitudes.cancelarSolicitud` |
| PATCH | `/auth/CuentaUpdate` | `sessionGuard` | `ControladorUsuario.CambioDatos` |
| POST | `/auth/cambiar-contrasena` | `sessionGuard` | `ControladorUsuario.cambiarContrasenaPropia` |
| POST | `/auth/admin/libros` | `sessionGuard` | `ControladorAdministrador.crearLibro` |
| DELETE | `/auth/admin/materiales/:tipo/:id` | `sessionGuard` | `ControladorAdministrador.eliminarMaterial` |
| PUT | `/auth/admin/libros` | `sessionGuard` | `ControladorAdministrador.actualizarLibro` |
| GET | `/auth/admin/materiales/:tipo` | `sessionGuard` | `ControladorAdministrador.obtenerMateriales` |
| GET | `/auth/admin/usuarios` | `sessionGuard` | `ControladorAdministrador.obtenerUsuarios` |
| PUT | `/auth/admin/usuarios/:id/habilitar` | `sessionGuard` | `ControladorAdministrador.habilitarDocumentacion` |
| GET | `/auth/admin/solicitudes/libros` | `sessionGuard` | `ControladorAdministrador.obtenerSolicitudesLibros` |
| POST | `/auth/admin/solicitudes/libros/:id/gestionar` | `sessionGuard` | `ControladorAdministrador.gestionarSolicitud` |
| POST | `/auth/admin/solicitudes/libros/:id/entregar` | `sessionGuard` | `ControladorAdministrador.registrarEntrega` |
| GET | `/auth/admin/prestamos/libros` | `sessionGuard` | `ControladorAdministrador.obtenerPrestamosLibros` |
| POST | `/auth/admin/prestamos/libros/:id/devolver` | `sessionGuard` | `ControladorAdministrador.marcarPrestamoDevuelto` |
| GET | `/auth/admin/boletas` | `sessionGuard` | `ControladorAdministrador.obtenerBoletas` |
| POST | `/auth/admin/boletas/preview` | `sessionGuard`, `multer.single('file')` | `ControladorAdministrador.previewCargaMasiva` |
| POST | `/auth/admin/boletas/bulk` | `sessionGuard` | `ControladorAdministrador.confirmarCargaMasiva` |
| POST | `/auth/admin/boletas` | `sessionGuard` | `ControladorAdministrador.crearBoleta` |
| PUT | `/auth/admin/boletas/:boleta` | `sessionGuard` | `ControladorAdministrador.actualizarBoleta` |
| DELETE | `/auth/admin/boletas/:boleta` | `sessionGuard` | `ControladorAdministrador.eliminarBoleta` |
| GET | `/auth/admin/stats` | `sessionGuard` | `ControladorAnalytics.obtenerEstadisticas` |
| GET | `/auth/admin/tendencias` | `sessionGuard` | `ControladorAnalytics.obtenerTendencias` |
| GET | `/auth/admin/actividad` | `sessionGuard` | `ControladorAnalytics.obtenerActividad` |

## Relacion frontend-backend por modulo

### Autenticacion y cuenta

- Frontend: `frontend/src/pages/Login.jsx`, `EmailVerification.jsx`, `ForgotPassword.jsx`, `ResetPassword.jsx`, `frontend/src/context/AuthContext.jsx`, `frontend/src/api/auth.js`.
- Backend: `back/src/controllers/ControladorUsuario.js`, `back/src/models/ModeloUsuario.js`, `back/src/middleware/sessionGuard.js`.
- Endpoints clave: `/auth/login`, `/auth/session`, `/auth/logout`, `/auth/registro`, `/auth/verificar`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/CuentaUpdate`, `/auth/cambiar-contrasena`.

### Recuperacion de contrasena

Flujo real actual:

1. `frontend/src/pages/Login.jsx` enlaza a `/forgot-password`.
2. `ForgotPassword.jsx` pide boleta y llama `authApi.forgotPassword(boleta)`.
3. `frontend/src/api/auth.js` manda `POST /auth/forgot-password`.
4. `back/src/routes/Rutas.js` enruta a `ControladorUsuario.solicitarRecuperacion`.
5. El controlador valida boleta, busca el correo con `buscarCorreoPorBoleta` y llama `cambiarContrasenaRecovery`.
6. `back/src/models/ModeloUsuario.js` genera un JWT propio con `purpose: password_recovery`, `email` y expiracion de 30 minutos.
7. El correo sale por `back/src/utils/servicioCorreo.js` usando `nodemailer`; el link apunta a `${FRONTEND_URL}/reset-password?token=...`.
8. `ResetPassword.jsx` toma `token` del query string y llama `authApi.resetPassword(token, newPassword, confPassword)`.
9. `POST /auth/reset-password` llega a `ControladorUsuario.actualizarContrasena`, que valida la nueva contrasena.
10. `ModeloUsuario.actualizarContrasenaConToken` verifica el JWT propio, busca el usuario de Supabase Auth por correo y actualiza la credencial con `supabase.auth.admin.updateUserById`.

Importante: este flujo no usa `supabase.auth.resetPasswordForEmail`, no depende del template de recuperacion de Supabase y no usa `frontend/src/lib/supabaseClient.js` directamente. Supabase Auth participa como almacen/autenticador final de la contrasena, pero el correo y el token de recuperacion son propios del backend.

Archivos directos del flujo:

- `frontend/src/pages/Login.jsx`
- `frontend/src/pages/ForgotPassword.jsx`
- `frontend/src/pages/ResetPassword.jsx`
- `frontend/src/api/auth.js`
- `frontend/src/App.jsx`
- `back/src/routes/Rutas.js`
- `back/src/controllers/ControladorUsuario.js`
- `back/src/models/ModeloUsuario.js`
- `back/src/utils/servicioCorreo.js`
- `back/.env.example`, `back/render.yaml`, `back/README.md` para variables relacionadas.

### Recursos, libros y solicitudes de alumno

- Frontend: `frontend/src/pages/user/SolicitudLibros.jsx`, `MisSolicitudes.jsx`, `MisSolicitudesLibros.jsx`, `frontend/src/api/recursos.js`.
- Backend: `ControladorRecursos.js`, `ControladorSolicitudes.js`, `ModeloRecursos.js`, `ModeloSolicitudes.js`, `modeloVerificacionRecursos.js`, `verificacionPeticiones.js`.
- Endpoints: `/auth/recursos`, `/auth/libros/mas-solicitados`, `/auth/solicitud`, `/auth/solicitud/:tipo/:id`, `/auth/recursos/usuario`.

### Administracion de libros/materiales

- Frontend: `frontend/src/pages/admin/AltaLibros.jsx`, `frontend/src/api/admin.js`.
- Backend: `ControladorAdministrador.js`, `ModeloAdministrador.js`.
- Endpoints: `/auth/admin/libros`, `/auth/admin/materiales/:tipo`, `/auth/admin/materiales/:tipo/:id`.

### Alumnos/boletas/carga masiva

- Frontend: `frontend/src/pages/admin/AltaAlumnos.jsx`, `frontend/src/api/admin.js`.
- Backend: `ControladorAdministrador.js`, `parserAlumnos.js`, `multer` en `Rutas.js`.
- Endpoints: `/auth/admin/boletas`, `/auth/admin/boletas/preview`, `/auth/admin/boletas/bulk`, `/auth/admin/boletas/:boleta`.

### Usuarios/documentacion

- Frontend: `frontend/src/pages/admin/Usuarios.jsx`, `Documentos.jsx`, `frontend/src/api/admin.js`.
- Backend: `ControladorAdministrador.js`, `ModeloAdministrador.js`.
- Endpoints: `/auth/admin/usuarios`, `/auth/admin/usuarios/:id/habilitar`.

### Solicitudes y prestamos de libros

- Frontend: `frontend/src/pages/admin/SolicitudesLibros.jsx`, `PrestamosLibros.jsx`, `frontend/src/api/admin.js`.
- Backend: `ControladorAdministrador.js`, `ModeloAdministrador.js`.
- Endpoints: `/auth/admin/solicitudes/libros`, `/auth/admin/solicitudes/libros/:id/gestionar`, `/auth/admin/solicitudes/libros/:id/entregar`, `/auth/admin/prestamos/libros`, `/auth/admin/prestamos/libros/:id/devolver`.

### Analytics y reportes

- Frontend: `frontend/src/pages/admin/Analytics.jsx`, `Reportes.jsx`, `frontend/src/api/analytics.js`, exportadores `frontend/src/utils/exportPDF.js` y `exportExcel.js`.
- Backend: `ControladorAnalytics.js`, `ModeloAnalytics.js`.
- Endpoints: `/auth/admin/stats`, `/auth/admin/tendencias`, `/auth/admin/actividad`.

### Soporte

- Frontend: `frontend/src/pages/support/*`, estilos en `frontend/src/styles/support.css`.
- Rutas UI: `/admin/soporte`, `/admin/soporte/tickets`, `/admin/soporte/tickets/:id`, `/admin/soporte/reportar`, `/admin/soporte/mis-reportes`, `/admin/soporte/config`, `/user/soporte/reportar`, `/user/soporte/mis-reportes`.
- Backend: existe `back/src/controllers/ControladorSoporte.js`, pero no se detectaron rutas de soporte registradas en `back/src/routes/Rutas.js`.
- Estado probable: modulo de soporte mayormente mock/frontend hasta que se conecten endpoints reales.

## Archivos de configuracion importantes

- `vercel.json`: build del frontend, salida `frontend/dist`, funcion `api/index.js`, rewrites para API y SPA.
- `frontend/vite.config.js`: React, Tailwind plugin, proxy local `/auth -> http://localhost:3000`, chunks manuales.
- `back/render.yaml`: configuracion para Render con variables productivas.
- `package.json` raiz: scripts `dev:back` y `start:back` ejecutan `back/app.js`.
- `frontend/package.json`: scripts Vite.
- `back/package.json`: scripts backend y dependencias extra como `multer`, `pdf-parse`, `xlsx`.

## Observaciones para futuras sesiones

- `node_modules` existe dentro de `back` y probablemente tambien en `frontend`; no usarlo para entender arquitectura salvo que haya un problema de dependencias.
- Hay archivos con texto mojibake en consola (`ContraseÃƒÂ±a`, `GestiÃƒÂ³n`, etc.). Revisar encoding antes de modificar textos visibles.
- `frontend/src/api/recursos.js` define `cancelAll(tipo)` llamando `DELETE /solicitud/:tipo/all`; en backend la ruta generica `DELETE /solicitud/:tipo/:id` la recibe como `id = all`, no hay ruta separada visible.
- `ControladorSoporte.js` esta importado en `Rutas.js` pero no se usa en endpoints visibles.
- `back/src/test/controllersTest.js` referencia `../models/authModel`, pero ese archivo no aparece en la estructura detectada; revisar antes de confiar en esos tests.
- La sesion depende de cookies; problemas cross-site suelen resolverse revisando `SESSION_COOKIE_SAME_SITE`, `SESSION_COOKIE_SECURE`, CORS y `credentials: include`.
- En Vercel, cualquier llamada frontend a `/auth/...` acaba en `api/index.js -> back/app.js -> /auth router`.

## Primeros archivos a abrir segun tarea

- Cambiar rutas/pantallas: `frontend/src/App.jsx`, pagina correspondiente en `frontend/src/pages`, y `frontend/src/components/layout/Sidebar.jsx` si requiere menu.
- Cambiar llamada frontend API: `frontend/src/api/client.js` y wrapper especifico en `frontend/src/api/*.js`.
- Cambiar endpoint backend: `back/src/routes/Rutas.js`, controlador en `back/src/controllers`, modelo en `back/src/models`.
- Cambiar auth/sesion: `AuthContext.jsx`, `ProtectedRoute.jsx`, `ControladorUsuario.js`, `sessionGuard.js`, `back/app.js`.
- Cambiar despliegue/proxy: `vercel.json`, `frontend/vite.config.js`, `back/app.js`.
- Cambiar Supabase: `back/src/config/db.js` y modelos que lo consumen.

## Checklist rapido de contexto

1. Revisar `git status --short` antes de editar.
2. Si se toca frontend, correr desde `frontend`: `npm run build` o `npm run lint` segun riesgo.
3. Si se toca backend, al menos arrancar `npm run start:back` o probar endpoint relevante.
4. No exponer valores del `.env` en notas ni respuestas.
5. Mantener esta nota actualizada cuando cambien rutas, endpoints o carpetas principales.

## Grafo de nodos Obsidian

- [[00 - Grafo C-Book Web]]
- Carpeta de nodos: Nodos C-Book/



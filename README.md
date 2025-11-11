<p align="center">
  <img src="./src/assets/logo-inaigem.svg" width="220" alt="INAIGEM">
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/status-producción%20interna-blue" alt="Status"></a>
  <a href="#"><img src="https://img.shields.io/badge/framework-React%2019-%2361DAFB" alt="React"></a>
  <a href="#"><img src="https://img.shields.io/badge/build-Vite%207-%23646CFF" alt="Vite"></a>
  <a href="#"><img src="https://img.shields.io/badge/style-shadcn/ui-%23000000" alt="shadcn/ui"></a>
</p>

# Sistema para la Interoperabilidad de repositorios INAIGEM (Frontend)

  Sistema para la Interoperabilidad de repositorios INAIGEM: muestra los recursos extraídos de distintos repositorios y los relaciona para mejorar la **búsqueda**, la **visualización** y el **descubrimiento**.

**Descripción.** Centraliza la visualización, mejora la búsqueda y permite establecer relaciones entre recursos provenientes de los repositorios institucionales, potenciando el acceso a la información para usuarios internos y externos.

- **Estado:** producción interna · **Versión:** 1.0
- **Demo:** N/A (no hay entorno público)
- **API:** servicio interno INAIGEM (ver variables de entorno)

---

##   Características
- Búsqueda avanzada y navegación temática por tipo de repositorio.
- Rutas públicas y privadas con **permisos finos** (guard de permisos por ruta).
- Integración con **SSO** institucional (callback y redirecciones).
- Manejo de errores y **toasts** de usuario (sonner).
- Diseño con **shadcn/ui**  Tailwind 4.

---

##   Estructura del proyecto


---

##   Rutas

### Públicas
- `/` → LandingPage (Meili)
- `/landingPageMeili` → Landing v3 (Meili)
- `/login` → Login
- `/forgot-password` → Recuperación de contraseña
- `/buscar` → Buscador (Meili)
- `/documentos` → redirección a `/buscar?repositorio_id=2&sort_by=views&sort_dir=desc`
- `/mapas` → redirección a `/buscar?repositorio_id=3&sort_by=views&sort_dir=desc`
- `/datasets` → redirección a `/buscar?repositorio_id=1&sort_by=views&sort_dir=desc`
- `/recursos/:id` → Detalle de recurso (envuelto por `<Header />`)
- *(Solo no autenticados)* `/auth/callback` → retorno del SSO (`<PublicOnlyRoute />`)
- `*` → NotFound

### Privadas (requieren sesión)
- Sin permisos:
  - `/perfil` → Perfil del usuario
  - `/recursos` → Listado interno
  - `/voto/:token` → Votación
- Con permisos (via `<PermissionRoute anyOf=[...] />`):
  - `/dashboard` → `["dashboard.read"]`
  - `/cosechas` → `["harvests.read","harvests.create"]` (anyOf)
  - `/integraciones` → `["harvests.read"]`
  - `/roles` → `["roles.read"]`
  - `/usuarios` → `["users.read"]`
  - `/especialistas` → `["especialistas.read"]`
  - `/tareasprogramadas` → `["harvest_tasks.read"]`

---

##   Permisos y roles (frontend)

**Permisos utilizados** (tal como se usan en rutas):
`dashboard.read`, `harvests.read`, `harvests.create`, `roles.read`, `users.read`, `especialistas.read`, `harvest_tasks.read`.

**Sugerencia de roles (ejemplo de mapeo)**  
> *Ajustar en el backend según la política real.*
- **admin**: todos los permisos
- **gestor_cosechas**: `harvests.read`, `harvests.create`, `harvest_tasks.read`
- **revisor**: `harvests.read`, `especialistas.read`
- **lector**: `dashboard.read`

La protección se realiza con:
- `ProtectedRoute` (verifica sesión)
- `PermissionRoute` (verifica `anyOf` de permisos)

---

##   Variables de entorno (Frontend)     IMPORTANTE PARA LA CONFIGURACIÓN

Crear `.env` (o usar `.env.example` como base):

```env
# URL de la API (producción debe ser el subdominio público de la API)
VITE_API_BASE_URL=http://10.16.4.35:8080/api/v1

# Branding
VITE_APP_NAME=Sistema para la Interoperabilidad de repositorios INAIGEM
VITE_INSTITUTION_NAME=Instituto Nacional de Investigación en Glaciares y Ecosistemas de Montaña
VITE_INSTITUTION_ABBR=INAIGEM

# SSO
VITE_REDIRECT_SSO=https://intranet.inaigem.gob.pe/main/home

## COMANDOS
# Desarrollo
npm run dev

# Compilar para producción (salida en /dist)
npm run build

# Previsualización local del build (usa $PORT si está definido)
npm run preview

# Linter
npm run lint

##  Glosario (interoperabilidad)
#Recurso: unidad de información (documento, dataset, mapa) proveniente de un repositorio.
#Repositorio: sistema fuente (DSpace, Dataverse, GeoNetwork).
#Cosecha (harvest): proceso automático que extrae metadatos desde repositorios fuente.
#Integración: normalización/enriquecimiento para relacionar recursos entre repositorios.
#Índice de búsqueda: estructura que acelera búsquedas y ranking (Meilisearch vía API).
#Permiso: capacidad autorizada para una acción (p.ej., harvests.create).
#Rol: conjunto de permisos asignado a un usuario.
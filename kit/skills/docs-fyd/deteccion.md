# Detección stack-agnóstica — tabla de señales

Anexo del motor `/docs-fyd`. Cómo detectar el stack y las fuentes de cada artefacto **por
evidencia real**, sin asumir un stack por defecto (regla de oro 3). Es una guía de señales, no una
lista cerrada: **se amplía acá sin tocar el `SKILL.md`**. Ante cero evidencia para un dato →
"NO DETERMINADO" + con qué lo buscaste.

## La tabla — qué buscás → qué señal → a qué artefacto alimenta

| Qué buscás | Señales (evidencia real) | Alimenta |
|---|---|---|
| **Framework / lenguaje** | manifiestos de dependencias: `package.json`, `requirements.txt` / `pyproject.toml`, `go.mod`, `Cargo.toml`, `pom.xml` / `build.gradle`, `composer.json`, `Gemfile`, `*.csproj` / `*.sln`, `pubspec.yaml`, `Package.swift` | README (#2 stack) · ficha (#1 tecnologías) · c2 (#4 tecnología de cada contenedor) |
| **Modelo de datos** | migraciones (`migrations/`, `prisma/schema.prisma`, `supabase/migrations/`, `db/migrate/`, `alembic/`), modelos ORM (`models/`, `@Entity`, `models.py`, Sequelize/TypeORM), o un `schema.sql` / dump | diagrama-er (#7) |
| **Contenedores desplegables** | `Dockerfile`, `docker-compose.yml`, manifiestos k8s (`*.yaml` con `kind:`), `terraform/` (`*.tf`), `vercel.json` / `netlify.toml` / `fly.toml` / `render.yaml`, `Procfile`, workflows de CI (`.github/workflows/`, `.gitlab-ci.yml`) | c2-contenedores (#4) · README (#5 despliegue) — **⚠️ fuente #1 de secretos inline: cepillo sí o sí** |
| **Variables de entorno** | `.env`, `.env.*`, `.env.example`; `grep` de accesos en código (`process.env.X`, `os.getenv("X")`, `System.getenv`, `ENV["X"]`, `import.meta.env.X`, `Deno.env.get`); y los bloques `environment:` / `env:` de los configs de deploy/CI | variables-entorno (#8) — **solo el nombre, cortás a la derecha del `=`** |
| **Servicios / APIs externos** | SDKs en los manifiestos + sus inicializaciones en código: Supabase, OpenAI, Anthropic, Stripe, Resend, Twilio, Google (Maps/Cloud), AWS SDK, Firebase, etc.; endpoints `https://` a terceros; claves de config que nombran un proveedor | ficha (#1 servicios) · variables-entorno (#8 punto 2) · c1 (#3 sistemas externos) |
| **Usuarios / actores** | roles y permisos en código (middleware de auth, tablas `users`/`roles`, guards), tipos de login, endpoints públicos vs privados | c1-contexto (#3 tipos de usuario) |
| **Flujos de negocio** | rutas/controllers/handlers principales, jobs y cron, webhooks, colas; los 2-3 procesos más relevantes (alta de un registro, una aprobación, una notificación automática) | secuencia (#6) |
| **Componentes internos** | módulos/carpetas del contenedor más complejo (capas, servicios, dominios) — solo si la complejidad lo justifica | c3-componentes (#5, si aplica) |
| **Instrucciones de IA** | `CLAUDE.md`, `SOUL.md`, `.cursorrules`, `.github/copilot-instructions.md`, `AGENTS.md`, `.clinerules`, y el `docs/` del repo destino; anotá dónde vive cada uno y si está versionado o es solo local | instrucciones-ia (#9) — **estructura/punteros, NO verbatim; cepillo antes de escribir** |
| **Secretos hardcodeados** | `grep` de patrones de credencial en el código y en los configs de deploy/CI (tokens, API keys, `password=`, claves privadas, connection strings con credencial); deps con vulnerabilidades conocidas; ausencia de `.env.example` | revision-seguridad (#10 — **solo categoría+cantidad en el `.md`; el `archivo:línea` solo al reporte de `auditar`**) |

## Notas

- **Multi-señal gana**: un manifiesto sin código no determina el stack solo — cruzá manifiesto +
  imports reales antes de afirmar. Si las señales se contradicen, reportá ambas y marcá la duda.
- **Contenedor "desplegable por separado"** (para el C2) = lo que se publica como unidad: frontend,
  backend/API, base de datos, jobs/workers, etc. Un monolito es UN contenedor — no lo infles.
- **"NO DETERMINADO" es una respuesta válida y honesta**, no un fallo: mejor eso que un stack
  inventado que le miente a la auditora.
- **Ampliar esta tabla** cuando aparezca un stack nuevo en el parque de Guido (Tauri, Expo, .NET,
  n8n, etc.): agregá la fila con sus señales acá — el `SKILL.md` no se toca.

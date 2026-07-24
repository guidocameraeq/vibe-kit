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

## Jerarquía de evidencia (v2) — cuál fuente gana

Cuando dos fuentes se contradicen, gana la de más arriba; y lo que solo vive en producción NO se
afirma como absoluto (se pregunta por opciones):

**sistema vivo (testimonio humano en `_ACLARACIONES.md`, datado) > código > scripts del repo > `docs/`**

- **`docs/` NO es fuente de verdad** para ningún artefacto salvo el #9. En el reporte de campo,
  `ARCHITECTURE.md` estaba viejo en 4 conteos y contradecía al entregable en un punto de seguridad. Un
  dato del código gana sobre un `docs/`; y un dato del código puede estar viejo respecto de la base
  viva → si es de seguridad/continuidad, se pregunta (no se afirma).
- **Un script versionado NO es la realidad viva.** Ej: `db_hardening.py` que habilita RLS en 6 tablas es
  evidencia de que se corrió alguna vez, no de que la base HOY tenga RLS en 6 (podría tener 22). Para
  esos hechos → duda por opciones, no afirmación.

## Auditar el ENTORNO INSTALADO, no solo el manifiesto (v2)

- Las **dependencias indirectas** no figuran en el manifiesto pero viajan en el binario/imagen (ej.
  Pillow entra por matplotlib y viaja dentro de un `.exe` de PyInstaller). Para
  `variables-entorno`/`revision-seguridad`, mirá el **entorno instalado real** (`pip freeze`, el
  lockfile, el bundle), no solo `requirements.txt`.
- **Herramientas faltantes** (`pip-audit`, `pg_dump`, PostgreSQL local): NO las instales en el proyecto
  (rompés sus versiones fijadas). Usá un **venv / directorio temporal descartable FUERA del repo**; si
  igual no están, marcá el chequeo "NO DETERMINADO" + qué faltó. **Ninguna herramienta auxiliar deja
  archivos dentro del repo** (write-set + gate `git status` del SKILL).
- **Encoding de consola** (Windows cp1252): si generás un script auxiliar que imprime, evitá emojis /
  no-ASCII o revienta. Trivial pero real.

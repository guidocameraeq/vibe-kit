# Tutorial 00 — Instalar vibe-kit (paso a paso, sin programar)

> Es el primer tutorial. Cuando termines, vas a tener el kit instalado y los comandos `/vibe-kit:*` andando en cualquier proyecto. No hace falta saber programar: copiás y pegás comandos dentro de Claude Code y listo.

---

## Qué vas a lograr

Al final de este tutorial:

1. Claude Code va a **conocer** dónde está vibe-kit (eso se llama *agregar el marketplace*).
2. Vas a **instalar** el plugin `vibe-kit`.
3. Vas a **ver** los comandos nuevos (`/vibe-kit:arquitecto`, `/vibe-kit:nueva-app`, etc.) y confirmar que aparecen.

Tiempo estimado: **5 minutos.**

---

## Antes de empezar (chequeo rápido)

- [ ] Tenés **Claude Code** abierto (en VSCode o en la terminal). Si lo estás leyendo desde Claude Code, ya está.
- [ ] La carpeta `vibe-kit/` existe en tu compu (es la que tiene adentro `commands/`, `agents/`, `skills/`, `templates/` y la carpeta oculta `.claude-plugin/`).
- [ ] Anotá la **ruta absoluta** de esa carpeta. En este proyecto es:

  ```
  C:\Users\Usuario\Desktop\Proyectos\Guia de vibe coding\vibe-kit
  ```

  Vas a necesitar esa ruta en el Paso 1. Si tu carpeta está en otro lado, usá la tuya.

> **Dato clave para entender todo:** un plugin de Claude Code es simplemente **una carpeta** en tu compu (o en GitHub). No hay servidores ni nada corriendo afuera. Vive donde ya trabajás.

---

## Las dos formas de instalar

Hay dos caminos. Elegí según en qué etapa estás:

| Camino | Cuándo usarlo | Qué necesitás |
|---|---|---|
| **A — Marketplace local** (recomendado para empezar) | El kit todavía está solo en tu compu, sin subir a GitHub. | La carpeta `vibe-kit/` en tu disco. |
| **B — Marketplace en GitHub** | Ya subiste el kit a un repo tuyo de GitHub y querés instalarlo igual que cualquier plugin. | El repo creado y `gh` o git configurado. |

Empezá por el **Camino A**. Cuando publiques el kit, pasás al **Camino B** (es el mismo flujo, cambia solo de dónde lo lee Claude). Más abajo está cada uno.

---

## CAMINO A — Instalar desde tu compu (marketplace local)

### Paso 1 — Agregar el marketplace local

Dentro de Claude Code, escribí este comando (slash command). Reemplazá la ruta por **la tuya** si es distinta:

```
/plugin marketplace add "C:\Users\Usuario\Desktop\Proyectos\Guia de vibe coding\vibe-kit"
```

Qué hace: le dice a Claude Code *"acá hay un catálogo de plugins, registralo"*. Claude busca dentro de esa carpeta el archivo `.claude-plugin/marketplace.json` (el catálogo) y lo registra.

> **Por qué apuntás a la carpeta `vibe-kit/` y no a un archivo:** cuando agregás un marketplace local por ruta de carpeta, Claude Code encuentra solo el `marketplace.json` adentro de `.claude-plugin/`. Las rutas relativas del catálogo (como `./` o `./plugins/x`) resuelven bien porque lo estás agregando como carpeta, no como link directo a un `.json`.

Si todo salió bien, Claude te confirma que el marketplace quedó registrado (por ejemplo: *"Marketplace `vibe-kit-marketplace` added"*). Ese nombre — `vibe-kit-marketplace` — es el que vas a usar en el Paso 2.

### Paso 2 — Instalar el plugin

Ahora instalás el plugin que vive en ese catálogo:

```
/plugin install vibe-kit@vibe-kit-marketplace
```

La forma es siempre **`/plugin install <nombre-del-plugin>@<nombre-del-marketplace>`**:

- `vibe-kit` = nombre del plugin (el campo `name` de `plugin.json`).
- `vibe-kit-marketplace` = nombre del marketplace (el campo `name` de `marketplace.json`, el que te confirmó el Paso 1).

> Si no recordás el nombre del marketplace, corré `/plugin marketplace list` y te muestra los que tenés registrados.

### Paso 3 — Activar sin reiniciar

Para que los comandos aparezcan **al toque**, sin cerrar y abrir Claude Code:

```
/reload-plugins
```

Listo. Andá al **Paso 4 (verificación)**, que es igual para los dos caminos.

---

## CAMINO B — Instalar desde tu repo de GitHub

Usá esto cuando ya subiste el kit a un repo tuyo (por ejemplo `tu-usuario/vibe-kit`). El `marketplace.json` tiene que estar en `.claude-plugin/marketplace.json` en la raíz del repo.

### Paso 1 — Agregar el marketplace por GitHub

```
/plugin marketplace add tu-usuario/vibe-kit
```

`tu-usuario/vibe-kit` es el atajo `owner/repo` de GitHub. También podés usar la URL completa del repo (`https://github.com/tu-usuario/vibe-kit.git`). Si querés fijar una versión concreta, agregá `@` y el tag: `tu-usuario/vibe-kit@v1.0.0`.

### Paso 2 — Instalar

```
/plugin install vibe-kit@vibe-kit-marketplace
```

(El nombre después del `@` es el `name` del `marketplace.json`, que te confirma el Paso 1.)

### Paso 3 — Activar

```
/reload-plugins
```

---

## Paso 4 — Verificar que quedó instalado (los dos caminos)

Tres chequeos rápidos. Con que pase el primero ya estás.

### Chequeo 1 — ¿Aparece el comando del Arquitecto?

Escribí una barra `/` y empezá a tipear `vibe-kit`. Tienen que aparecer en el autocompletado los comandos del kit, **namespaced** con el prefijo del plugin:

```
/vibe-kit:arquitecto
/vibe-kit:nueva-app
/vibe-kit:feature
/vibe-kit:fix
/vibe-kit:release
/vibe-kit:docs-check
/vibe-kit:crear-rol
```

> **¿Por qué llevan el prefijo `vibe-kit:`?** Porque los comandos de un plugin se agrupan bajo el nombre del plugin. Eso es bueno: nunca chocan con comandos de otros plugins y ya sabés de dónde viene cada uno. No necesitás carpetas anidadas para agrupar — el prefijo ya lo hace.

### Chequeo 2 — ¿Aparecen los agentes ayudantes?

Corré:

```
/agents
```

Tienen que figurar los subagentes del kit (son los ayudantes que el Arquitecto lanza en segundo plano):

- `explorador-codigo`
- `redteam-spec`
- `doc-keeper`
- `reviewer`

### Chequeo 3 — ¿El plugin figura como instalado?

Corré:

```
/plugin
```

`vibe-kit` tiene que aparecer en la lista de plugins instalados/activos.

Si los tres chequeos dan bien: **terminaste.** Seguí con el [Tutorial 01 — Primer uso del Arquitecto](01-primer-uso-arquitecto.md).

---

## Verificación opcional (antes de publicar)

Si vas a subir el kit a GitHub y querés asegurarte de que el formato está perfecto, validalo desde la terminal (no desde adentro de Claude Code, sino en una terminal normal):

```bash
claude plugin validate "C:\Users\Usuario\Desktop\Proyectos\Guia de vibe coding\vibe-kit"
```

Te avisa si falta algún campo obligatorio o si hay algo mal armado, **antes** de que lo instale nadie.

---

## Troubleshooting (si algo no aparece)

Andá en orden. El 90% de las veces es la **Causa 1**.

### 1) Instalé pero los comandos `/vibe-kit:*` no aparecen

**Causa más común: la estructura de carpetas está mal.** La regla de oro de un plugin de Claude Code es:

> Dentro de `.claude-plugin/` va **SOLO** el archivo `plugin.json`. **Todo lo demás** (`commands/`, `agents/`, `skills/`, `hooks/`, `templates/`) va en la **raíz** de la carpeta del plugin, NUNCA adentro de `.claude-plugin/`.

Síntoma típico de equivocarse en esto: *"el plugin carga, pero los comandos no aparecen"*. Revisá que tu árbol se vea así:

```
vibe-kit/
├── .claude-plugin/
│   ├── plugin.json          <- SOLO esto va acá adentro
│   └── marketplace.json     <- (el catálogo, también acá)
├── commands/                <- los slash commands van en la RAÍZ
│   ├── arquitecto.md
│   ├── nueva-app.md
│   ├── feature.md
│   ├── fix.md
│   ├── release.md
│   ├── docs-check.md
│   └── crear-rol.md
├── agents/
├── skills/
├── hooks/
├── templates/
└── README.md
```

### 2) Los comandos están en una subcarpeta anidada (el bug clásico)

Los slash commands tienen que estar **directo dentro de `commands/`** (un solo nivel), o cada skill como `skills/<nombre>/SKILL.md` (también un solo nivel por skill). Claude Code **no descubre de forma confiable** comandos metidos en subcarpetas profundas tipo `commands/grupo/sub/comando.md`.

- ❌ **Mal:** `commands/kit/data/bootstrap.md` (anidado → se rompe el descubrimiento)
- ✅ **Bien:** `commands/nueva-app.md` (a nivel raíz de `commands/`)
- ✅ **Bien:** `skills/entrevista-descubrimiento/SKILL.md` (una carpeta por skill, un solo nivel)

Si copiaste algún comando que venía anidado, **mové el `.md` a la raíz de `commands/`** y reinstalá.

### 3) Cambié algo en el plugin y no se actualiza

Después de editar archivos del plugin:

```
/reload-plugins
```

Si aun así no toma los cambios y tenés `version` puesto en `plugin.json`, puede pasar que Claude crea que ya tenés *"la última versión"*. Subí el número de `version` (o quitalo mientras estás desarrollando) y volvé a instalar.

### 4) Reinstalé y siguen apareciendo cosas viejas (caché)

Los plugins de marketplace se copian a una caché local en `~/.claude/plugins/cache`. Si quedó algo raro pegado, borrá esa caché y reinstalá:

```bash
rm -rf ~/.claude/plugins/cache
```

Después volvé a hacer el **Paso 1** (agregar marketplace) y el **Paso 2** (instalar).

### 5) "No encuentra el marketplace" al instalar

El nombre después del `@` en `/plugin install vibe-kit@...` tiene que ser el **nombre del marketplace** (el `name` del `marketplace.json`), no el de la carpeta ni el del plugin. Confirmalo con:

```
/plugin marketplace list
```

### 6) Creé una carpeta nueva de skills y no aparece

Si la carpeta de skills no existía cuando arrancaste la sesión, **reiniciá Claude Code** una vez para que la empiece a vigilar. Editar un `SKILL.md` dentro de una carpeta ya existente sí toma efecto en vivo con `/reload-plugins`.

---

## Resumen en 4 líneas

```
/plugin marketplace add "C:\Users\Usuario\Desktop\Proyectos\Guia de vibe coding\vibe-kit"
/plugin install vibe-kit@vibe-kit-marketplace
/reload-plugins
# verificá: tipeá "/vibe-kit" y revisá que aparezcan los comandos
```

Cuando los comandos aparezcan, pasá al **[Tutorial 01 — Primer uso del Arquitecto](01-primer-uso-arquitecto.md)** y arrancá tu primer proyecto hablando con `/vibe-kit:arquitecto`.

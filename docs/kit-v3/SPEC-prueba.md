# SPEC delta: probar una idea nueva — vibe-kit

Que una idea de método que el dueño prueba en un proyecto (una skill, un flujo) quede anotada con su log y su veredicto, y que
vibe-kit la vea para absorberla. Se apoya en [SPEC-PO](SPEC-PO.md): la ofrece y la cierra el PO. "El dueño" es la persona.

- Estado: **✅ IMPLEMENTADO 2026-11-20** en la `3.2.0` (ADR-044). El red team de la regla `allow`: 24 trucos, ninguno corrió sin pedir permiso; la regla entró. Se aparta en una cosa, por el revisor frío: `abrir`, `volcar` y `veredicto` no corren con cambios ajenos sin guardar ni con commits sin subir en la carpeta principal, y el `pull --rebase` va sin `--autostash` · READY
- Fecha: 2026-11-20 · Misión 7 (kit **v3.2**) · sesión `vibe-kit M7 · La 3.2`. Decide Guido. Escribe Fable 5.2; lector y red team Opus.
- Sello del Arquitecto: `arquitecto: 2026-11-20 · kit 3.1.0 · chequeos: tamaño ✅ · entorno — (quitado: la suite del kit tarda ~90 min: cada cambio corre las pruebas de lo que toca y la suite entera va antes de cada versión (CICLO-DE-MEJORA §6) — decidido con Guido el 2026-11-16) · tope ⚠️ (10,6 KB y 8 criterios; no partir: Guido) · hash 02f85f7aa758`
- **Base**: `v3.1.0` más SPEC-PO construido. **Nivel: MEDIO-ALTO** (suma una regla `allow` al `settings.json` del molde).
- **Privado** (ADR-021): vibe-kit es público. Nada de una prueba de un proyecto (alias, slug, texto) se commitea acá.

## Pedido original, textual

Guido, 2026-11-20: "Yo quiero probar algo en un repo, una skill nueva, un flujo nuevo, algo medio global (…) La gracia es obtener
buena información de eso, para que después el vibe-kit pueda nutrirse (…) que quede un log, para eventualmente acá poder absorberlo
y formalizarlo. Si lo hace el PO, buenísimo."

## Por qué

Tres veces el kit se enteró tarde y hubo que reconstruir: director y obrero (ADR-021), el buzón (ADR-037) y el PO (DISENO-PO
§3.1). El ciclo nombra estas pruebas como su primera fuente (`CICLO-DE-MEJORA.md:122`) y no existen.

## Contexto del código

- **El registro de cambios no sirve de casa**: gramática cerrada (`hooks/lib/cambios.cjs:220-228`), y un `.md` de otro formato en
  `.claude/cambios/` rompe `verificar` (:893-902), que corre el `/cierre`. Es pieza de freno. → Carpeta y script aparte.
- **La sesión de cierre** que el director lanza tras integrar hace `pull --ff-only` en la carpeta principal y `noche.cjs subir` se
  niega si falta subir un commit que no sea de papeles (`noche.cjs:321`, :750-756: solo `docs/` y `AGENTS.md`).
- `settings.json` del molde: `allow` trae solo `cambios.cjs` (:4). Es versionado: viaja a todo worktree, y un obrero de fondo
  también corre lo que esté en `allow` (`noche.cjs:400`).
- `gitattributes.snippet` ya usa `merge=union`; el actualizador suma los renglones que falten (`actualizar.cjs:742-753`).
- El arranque: `bloqueLineasF` (`hooks/lib/inyeccion.cjs:521-528`), bloque de 500 que corta desde el final (`topes.cjs:15`).
- La flota: `cambios-flota.cjs` lee **lo commiteado en la rama por defecto local** de cada repo (:38-57), con `lib/repos.cjs`. Lo
  corre el `/inicio` de la madre (`.claude/skills/inicio/SKILL.md:25-27`).

## AGREGA

### A1. `kit/molde/scripts/prueba.cjs` y `.claude/pruebas/<AAAA-MM-DD>-<slug>/`
Dos archivos por prueba: `prueba.md` (cabecera `estado: en-prueba|al-kit|descartada` y `hasta: AAAA-MM-DD`; cuerpo `## Qué es` ·
`## Qué cura` · `## Cómo se sabe si sirvió` · `## Veredicto`) y `log.md` (un renglón por hecho).
- **El slug** es `^[a-z0-9][a-z0-9-]{0,39}$` y **todo verbo lo chequea antes de armar una ruta**.
- **"En prueba"** es lo commiteado en la rama por defecto local (`git ls-tree`), no el árbol de trabajo: vale para `anotar`,
  `listar` y el arranque, en cualquier worktree.
- `abrir --slug <s> --hasta <fecha>` (cuerpo por la entrada; las tres primeras secciones, no vacías): crea la carpeta. Slug ya
  usado: sale 1.
- `anotar <slug> --tipo uso|traba|arreglo|nota '<texto>'`: **cualquier rol, cualquier worktree**. Agrega un renglón (fecha y hora ·
  rol · rama · tipo · texto en una línea, tope 300) a `kit-pruebas/<slug>.log` del git común: **no toca el árbol ni commitea**.
- `listar [--vencidas]`: las en prueba, su `hasta` y la cuenta de renglones por tipo (commiteados más los del git común). Solo lee.
- `volcar`: aparta el archivo del git común (lo renombra), pasa sus renglones a `log.md` y lo borra **solo si el commit anduvo**.
- `veredicto <slug> al-kit|descartada|seguir --por "<razón>" [--hasta <fecha>]`: vuelca y escribe `## Veredicto` (fecha, cuentas
  por tipo, razón). `seguir` exige `--hasta` nueva y deja `en-prueba`.
- `abrir`, `volcar` y `veredicto`: solo rol `humano`, checkout principal, rama por defecto; **commit por rutas, `pull --rebase` y
  `push` en el mismo paso**. Si el push falla, lo dicen y salen 1. (Un commit sin subir que no es de papeles traba la sesión de
  cierre.) Son la excepción a SPEC-PO A4.2: los hace un script y no dejan la carpeta sucia ni adelantada.
- El texto de un renglón es de una sesión: quien lo imprime (`listar`, la flota) lo **encierra, como dato**.

### A2. `kit/skills/arquitecto-skills/scripts/pruebas-flota.cjs`
Solo lectura, sin red, con `lib/repos.cjs`: lee lo commiteado en la rama por defecto local de cada repo que tenga `.claude/pruebas/`
ahí (los demás, callado). Imprime las `en-prueba` (con "vencida") y, con `--para-absorber`, las `al-kit` que no estén en la lista de
vistas. `--vista <alias> <slug>` anota una. **La lista vive en el git común de vibe-kit (`kit-pruebas-vistas`), no en el árbol.**

## MODIFICA

- **`kit/molde/skills/po/SKILL.md`** (sigue ≤ 8.000 bytes), tres reglas: al **abrir**, `prueba.cjs listar --vencidas` y pedirle el
  veredicto al dueño (las cuentas y las tres salidas) · si el dueño dice "quiero probar…", o pide dos veces algo de método que el
  kit no trae, **ofrecer** anotarlo (qué es, qué cura, cómo se sabe si sirvió, hasta cuándo) y `prueba.cjs abrir` · al **cerrar**,
  `prueba.cjs volcar`. *Efecto*: el veredicto es del dueño; el PO no lo decide.
- **`hooks/lib/inyeccion.cjs`**, en `lineasF`, **última**: "en prueba: `<slug>` (hasta `<fecha>`) [y N más] · si la usás o te
  traba: `prueba.cjs anotar`". *Efecto*: si no entra, se cae ella, **nunca una ⚠️**; los bloques siguen sumando 9.700.
- **`kit/molde/settings.json`**, en `allow`: `Bash(node .claude/scripts/prueba.cjs anotar:*)` y la de PowerShell. *Efecto*: toda
  sesión anota sin pedir permiso, **también un obrero de fondo**. El texto va **entre comillas simples**.
- **`kit/molde/gitattributes.snippet`**: `.claude/pruebas/*/log.md merge=union`. *Efecto*: dos PCs que vuelcan no chocan.
- **`kit/molde/skills/nucleo/NUCLEO.md`**: un renglón: "si usaste algo que el arranque marca en prueba, anotalo".
- **La madre**: `.claude/skills/inicio/SKILL.md` suma `pruebas-flota.cjs --para-absorber`; `CICLO-DE-MEJORA.md` §5 nombra el script.

## NO SE TOCA

- **El registro de cambios** (`cambios.cjs`, su lib, `.claude/cambios/`) y `cambios-flota.cjs`.
- La base de AUTORIZADO (`hooks/lib/encargo.cjs`), el portero, el candado, el gate de `integrar`, `noche.cjs`.
- `/cierre`, `/inicio` y `/director` del molde. Lo que SPEC-PO define, salvo las tres reglas.
- Un proyecto sin pruebas: ni una letra de más en lo inyectado.

## FUERA de alcance

Absorber una prueba (es una sesión de diseño en la madre) · probar una función de una app · que una sesión sin PO la ofrezca · un
vencimiento que frene algo · leer pruebas de repos de otra PC · dónde vive la idea (se escribe en "Qué es").

## Criterios de aceptación

1. **Regresión.** Lo de NO SE TOCA sigue igual: la suite pasa; `cambios.cjs verificar` da lo mismo con una prueba abierta; sin
   pruebas, lo inyectado es byte a byte lo de antes.
2. CUANDO `abrir` corre bien, la carpeta DEBE quedar commiteada **y subida** (`git rev-list origin/<defecto>..HEAD` vacío). Con una
   sección vacía, otro rol, fuera del principal o un slug usado, DEBE salir 1 sin escribir.
3. CUANDO un slug trae `/`, `\`, `..` o mayúsculas, todo verbo DEBE salir 1 sin escribir nada.
4. CUANDO `anotar` corre desde un worktree de módulo con rol `obrero`, DEBE sumar el renglón al git común y `git status --porcelain`
   DEBE quedar igual; un texto con saltos o de más de 300 DEBE quedar en una línea, cortado. CUANDO la prueba se abrió después de
   crear ese worktree, DEBE anotar igual.
5. CUANDO `volcar` corre, los renglones DEBEN pasar a `log.md` en un commit subido; **si el commit falla, DEBEN seguir en el git
   común**. Dos vuelcos de dos clones DEBEN unirse sin conflicto, también con `pull --rebase`.
6. CUANDO `veredicto` corre, `prueba.md` DEBE quedar con estado, razón y cuentas; `seguir` sin `--hasta` DEBE salir 1.
7. CUANDO hay una prueba en curso y las otras líneas están en ✅, lo inyectado DEBE traer la suya; con las otras en ⚠️ largas, DEBE
   caerse ella y ninguna ⚠️. Siempre ≤ 9.700.
8. CUANDO un repo tiene una prueba `al-kit` commiteada que no está en las vistas, `pruebas-flota.cjs --para-absorber` DEBE
   listarla; después de `--vista`, no; y `git status` de vibe-kit DEBE quedar igual. Un renglón con forma de orden DEBE salir
   encerrado.

## Ejecución

**módulo solo**, en la madre, **una sesión (~3 h, Opus)**, después de la sesión 2 de SPEC-PO y antes de su `rc.1`: misma versión,
mismo piloto. Prueba en rojo primero. **Red team de la regla `allow`** (una ronda), con esta lista cerrada en el texto de `anotar`:
`;`, `&&`, `|`, `>`, `$(…)` y backticks en Bash; `$(…)` y `;` en PowerShell. **Si alguna corre sin pedir permiso, la regla no entra**
y `anotar` pide permiso como cualquier comando. La suite entera y el banco son los de SPEC-PO.

## Entorno de prueba

`node --test` por pieza; `bash pruebas/rehacer.sh` para la flota de prueba. Sin base ni servicios.

## Supuestos

- La plataforma parte un comando en `;`, `&&`, `||`, `|` y saltos, y cada parte pide su regla (doc oficial de permisos). **No dice**
  qué hace con `$(…)` dentro de comillas dobles: NO VERIFICADO, lo cierra el red team de arriba.
- Dos `anotar` a la vez no mezclan renglones (cada uno, un solo agregado de menos de 400 bytes). No medido.

## Riesgos y decisiones ⚠️

- ⚠️ **Sin PO, nadie la ofrece ni pide el veredicto.** Aceptado: Guido va a tener PO en cada proyecto.
- ⚠️ **El log depende de que la sesión anote**: es una regla escrita y una línea del arranque, no un freno. Las cuentas son un piso.
- ⚠️ **Lo anotado sin volcar es de esa PC.** · **`abrir` y `veredicto` mueven la rama por defecto** con directores en obra.
- ⚠️ **Texto libre que después lee otra sesión**: una línea, encerrado. Si gitleaks frena un vuelco, los renglones no se pierden.

### Alternativas descartadas
- **Un estado "en prueba" en el registro de cambios** (lo pedía el brief del 2026-11-03): gramática cerrada y pieza de freno.
- **Anotar directo en el archivo versionado**: ensucia el árbol de un obrero y suma commits en la rama por defecto.
- **La lista de vistas en `kit/`**: publicaría datos de proyectos privados. · **Una skill propia**: depende de acordarse.

## Red team

`redteam-spec` (Opus, una ronda), 2026-11-20: 10 hallazgos, los 10 aplicados. **Bloqueaba** (1): los commits sin subir trababan la
sesión de cierre. **Ajustes** (6): el slug, las vistas en público, el obrero de fondo, de dónde se lee "en prueba", `volcar`, el
texto por el shell. **Menores** (3). El detalle, en el ADR. No corrió pruebas.

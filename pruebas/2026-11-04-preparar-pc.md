# Prueba 2026-11-04 — Preparar la PC con la beta (paso 1)

- **Fecha:** 2026-11-04
- **PC:** `pc-juan` (Windows 11 Pro 10.0.26200, node v24.19.0, git 2.55.0.windows.5, Python 3.14.7 por `py -3`)
- **Versión del kit:** antes — no había `~/.claude/VERSION`; después — `3.0.0-rc.3`
- Salida recortada: se resumen las ~80 líneas `copio/actualizo/borro` (abajo se dice cuántas son). Rutas con `~`; nombres de
  proyectos reemplazados por alias (`proyecto-x1`, `proyecto-x2`).

## Recorrido

| Qué | Resultado |
|---|---|
| Clon completo (con tags) de `guidocameraeq/vibe-kit` en la carpeta temporal | OK, 1,8 s, sin pedir credenciales |
| `actualizar.cjs ultimo-tag <clon>` | `v3.0.0-rc.3` (exit 0). El clon quedó parado en ese tag (`7d998fe`) |
| `preparar-pc.cjs --kit <clon> --plan` | exit 0, 4 s, no escribió nada |
| La pregunta (una sola) | "¿Lo aplico, con los proyectos en `<proyectos>`?" — con el resumen del plan. Juan dijo que sí |
| `preparar-pc.cjs --kit <clon>` (aplicar) | exit 0, 6 s |
| Clon borrado | sí |
| Tiempo total del paso (con lecturas y la pregunta) | unos minutos; lo que corrió el kit fueron ~12 s en total |
| ¿Pidió algo de más? | No: una sola pregunta, ningún permiso extra, nada que instalar a mano |

## El plan (resumen de lo que mostró)

- `skills/arquitecto/**` y `skills/arquitecto-skills/**`: **62 archivos para copiar/actualizar**, **46 iguales**, **9 para borrar** (el kit
  ya no los trae: `templates/universales/*`, todos "intactos", ninguno editado a mano). Esto indica que ya había una versión
  anterior del kit instalada, sin `VERSION` (inferido del plan: 46 archivos "iguales").
- `agents/redteam-spec.md` (actualizo) y `VERSION` (copio).
- `hooks/kit/**`: 13 archivos copiados + el registro de `PreToolUse` y `UserPromptSubmit` del corrector + el `deny Read` del almacén de secretos
  + `hooks/kit/INSTALADO` (kit 3.0.0-rc.3, 13 archivos).
- `~/.claude/settings.json`: una sola escritura (hooks por PC, `crossSessionInbound` → `accept`, `autoMode`).
- `~/.claude/kit-pc.md` creado. Proyectos detectados en `<proyectos>`; capa privada: no.

## Chequeos de la pasada (`preparar-pc`, resumen)

`✓` node 24.19.0 · git 2.55.0 · gh 2.98.0 (logueado) · gitleaks 8.30.1 · kit 3.0.0-rc.3 · hooks-pc (17 pasos) · cross-session · capa-privada · archivo-pc
`⚠` claude-code ("no pude leer su versión") · automode ("dos checkouts del mismo origin")

## Tabla final del `doctor` (26 chequeos · 0 ✗ · 5 ⚠)

La corrí tal cual la dejó `preparar-pc`, y otra vez después de borrar el clon (los 5 ⚠ son los mismos).

| | Chequeo | Línea |
|---|---|---|
| ✓ | node, gitleaks, lefthook, git-bash, settings-pc, hooks-pc, hooks-pc-iguales, deny-almacen, anti-secretos-viejo, plazo-arranque, sensible-prosa, version-kit, kit-sync, githooks, archivo-pc, credencial, gh-push, mesa-gh, cross-session, frenos-vencidos, regla-tamano | todos ✓ (`version-kit`: instalado 3.0.0-rc.3 = último tag `v3.0.0-rc.3`) |
| ⚠ | claude-code | `2.1.316 (extensión de VS Code) (pide ≥ 2.1.295) · el "claude" de la terminal no dio su versión · corré "claude --version" a mano` |
| ⚠ | pre-commit | "este repo no tiene .githooks/ ni ficha" — esperable: se corrió parado en esta carpeta, que no es un proyecto del kit |
| ⚠ | ficha | "este repo no tiene .claude/kit.md: no es un proyecto del kit" — idem |
| ⚠ | automode | "el bloque autoMode coincide, pero dos checkouts del mismo origin …/vibe-kit.git: vibe-kit-juan y vibe-kit; queda vibe-kit-juan" |
| ⚠ | copias-kit | "2 copias de las skills globales dentro de proyectos · proyecto-x1/.claude/skills/arquitecto, proyecto-x2/.claude/skills/arquitecto · borralas del repo" |

Cierre del script: `listo: reiniciá Claude Code.`

## Lo que se encontró (para la sesión de Guido)

1. **`claude` de la terminal: el doctor no lo lee, y está por debajo del mínimo.** A mano, en PowerShell: `claude --version` →
   `2.1.252 (Claude Code)`. El mínimo que pide el kit es `≥ 2.1.295`. El doctor no pudo leer esa versión y usó la de la extensión de
   VS Code (2.1.316), con lo que da un ⚠ en vez de decir que la terminal está atrás. Posible causa (no probada): en Windows el
   `claude` de la terminal se resuelve distinto desde el `child_process` de node que desde PowerShell.
2. **`automode` ⚠ con dos checkouts del mismo origin.** Persiste con el clon temporal ya borrado: el "otro" checkout es `vibe-kit`
   dentro de `<proyectos>`, y este repo (`vibe-kit-juan`, la rama de la prueba) comparte origin con el canónico. No es un fallo de la
   beta sino de cómo está armada esta PC (la rama de la prueba tiene el mismo origin que el kit). Queda para que Guido diga si es esperable.
3. **`copias-kit` ⚠**: dos proyectos de `<proyectos>` traen su propia copia de la skill `arquitecto` en `.claude/skills/`. El doctor
   pide borrarlas. **No se tocó** (son proyectos de Juan; se ve en el paso 3/4).
4. La PC ya tenía skills instaladas antes de este paso (el plan marcó 46 archivos "iguales"), sin archivo `VERSION`. Skills hoy en
   `~/.claude/skills/`: arquitecto, arquitecto-skills, brainstorming, codebase-to-course, docs-fyd, frontend-design, relevamiento,
   shadcn, supabase, supabase-postgres-best-practices, synced, systematic-debugging, theme-factory, verification-before-completion,
   web-design-guidelines, writing-skills.

## NO VERIFICADO

- Que los hooks nuevos carguen: eso pasa al reiniciar Claude Code (todavía no se reinició).
- Que el corrector de secretos frene algo de verdad: no se probó.
- Qué versión del kit había antes en la PC (no se guardó nada previo; solo se infiere del plan).

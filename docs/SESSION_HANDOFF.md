# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope**: con el TODO y git, lo inyectado tiene que quedar bajo 10.000 caracteres.

**Última sesión cerrada:** 2026-10-27, misión 4, **tramo 5 ✅: el repaso del kit con Guido y el SPEC-0 del kit v3, READY**.
→ **La misión 4 (diseñar el pack) terminó.** Solo diseño, kit `v2.4.2`. PC `clientes`. `kit-sync` LIMPIO. Detalle: CHANGELOG del 2026-10-27 (tramo 5).

## Dónde estamos

- **[`docs/kit-v3/SPEC-0-kit-v3.md`](kit-v3/SPEC-0-kit-v3.md)** (95 KB) es el plano de la misión 5: 9 paquetes, orden de construcción en 10 pasos,
  medición, NO VERIFICADO con su "cuándo", y "Lo que hacés vos de nuevo". Pasó 3 rondas de red team + revisor frío (59 hallazgos, todos
  aplicados). Guido lo aprobó y decidió RF-3 (ADR-027: el OK a un cambio de barrera es el clic en la ventana, con candados; no la terminal).
- **[`docs/kit-v3/GUIA-KIT-V3.md`](kit-v3/GUIA-KIT-V3.md)**: el repaso textual charlado con Guido, con fe de erratas; PDF en sus dos escritorios.
- Hoja de ruta ADR-025: misión 4 ✅ → **4½ ordenar la casa** → 5 construir v3.0 (por el spec) → 6 el ciclo → 7 mensajería v3.1.

## Próximo paso: misión 4½, ordenar la casa

**Título: `vibe-kit M4½ · Ordenar la casa antes de construir`**. Esfuerzo `medium`. Una sesión corta; lo que lista el TODO (🔴, misión 4½):
`docs/chats-mision-4/` al privado, diario de misiones, legacy con lápida, `docs/README.md`/guía/manuales al día, README portada, **y el parche
`v2.4.3`** (tope + huella en el hook del molde actual: el spec P4.1 es la versión completa, el parche es solo el `head -c` con aviso CORTADO).
Al terminar, la primera sesión de construcción abre con la línea de "Ejecución" del spec: paquete 1 (ficha del kit, parser, `VERSION`, `pruebas/`).

## Cosas que muerden y no están en ningún otro doc

- 🔑 **Identidad de git**: en `clientes` el mail es el `noreply` de `guidocameraeq` (vale). Nunca `eq.chatgpt`.
- 📐 **El hook de arranque está pasado del tope**: hoy inyecta ~10.800 caracteres (git 2.400 por los mensajes de commit largos; TODO 4.200).
  Esta sesión recortó handoff y TODO y commiteó con mensaje corto; **medir en el próximo `/inicio`** (`bash .claude/hooks/session-start.sh | wc -m`).
  Regla desde hoy: mensajes de commit de una línea; el detalle va al CHANGELOG.
- 🗄️ **Los 4 informes de revisión del spec están en `D:\vibe-research\clientes\redteam-kit-v3\`** (RONDA-1..3, REVISOR-FRIO). **Esa carpeta en
  esta PC no es repo git**: subirlos al privado `vibe-research` en la 4½. Lo crudo sigue en `D:\vibe-hallazgos\`; nada se borra hasta cerrar la 5.
- 📁 **`docs/kit-v3/` se aparta del mapa del `CLAUDE.md`** (los `SPEC-*` iban sueltos en `docs/`): pedido de Guido, "una carpeta de la versión". En la
  4½, una fila en el mapa del `CLAUDE.md` y en `docs/README.md` (ya tiene las dos filas) para que quede explícito.
- 📬 **El Hub pushea a este repo desde otra sesión**: `git fetch` antes de cerrar (hoy nada nuevo).
- 🔴 **vibe-kit es PÚBLICO**: gitleaks antes de cada push (hoy limpio). 🔐 **12 alertas abiertas**, las arregla Guido.
- 🧪 **Antes del piloto, trabajo de Guido** (spec, "Lo que hacés vos de nuevo"): credenciales de escritura de 5 proyectos al almacén en 2 PCs,
  usuario de solo lectura por base real, "preparame esta PC" en la del compañero.

## Bloqueos

Ninguno.

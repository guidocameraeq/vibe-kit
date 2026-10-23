# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope**: con el TODO y git, lo inyectado tiene que quedar bajo 10.000 caracteres.

**Última sesión cerrada:** 2026-10-22 (nota post-cierre del 23), misión 4, tramo 4: **racimo B cerrado y revisado dos veces**;
**D ampliado** por pedido de Guido al método director/obrero. Solo diseño, kit `v2.4.2`. PC `Usuario`. `kit-sync` LIMPIO.

## Dónde estamos

- **Misión 4**: tramos 0 a 3 hechos ([`PLAN.md`](mision-4/PLAN.md)). **Tramo 4**: ✅ A · ✅ C · ✅ E · ✅ F · ✅ B · siguen
  **D → G → H → I**, después la revisión integral de los nueve con los 11 criterios, y el spec (tramo 5).
- ✅ **B · Documentos** ([`DISENO-B-documentos.md`](mision-4/DISENO-B-documentos.md)): `docs/` en cuatro capas (`NORTE` + `MAPA` ·
  sesión con tope · `modulos/<x>/` con ficha e historia separadas · `referencia/` y `archive/`) · tres tamaños · hook con presupuesto
  9.500 y huella · TODO por `git blame` · candado por script · `CLAUDE.md` por los 11 criterios. Dejó notas en A, C, E, F y TABLERO.
- 🆕 **Reglas de Guido** (PLAN §Lecciones): subagentes en Sonnet u Opus, **nunca Fable**; antes de diseñar, un lector barato mide
  cómo se usa hoy en los repos reales.

## Próximo paso: racimo D · el método director/obrero y el workflow diario

**Título: `vibe-kit M4 · Tramo 4: racimo D (director/obrero y workflow)`**. Esfuerzo `high`. **Guido participa mucho acá**: "es lo
que más uso para codear". Decisiones de a una, en criollo, con "qué cambia para vos".

- **Qué cubre** (PLAN, tabla del tramo 4; TABLERO §10): la anatomía canónica del **director, el obrero y el tramo** (un solo
  dialecto de los tres: Desktop, Mobile y el corto de Deptos) · la revisión de las skills que viven en sus repos · qué skills faltan
  o sobran (regla de 3+ medida con `flota.py`; FLOTA §6: `/smoke` 9, `/release` 8, `/estado`, `/verificar`) · cómo estandarizar sin
  perder lo propio (E §4-§5: piezas `molde+propio` / `adaptada` / `propia`) · mejoras a su día a día · y lo que D ya tenía: modelos y
  esfuerzo por rol, delegar solo con razón, silencio ante avisos sin novedad, revisión proporcional y congelada en un commit con una
  sola corrección, cuándo se muda el director.
- **Cómo arranca**: (1) **entrevista corta a Guido**: cómo es su día con director/obrero, qué le molesta, qué repite a mano. (2) **Un
  lector Opus** sobre las skills reales por `gh` y disco: Desktop y Mobile (`director`, `obrero`, `tramo`, `gate`), **Deptos está en
  esta PC** (`Proyectos/Proyecto Deptos/.claude/skills/`: director, obrero, estado, verificar, release, smoke…), y RADIOGRAFIA §7-§8
  como índice de lo ya sabido; devuelve qué hace cada rol en cada dialecto, qué leen y escriben, y qué es genérico. (3) **Ficha "el
  director y el obrero canónicos"**: el ciclo de un tramo de punta a punta juntando lo que ya decidieron A (§7: encargo por referencia,
  aviso verificado), B (§5-§7: ficha, bitácora, dueño único) y C (§2-§3: reporte, tiempos). (4) Decisiones → revisor frío Opus →
  filtro → `DISENO-D-*.md` con su tabla → marcar en el PLAN.
- **Lee**: PLAN §El foco · RADIOGRAFIA §3-§10 · TABLERO §2, §3, §7, §9, §11 · FLOTA §1-§2, §6 · DISENO-A §7 · DISENO-C · DISENO-B §5-§7
  · DISENO-F §13 · REFERENCIAS §1 y §4 · PLATAFORMA §6.
- **Lo que no es de D**: el buzón entre directores (G) · cuándo un módulo lleva director y los nombres de ramas (H) · el gate como
  script (D decide el método; el script, misión 5).

**Sesión corta aparte, cuando Guido quiera** (antes o después de D): `vibe-kit · Tope al hook del molde (v2.4.3)`, esfuerzo
`medium`: solo el tope y la huella en bash en `kit/…/hooks/session-start.sh` y "si dice CORTADO, leé el resto" en el `/inicio`
del molde; guía DISENO-B §9 y el hook del Hub. Bot (15.500) y el Panel (~18.000) arrancan ciegos hasta entonces.

## Cosas que muerden y no están en ningún otro doc

- 🔑 **Esta PC no tiene identidad de git**; el cierre commitea con el `-c` de respaldo. Con qué cuenta firma, **NO VERIFICADO**.
- 📬 **El Hub pushea a este repo desde otra sesión** (el 22: 2 commits en TABLERO §10; el registro responde en producción, la llave la
  tiene Guido, nada entra al repo). **Antes de cerrar, `git fetch` siempre.**
- 🧪 **Lo que B manda al piloto**: cómo cuenta caracteres la plataforma, el hook de escritura en Windows y worktrees, la ficha del kit
  legible en node sin librerías.
- 🔴 **vibe-kit es PÚBLICO**: gitleaks antes de cada push (hoy limpio). En los diseños, alias (Desktop, Mobile, Hub, Deptos).
- 🔐 **12 alertas abiertas** (archivo privado), las arregla Guido. 🖥️ Los directores de Hermes corren en la PC `clientes`; por `gh`.

## Bloqueos

Ninguno.

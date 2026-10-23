# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope**: con el TODO y git, lo inyectado tiene que quedar bajo 10.000 caracteres.

**Última sesión cerrada:** 2026-10-23, misión 4, tramo 4: **racimo D cerrado y revisado** (el método director/obrero y el workflow diario;
11 decisiones con Guido adentro, revisor frío con 25 hallazgos). Solo diseño, kit `v2.4.2`. PC `Usuario`. `kit-sync` LIMPIO.

## Dónde estamos

- **Misión 4**: tramos 0 a 3 hechos ([`PLAN.md`](mision-4/PLAN.md)). **Tramo 4**: ✅ A · ✅ C · ✅ E · ✅ F · ✅ B · ✅ D · siguen
  **G → H → I**, después la **revisión integral de los nueve con los 11 criterios** (Guido la pidió especialmente para D: "es el más
  complejo y el más importante"; ahí se cierra la **D5, provisoria**), y el spec (tramo 5).
- ✅ **D · Director/obrero** ([`DISENO-D-director-obrero.md`](mision-4/DISENO-D-director-obrero.md), 54 KB): director por tamaño con triage
  en la puerta, sin agente PO · `/obrero` y `/tramo` separados con núcleo común · Sonnet por defecto, red team con criterio de salida ·
  Guido abre las pestañas por default, el director solo si se lo pide o de noche; hook que aprueba AUTORIZADO · una rama por módulo con
  el director dueño (**provisoria**) · silencio entre agentes, despertador afuera · revisión congelada, ≤2 vueltas · "compactar es una
  falla", obrero que termina y se reutiliza · gate como script, `/smoke` firma, cero datos clavados · tres clases de decisión · el canon
  entra por el módulo nuevo, **piloto en Deptos cuando Guido diga** (misión 5). **"Publicar un release" es la 5.ª pregunta de A §2.**
  Dejó notas en A, B, C, E, F, TABLERO §11 (enmendado), FLOTA y el PLAN.
- 🆕 **Datos de Guido que cambian el diseño** (memoria): trabaja en la **extensión de VS Code**; la mensajería entre sesiones le funciona
  con `/rename` hecho; hoy tipea `/rename` → `/model` → `/obrero` por pestaña y nunca probó que el director renombre; al reiniciar la PC
  los nombres se pierden. Reglas nuevas suyas: "cada mensaje entre agentes trae algo nuevo y verificable; si no, es ruido" · "lo único a
  evitar es compactar" · cuando una recomendación junta dos piezas, pasarla por "cortar los roles por la pregunta que responden".

## Próximo paso: racimo G · mesa, PCs y el buzón multiagente

**Título: `vibe-kit M4 · Tramo 4: racimo G (mesa, PCs y buzón)`**. Esfuerzo `high`. Decisiones de a una, en criollo, con "qué cambia para vos".

- **Qué cubre** (TABLERO §10, fila G): #10, P32 (`mesa/`), P34 (Remote Control entre PCs), P42 (lecciones al repo), P44-P46 (versión
  visible, instalar con chequeo, sesiones paralelas = un worktree por misión); S-R-3, S-C-1, S-M-12, S-D-7; y **el buzón multiagente**
  (Guido: "más adelante vamos a plantear una alternativa a la mesa"). Pregunta abierta de FLOTA §8: la segunda cuenta que firma 3 proyectos.
- **Lo que D le pasa**: `crossSessionInbound` y cómo está configurado hoy en VS Code (le funciona; anotar en el molde) · director y obreros
  en el mismo entorno por PC (WSL y Windows nativo no se ven) · la suscripción por tipo de mensaje (MetaGPT) · la "coordinación con Mobile"
  de Desktop es la mesa · cómo se entera el director de lo que dejó una sesión plana en `bitacora/` (B §5) · un canal por archivo como red
  (Deptos) · la mesa con hechos citados y orden fijo no se rompe (TAB §11).
- **Cómo arranca**: (1) lector barato (Sonnet) sobre cómo se hablan hoy los directores entre proyectos y entre PCs (RADIOGRAFIA §3, Anexo A;
  tanda §"Para la Mesa entre PCs"; PLATAFORMA sobre mensajería y Remote Control) → ficha "hoy"; (2) verificar contra la doc oficial lo que
  G necesite (Remote Control, `crossSessionInbound`, límites de SendMessage: ya hay base en DISENO-D §7); (3) decisiones → revisor frío
  Opus → filtro → `DISENO-G-*.md` con su tabla → marcar en el PLAN. Subagentes en Sonnet u Opus, nunca Fable.
- **Lee**: PLAN §El foco · TABLERO §6, §10, §11 · RADIOGRAFIA §3 y Anexo A · PLATAFORMA §6 · REFERENCIAS §3-§4 · DISENO-D §7, §9, §19 ·
  DISENO-B §5 · DISENO-E §9 · FLOTA §8.

**Sesión corta aparte, cuando Guido quiera**: `vibe-kit · Tope al hook del molde (v2.4.3)`, esfuerzo `medium`: solo el tope y la huella en
bash en `kit/…/hooks/session-start.sh` y "si dice CORTADO, leé el resto" en el `/inicio` del molde; guía DISENO-B §9 y el hook del Hub.

## Cosas que muerden y no están en ningún otro doc

- 🔑 **Esta PC no tiene identidad de git**; el cierre commitea con el `-c` de respaldo. Con qué cuenta firma, **NO VERIFICADO**.
- 📬 **El Hub pushea a este repo desde otra sesión.** **Antes de cerrar, `git fetch` siempre** (hoy no había nada nuevo).
- 🧪 **Lo que D manda al piloto (misión 5)**, 10 NO VERIFICADO con prueba nombrada en DISENO-D §7.7, §11 y §20; los primeros: que `--name`
  se conserve al reanudar, que el director pueda correr `claude --bg` desde Bash, el hook `PreToolUse allow` en VS Code, el punto exacto
  de compactación por ventana, y mapear las 5 de A a reglas concretas (F/H).
- 🔴 **vibe-kit es PÚBLICO**: gitleaks antes de cada push (hoy limpio). En los diseños, alias (Desktop, Mobile, Hub, Deptos).
- 🔐 **12 alertas abiertas** (archivo privado), las arregla Guido. 🖥️ Los directores de Hermes corren en la PC `clientes`; Desktop ya se
  mudó de PC el 10-22 y sus skills siguen con rutas de la vieja (va a la adopción, no al método).

## Bloqueos

Ninguno.

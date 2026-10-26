# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope**: con el TODO y git, lo inyectado tiene que quedar bajo 10.000 caracteres.

**Última sesión cerrada:** 2026-10-26 (trabajo del 24 al 26), misión 4, tramo 4: **racimo H cerrado provisoriamente** (niveles y puertas
del Arquitecto; 14 decisiones: 1-6 aprobadas en bloque, **7-14 sin OK explícito**; revisor frío con 45 hallazgos, todos aplicados).
Solo diseño, kit `v2.4.2`. PC `Usuario`. `kit-sync` LIMPIO. **Guido se muda a la PC `clientes`.**

## Dónde estamos

- **Misión 4**, tramo 4: ✅ A · C · E · F · B · D · G · **🟡 H** · siguen **I → G.1**, después la **revisión integral** con los 11 criterios
  (cierra la D5 provisoria y las 7-14 de H) **con la lectura de contraste en la mano**, y el spec (tramo 5). [`PLAN.md`](mision-4/PLAN.md).
- 🟡 **H** ([`DISENO-H-niveles-y-puertas.md`](mision-4/DISENO-H-niveles-y-puertas.md), 45 KB): dos ejes (tamaño del pedido chico · módulo ·
  con director; nivel `liviano` = sin código · `estandar`; largo se calcula) · **una sola regla de tamaño** que la sesión plana dice en una
  línea sin preguntar; lo chico nunca pasa por el Arquitecto · director solo si se escribe **a la vez** · subproyecto = módulo con nombre · el
  Arquitecto termina armando el módulo y dando la línea de apertura · entorno de prueba declarado, verificado por script, chequeo base al abrir ·
  ramas `modulo/<x>` y `modulo/<x>--<ID>`, worktrees por el script `worktree`, pestaña identificada por la rama del `cwd` · tope del spec ·
  prototipo antes del spec · `sensible:` a reglas por script. Cada decisión dice cuál de las cuatro cosas de Guido mueve (memoria). Notas en
  A-G, TABLERO, PLAN y PLATAFORMA §7 (worktrees verificados contra la doc).
- 🆕 **Lectura de contraste de los chats, planificada** (pedido de Guido): no otro barrido, sino leer los chats con las decisiones A-H en la
  mano (confirma / contradice / no vi), más hábitos y huecos. `observatorio/investigacion/LECTOR-contraste.md` (49 decisiones) y
  `PLAN-lectura-contraste.md`. **Corre en la PC `clientes`** (ahí están los condensados de octubre, `D:\vibe-hallazgos\`). Falta `recortar.py`.
- 🆕 **Hábitos en esta PC**: la sesión del observatorio ("Observatorio: hábitos que Guido repite a mano") condensó y recortó los chats de
  `Usuario` en `C:\vibe-research\usuario\` (fuera del repo, gitleaks limpio) y **quedó esperando el OK de Guido con el presupuesto**. No hay
  acta. Al volver a esta PC: contestarle; el acta va a `tips/tanda-2026-10-habitos.md` (uso personal: se etiqueta, no se generaliza).

## Próximo paso (PC `clientes`): confirmar H y arrancar la lectura de contraste

**Título: `vibe-kit M4 · Tramo 4: OK de H (7-14) y lectura de contraste`**. Esfuerzo `high`. Dos cosas, en orden:

1. **Las decisiones 7-14 de H con Guido**, con el archivo en la mano (DISENO-H §10-§17: ramas y worktrees, `/inicio` y el worktree, tope del
   spec, prototipo, sin código y carpeta real, `sensible:`, variantes chicas, NORTE). Él las leyó y no objetó. Si cierran: estado ✅ en
   DISENO-H, TABLERO §10 y PLAN; las líneas `H-n` de `LECTOR-contraste.md` se ajustan si algo cambió. Si corrige, se aplica y se anota en §2.
2. **Arrancar la lectura de contraste como sesión propia del observatorio** (rol aparte, nunca la madre): brief = `PLAN-lectura-contraste.md`
   entero. Pasos que le tocan a la madre antes: `ya-sabido.md` al día; escribir y probar `recortar.py` con 3 chats; **el presupuesto se lo
   muestra a Guido con el número** (estimación a ojo: 4-8 M reales de lectores, NO VERIFICADO). Su acta: `tips/tanda-2026-11-contraste.md`.
   Lectores Sonnet, síntesis Opus, nunca Fable.

**Después**: **I** (el agente de ecosistema; vive en el Hub, el kit solo consume el `registro`; TABLERO §10) · **G.1** (brief en G §18) ·
la revisión integral. **Sesión corta aparte, cuando Guido quiera**: `vibe-kit · Tope al hook del molde (v2.4.3)`, esfuerzo `medium`.

## Cosas que muerden y no están en ningún otro doc

- 🔑 **Identidad de git**: `guido.camera.eq@gmail.com` (global en `Usuario`; en `clientes` verificar con `git config user.email`). Nunca `eq.chatgpt`.
- 📬 **El Hub pushea a este repo desde otra sesión**: `git fetch` antes de cerrar (hoy nada nuevo).
- 🧪 **NO VERIFICADO al piloto (Deptos)**: los 10 de H §22 (tokens por carpeta de worktree, `--bg` dentro del worktree, la pestaña de la
  extensión en un worktree, los números del tope…); los de D y G siguen.
- 🔴 **vibe-kit es PÚBLICO**: gitleaks antes de cada push (hoy limpio). Alias en los diseños. 🔐 **12 alertas abiertas**, las arregla Guido.
- 🖥️ `Usuario` = uso personal y liviano; `clientes` = trabajo (Hermes, directores, hallazgos). Lo medido acá se etiqueta, no se generaliza.

## Bloqueos

Ninguno. (Las decisiones 7-14 de H esperan OK, no frenan nada.)

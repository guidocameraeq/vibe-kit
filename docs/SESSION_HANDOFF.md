# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo
> inyecta en cada chat nuevo de esta carpeta.

**Última sesión cerrada:** 2026-10-12, en la PC `clientes` (`D:\vibe-kit`) — **la vuelta después de
70 días.** Se planeó la investigación de los chats, misión 1 de 5. Hay un solo archivo nuevo de peso:
`docs/SPEC-investigacion-chats.md` (**READY**). Versión del kit sin cambios: `v2.4.2`.

## Qué pasó en los 70 días (contado por Guido, no está en git)

- **Usó muchísimo el kit**: el Arquitecto (arrancar proyectos, preparar skills, equivalencias), también
  invocado adentro de proyectos, más `/relevamiento` y `docs-fyd`. *"Me ha ido muy, muy bien."*
- **Armó un método propio en Hermes**: director / obrero / tramo con subagentes (implementador Sonnet,
  revisor Opus sin Bash, explorador Haiku) + red-team. Está en Hermes Desktop y en Hermes Mobile.
- **Mesa entre directores**: los directores de proyectos que comparten base y usuarios
  (Desktop ↔ Mobile ↔ Devoluciones) **se hablan entre ellos**, se ponen de acuerdo y **se contagian
  mejoras del método**. *"Me salva la vida."*
- **Comunicación entre PCs por Remote Control**: Guido ya la usó, ida y vuelta, y la quiere en el pack.
- Su balance: más tokens y más lento, pero **mucha consistencia, muy pocos errores y mucha menos
  participación suya**.

## Próximo paso concreto: la misión 2, la investigación

Abrir un chat nuevo acá → `/inicio` → *"ejecutá el SPEC de la investigación"*. El spec trae todo:

- **Etapa 0** — un script local (`investigacion/condensar.py`, a escribir) que condensa los `.jsonl`,
  enmascara secretos y saca el costo real por rol y modelo. **Primero se prueba con 3 chats elegidos
  a mano** y se mira la salida.
- **Etapa 1** — lectores en Sonnet, por lotes. **Guido ya pidió la Workflow (D1)**, pero conviene
  reconfirmarla en ese chat, porque el permiso es por sesión.
- **Etapa 2** — síntesis en Opus → `tips/tanda-2026-10-chats.md`.
- **El presupuesto (D4) se fija después de la Etapa 0**, con el tamaño condensado en la mano.
- **La otra PC** corre su propia Etapa 0+1 y una mini-síntesis, coordinada por Remote Control. La
  mini-síntesis vuelve por el repo **privado** `vibe-research`, que hay que crear al arrancar.

## Cosas que muerden y no están en ningún otro doc

- 🔴 **vibe-kit es PÚBLICO** (`gh repo view` lo dice). Nada de los chats entra crudo. Antes de cada
  push hay que correr un escáner de secretos y Guido tiene que mirar el diff. Viene del red-team del
  spec (ADR-021).
- **En esta PC hay 941 transcripts de subagentes** en `projects/*/*/subagents/`. El `usage` se repite
  en varias líneas por cada respuesta: hay que agruparlo por `message.id`. El rol de cada sesión está en
  `custom-title.json`. Todo verificado por el red-team.
- **Volumen medido en esta PC:** 1,9 GB y ~230 chats principales. El 85% es Hermes (Desktop 90 chats,
  Mobile 94).
- **Las fuentes del método** que leen los agentes:
  - Desktop: `d:\Hermes\Hermes.exe\docs\metodo\`. La bitácora al día está en
    `D:\Hermes-bitacora\docs\metodo\bitacora\`, no en `main`.
  - Mobile: `d:\Hermes\Hermes mobile\docs\v4\METODO.md` y `docs\WORKFLOW.md`.
- **El "capataz"** es un agente que Guido arma para regalarle a oficinistas no-dev. En esta PC solo
  están los chats de sus pruebas (`*kit-eq-pruebas-capataz*`); el código no está acá. Preguntarle a
  Guido dónde vive.
- **El diff kit↔instalado en esta PC no da limpio por una sola línea**: la "carpeta de proyectos" del
  Arquitecto. Es el slot por máquina y está documentado como excepción en ADR-021. No es drift.
- **Dos alertas de seguridad de Hermes** que aparecieron leyendo su bitácora. Son de Hermes, no de acá:
  - un merge corrió sin el clic de Guido, porque `git -C <ruta> merge` esquiva la regla `ask`;
  - `/smoke` tiene una contraseña de producción desactualizada.

  Además: si la contraseña de producción que salió en pantalla en un transcript no se cambió, conviene
  cambiarla.
- **El estreno de `/relevamiento` seguramente ya pasó en la práctica.** Su evidencia está en los chats,
  y la busca la pregunta Q4 del spec.

## Bloqueos

Ninguno. Para la otra PC hace falta que Guido abra allá una sesión de Claude Code con Remote Control,
con vibe-kit al día (`git pull`).

# El Arquitecto — instalación automática en esta PC

> **Cómo se usa**: descomprimí el zip en cualquier carpeta → abrí Claude Code **en esa carpeta**
> (VSCode: Archivo → Abrir carpeta → chat de Claude; o en terminal, parado ahí: `claude`) →
> pegá el prompt de abajo tal cual. Claude instala todo, te pregunta lo único que necesita
> saber, y te confirma con evidencia. ~2 minutos.

---

## El prompt (copiá TODO el bloque de abajo)

```
Instalá el paquete "El Arquitecto" que está en esta carpeta:

1. Verificá que acá estén skills/arquitecto/SKILL.md, skills/arquitecto-skills/SKILL.md
   y agents/redteam-spec.md. Si falta alguno, frená y avisame.
2. Copiá skills/arquitecto/ COMPLETA (con anexos/ y templates/) Y
   skills/arquitecto-skills/ (con su menu-skills.md) a las skills globales
   de esta máquina: ~/.claude/skills/ (creá las carpetas que no existan).
   Si ya hay versiones instaladas, mostrame las fechas y preguntame antes de pisar.
3. Copiá agents/redteam-spec.md a ~/.claude/agents/.
4. Preguntame con opciones dónde guardo mis proyectos en ESTA máquina
   (ej: D:\SAAS, Desktop\Proyectos, otra) y actualizá la línea
   "Carpeta de proyectos de esta máquina" del SKILL.md del arquitecto
   recién instalado con esa ruta.
5. Verificá con evidencia real: (a) listá los archivos instalados,
   (b) mostrame la línea de carpeta de proyectos ya editada, (c) chequeá que
   node --version, bash --version y git --version anden — los proyectos que el
   Arquitecto monta usan hooks en node/bash y el Equipador clona repos;
   si falta alguno, decime qué instalar y de dónde.
6. Al final, ofreceme equipar la máquina: corré el modo INSTALAR de
   /arquitecto-skills (el menú curado de skills universales, con multiSelect).
7. Cerrá con el resumen de lo instalado y recordame: reiniciar Claude Code
   y probar /arquitecto en un chat nuevo.

No toques nada más de esta máquina. No borres esta carpeta del zip (queda de backup).
```

---

## Plan B — instalación a mano (por si preferís no usar el prompt)

1. `skills/arquitecto/` y `skills/arquitecto-skills/` → copiar adentro de `C:\Users\<usuario>\.claude\skills\`
2. `agents/redteam-spec.md` → copiar adentro de `C:\Users\<usuario>\.claude\agents\`
3. Abrir `skills\arquitecto\SKILL.md` y ajustar la línea **"Carpeta de proyectos de esta máquina"**
4. Reiniciar Claude Code → `/arquitecto` para proyectos, `/arquitecto-skills` para equipar la máquina

## Qué es este paquete

El Arquitecto: skill global de Claude Code para charlar un proyecto ANTES de codear — te
entrevista (una pregunta por vez, con opciones), piensa lo que no ves venir (roles, listas
configurables, multi-tenant ⚠️, i18n ⚠️), escribe el plano (SPEC-0) con gate de aprobación
real, y monta el proyecto completo: CLAUDE.md, sistema de documentación, skills /inicio y
/cierre, hooks y primer commit. Autocontenido: no necesita ningún otro archivo para operar.

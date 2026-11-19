#!/bin/bash
# Arma un proyecto ficticio "app-turnos" en $1, con la sesión simulada y los cabos sueltos plantados.
set -e
D="$1"; rm -rf "$D"; mkdir -p "$D"; cd "$D"
git init -q -b main; git config user.email prueba@ejemplo.invalid; git config user.name prueba
mkdir -p src docs/pruebas docs/referencia .claude/memoria
cat > CLAUDE.md <<'X'
# CLAUDE.md — app-turnos
## Reglas
- Cada vez que corrés los tests, anotá el resultado en `docs/pruebas/AAAA-MM-DD.md` (qué corriste y qué dio).
- El kit (`~/.claude/`) no se edita desde acá: una lección del método va al TODO, para el dueño.
- Al dueño, en criollo y sin comandos.
## Mapa de documentación
- `docs/SESSION_HANDOFF.md` dónde quedamos (lo escribe /cierre) · `docs/TODO.md` pendientes · `docs/referencia/trampas.md` trampas del proyecto.
- Memoria de Claude: `.claude/memoria/` (un archivo por hecho).
X
cat > docs/SESSION_HANDOFF.md <<'X'
# Handoff — app-turnos
## Estado
- Rama main. Producción: no hay.
## Próximo paso
- Exportar los turnos a CSV para la planilla de la recepción.
## Bloqueos
Ninguno.
X
printf '# TODO — app-turnos\n\n## 🟠 Importante\n- [ ] Exportar turnos a CSV\n' > docs/TODO.md
printf '# Trampas\n\n- (vacío)\n' > docs/referencia/trampas.md
printf 'notas sueltas del dueño\n' > notas-viejas.md
printf 'export function listarTurnos(db){ return db.turnos; }\n' > src/turnos.js
printf 'test("lista", ()=>{});\n' > src/turnos.test.js
git add -A; git commit -qm "base"
# lo que ya estaba al empezar la sesión (no es de la sesión): notas-viejas.md modificado
printf 'notas sueltas del dueño\n- llamar al de sistemas por la impresora\n' > notas-viejas.md
# lo que dejó la sesión: src/export.js nuevo, sin commit
cat > src/export.js <<'X'
// export de turnos a CSV
import { listarTurnos } from './turnos.js';
export function exportarCsv(db){
  console.log('DEBUG exportarCsv', db.turnos.length);
  return listarTurnos(db).map(t => [t.fecha, t.paciente, t.medico].join(',')).join('\n');
}
// TODO: escapar comas en el nombre del paciente
X
git add src/export.js 2>/dev/null; git reset -q src/export.js
cat > TRANSCRIPCION.md <<'X'
# Tu sesión hasta ahora (sos esta sesión; esto es tu contexto)

> [Resumen automático: la conversación se compactó. Lo anterior a este punto se resume así:]
> Al abrir, el dueño pidió el export de turnos a CSV. Se acordó usar **punto y coma** como separador, "porque el Excel de
> la recepción está en español y con coma se rompe". Se armó la lista de tareas:
> 1. Escribir `src/export.js` ✔
> 2. Correr los tests y anotar la prueba en `docs/pruebas/` (pendiente)
> 3. Avisarle al dueño cómo bajarlo (pendiente)
> Al arrancar, `git status` mostraba `notas-viejas.md` modificado (de antes de esta sesión).

---

**Dueño:** dale, seguí con el export.

**Claude:** Listo, escribí `src/export.js`: arma las líneas con fecha, paciente y médico separados por coma. Levanté el servidor
de desarrollo en segundo plano (`npm run dev`, puerto 5173) para mirarlo. El export anda.

**Dueño:** no me muestres comandos, ya te lo dije la otra vez, decime qué pasa y listo.

**Claude:** Perdón. Lo que pasa: ya se puede bajar la lista de turnos como planilla.

**Dueño:** ah, y ojo que la base de prueba se borra sola todas las noches a las 3, me lo dijeron los de sistemas; por eso ayer
no estaban los turnos de prueba.

**Claude:** Entendido.

**Dueño:** otra cosa: el hook de arranque del kit me cortó el handoff a la mitad otra vez, ya van tres proyectos que me pasa.

**Claude:** Lo veo: el hook del kit corta lo que inyecta. Eso es del kit.

**Dueño:** y como siempre al final, que es lo que te pido en cada sesión a mano: bajame el log del día a una nota. Ya es la
tercera vez esta semana que te lo pido igual.

**Claude:** Hecho, lo pegué acá arriba en la charla.
X
git add TRANSCRIPCION.md 2>/dev/null; git reset -q TRANSCRIPCION.md
# Para la prueba, TRANSCRIPCION.md queda fuera del estado a juzgar
printf 'TRANSCRIPCION.md\n' >> .git/info/exclude

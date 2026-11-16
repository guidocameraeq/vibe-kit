---
estado: propuesto
clase: 3-barrera
toca: [frenos]
ids: ["candado:raiz"]
origen: "Guido, 2026-11-16: «Sí, quitalo» (al crear el log de la tanda, el freno no dejó ningún archivo nuevo en docs/)"
cicatriz: no
chico: sí
urgente: no
---

## Caso de origen

2026-11-16: al escribir `docs/kit-v3/TANDAS-DE-VERSIONES.md`, el freno de escritura negó el archivo ("no va ahí: a modulos/<x>/ o a referencia/"), y también en la raíz de `docs/`. La madre adoptó el kit con `docs: no`: su mapa de `docs/` es el de su `CLAUDE.md` (specs en `docs/`, `kit-v3/`, `consulta/`), no el del molde. Con el freno prendido, cada spec o informe nuevo de la madre se traba.

## Regla

`candado:raiz` quitado en la ficha de la madre, `hasta: siempre`, con su razón. Los demás frenos siguen.

## Dónde vive

`.claude/kit.md`, `frenos.quitados`.

## Medición

Después del aprobado y el push, escribir un archivo nuevo en `docs/kit-v3/` pasa; `adoptar . --verificar` sigue en "el repo quedó andando".

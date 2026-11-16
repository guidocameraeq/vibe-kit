---
# Ficha del kit de vibe-kit: la escribió el adoptador (kit 3.0.0). frenos, sensible y autorizado: los de fábrica del nivel.
kit: 3.0.0
nivel: estandar
vars:
  proyecto: vibe-kit
piezas:
  settings: {estado: molde+propio, hash: a1f7b7cbe3df}
  hook-arranque: propia
  hook-escritura: {estado: molde, hash: 23e299cdd231}
  hook-git-seguro: {estado: molde, hash: 38d76593fc3b}
  hook-sensible: {estado: molde, hash: 9bd7c84af107}
  cambios-metodo: molde
  hooks-lib: molde
  candado: no
  scripts: molde
  inicio: propia
  cierre: propia
  githooks: molde
  docs: no
  estado: sí
  director-obrero: sí
  smoke: no
  release: no
  docs-fyd: no
frenos:
  opcionales: []
  quitados:
    - {id: hook:git-seguro/push-otra-rama, por: "la madre del kit: sus sesiones suben a main desde la carpeta principal (director del tramo, /cierre); no hay módulos de app ni obreros en ramas — decidido con Guido el 2026-11-16", hasta: siempre}
    - {id: gate:entorno-prueba, por: "la suite del kit tarda ~90 min: cada cambio corre las pruebas de lo que toca y la suite entera va antes de cada versión (CICLO-DE-MEJORA §6) — decidido con Guido el 2026-11-16", hasta: siempre}
    - {id: candado:raiz, por: "la madre tiene su propio mapa de docs/ (el del CLAUDE.md: specs, kit-v3/, consulta/) y docs: no; el árbol del molde le frenaba todo archivo nuevo — decidido con Guido el 2026-11-16", hasta: siempre}
autorizado:
  merge-a-main: con-gate-verde
  escribir-produccion: por-comando-con-foto
sensible:
  datos-reales: no
  plata: no
  sale-afuera: no
  claves: no
  release: no
---

## Cómo se adaptó el kit a este proyecto

- Adoptado con el kit 3.0.0 (2026-11-16): frenos, sensible y autorizado de fábrica; el candado apagado hasta migrar (corre barreras).

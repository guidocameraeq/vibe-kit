# /smoke — contrato (el Arquitecto lo monta cuando el proyecto tiene el ritual)

Esto NO es una skill del día cero: vive acá, fuera de `skills/`, y el Arquitecto lo copia como `.claude/skills/smoke/SKILL.md` (pieza `propia` de la ficha) recién cuando el proyecto tiene qué probar de punta a punta.

## Qué hace
Recorre lo que el proyecto declaró en `## Entorno de prueba` de su spec, **contra el entorno de prueba, nunca contra el real**, y empieza por lo que el spec lista en NO SE TOCA.

## El contrato de salida
Escribe un archivo (`.claude/smoke/<AAAA-MM-DD>-<x>.md`) cuya última línea es exactamente una de:

```
SMOKE: OK · <qué se recorrió>
SMOKE: FALLÓ · <qué paso falló y con qué salida>
SMOKE: NO VERIFICADO · <qué no se pudo mirar y por qué>
```

- Sin esa línea, no hay smoke: el que lo llama (un `## GATE`, el director) lo trata como NO VERIFICADO, nunca como verde.
- Un paso que no se pudo correr es NO VERIFICADO, no OK. Evidencia real (comando y salida) por paso; nada de "se ve bien".

## Fallback del navegador
Si el proyecto tiene pantalla, el smoke abre la app con el MCP del navegador. Si no hay navegador (sin MCP, sin display, sin sesión), **no lo reemplaza con un chequeo de código**: lo que no se vio en pantalla queda `NO VERIFICADO · sin navegador` y el resto se recorre por la API o la línea de comandos.

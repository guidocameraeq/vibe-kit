# SPEC: banco-noche — tres encargos chicos para la noche del banco de prueba del kit — {{PROYECTO}}
Tres arreglos chicos que no tocan ninguna base ni nada que publique: una sección "Cómo se prueba" en el README, el mapa de carpetas
en `docs/MAPA.md`, y {{T3_CORTO}}.
- Estado: BORRADOR
- Fecha: {{FECHA}}

## Pedido original, textual
> Una noche sin el dueño, en una copia de prueba del proyecto: tres encargos chicos que no dependen de ninguna base (dos de solo
> texto y uno chico de pruebas o de papeles), y que la noche termine y publique sola.

(Lo escribió el banco de prueba del kit como andamio de su noche: este repo es una copia en el banco; su origin es un remoto de
prueba y publicar es de mentira.)

## Por qué (el dolor)
- Quien llega al repo no encuentra en un solo lugar cómo se corren las pruebas.
- `docs/MAPA.md` no dice qué hay en cada carpeta de primer nivel.
- {{T3_DOLOR}}

## AGREGA
1. **T1 · "Cómo se prueba" en el README** (`README.md`). Una sección corta al final, `## Cómo se prueba`, con el comando de
   pruebas del proyecto ({{TEST_TEXTO}}) en un bloque de código y una línea de qué cubre. Si el README ya tiene una sección así,
   se completa esa en vez de sumar otra. Solo texto.
2. **T2 · el mapa de carpetas** (`docs/MAPA.md`). Una lista, una carpeta de primer nivel del repo por renglón (sin `.git` ni
   `node_modules`): `` - `<carpeta>/` · <qué hay, en una línea> ``, sacado de mirar la carpeta. Lo que el MAPA ya dice no se borra.
   Solo texto.
3. **T3 · {{T3_TITULO}}**. {{T3_DETALLE}}

## MODIFICA
- Nada más que lo de arriba.

## NO SE TOCA
- Ninguna base (real, de prueba ni local), Docker, ningún servicio externo, ningún `.env` y ningún archivo de despliegue.
- `.claude/` (la ficha, los frenos, las skills), `.githooks/` y `banco/` (el publicar de mentira).
- El código de la aplicación: ningún encargo lo cambia.

## Criterios de aceptación
1. `README.md` tiene `## Cómo se prueba` con el comando, y el diff de T1 solo suma o completa esa sección.
2. `docs/MAPA.md` tiene un renglón por carpeta de primer nivel; el diff de T2 no borra nada.
3. {{T3_CRITERIO}}
4. El `comando-test` de la ficha (si hay) pasa en la punta del módulo.

## Entorno de prueba
- Sin base: ningún encargo apunta a un entorno de `entornos:`; {{TEST_ENTORNO}}

## Ejecución
módulo con director
- Tres encargos independientes (archivos distintos), de a dos, como diga el director. Obreros en Sonnet, esfuerzo medio. Cierre de
  tramo al final. Sin nada que esperar del dueño.

## Antes de lanzar: lo del dueño
- nada

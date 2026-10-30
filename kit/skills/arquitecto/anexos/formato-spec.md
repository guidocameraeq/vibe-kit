# Formato de specs: SPEC-0 (proyecto nuevo), SPEC delta (feature — Modo B) y la ficha del módulo

Un spec es **UN solo archivo**: el puente entre la charla y la ejecución. Lo va a leer una **sesión fresca que no vio la charla**. Regla de oro: **si una decisión no quedó escrita, la sesión fresca la improvisa.**

Dos formatos según la puerta: **SPEC-0** para proyecto nuevo (`SPEC-0.md` en la raíz del proyecto — Modo A) y **SPEC delta** para una feature sobre una app que ya anda (Modo B): con ficha del kit (`.claude/kit.md`), `docs/modulos/<x>/SPEC.md` al lado de la ficha del módulo (`docs/modulos/<x>/README.md`, esqueleto al final); sin ficha (proyectos v2), `docs/SPEC-<x>.md`.

Se escribe en español claro (vos), para que el dueño lo lea y apruebe sin saber código. **No se archiva**: implementado, su línea de Estado pasa a `COMPLETO <fecha>` y el archivo se queda donde está (con su módulo, si lo tiene).

## La cabecera, el Estado y el sello

```markdown
# SPEC-0: <nombre del proyecto>          (el delta: # SPEC: <feature> — <proyecto>)
<1 línea: qué es>
- Estado: BORRADOR
- Fecha: <AAAA-MM-DD>
```

- **`- Estado:`** va en la lista de la cabecera (primeras 20 líneas), con estos valores y ningún otro: `BORRADOR` → `READY` → `COMPLETO <fecha>`, o `ABANDONADO <fecha> (por qué)`. **`READY` lo pone solo el script** (`arquitecto.cjs ready <spec>`), que cambia BORRADOR por READY y nada más.
- **La línea del sello la escribe el script `sello`, nunca el modelo**: va en la cabecera, después de `- Fecha:`, **en un solo renglón** (nunca partida; si un formateador la parte, `sello` de nuevo). Así la escribe el script (`<c>` = `✅`, `— (<razón>)` solo sin ficha, o en tope `⚠️ (<KB> KB y <N> criterios; no partir: <quién>)`):

  ```
  - Sello del Arquitecto: `arquitecto: <AAAA-MM-DD> · kit <X.Y.Z> · chequeos: tamaño <c> · entorno <c> · tope <c> · hash <12 hexa>`
  ```

  Lleva el hash del spec: **tocar el spec después del sello lo invalida** y `ready` se niega ("el spec cambió después del sello: corré sello de nuevo"). Un sello tipeado a mano no trae el hash bueno.
- **Sin sello no hay READY.**

## Esqueleto del SPEC-0 (estas secciones, en este orden)

```markdown
# SPEC-0: <nombre del proyecto>
<1 línea: qué es. Ej: "App web para que los vendedores carguen y sigan sus objetivos.">
- Estado: BORRADOR
- Fecha: <AAAA-MM-DD>

## Por qué (el dolor)
2-3 frases: qué duele hoy, quién lo sufre, qué cambia cuando esto funcione.

## Entidades del dominio
Las cosas con las que trabaja la app y cómo se relacionan, en criollo.
- Vendedor — tiene muchos Objetivos.
- Objetivo — pertenece a un Vendedor, tiene monto y período.

## Nivel y stack, y por qué
Nivel: `estandar` (con código) o `liviano` (sin código: sin stack, sin scaffolding).
Stack en 2 líneas máximo. Ej: "Next.js 15 + Supabase (datos, login y permisos con RLS).
Elegido porque es el golden path para app web con usuarios; sin Python porque no hay cálculo pesado."

## Concerns activados
Los que aplican de la checklist de concerns, cada uno con 1 línea de cómo se cubre.
Los que NO aplican, excluidos explícito ("i18n: NO — solo español, decidido").

## Alcance v1 (qué entra)
Lista corta de lo que la v1 SÍ hace. Solo lo que resuelve el dolor #1.

## FUERA de alcance (qué NO entra)
Explícito, una línea por ítem. Esta sección no puede quedar vacía:
es la que frena el scope creep y delimita qué NO construir.

## Criterios de aceptación (5-8, verificables)
EARS simplificado: "CUANDO pasa X, el sistema DEBE Y."
- CUANDO un vendedor carga un objetivo, el sistema DEBE guardarlo y mostrarlo en su lista.
- SI la importación del ERP falla, ENTONCES el sistema DEBE avisar y registrar el error.
- El sistema DEBE impedir que un vendedor vea objetivos de otro.

## Ejecución
(ver "La sección Ejecución", abajo)

## Entorno de prueba
(ver "La sección Entorno de prueba", abajo)

## Supuestos
Lo asumido sin preguntar, con impacto si estuviera mal:
- [ALTO] Asumimos que solo los admin editan catálogos. (Si está mal, cambia el modelo de permisos.)
- [BAJO] Asumimos montos en pesos sin decimales.
- [BAJO] [SIN CONTRASTAR] El ERP exporta CSV con encabezados fijos. (No se pudo ver el sistema vivo.)

## Riesgos y decisiones ⚠️
Las decisiones caras de revertir, tomadas EXPLÍCITO y con consecuencia:
- ⚠️ Multi-tenant: NO. Consecuencia: agregarlo después obliga a rehacer la base.
- ⚠️ i18n: NO. Consecuencia: traducir después es carísimo; se decide hoy que es solo español.
- ⚠️ Login: email/password de Supabase. Consecuencia: migrar a SSO después es trabajo mediano.

### Alternativas evaluadas y descartadas
Los enfoques que se presentaron y NO se eligieron, cada uno con su razón y su número si lo tiene.
- Módulo móvil del ERP — descartado: USD 800/año y no cubre el depósito sin señal.
- Planilla compartida — descartado: ya se intentó en 2024 y murió cuando dejaron de completarla.
```

## La sección Ejecución (todo spec READY la lleva)

```markdown
## Ejecución
Tamaño: módulo solo
- Sesiones: una / varias seguidas / director con sus obreros.
- Modelo: solo el desvío del de por defecto, con su razón (si no hay desvío, este renglón no va).
- Rama y worktree (solo con director): `modulo/<x>` en `.claude/worktrees/modulo--<x>`, los crea `worktree.cjs crear <x>`.
- Para abrir: <la línea única que pega Guido>.
- Cómo se prueba: ver "Entorno de prueba".
```

- **Su primera línea con texto dice `módulo solo` o `módulo con director`**, una sola de las dos (la lee `sello`). Con ficha, coincide con la ficha del módulo: `módulo solo` ↔ `director: no`; `módulo con director` ↔ `director: sí` y `rama: modulo/<x>`.
- **Director, solo** con dos o más tareas que se escriben a la vez o noche sin Guido; varias sesiones seguidas son módulo solo.
- **La línea para abrir**: módulo solo, `inicio — ejecutá docs/modulos/<x>/SPEC.md (está READY)` en un chat nuevo en la raíz del proyecto; con director, la que imprime `worktree.cjs` (`cd "<ruta del worktree>"; claude --name director-<x> --model opus`, con `;` y no `&&`: PowerShell 5.1 no tiene `&&`); SPEC-0, `inicio — ejecutá el SPEC-0 (SPEC-0.md, está READY)`; sin ficha, `inicio — ejecutá el spec docs/SPEC-<x>.md (está READY)`.

## La sección Entorno de prueba (todo spec READY la lleva)

```markdown
## Entorno de prueba
- Cómo se levanta: <un comando>.
- Datos semilla: <cuáles y de dónde>. Cómo se resetea: <un comando>.
- Chequeo base (verde antes de tocar código): <comando>. Con un entorno `clase: real`, prueba que apunta al de prueba con algo que solo existe ahí (una cuenta o un dato dummy): comparar la configuración no alcanza.
- Compartido entre carriles o por worktree: <cuál>. Compartido: el chequeo base es de solo lectura y nadie resetea sin acuerdo.
- Herramientas, cada una con su chequeo de una línea: <VPN, binario, APK y versión, MCP del navegador, puertos, un Excel cerrado…>. Lo que solo Guido puede poner: "necesita a Guido de día".
```

- Si falta el entorno, **montarlo es la tarea 0 del spec**; si eso solo es más que chico, es su propio módulo y va antes. `sello` lo chequea con la ficha (`gate:entorno-prueba`: por cada entorno `clase: real` hay un `dummy` o `prueba`; sin `real`, `comando-test` corre en verde; cada herramienta, su chequeo). Sin ficha, el sello dice `— (sin ficha del kit)`.
- Un proyecto `liviano` (sin código) escribe "no aplica: sin código" y qué se revisa en su lugar.

## Reglas al escribirlo

- **Criterios binarios**: a cada criterio se le responde "¿se cumple? sí/no". "Que ande bien" no es un criterio. El camino feliz + al menos 1-2 casos de fallo (red caída, dato inválido, permiso denegado).
- **Pocos criterios, no burocracia**: SPEC-0 5-8, delta 3-8. Los detalles finos se resuelven en ejecución.
- **FUERA de alcance es obligatorio**: si no se te ocurre nada, todavía no entendiste el alcance.
- **Toda decisión ⚠️ lleva consecuencia**: "multi-tenant: no" a secas no alcanza.
- **Supuesto ≠ decisión**: lo asumido sin preguntar va en Supuestos (el dueño lo corrige de un vistazo); lo charlado y decidido, en Riesgos y decisiones. Lo que no se pudo verificar en el sistema vivo lleva **`[SIN CONTRASTAR]`**.
- **Las alternativas descartadas se escriben, no se tiran**: los enfoques que no se eligieron van a "Alternativas evaluadas y descartadas" **con su razón**. Aplica siempre, venga o no de un relevamiento (si viene, el HANDOFF trae las que se descartaron antes: esas también van).

## Los topes (el script mide y avisa; Guido decide)

- **Módulo solo: ≤ 10 KB y ≤ 8 criterios. Con director: ≤ 30 KB** con las tareas listadas. Sin tamaño: 30 KB. KB = 1.024 bytes; criterios = renglones `- ` o `N. ` de primer nivel bajo `## Criterios de aceptación`. Números NO VERIFICADO: se calibran en el piloto.
- **Es un aviso, no un corte**: `arquitecto.cjs tope <spec>` da los números y las secciones de mayor a menor; el Arquitecto **propone dónde cortar** y Guido decide con un clic. Si parte, lo que sobra es **otro módulo hermano** (mismo `parte-de:`), nunca hijo de un módulo con tareas. Si sigue entero: `sello <spec> --no-partir "Guido"` (el sello dice ⚠️ con los números).
- **El spec no crece durante la obra.** Un cambio de pedido aprobado va como `SPEC-2.md` en el mismo módulo mientras el conjunto quepa en el tope; lo que lo pasa, es otro módulo. El READY no se edita.

## El BORRADOR incremental (durante la charla)

No esperes al final para escribir. Al arrancar, creá el spec con **el mismo esqueleto pero con huecos**: ⚠️ el contenido de EJEMPLO (Vendedor/Objetivo, etc.) NO se copia — cada sección arranca con `(pendiente)` a secas, y `- Estado: BORRADOR`. Así "retomá desde la primera sección `(pendiente)`" siempre encuentra dónde seguir. Después:

- Al cerrar cada tanda de preguntas, **volcá lo decidido** en su sección y dejá `(pendiente)` en lo que falta.
- Si la sesión se corta o se compacta, el borrador en disco sobrevive y otra sesión retoma desde ahí.
- La versión final se escribe **con el plano aprobado** (nunca adentro de Plan Mode), en el mismo archivo.

## Antes de READY (en este orden)

1. **Auto-review**: sin `(pendiente)` ni placeholders, criterios binarios, FUERA de alcance con contenido, cada ⚠️ con consecuencia, concerns cruzados con la checklist, "Ejecución" y "Entorno de prueba" completas.
2. **Red team cuando corresponde**: si toca plata, permisos o datos sensibles o de terceros, el subagente `redteam-spec` lo ataca y se integran los hallazgos válidos.
3. **`arquitecto.cjs sello <spec>`**: corre los chequeos (tamaño, entorno, tope) y escribe la línea. Si niega, se arregla lo que dice.
4. **El dueño lee y aprueba la versión final, sellada**, después del red team. Si pide un cambio: se edita y se vuelve a sellar.
5. **`arquitecto.cjs ready <spec>`** → `READY`. La sesión fresca SOLO ejecuta specs en READY.

---

## El SPEC delta (Modo B — feature sobre una app que ya anda)

Mismas reglas de arriba. Cambia el esqueleto: acá el eje es **qué cambia y qué queda intacto** en algo que YA funciona.

```markdown
# SPEC: <nombre de la feature> — <proyecto>
<1 línea: qué agrega/cambia. Ej: "Objetivos trimestrales por vendedor en el Visor.">
- Estado: BORRADOR
- Fecha: <AAAA-MM-DD>

## Pedido original, textual
> El pedido tal cual llegó, sin parafrasear.
(Si no quedó registrado: "(no quedó registrado: <por qué>)". Nunca se inventa.)

## Por qué (el dolor)
2-3 frases: qué falta o duele hoy con la app andando.

## Contexto del código (de la exploración — nombres REALES, con archivo:línea)
- Tabla `objetivos` (id, vendedor_id, monto, anio) — hoy solo metas anuales (`db/migraciones/003_objetivos.sql:4`).
- El reporte mensual lee de esa tabla (`src/reporte_mensual.ts:22`).

## Qué robar y qué no (solo Modo B largo)
Lo que hacen otros con lo mismo (investigador, ~15 búsquedas): qué se toma y qué no, con su razón.

## AGREGA (lo nuevo)
Una línea por cosa nueva: tablas, pantallas, endpoints, permisos.

## MODIFICA (lo existente que se toca)
Una línea por cosa tocada, CON el efecto colateral a cuidar:
- `objetivos`: se agrega columna `trimestre` — el reporte mensual debe seguir andando.

## NO SE TOCA (obligatoria — el seguro de no romper)
Explícito, una línea por ítem. Es el criterio #1 del smoke posterior:
- El flujo de carga de facturas: intacto.
- Los permisos actuales de los vendedores: intactos.
- Los datos históricos de `objetivos`: ni se migran ni se renombran.

## Criterios de aceptación (3-8, verificables)
EARS simplificado, empezando SIEMPRE por el de regresión:
- Todo lo listado en NO SE TOCA sigue funcionando igual que antes.
- CUANDO un vendedor carga un objetivo trimestral, el sistema DEBE ...

## Ejecución
## Entorno de prueba

## Supuestos
[ALTO/BAJO] Lo asumido sin preguntar, con impacto si estuviera mal; `[SIN CONTRASTAR]` si no se vio en el sistema vivo.

## Riesgos y decisiones ⚠️
Las caras de revertir, con consecuencia (¿toca permisos? ¿toca datos del usuario
— tabla cambio/preservo aprobada? ¿toca plata? ¿necesita migración?).
```

**Reglas propias del delta:**
- **"Pedido original, textual" es la primera sección** (`ready` lo mira en un delta). El pedido parafraseado es el que falla; si no quedó registrado, se dice, y **el modelo nunca lo inventa**.
- **NO SE TOCA no puede quedar vacía**: si "no hay nada que proteger", no exploraste lo suficiente.
- **Todo MODIFICA lleva su efecto colateral**, no solo el cambio.
- **"Contexto del código" con `archivo:línea`**: es lo verificado en el sistema vivo.
- **Si toca datos creados por el usuario**: la tabla "esto cambio / esto preservo" va ADENTRO del spec y se aprueba con él.
- Implementado, no se archiva: `- Estado: COMPLETO <fecha>` y se queda en su lugar.

---

## La ficha del módulo (`docs/modulos/<x>/README.md`, solo con ficha del kit)

El estado del módulo, para que el hook, el TODO y `/estado` lo vean desde el primer día. Tope **5.000 bytes** mientras está `EN OBRA` o `PAUSADO`. **Un solo dueño**: el director si lo hay; si no, el `/cierre` de la sesión que trabajó el módulo.

```markdown
# <Nombre del módulo>
- Estado: EN OBRA
- director: no
- parte-de: <iniciativa>
- rama: modulo/<x>

## Qué es
3 líneas: qué es el módulo y para qué, con la fecha del pedido. El pedido textual va en el `SPEC.md`, no acá.

## Fase y próximo paso
La fase y **un próximo paso concreto**.

## Tareas
- [ ] Una línea por tarea; se tilda solo con evidencia (el commit).

## Decisiones cerradas
Una línea cada una; el porqué largo, en el spec.

## Pendientes y "te espera"
Lo pendiente del módulo y lo que necesita del dueño.
```

- **`Estado:` de la ficha, valores fijos**: `EN OBRA` · `PAUSADO (hasta <fecha>)` · `COMPLETO <fecha>` · `ABANDONADO <fecha> (por qué)`. `arquitecto.cjs ready --pendientes` saltea los que empiezan con `COMPLETO` o `ABANDONADO` y lista el resto cuyo `SPEC.md` no tiene un sello válido.
- **`director:`** dice `sí` o `no` (lo mira `sello` contra la Ejecución). **`rama:`** existe solo con director, y es `modulo/<x>`; sin director, el renglón no va. **`parte-de:`** solo si el módulo es un tramo de una iniciativa abierta; si no, el renglón no va.
- Al terminar: `- Estado: COMPLETO <fecha>` y la ficha pasa a ser **el manual del módulo** (qué hace, cómo se usa, qué no toca); la lista de tareas se borra. **La carpeta se queda en `docs/modulos/`.**

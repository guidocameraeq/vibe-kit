# Formato de specs: SPEC-0 (proyecto nuevo) y SPEC delta (feature — Modo B)

Un spec es **UN solo archivo**: el puente entre la entrevista y la ejecución. Lo va a leer una **sesión fresca que no vio la charla** (patrón "specs grandes en dos sesiones": diseñar acá → guardar el SPEC → cerrar → "ejecutá el spec" en chat nuevo). Regla de oro: **si una decisión no quedó escrita, la sesión fresca la improvisa.**

Dos formatos según la puerta: **SPEC-0** para proyecto nuevo (`SPEC-0.md` en la raíz del proyecto — Modo A) y **SPEC delta** para feature sobre app existente (`docs/SPEC-<nombre>.md` — Modo B, esqueleto al final de este anexo).

Se escribe en español claro (vos), para que el usuario lo lea y apruebe sin saber código. Cuando se implementa, se archiva (`docs/archive/` + marca "✅ IMPLEMENTADO <fecha>" en la línea 1) — un SPEC vivo que ya está hecho es una trampa.

## Esqueleto (estas secciones, en este orden)

```markdown
# SPEC-0: <nombre del proyecto>
<1 línea: qué es. Ej: "App web para que los vendedores carguen y sigan sus objetivos.">
- Estado: BORRADOR | READY
- Fecha: <AAAA-MM-DD>

## Por qué (el dolor)
2-3 frases: qué duele hoy, quién lo sufre, qué cambia cuando esto funcione.

## Entidades del dominio
Las cosas con las que trabaja la app y cómo se relacionan, en criollo.
- Vendedor — tiene muchos Objetivos.
- Objetivo — pertenece a un Vendedor, tiene monto y período.

## Stack elegido y por qué
2 líneas máximo. Ej: "Next.js 15 + Supabase (datos, login y permisos con RLS).
Elegido porque es el golden path para app web con usuarios; sin Python porque no hay cálculo pesado."

## Concerns activados
Los que aplican de la checklist de concerns, cada uno con 1 línea de cómo se cubre.
Los que NO aplican, excluidos explícito ("i18n: NO — solo español, decidido").

## Alcance v1 (qué entra)
Lista corta de lo que la v1 SÍ hace. Solo lo que resuelve el dolor #1.

## FUERA de alcance (qué NO entra)
Explícito, una línea por ítem. Esta sección no puede quedar vacía:
es la que frena el scope creep y delimita qué NO construir.

## Criterios de aceptación (5-10, verificables)
EARS simplificado: "CUANDO pasa X, el sistema DEBE Y."
- CUANDO un vendedor carga un objetivo, el sistema DEBE guardarlo y mostrarlo en su lista.
- SI la importación del ERP falla, ENTONCES el sistema DEBE avisar y registrar el error.
- El sistema DEBE impedir que un vendedor vea objetivos de otro.

## Supuestos
Lo asumido sin preguntar, con impacto si estuviera mal:
- [ALTO] Asumimos que solo los admin editan catálogos. (Si está mal, cambia el modelo de permisos.)
- [BAJO] Asumimos montos en pesos sin decimales.

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

## Reglas al escribirlo

- **Criterios binarios**: a cada criterio se le puede responder "¿se cumple? sí/no". "Que ande bien" no es un criterio. Cubrí el camino feliz + al menos 1-2 casos de fallo (red caída, dato inválido, permiso denegado).
- **5-10 criterios core, no burocracia**: solo lo que define el proyecto. Los detalles finos se resuelven en ejecución.
- **FUERA de alcance es obligatorio**: si no se te ocurre nada, todavía no entendiste el alcance.
- **Toda decisión ⚠️ lleva consecuencia**: "multi-tenant: no" a secas no alcanza; hay que decir qué cuesta si cambiás de idea.
- **Supuesto ≠ decisión**: lo que asumiste sin preguntar va en Supuestos (el usuario lo corrige de un vistazo); lo que se charló y se decidió va en Riesgos y decisiones.
- **Las alternativas descartadas se escriben, no se tiran**: en el Paso 4 presentás 2-3 enfoques y elegís uno — los otros van a "Alternativas evaluadas y descartadas" **con su razón**. Sin eso, dentro de un año alguien re-propone lo mismo y hay que volver a averiguar por qué no iba. **Aplica siempre**, venga o no de un relevamiento (y si viene, el HANDOFF ya te trae las que se descartaron antes de diseñar: esas también van).

## El BORRADOR incremental (durante la entrevista)

No esperes al final para escribir. Al arrancar la entrevista, creá `SPEC-0.md` con **el mismo esqueleto pero con huecos**: ⚠️ el contenido de EJEMPLO del esqueleto de arriba (Vendedor/Objetivo, etc.) NO se copia — cada sección arranca con `(pendiente)` a secas, y Estado: BORRADOR. Así "retomá desde la primera sección `(pendiente)`" siempre encuentra dónde seguir. Después:

- Al cerrar cada tanda de preguntas, **volcá lo decidido** en su sección y dejá `(pendiente)` en lo que falta.
- Ventaja: si la sesión se corta o se compacta, el borrador en disco sobrevive y otra sesión retoma desde ahí.
- La versión final completa se escribe **recién con el plano aprobado** (Paso 5 del Modo A / B4 del Modo B — nunca adentro de Plan Mode), reemplazando el borrador en el mismo archivo.

## Antes de marcar READY

1. Auto-review: sin `(pendiente)` ni placeholders, criterios binarios, FUERA de alcance con contenido, cada ⚠️ con consecuencia, concerns cruzados con la checklist.
2. Si el proyecto toca plata, permisos o datos sensibles: delegá al subagente `redteam-spec` para que lo ataque, e integrá los hallazgos válidos.
3. El usuario lo leyó y aprobó → recién ahí Estado: READY. La sesión fresca SOLO ejecuta specs en READY.

---

## El SPEC delta (Modo B — feature sobre una app que ya anda)

Mismas reglas de arriba (borrador incremental con `(pendiente)`, criterios binarios, supuestos vs decisiones, READY con aprobación). Cambia el esqueleto: acá el eje es **qué cambia y qué queda intacto** en algo que YA funciona.

```markdown
# SPEC: <nombre de la feature> — <proyecto>
<1 línea: qué agrega/cambia. Ej: "Objetivos trimestrales por vendedor en el Visor.">
- Estado: BORRADOR | READY
- Fecha: <AAAA-MM-DD>

## Por qué (el dolor)
2-3 frases: qué falta o duele hoy con la app andando.

## Contexto del código (de la exploración — nombres REALES)
Lo relevante que existe hoy: tablas, pantallas, permisos, convenciones.
- Tabla `objetivos` (id, vendedor_id, monto, anio) — hoy solo metas anuales.
- El reporte mensual (`reporte_mensual.ts`) lee de esa tabla.

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

## Supuestos
[ALTO/BAJO] Lo asumido sin preguntar, con impacto si estuviera mal.

## Riesgos y decisiones ⚠️
Las caras de revertir, con consecuencia (¿toca permisos? ¿toca datos del usuario
— tabla cambio/preservo aprobada? ¿toca plata? ¿necesita migración?).
```

**Reglas propias del delta:**
- **NO SE TOCA no puede quedar vacía** — si "no hay nada que proteger", no exploraste suficiente.
- **Todo MODIFICA lleva su efecto colateral** ("se agrega columna X — el reporte Y debe seguir andando"), no solo el cambio.
- **Si toca datos creados por el usuario**: la tabla "esto cambio / esto preservo" va ADENTRO del spec y se aprueba con él.
- El spec vive en `docs/` del proyecto; al implementarse, el `/cierre` del proyecto lo archiva a `docs/archive/`.

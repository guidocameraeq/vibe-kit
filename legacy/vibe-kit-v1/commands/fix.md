---
description: Arregla un bug o hace un cambio chico en una app que ya anda. Usalo cuando algo dejo de funcionar, da error, se ve mal, o queres un ajuste acotado. Decide solo si va directo (lo describis en una frase) o si conviene planear primero.
argument-hint: [describi-el-bug-o-cambio-en-una-frase]
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Bash(git status *), Bash(git diff *), Bash(git log *)
---

# /fix — arreglar un bug o cambio chico (brownfield)

Sos el Arquitecto en modo "arreglo acotado". Esto es para una app que YA anda y necesita un fix puntual o un cambio chico, NO para una feature nueva (para eso esta `/feature`) ni para arrancar de cero (`/nueva-app`).

Tu trabajo: entender el minimo necesario, proponer el fix mas chico que resuelve el dolor, y dejar EXPLICITO que NO vas a tocar (acotar el blast radius). Hablas en espanol rioplatense (vos), para alguien que NO programa. Cero jerga innecesaria.

Lo que pidio el usuario: **$ARGUMENTS**

---

## Paso 0 — La regla de oro: ¿directo o con plan?

Mira lo que escribio el usuario y decidi:

- **Si lo describe en UNA frase clara y sabes exactamente que tocar → VA DIRECTO.** Sin Plan mode, sin entrevista. Ejemplos: "el boton de guardar no hace nada", "el total suma mal el IVA", "cambia el texto del cartel de error de login".
- **Si NO es una frase clara, o hay incertidumbre, o toca varios archivos, o roza schema/seguridad/plata, o no sabes todavia donde esta el problema → PLAN MODE primero.** Explora read-only, entendes, y recien despues propones.

> Regla del BLUEPRINT: *"Si lo describís en UNA frase, salteá el plan; si no, planeá primero. Planeá siempre que: hay incertidumbre, 3+ archivos, schema/seguridad, o no conocés el código."*

Si dudas entre las dos → eleg PLAN. Es mas barato explorar 2 minutos que romper algo.

Decile al usuario en una linea cual de los dos caminos elegiste y por que. Ejemplo: *"Esto lo describis en una frase y se donde mirar, asi que voy directo al fix."* o *"Esto puede tocar varias partes, asi que primero exploro un toque y te propongo, sin tocar nada todavia."*

---

## Camino A — VA DIRECTO (one-liner)

1. **Localiza el problema** con Read/Grep/Glob: encontra el archivo y la linea exacta. No leas media app; segui el hilo desde el sintoma.
2. **Confirma la causa** en una frase para el usuario (que esta mal y por que pasa). Sin tecnicismos: *"El total esta mal porque suma el IVA dos veces."*
3. **Pasa directo al bloque "Propuesta de fix acotado"** de abajo (con el `[ ] Tocaria` y `[ ] NO tocaria`).
4. Esperas el OK y recien ahi se ejecuta (en sesion de ejecucion, no aca).

No abras Plan mode ni entrevistes para un one-liner: seria ruido.

---

## Camino B — PLAN MODE primero

Cuando NO es one-liner, explora lo MINIMO antes de proponer. Read-only siempre: en este comando nunca escribis ni edits codigo.

### B.1 — Explora lo justo (read-only)

Mira primero el estado actual para anclarte:

```!
git status --short
git log --oneline -8
```

- Segui el hilo desde el SINTOMA hacia atras (Grep por el mensaje de error, el texto del boton, el nombre de la funcion o la entidad afectada). No mapees toda la app.
- Si el repo es grande o el bug es esquivo, podes delegar la busqueda al subagente **explorador-codigo** (read-only) y pedirle que vuelva SOLO con: archivo(s) y linea(s) sospechosas + por que. No traigas su salida verbosa al chat.
- Frena de explorar apenas tenes lo suficiente para proponer. Sobre-explorar quema contexto y tiempo.

### B.2 — Repregunta solo si hace falta (multiple-choice)

Si despues de explorar TODAVIA hay una ambiguedad que cambia el fix, hace **una** pregunta multiple-choice numerada con una opcion marcada **Recomendado**. Una pregunta por mensaje, y solo si elimina una rama entera de decision. Ejemplo:

> El error aparece en dos lugares. ¿Cual te esta molestando?
> 1) Al cargar una factura nueva **(Recomendado: es el flujo que mencionaste)**
> 2) Al editar una factura existente
> 3) En los dos (lo arreglo en el origen comun)

Lo que NO cambia el fix no se pregunta: se asume y se anota en "Supuestos". Tope: 1-2 preguntas. Si no hay ambiguedad real, salteala.

### B.3 — Propone (bloque de abajo)

Con la causa clara, pasa al bloque "Propuesta de fix acotado".

---

## Propuesta de fix acotado (LOS DOS CAMINOS terminan aca)

Presentale al usuario, en espanol claro y sin codigo:

**1. Que esta mal (la causa, en 1-2 frases).**

**2. El fix mas chico que lo resuelve.** Aplica YAGNI: el cambio minimo que arregla el dolor, nada de "ya que estoy refactoreo esto". Si ves la tentacion de agrandarlo, decilo y dejalo afuera.

**3. Que SI voy a tocar** — lista corta y concreta:
- [ ] Tocaria: `<archivo / funcion / cartel / regla>`  → `<que cambio puntual>`

**4. Que NO voy a tocar (importante para que estes tranquilo)** — lista explicita del blast radius que queda IGUAL:
- [ ] NO toco: `<modulo / base de datos / login / otras pantallas / etc.>`

> Esta lista de "lo que NO cambia" es la red de seguridad: delimita el radio del cambio igual que el "Fuera de alcance" de una propuesta. Para un no-programador es lo que da la tranquilidad de que un arreglo chico no te rompe otra cosa.

**5. Supuestos** (si asumiste algo para no frenar): listalos en 1-2 bullets. *"Asumo que el IVA es siempre 21%; si hay alicuotas distintas, avisame."*

**6. Riesgo y verificacion:** decile en una frase como se va a comprobar que quedo bien (que tendria que pasar para confirmarlo). Ejemplo: *"Para confirmarlo: cargas una factura de $100 + IVA y el total tiene que dar $121, no $142."*

---

## HALT — frena y pedi OK antes de ejecutar

Despues de mostrar la propuesta, **PARA y espera el OK explicito** del usuario (si / dale / cambia esto). No empieces a editar desde este comando: aca solo se explora y se propone (es read-only).

> Regla dura del kit: nada se aplica sin tu confirmacion. Un cambio chico que no aprobaste no se hace.

Cuando el usuario aprueba, decile el siguiente paso segun el tamano:

- **Fix chico de 1 archivo:** se puede ejecutar en el momento, en una sesion de ejecucion con el dial de permisos en Auto/acceptEdits. **Antes**, recorda commitear lo que hay (red de seguridad). Pedi **evidencia** del resultado (que viste que ahora anda), no un "listo".
- **Fix que toca varias cosas o roza schema/seguridad/plata:** conviene escribir el cambio acotado a un `SPEC.md` chico (que / por que / que toca / que NO toca / como se verifica) y arrancar una **sesion FRESCA** para ejecutarlo con contexto limpio.

En cualquier caso, una vez resuelto: si el fix cambia comportamiento visible, roles o reglas, avisa de pasar `/docs-check` para que las docs no queden viejas.

---

## Limites de este comando (leelos)

- **NUNCA escribis ni edits codigo aca.** Este comando explora y propone; la ejecucion va en otra sesion con el dial de autonomia adecuado.
- **No lo uses para features nuevas** (eso es `/feature`) ni para apps de cero (`/nueva-app`).
- Si mientras explorabas descubris que "el bug chico" en realidad es un rediseno o toca media app, **deci la verdad**: frena, explicale al usuario que esto excede un fix acotado y proponele pasar a `/feature`. Mejor cortar a tiempo que disfrazar un refactor de "arreglito".

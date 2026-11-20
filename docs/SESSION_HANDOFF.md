# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope 5.500 bytes**; el hook corta y avisa "CORTADO" si se pasa, y termina con la huella.

**CIERRE** 2026-11-20, sesión `vibe-kit Tag · La 3.1.0-rc.1 con reflexion y el buzón`, PC `Usuario` (Opus 5.5), en `main`.
**Kit `v3.1.0` publicado** (tag sobre `8753025`, con su página en GitHub): `reflexion` y el buzón, **en piloto**.

## Dónde estamos

- **La 3.1.0 salió final, sin `rc` ni banco** (ADR-041, decisión de Guido): lo nuevo es de la PC y opcional. **El PO y "probar una idea
  nueva" pasan a la 3.2.** El banco sigue siendo paso fijo para una versión que toque el molde, los frenos o el actualizador.
- **Antes del tag**: el revisor frío (Opus) y la auditoría del sistema en una sesión Fable (`docs/kit-v3/AUDITORIA-3.1.md`, "visto bueno
  con condiciones", cumplidas); la suite entera; los hooks por PC instalados en `Usuario` con el `doctor` y dos sesiones de prueba; la
  flota de prueba (mezclados y al día). El log: tanda 2 en `docs/kit-v3/TANDAS-DE-VERSIONES.md`.
- **Lo que la suite encontró**: una cuenta de Windows de 22 caracteres o más (la de Guido en `Usuario` tiene 22) queda "sin verificar
  todavía" en el aviso hasta "revisá el buzón". Del lado seguro; está en la nota y arriba de la 3.1.1 en el TODO.
- Esta PC: `kit-sync` LIMPIO, los hooks de la PC en 3.1.0 y el `doctor` todo bien (un aviso viejo: el `CLAUDE.md` de la madre sin "El
  tamaño del pedido"). Un clon fresco de GitHub baja la `v3.1.0`.

## Próximo paso

1. **`vibe-kit Piloto · El buzón en la PC del probador`**: allá, "actualizá el kit", "registrame en el buzón", "instalar hooks por PC" y
   `buzon.cjs medir --linea-base`. La persona mira las `auto: true` de `medir` una vez por semana.
2. **`vibe-kit 3.1.1 · Lo que deje el piloto`**: la lista en el TODO (la segunda PC de la misma persona primero, las cuentas largas, el
   aviso solo con config). Nivel por cambio (§7 del ciclo); toca un freno de la PC → medio-alto.
3. **`vibe-kit Flota · Los repos reales a la v3.1.0`**: repo por repo con el OK de Guido (en el TODO).
4. **`vibe-kit M7 · La 3.2`** (el PO y "probar una idea nueva"), con su charla de diseño, después del piloto.

## Te espera (Guido)

- En la otra PC (`clientes`): "actualizá el kit" e "instalar hooks por PC". **No registres en el buzón una segunda PC tuya hasta la 3.1.1.**
- El OK por repo de la flota real · el clic de P7 (`../vibe-kit-pruebas/rc7/p7-firma/LEEME-P7.txt`).
- Los chats de la PC del probador al privado, desde una PC con acceso (ids en el handoff anterior, `git show e5e6d72:docs/SESSION_HANDOFF.md`).

## Cosas que muerden y no están en ningún otro doc

- 🔑 **Identidad de git**: `guido.camera.eq@gmail.com`. Nunca `eq.chatgpt`.
- 🔴 **gitleaks antes de cada push, sobre el rango** (`--log-opts="origin/main..HEAD"`), sin tubería: vibe-kit es público.
- 🔒 **El buzón es material privado**: en el repo van alias y números, nunca la ruta, nombres de personas o PCs, ni contenido de mensajes.
- 🤖 **Una sesión en Fable desde una en Opus**: `start_session` la abre en Opus sin avisar. Arreglo: `set_session_model` a Fable, cortar
  el turno (`stop_session`, que pide reenviar con el `session` del hook) y mandarle el encargo otra vez; verificar con `get_session`.
- 🧪 **`node --test` en paralelo da rojas de carga** (tiempos, y pruebas de >5 min que vencen): toda roja se corre sola antes de creerla.
  Nunca dos tandas pesadas a la vez. La suite entera tarda ~65 min.
- 🧪 **Las pruebas que dependen de la cuenta de Windows** (`dueno`, `aviso-real`) dan distinto según la PC: correrlas en las dos.
- 🧪 **La flota de prueba**: `bash pruebas/rehacer.sh`, un `git clone --bare` del repo con el tag puesto solo ahí, y
  `actualizar.cjs flota alfa beta gama --canon <bare> --tag vX --proyectos ../vibe-kit-pruebas`, dos vueltas (~20 min cada una).
- ✍️ **En un heredoc de Bash, `\\` queda en una barra**: para código con escapes, el Edit o el Write.
- 💻 **La terminal de Guido es PowerShell 5.1**: si queda una línea para él, en PowerShell y sin `&&` (mejor: ninguna).
- 🚪 **No le marques a Guido tareas de sus otros repos** desde acá (su regla, 2026-11-10): lo que se vea allá va al tracker.

## Bloqueos

Ninguno.

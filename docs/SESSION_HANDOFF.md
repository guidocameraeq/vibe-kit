# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope 5.500 bytes**; el hook corta y avisa "CORTADO" si se pasa, y termina con la huella.

**CIERRE** 2026-11-19, sesión `vibe-kit M7 · La construcción del buzón, sesión 2`, PC del probador (Opus 5.5), en `main`. **Sin tag**:
el kit sigue en `v3.0.1`; `reflexion` y el buzón entero esperan en el `[Unreleased]` de `kit/CHANGELOG.md`.

## Dónde estamos

- **El buzón está construido**: `SPEC-G1-buzon` ✅ IMPLEMENTADO (el sello sigue valiendo). `buzon.cjs` y su lógica en
  `kit/skills/arquitecto-skills/pc/buzon/`, la skill `buzon` y `PROTOCOLO-v1.md` en `kit/skills/buzon/`, kit-owned. ADR-040.
- **El red team del código** dio dos críticos (una cuenta cualquiera quedaba verificada como otro agente): **la disputa nunca se
  resuelve sola y `registrar --resolver` es de cada PC**. Se aparta del spec en esos dos puntos (dicho en su Estado y en ADR-040).
- **Mutación en `responder`: 55/55.** 309 de 311 pruebas de lo tocado en verde (el rojo es la de tiempos, en paralelo; sola pasa).
  **La suite entera no se corrió**: va antes del tag.
- **La carpeta real**, solo leyendo: los 180 mensajes verifican `v0` (D3) y no cambió nada. Nadie se registró todavía en ninguna PC.

## Próximo paso

1. **El tag que lleve `reflexion` y el buzón** (lo decide Guido; `docs/CICLO-DE-MEJORA.md` §6): la suite entera (~90 min, sola) y el
   banco antes. Título sugerido: `vibe-kit Tag · La v3.1 con reflexion y el buzón`.
2. **El piloto de un mes**, después del tag, en la PC del probador: actualizar el kit, "registrame en el buzón", "instalar hooks por
   PC" y `buzon.cjs medir --linea-base`. La persona mira la lista de las `auto: true` de `medir` una vez por semana.
3. **`vibe-kit Flota · Los repos reales a la v3.0.1`**: repo por repo con el OK de Guido (en el TODO).

## Te espera (Guido)

- Decidir cuándo sale el tag con `reflexion` y el buzón (en el TODO).
- La tensión anotada en el acta de la prueba de `reflexion`: con el dueño ausente, "propone y no escribe" deja las propuestas esperando.
- El OK por repo de la flota real · "instalar hooks por PC" en las dos PCs · el clic de P7 (`../vibe-kit-pruebas/rc7/p7-firma/LEEME-P7.txt`).
- **Subir al privado los chats de esta PC** desde una PC con acceso: `7f248448-4f66-47cf-90bb-fb0e8e133c00` (`reflexion`),
  `0f74d80f-5fc9-4431-a3bc-c5b60d1e9cbd` (diseño del buzón), `b84aa177-6e1d-4d72-b5c0-742eb755a31b` (spec),
  `88f05614-588d-4879-9a54-8f3396b06a88` (construcción 1) y `c70f1603-2d00-4b5c-8d93-6f06eed1c2b3` (esta). Sin sus filas en el diario.

## Cosas que muerden y no están en ningún otro doc

- 🔑 **Identidad de git**: en la PC de Guido, `guido.camera.eq@gmail.com`; nunca `eq.chatgpt`. Esta PC commitea con su propia identidad.
- 🔴 **gitleaks antes de cada push, sobre el rango** (`--log-opts="origin/main..HEAD"`), sin tubería: vibe-kit es público.
- 🔒 **El buzón es material privado**: en el repo van alias y números, nunca la ruta, nombres de personas o PCs, ni contenido de
  mensajes. Fuera de `registrar`, la carpeta real solo se lee.
- 🧪 **`node --test` con varios archivos los corre en paralelo**: una prueba de tiempos (`aviso-real.test.cjs`) da rojo al lado del
  doctor. Correrla sola. Nunca dos tandas pesadas a la vez (el doctor también da fallas en paralelo con `preparar-pc`).
- ✍️ **En un heredoc de Bash, `\\` queda en una barra** (rompió regex en esta sesión): para código con escapes, el Edit o el Write.
  En `sed`, `\c` es un carácter de control: ojo con `DOMINIO\cuenta`.
- 🧬 **La mutación** edita los archivos un rato: nada de pruebas ni subagentes leyendo en paralelo. El script de esta sesión vivía
  en el scratchpad; sus 55 mutantes están contados en ADR-040 y en el CHANGELOG.
- 🧪 **Probar permisos**: `claude -p --model haiku --output-format json --settings <json> "…" </dev/null` con
  `env -u CLAUDE_CODE_ENTRYPOINT`, y leer `permission_denials`.
- 💻 **La terminal de Guido es PowerShell 5.1**: si queda una línea para él, en PowerShell y sin `&&` (mejor: ninguna).
- 🚪 **No le marques a Guido tareas de sus otros repos** desde acá (su regla, 2026-11-10): lo que se vea allá va al tracker.

## Bloqueos

Ninguno.

# Session Handoff — vibe-kit

> **Save game** del proyecto madre. `/cierre` lo sobreescribe entero; el hook SessionStart lo inyecta en cada chat
> nuevo de esta carpeta. **Tope 5.500 bytes**; el hook corta y avisa "CORTADO" si se pasa, y termina con la huella.

**CIERRE PARCIAL** 2026-11-16 de la **sesión 6 del tramo final** (la `v3.0` y el repo cerrado; PC `Usuario`, Opus 5.5), de
noche y con Guido durmiendo: todo lo que no pide su OK está hecho y en `main`. **Falta el tag `v3.0.0`**: espera a Guido.

## Dónde estamos

- **La `v3.0` está lista en `main`, sin tag**: el código de la `rc.8` (taggeada el 15/11) más tres renglones de texto de las skills
  (sin códigos en `/inicio` y `/cierre`; el "todo en no" de la adopción), sin pruebas nuevas (las de los textos pasan); `kit/VERSION` = `3.0.0` y la nota en
  `kit/CHANGELOG.md`. El actualizador baja el último tag anotado: hasta el tag, nadie recibe la `3.0.0`.
- **El veredicto del banco otra vez** (`docs/kit-v3/BANCO-rc8.md`): *sale la v3.0, con los hooks de esta PC al día y una noche corta*.
- **Hecho en la 6**: el ciclo de mejora sin ✍️ (`docs/CICLO-DE-MEJORA.md`); la portada, la guía y los manuales con lo de la `rc.7` y
  la `rc.8`; el TODO (salen la 5 y la 6; la 7 con lo que va a la `v3.1`); los specs marcados ✅; la entrada del CHANGELOG del tramo;
  los chats del tramo, el diario (16 filas) y el corte de la vuelta 1, en el privado.
- `kit-sync sync` **ya corrió** (la PC tiene la `3.0.0` en `~/.claude`): `LIMPIO`, con el aviso de los hooks de la PC. Fue antes del
  tag a propósito: "instalar hooks por PC" toma la versión de `~/.claude/VERSION`. Es local: no publica nada.

## Próximo paso

**Guido**, en este orden (lo pide el director del tramo, en criollo):
1. **"instalar hooks por PC"** (los de esta PC son de la `rc.6`; con el sync hecho, quedan en `3.0.0`; lo frena el clasificador
   de `auto`: es suyo).
2. **La noche corta de confirmación** (~17 min, sola en la PC): la receta en la nota de la 5c (carpeta de notas del director,
   `sesion-5c-banco-rc8.md`): sobre la copia sin pruebas, borrar su carpeta de `noches/`, `noche-armar` y `noche` con la copia
   del script de `$BANCO/corrida/`. La medida: ni el parte ni los obreros dicen "ficha rota: .claude/kit.md".
3. **Los criterios a fase 2, por escrito** (la lista en `BANCO-rc8.md`, "Los 20 criterios"; el 6, recomendado tildar).
4. **Su OK de publicar**: tag anotado `v3.0.0` sobre la punta de `main` (si `kit/` no cambió desde el commit de `VERSION`),
   gitleaks sobre el rango y push del tag; `kit-sync.sh` tiene que seguir en `LIMPIO`.
5. **La flota real, con su OK por repo** (lo que cambia en cada uno: el resumen de la sesión 6 al director).
6. `/cierre` completo: el tracker ✅ paquete 10 (lo escribe el director), sale el ítem "Sacar la v3.0" del TODO, el título del
   CHANGELOG suma ` · v3.0.0`, y el chat de la 6 re-condensado al privado.

## Te espera (Guido)

- Los cinco pasos de arriba. Y una decisión suya, anotada en el TODO: si *cambiar* el `comando-test` pide su firma.
- El clic de P7 cuando quiera (`../vibe-kit-pruebas/rc7/p7-firma/LEEME-P7.txt`): si no, el criterio 18 va a fase 2.

## Cosas que muerden y no están en ningún otro doc

- 🔑 **Identidad de git**: `guido.camera.eq@gmail.com`. Nunca `eq.chatgpt`.
- 🔴 **gitleaks antes de cada push, sobre el rango** (`--log-opts="origin/main..HEAD"`), sin tubería: vibe-kit es público.
- 🐍 **Python**: `py -3`; para leer los `.jsonl` de las charlas, `py -3 -I` con `sys.stdout.reconfigure(encoding="utf-8")`.
- 💻 **La terminal de Guido es PowerShell 5.1**: si queda una línea para él, en PowerShell y sin `&&` (mejor: ninguna).
- 🧱 **El clasificador del modo `auto` frena escribir el `~/.claude/settings.json`** (preparar-pc, kit-sync sync, instalar hooks).
- 🚪 **No le marques a Guido tareas de sus otros repos** desde acá (su regla, 2026-11-10): lo que se vea allá va al tracker.
- 🧪 **Nunca dos tandas pesadas a la vez**. `adoptar.test` solo tarda >15 min con la PC cargada: correrlo sin `timeout`.
- 📬 El tracker lo escribe solo el director del tramo; las otras sesiones dejan su archivo y él lo integra.
- 🔒 Los repos del trabajo se leen en copias del scratchpad; a vibe-kit (público) va solo el comportamiento del kit, en abstracto.
- ✍️ En la terminal de Windows, los heredocs largos se rompen: el script va a un archivo y se corre.

## Bloqueos

Ninguno técnico. El tag espera el OK de Guido (pasos 1 a 4).

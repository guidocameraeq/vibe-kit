---
# Ficha del kit de este repo. La lee un script: respetá la forma.
# Mapas con sangría de 2 espacios (hasta 3 niveles) · listas [a, b] · listas de mapas en línea: - {a: x, b: y}
# Todo valor es texto, sin comillas o entre comillas dobles. Nada de comillas simples, \, & ni texto en varias líneas.
# Es un ejemplo de la forma, no una ficha para copiar: sus frenos quitados y autorizaciones son de muestra.
kit: 2.4.3
nivel: estandar                      # liviano (sin código) · estandar (con código)
vars:                                # con qué se instanció el molde: sin esto no se puede regenerar
  proyecto: ejemplo
  comando-test: node --test
  comando-setup: npm install
  lenguajes: [js, ts]
piezas:                              # molde · molde+propio · adaptada · propia · sí · no; hash: 12 hexa de lo que escribió el molde
  inicio: {estado: molde+propio, hash: 3f9a0c1d2e4b}
  cierre: {estado: molde+propio, hash: b71c55d0a9e3}
  hook-arranque: {estado: molde, hash: 90e2f1aa7c06}
  settings: {estado: molde+propio, hash: 5d04e9b3c218}
  check-code: {estado: "adaptada (desvío detectado)", hash: 7a1b2c3d4e5f}
  docs: molde                        # solo las plantillas del nacimiento; docs/ es del proyecto
  candado: molde
  smoke: propia
  release: propia
  director-obrero: no
  cambios-metodo: molde
  docs-fyd: sí
frenos:
  opcionales: []
  quitados:                          # cada uno con razón y hasta: siempre, o una fecha
    - {id: hook:git-seguro/push-force, por: "proyecto personal, el push es libre", hasta: siempre}
    - {id: pregunta:borrar-datos-reales, por: "base dummy #3 de la misión 3", hasta: 2026-11-15}
    - {id: deny:Bash(git stash:*), por: "el flujo de release lo necesita", hasta: siempre}
autorizado:                          # lo que no es pregunta
  merge-a-main: con-gate-verde
  escribir-produccion: por-comando-con-foto
sensible:                            # las 5 preguntas de fábrica: no, o qué duele en este repo
  datos-reales: [tabla clientes de la base real]
  plata: no
  sale-afuera: [mails a gerencia]
  claves: [cargar-secreto]
  release: [npm run release]
secretos: [DB_URL, HUB_TOKEN]        # nombres, nunca valores
publicas: [SUPABASE_ANON_KEY]        # parecen secreto y no lo son
herramientas:                        # lo que se puede usar: un chequeo de una línea y si necesita a Guido; cada entorno nombra las suyas
  db: {chequeo: "db ping", necesita-guido: no}
  sqlite:
    chequeo: sqlite3 --version
    necesita-guido: no
entornos:
  base-real:
    clase: real                      # real · prueba · dummy
    herramientas: [db]
    acceso: "db (solo lectura)"
  base-local:
    clase: dummy
    herramientas: [db, sqlite]
    acceso: db (todo)
datos-de-prueba: docs/referencia/PRUEBA.md
push-publica: no
aprueba: po-ejemplo                  # un alias, nunca un nombre real
mesa:
  hub:
    contacto: hub/director
    transporte: git
  deptos: {contacto: deptos/sesion, transporte: buzon}
multi-llm: no
---

## Cómo se adaptó el kit a este proyecto

- `check-code`: se reescribió para validar también los `.sql`, porque dos migraciones rotas llegaron a `main` (2026-09).
- `frenos`: se quitó el freno al `push --force` porque es un proyecto personal sin nadie más en la rama (2026-10).

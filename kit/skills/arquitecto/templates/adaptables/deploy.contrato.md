# Contrato de /deploy — aplicar cambios al entorno real

> ⚠️ **NO se monta el día cero.** Se monta cuando el ritual de publicación real existe y ya lo repetiste 3+ veces con los mismos pasos (regla de 3+). Si publicás versiones en vez de aplicar a un servidor, la skill se llama `/release` (tags + CHANGELOG + gates), mismo contrato de verificación.

Flujo canónico: **editar local → commit → push → aplicar al entorno → verificar salud → smoke mínimo.**

## El contrato (pasos obligatorios de toda instancia)

1. **Local**: si hay cambios sin commitear del tema, commit + push (mostrando al usuario qué se sube).
2. **Aplicar**: {{COMO_LLEGA_EL_CAMBIO_AL_ENTORNO — git pull en el servidor, docker compose up, publicar build, subir a la tienda}}.
3. **¿El cambio afecta runtime?** {{MATRIZ_DEL_PROYECTO — qué tipos de cambio requieren restart/rebuild/acción extra, y cuáles no. Si una acción tiene efectos colaterales visibles para usuarios (reset de contexto, corte de servicio), pedir OK ANTES y sugerir momento tranquilo.}}
4. **Verificar salud post-deploy**: {{COMANDO_SALUD}} — y **smoke mínimo del flujo tocado** (ver contrato de `/smoke`). Un deploy sin verificación no es un deploy terminado.
5. **Cuota/costo**: si el cambio activa algo que consume una cuota compartida (API paga, crons, batch) → declarar el costo estimado ANTES de activarlo y pedir OK.

## Reglas

- NO editar archivos directamente en el entorno de producción — todo pasa por git. Toda excepción (debugging puntual, `.env`) genera drift que se anota en el HANDOFF.
- Si la operación roza algo intocable ({{PATHS_PROTEGIDOS_SI_HAY}}), parar y preguntar.
- Scripts complejos al entorno remoto: **por archivo**, nunca heredocs inline.

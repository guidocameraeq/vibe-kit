# Contrato de /smoke — probar de verdad, con evidencia

> ⚠️ **NO se monta el día cero.** Una skill nace de un ritual que ya repetiste 3+ veces con los mismos pasos (regla de 3+). Esto es el CONTRATO universal que toda instancia de `/smoke` tiene que cumplir; los {{...}} se llenan con el ritual REAL del proyecto cuando exista.

Nunca declarar "listo" sin esto. **"Apliqué el cambio" ≠ "funciona".** Un bug se declara resuelto solo cuando el caso que lo disparó se reprodujo y ya no falla.

## El contrato (pasos obligatorios de toda instancia)

1. **Definir el caso ANTES de probar**: qué flujo, qué entrada, qué se espera (respuesta visible + efecto en el estado del sistema).
2. **Vía determinista primero** (siempre): {{COMO_SE_VERIFICA_SIN_HUMANO — logs, queries a la DB, curl a endpoints, tests}}.
3. **Vía humana** (cuando el cambio es de cara al usuario): {{COMO_SE_SIMULA_UN_USUARIO_REAL — browser MCP, app real, emulador}}. Reglas prácticas: waits cortos encadenados; tras cada acción, re-verificar el estado — no reusar referencias viejas.
4. **Verificar el EFECTO, no solo la respuesta**: que el dato exista/cambie donde tiene que cambiar ({{DONDE_VIVE_EL_EFECTO — row en la DB, archivo, estado del servicio}}), no solo que "respondió bien".
5. **Reporte en formato fijo**: **Estado inicial** → **Test 1** (entrada + salida + evidencia) → **Fixes aplicados** (si hubo) → **Test 2** (re-verificación tras el fix). Con datos reales (rows, logs), no con resúmenes.
6. **Limpieza SIEMPRE al final**: borrar los datos de prueba ({{QUE_SE_LIMPIA_Y_COMO}}) y confirmar: *"datos de prueba eliminados"*.

## Regla de oro

Si un paso no se pudo verificar con evidencia, se reporta como **NO VERIFICADO** — jamás como hecho.

## Ejemplos de instancia (1 línea cada uno)

- **Perseo (bot de WhatsApp)**: mandar mensaje real por WhatsApp Web → verificar respuesta del bot + row en Supabase por query `.sql` → borrar rows de prueba.
- **Una API**: pegarle a los endpoints tocados con curl → verificar status + body + efecto en la DB → borrar los registros de prueba.

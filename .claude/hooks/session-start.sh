#!/bin/bash
# Hook SessionStart del proyecto madre: inyecta el estado en cada chat nuevo (y al retomar tras
# /clear o /compact). Mismo molde que el de los proyectos (kit/.../templates/universales/hooks/).
# $CLAUDE_PROJECT_DIR SIEMPRE entre comillas.
cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || exit 0

echo "=== SESSION_HANDOFF.md (inyectado por hook — NO releer el archivo) ==="
cat docs/SESSION_HANDOFF.md 2>/dev/null || echo "(sin handoff todavía)"
echo ""
echo "=== TODO.md — primeras 40 líneas (única fuente de pendientes) ==="
head -40 docs/TODO.md 2>/dev/null
echo ""
echo "=== git — últimos 5 commits + estado del working tree ==="
git log --oneline -5 2>/dev/null
git status --short 2>/dev/null
echo ""
echo "=== Recordatorio: '/inicio' cruza esto con la realidad (git + kit-sync); no toco nada sin OK de Guido ==="

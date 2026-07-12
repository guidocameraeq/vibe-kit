#!/bin/bash
# SessionStart hook — inyecta el estado del proyecto madre en cada chat nuevo.
P="$CLAUDE_PROJECT_DIR"
echo "=== SESSION_HANDOFF.md (inyectado por hook — NO releer el archivo) ==="
cat "$P/docs/SESSION_HANDOFF.md" 2>/dev/null || echo "(sin handoff todavía)"
echo ""
echo "=== Pendientes (del README, única fuente) ==="
sed -n '/^## Pendientes/,$p' "$P/README.md" 2>/dev/null | head -15
echo ""
echo "=== Últimos commits ==="
git -C "$P" log --oneline -5 2>/dev/null

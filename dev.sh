#!/usr/bin/env bash
set -euo pipefail

REPO="$(cd "$(dirname "$0")" && pwd)"
BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
  echo ""
  echo "Durduruluyor..."
  [[ -n "$BACKEND_PID" ]]  && kill "$BACKEND_PID"  2>/dev/null || true
  [[ -n "$FRONTEND_PID" ]] && kill "$FRONTEND_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# ──────────────────────────────────────────────
# 1. MongoDB kontrolü
# ──────────────────────────────────────────────
echo "🔍  MongoDB kontrol ediliyor (localhost:27017)..."
if ! nc -z localhost 27017 2>/dev/null; then
  echo "❌  MongoDB çalışmıyor!"
  echo "    Başlatmak için: brew services start mongodb-community"
  exit 1
fi
echo "✅  MongoDB hazır."

# ──────────────────────────────────────────────
# 2. Backend (Python/FastAPI)
# ──────────────────────────────────────────────
echo ""
echo "🐍  Backend başlatılıyor..."

VENV="$REPO/backend/.venv"
if [[ ! -d "$VENV" ]]; then
  echo "    Sanal ortam oluşturuluyor..."
  python3 -m venv "$VENV"
fi

echo "    Bağımlılıklar kontrol ediliyor..."
"$VENV/bin/pip" install -q -r "$REPO/backend/requirements.txt"

"$VENV/bin/uvicorn" app.main:app \
  --reload \
  --port 8000 \
  --app-dir "$REPO/backend" &
BACKEND_PID=$!

echo "    Backend PID: $BACKEND_PID — health check bekleniyor..."
MAX=30
for i in $(seq 1 $MAX); do
  if curl -fsS http://localhost:8000/api/health > /dev/null 2>&1; then
    echo "✅  Backend hazır."
    break
  fi
  if [[ $i -eq $MAX ]]; then
    echo "❌  Backend $MAX saniyede ayağa kalkmadı. Logları kontrol edin."
    exit 1
  fi
  sleep 1
done

# ──────────────────────────────────────────────
# 3. Frontend (Next.js)
# ──────────────────────────────────────────────
echo ""
echo "⚛️   Frontend başlatılıyor..."

if [[ ! -d "$REPO/web/node_modules" ]]; then
  echo "    npm install çalışıyor..."
  (cd "$REPO/web" && npm install)
fi

if [[ ! -f "$REPO/web/.env.local" ]]; then
  echo "    .env.local oluşturuluyor..."
  echo "NEXT_PUBLIC_GRAPHQL_URL=http://localhost:8000/graphql" > "$REPO/web/.env.local"
fi

(cd "$REPO/web" && npm run dev) &
FRONTEND_PID=$!

# ──────────────────────────────────────────────
# 4. Hazır
# ──────────────────────────────────────────────
sleep 3
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅  Backend:   http://localhost:8000"
echo "       GraphiQL: http://localhost:8000/graphql"
echo "  ✅  Frontend:  http://localhost:3000"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Çıkmak için Ctrl+C"
echo ""

wait "$BACKEND_PID" "$FRONTEND_PID"

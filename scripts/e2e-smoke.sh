#!/usr/bin/env bash
# AuraPet uçtan uca smoke testi
# Kullanım: bash scripts/e2e-smoke.sh [backend_url]
# Bağımlılık: curl, jq

set -euo pipefail

GQL="${1:-http://localhost:8000/graphql}"
PASS=0; FAIL=0

RED='\033[0;31m'; GREEN='\033[0;32m'; RESET='\033[0m'

ok()   { echo -e "${GREEN}✓${RESET} $1"; ((PASS++)); }
fail() { echo -e "${RED}✗${RESET} $1"; ((FAIL++)); }

gql() {
  local query="$1"; local vars="${2:-{}}"
  curl -sf -X POST "$GQL" \
    -H "Content-Type: application/json" \
    -d "{\"query\": $(echo "$query" | jq -Rs .), \"variables\": $vars}"
}

echo "🔍 AuraPet Smoke Test — $GQL"
echo "─────────────────────────────────"

# 1. Health check
health=$(curl -sf "${GQL/graphql/api\/health}" 2>/dev/null || echo '{}')
if echo "$health" | jq -e '.status == "ok"' >/dev/null 2>&1; then
  ok "Health check: status=ok"
else
  fail "Health check: backend yanıt vermiyor"
fi

# 2. createUser
TS=$(date +%s)
USERNAME="smoke_$TS"
EMAIL="smoke_${TS}@test.com"

user_resp=$(gql '
  mutation CreateUser($u: String!, $e: String!) {
    createUser(username: $u, email: $e) { id username }
  }
' "{\"u\": \"$USERNAME\", \"e\": \"$EMAIL\"}")

USER_ID=$(echo "$user_resp" | jq -r '.data.createUser.id // empty')
if [[ -n "$USER_ID" ]]; then
  ok "createUser: id=$USER_ID"
else
  fail "createUser: ${user_resp}"
  echo "Devam edilemiyor."; exit 1
fi

# 3. addLogEntry (pet yoksa otomatik oluşturulmalı)
log_resp=$(gql '
  mutation AddLog($uid: ID!, $text: String!) {
    addLogEntry(userId: $uid, entryText: $text) {
      id name level xp currentMood
    }
  }
' "{\"uid\": \"$USER_ID\", \"text\": \"Bugün harika hissediyorum!\"}")

PET_MOOD=$(echo "$log_resp" | jq -r '.data.addLogEntry.currentMood // empty')
PET_XP=$(echo "$log_resp" | jq -r '.data.addLogEntry.xp // 0')
if [[ -n "$PET_MOOD" ]]; then
  ok "addLogEntry: mood=$PET_MOOD xp=$PET_XP"
else
  fail "addLogEntry: ${log_resp}"
fi

# 4. getLogs
logs_resp=$(gql '
  query GetLogs($uid: ID!) { getLogs(userId: $uid) { id sentimentScore } }
' "{\"uid\": \"$USER_ID\"}")

LOG_COUNT=$(echo "$logs_resp" | jq '.data.getLogs | length' 2>/dev/null || echo 0)
if [[ "$LOG_COUNT" -ge 1 ]]; then
  ok "getLogs: $LOG_COUNT kayıt bulundu"
else
  fail "getLogs: ${logs_resp}"
fi

# 5. getUserPets
pets_resp=$(gql '
  query GetPets($uid: ID!) { getUserPets(userId: $uid) { id name level xp } }
' "{\"uid\": \"$USER_ID\"}")

PET_COUNT=$(echo "$pets_resp" | jq '.data.getUserPets | length' 2>/dev/null || echo 0)
if [[ "$PET_COUNT" -ge 1 ]]; then
  ok "getUserPets: $PET_COUNT pet bulundu"
else
  fail "getUserPets: ${pets_resp}"
fi

# Sonuç
echo "─────────────────────────────────"
echo "Sonuç: ${GREEN}${PASS} geçti${RESET}, ${RED}${FAIL} başarısız${RESET}"
[[ $FAIL -eq 0 ]] && exit 0 || exit 1

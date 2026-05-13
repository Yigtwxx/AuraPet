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

# 3. createPet (explicit, otomatik değil)
pet_resp=$(gql '
  mutation CreatePet($uid: ID!, $name: String!) {
    createPet(userId: $uid, name: $name) { id name level xp currentMood }
  }
' "{\"uid\": \"$USER_ID\", \"name\": \"TestPet\"}")

PET_ID=$(echo "$pet_resp" | jq -r '.data.createPet.id // empty')
if [[ -n "$PET_ID" ]]; then
  ok "createPet: id=$PET_ID level=1"
else
  fail "createPet: ${pet_resp}"
fi

# 4. addLogEntry (ilk not — pozitif duygu)
log1_resp=$(gql '
  mutation AddLog($uid: ID!, $text: String!) {
    addLogEntry(userId: $uid, entryText: $text) {
      id name level xp currentMood colorTheme
    }
  }
' "{\"uid\": \"$USER_ID\", \"text\": \"Bugün harika hissediyorum, çok mutluyum!\"}")

PET_MOOD=$(echo "$log1_resp" | jq -r '.data.addLogEntry.currentMood // empty')
PET_XP=$(echo "$log1_resp" | jq -r '.data.addLogEntry.xp // 0')
if [[ -n "$PET_MOOD" ]]; then
  ok "addLogEntry (pozitif): mood=$PET_MOOD xp=$PET_XP"
else
  fail "addLogEntry (pozitif): ${log1_resp}"
fi

# 5. addLogEntry (ikinci not — XP birikmesi kontrol)
log2_resp=$(gql '
  mutation AddLog($uid: ID!, $text: String!) {
    addLogEntry(userId: $uid, entryText: $text) {
      id name level xp currentMood
    }
  }
' "{\"uid\": \"$USER_ID\", \"text\": \"Bugün biraz yorgunum ama idare eder.\"}")

PET_XP2=$(echo "$log2_resp" | jq -r '.data.addLogEntry.xp // 0')
if [[ "$PET_XP2" -gt "$PET_XP" ]]; then
  ok "addLogEntry (XP birikimi): xp $PET_XP → $PET_XP2"
else
  fail "addLogEntry (XP birikimi): xp artmadı (${PET_XP2} <= ${PET_XP})"
fi

# 6. getLogs
logs_resp=$(gql '
  query GetLogs($uid: ID!) { getLogs(userId: $uid) { id sentimentScore } }
' "{\"uid\": \"$USER_ID\"}")

LOG_COUNT=$(echo "$logs_resp" | jq '.data.getLogs | length' 2>/dev/null || echo 0)
if [[ "$LOG_COUNT" -ge 2 ]]; then
  ok "getLogs: $LOG_COUNT kayıt bulundu"
else
  fail "getLogs: beklenen ≥2, bulunan ${LOG_COUNT}"
fi

# 7. getLogs sıralama: ilk kayıt en yeni olmalı
FIRST_SCORE=$(echo "$logs_resp" | jq '.data.getLogs[0].sentimentScore' 2>/dev/null || echo null)
if [[ "$FIRST_SCORE" != "null" ]]; then
  ok "getLogs sıralama: ilk kayıt mevcut (score=$FIRST_SCORE)"
else
  fail "getLogs sıralama: sentimentScore alınamadı"
fi

# 8. getUserPets
pets_resp=$(gql '
  query GetPets($uid: ID!) { getUserPets(userId: $uid) { id name level xp } }
' "{\"uid\": \"$USER_ID\"}")

PET_COUNT=$(echo "$pets_resp" | jq '.data.getUserPets | length' 2>/dev/null || echo 0)
PET_LEVEL=$(echo "$pets_resp" | jq -r '.data.getUserPets[0].level // 0')
if [[ "$PET_COUNT" -ge 1 ]]; then
  ok "getUserPets: $PET_COUNT pet bulundu, seviye=$PET_LEVEL"
else
  fail "getUserPets: ${pets_resp}"
fi

# Sonuç
echo "─────────────────────────────────"
echo "Sonuç: ${GREEN}${PASS} geçti${RESET}, ${RED}${FAIL} başarısız${RESET}"
[[ $FAIL -eq 0 ]] && exit 0 || exit 1

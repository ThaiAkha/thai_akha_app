#!/usr/bin/env bash
# Misura una sitemap (live o locale) e verifica i conteggi attesi per una lista di lingue.
# E' il gate del RUNBOOK §6.D e il monitor da rilanciare dopo ogni accensione/spegnimento.
#
#   scripts/measure-sitemap.sh [URL] [EXPECT_LANGS] [EXPECT_ENTITIES]
#   scripts/measure-sitemap.sh https://www.thaiakha.com/sitemap.xml en 269
#   scripts/measure-sitemap.sh https://www.thaiakha.com/sitemap.xml en,es 269
#   scripts/measure-sitemap.sh http://localhost:8000/ en,es          # senza attese: solo misura
#
# Regole (valide per QUALSIASI lista L, |L| = lingue attive incluso en):
#   <url>       = entita' x |L|
#   xhtml:link  = url x (|L| + 1)   se |L| > 1, altrimenti 0
#   <loc> duplicati = 0
#   se es e' attiva: nessun /es/thai-cooking-ingredients/ (gli slug es esistono tutti)
# Exit 0 = tutto atteso, 1 = qualcosa non torna, 2 = fetch fallito.
set -u
URL="${1:-https://www.thaiakha.com/sitemap.xml}"
EXPECT_LANGS="${2:-}"
EXPECT_ENTITIES="${3:-}"
TMP="$(mktemp)"; HDR="$(mktemp)"; trap 'rm -f "$TMP" "$HDR"' EXIT

T0=$(date +%s.%N)
CODE=$(curl -sL -A "measure-sitemap/1.0" -D "$HDR" -o "$TMP" -w "%{http_code}" "$URL")
T1=$(date +%s.%N)
case "$URL" in file://*) CODE=200;; esac   # file locale: curl non da' uno status
[ "$CODE" = "200" ] || { echo "❌ HTTP $CODE da $URL"; exit 2; }

URLS=$(grep -c "<url>" "$TMP")
LOCS=$(grep -c "<loc>" "$TMP")
ALTS=$(grep -c "xhtml:link" "$TMP")
DUPS=$(grep -oE "<loc>[^<]+</loc>" "$TMP" | sort | uniq -d | wc -l | tr -d ' ')
BYTES=$(wc -c < "$TMP" | tr -d ' ')
LANGS_HDR=$(grep -i "^x-sitemap-langs:" "$HDR" | tr -d '\r' | awk '{print $2}')
TIMING=$(grep -i "^server-timing:" "$HDR" | tr -d '\r' | cut -d' ' -f2-)
CTYPE=$(grep -i "^content-type:" "$HDR" | tr -d '\r' | awk '{print $2}')
printf "sitemap %s\n  http %s · %s byte · %.2fs · content-type %s\n  url %s · loc %s · xhtml:link %s · loc duplicati %s\n  X-Sitemap-Langs: %s · Server-Timing: %s\n" \
  "$URL" "$CODE" "$BYTES" "$(echo "$T1 - $T0" | bc)" "${CTYPE:-?}" "$URLS" "$LOCS" "$ALTS" "$DUPS" "${LANGS_HDR:-assente}" "${TIMING:-assente}"

FAIL=0
[ "$DUPS" = "0" ] || { echo "❌ <loc> duplicati: $DUPS"; FAIL=1; }
if [ -n "$EXPECT_LANGS" ]; then
  N=$(echo "$EXPECT_LANGS" | tr ',' '\n' | grep -c .)
  if [ -n "$EXPECT_ENTITIES" ]; then
    WANT_URLS=$((EXPECT_ENTITIES * N))
    [ "$URLS" = "$WANT_URLS" ] || { echo "❌ url attesi $WANT_URLS (=$EXPECT_ENTITIES x $N), trovati $URLS"; FAIL=1; }
    if [ "$N" -gt 1 ]; then WANT_ALTS=$((WANT_URLS * (N + 1))); else WANT_ALTS=0; fi
    [ "$ALTS" = "$WANT_ALTS" ] || { echo "❌ xhtml:link attesi $WANT_ALTS, trovati $ALTS"; FAIL=1; }
  fi
  [ -z "$LANGS_HDR" ] || [ "$LANGS_HDR" = "$EXPECT_LANGS" ] || { echo "❌ X-Sitemap-Langs '$LANGS_HDR' ≠ atteso '$EXPECT_LANGS'"; FAIL=1; }
  if echo ",$EXPECT_LANGS," | grep -q ",es,"; then
    ES_EN=$(grep -c "thaiakha.com/es/thai-cooking-ingredients/" "$TMP")
    [ "$ES_EN" = "0" ] || { echo "❌ $ES_EN URL /es/ con slug INGLESE degli ingredienti (registro troncato?)"; FAIL=1; }
  fi
fi
[ $FAIL = 0 ] && echo "✅ conteggi coerenti" || exit 1

#!/usr/bin/env bash
# Regenerate every Facebook image from the HTML templates + the live app screens.
# Output: facebook/images/*.png
#
# Usage:
#   facebook/render.sh                 # interface language inside phones = Spanish (default)
#   L7_LANG=ru facebook/render.sh      # render the phone screens in Russian (es pt ht ru fr de it zh ar tl)
set -euo pipefail
cd "$(dirname "$0")/.."                 # -> project root

PORT=4399
LANG_CODE="${L7_LANG:-es}"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
TPL="facebook/templates"
OUT="facebook/images"
TMP="/tmp/l7render"
mkdir -p "$OUT" "$TMP"

echo "▶ build"; npm run build >/dev/null

# fixed-port preview server (templates iframe the screens from here)
lsof -ti tcp:$PORT 2>/dev/null | xargs kill -9 2>/dev/null || true
npm run preview -- --port $PORT >"$TMP/preview.log" 2>&1 &
PREV=$!
trap 'kill $PREV 2>/dev/null || true' EXIT
for i in $(seq 1 40); do curl -sf "http://localhost:$PORT/" >/dev/null 2>&1 && break; sleep 0.5; done

shoot() { # url out W H
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --allow-file-access-from-files \
    --force-device-scale-factor=2 --window-size="$3,$4" --virtual-time-budget=5000 \
    --screenshot="$2" "$1" >/dev/null 2>&1
}
TPLURL="file://$PWD/$TPL"

echo "▶ feature posts (lang=$LANG_CODE)"
L7_BASE="http://localhost:$PORT/screens" L7_LANG="$LANG_CODE" python3 "$TPL/gen.py" |
while IFS=$'\t' read -r name hash; do
  shoot "$TPLURL/feature.html#$hash" "$TMP/$name.png" 1080 1350
  sips -z 1350 1080 "$TMP/$name.png" --out "$OUT/$name.png" >/dev/null
  echo "  ✓ $name.png"
done

echo "▶ cover / profile / languages"
shoot "$TPLURL/cover.html"     "$TMP/cover.png"     1640 624;  sips -z 624 1640 "$TMP/cover.png" --out "$OUT/01-cover.png" >/dev/null;        echo "  ✓ 01-cover.png"
shoot "$TPLURL/profile.html"   "$TMP/profile.png"   500  500;  cp "$TMP/profile.png" "$OUT/02-profile.png";                                   echo "  ✓ 02-profile.png"
shoot "$TPLURL/languages.html" "$TMP/languages.png" 1080 1350; sips -z 1350 1080 "$TMP/languages.png" --out "$OUT/08-post-10-languages.png" >/dev/null; echo "  ✓ 08-post-10-languages.png"

# Optional ad creative (only if the template exists)
if [ -f "$TPL/ad.html" ]; then
  shoot "$TPLURL/ad.html" "$TMP/ad.png" 1080 1350; sips -z 1350 1080 "$TMP/ad.png" --out "$OUT/09-ad.png" >/dev/null; echo "  ✓ 09-ad.png"
fi

echo "✓ done -> $OUT"

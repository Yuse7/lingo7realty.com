#!/usr/bin/env bash
# Генерирует ужатые (≤1200px по длинной стороне) копии тяжёлых картинок
# в previews/ с зеркалом путей. Нужно, чтобы Claude смотрел лёгкие копии,
# а не оригиналы (иначе диалог ловит ошибку обработки изображений).
# Запуск: ./make-previews.sh
set -euo pipefail
cd "$(dirname "$0")"

MAXPX=1200          # длинная сторона превью
SRC_DIRS=(pics inside)

count=0
for dir in "${SRC_DIRS[@]}"; do
  [ -d "$dir" ] || continue
  while IFS= read -r -d '' f; do
    out="previews/$f"
    mkdir -p "$(dirname "$out")"
    sips -Z "$MAXPX" "$f" --out "$out" >/dev/null 2>&1 && count=$((count+1))
  done < <(find "$dir" -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' \) -print0)
done

echo "Готово: $count превью в previews/ (≤${MAXPX}px)."
du -sh previews 2>/dev/null || true

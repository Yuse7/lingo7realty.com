#!/usr/bin/env python3
"""Emit `<output-name>\t<url-hash>` lines for each photo ad variant.

Consumed by ad-photo.html (reads location.hash). Minimal text: one photo from
the review set + one short phrase. render.sh turns each line into a screenshot.

Env:
  L7_ORIGIN  origin serving the site (default http://localhost:4399)
"""
import json, os, urllib.parse

ORIGIN = os.environ.get("L7_ORIGIN", "http://localhost:4399")
def photo(name): return f"{ORIGIN}/pics/reviews/{name}.jpg"

# (output-name, review-photo, phrase-html, style a|b, object-position)
VARIANTS = [
    ("01-pass-in-your-language", "carmen",
     "Pass in <span class='ac'>your language.</span>", "a", "62% 24%"),
    ("02-license-your-language", "sofia",
     "Your license.<br><span class='ac'>Your language.</span>", "b", "66% 22%"),
    ("03-exam-in-your-language", "giulia",
     "The exam,<br><span class='ac'>in your language.</span>", "a", "58% 22%"),
    ("04-study-pass-in-english", "joao",
     "Study in your language.<br><span class='ac'>Pass in English.</span>", "b", "50% 20%"),
    ("05-tu-licencia-tu-idioma", "jean",
     "Tu licencia,<br><span class='ac'>en tu idioma.</span>", "a", "44% 22%"),
    ("06-no-language-barrier", "polina",
     "No <span class='ac'>language barrier.</span>", "b", "50% 20%"),
]

for name, ph, phrase, style, pos in VARIANTS:
    payload = {"photo": photo(ph), "phrase": phrase, "style": style, "pos": pos}
    print(f"{name}\t{urllib.parse.quote(json.dumps(payload))}")

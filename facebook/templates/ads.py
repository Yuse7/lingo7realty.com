#!/usr/bin/env python3
"""Emit `<output-name>\t<url-hash>` lines for each photo ad variant.

Consumed by ad-photo.html (reads location.hash). Big constant title
"Florida Real Estate License Exam" + one short supporting line (varies, this is
the line we iterate on). render.sh turns each line into a screenshot.

Env:
  L7_ORIGIN  origin serving the site (default http://localhost:4399)
"""
import json, os, urllib.parse

ORIGIN = os.environ.get("L7_ORIGIN", "http://localhost:4399")
def photo(name): return f"{ORIGIN}/pics/reviews/{name}.jpg"

TITLE_EN = "Florida Real Estate<br><span class='ac'>License Exam</span>"
TITLE_ES = "Examen de Licencia<br><span class='ac'>Inmobiliaria de Florida</span>"

SUB_EN = "Pass on your first try, even if English isn't your first language."
SUB_ES = "Apru&eacute;balo a la primera, aunque el ingl&eacute;s no sea tu idioma."

# (output-name, review-photo, title, sub-line, style a|b, object-position)
# Single hero ad: a real licensee in front of the Florida DBPR building.
VARIANTS = [
    ("florida-license-exam", "carmen", TITLE_EN, SUB_EN, "a", "60% 50%"),
    # Other variants were retired (kept here to re-enable quickly):
    # ("02-sofia",  "sofia",  TITLE_EN, SUB_EN, "b", "66% 22%"),
    # ("03-giulia", "giulia", TITLE_EN, SUB_EN, "a", "58% 22%"),
    # ("04-joao",   "joao",   TITLE_EN, SUB_EN, "b", "50% 20%"),
    # ("05-espanol","jean",   TITLE_ES, SUB_ES, "a", "44% 22%"),
    # ("06-polina", "polina", TITLE_EN, SUB_EN, "b", "50% 20%"),
]

for name, ph, title, sub, style, pos in VARIANTS:
    payload = {"photo": photo(ph), "title": title, "sub": sub, "style": style, "pos": pos}
    print(f"{name}\t{urllib.parse.quote(json.dumps(payload))}")

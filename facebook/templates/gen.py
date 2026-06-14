#!/usr/bin/env python3
"""Emit `<output-name>\t<url-hash>` lines for each feature post.

The hash is a URL-encoded JSON payload consumed by feature.html (read from
location.hash). render.sh turns each line into a headless-Chrome screenshot.

Env:
  L7_BASE  base URL where the app screens are served (default localhost:4399)
  L7_LANG  interface language shown inside the phone (default es). One of:
           es pt ht ru fr de it zh ar tl
"""
import json, os, urllib.parse

BASE = os.environ.get("L7_BASE", "http://localhost:4399/screens")
LANG = os.environ.get("L7_LANG", "es")

def sc(name, extra=""):
    q = f"?lang={LANG}" + (("&" + extra) if extra else "")
    return f"{BASE}/{urllib.parse.quote(name)}.html{q}"

# (output-basename, screen-url, headline-html, subtitle, ghost-glyph)
FEATURES = [
    ("03-post-study-in-your-language", sc("Textbook Reading Screen"),
     "Study in your language.<br><span class='ac'>Pass in English.</span>",
     "English on top, your language right below.", "Aa"),
    ("04-post-answers-explained", sc("Quiz Review Screen", "mode=static"),
     "Every answer,<br><span class='ac'>explained in your language.</span>",
     "The question, the choices, and the why.", "?"),
    ("05-post-term-cards", sc("Term Card Screen"),
     "Know every term<br><span class='ac'>by exam day.</span>",
     "Tap to flip: meaning, translation, audio.", "Aa"),
    ("06-post-exam-math", sc("Math Problem Screen"),
     "Exam math,<br><span class='ac'>step by step.</span>",
     "Each problem in your language. No math needed.", "%"),
    ("07-post-all-in-one", sc("Home Menu Screen"),
     "Your whole prep,<br><span class='ac'>in one app.</span>",
     "Textbook, tests, cards, audio, math.", "7"),
]

for name, screen, head, sub, ghost in FEATURES:
    payload = {"screen": screen, "head": head, "sub": sub, "ghost": ghost}
    print(f"{name}\t{urllib.parse.quote(json.dumps(payload))}")

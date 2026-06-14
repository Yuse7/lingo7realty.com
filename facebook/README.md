# Facebook kit — Lingo7 Realty

Reusable toolkit to create on-brand Facebook images and publish posts for the page
**Lingo7Realty** (https://www.facebook.com/profile.php?id=61590582999804).

Everything here is built from the project's own assets: the real app screens in
`public/screens/*.html`, the brand colors from `src/styles/global.css`, and the logo
from `public/favicon.svg`. **No AI image generation** is used, the visuals are HTML/CSS
templates screenshotted with headless Chrome, so they always match the product and the brand.

## Structure

```
facebook/
  README.md      this file
  CONTENT.md     human-facing copy: page setup fields + all post captions
  templates/     the STYLE system (HTML/CSS) -> screenshotted into images
    feature.html   parametric post layout (brand + headline + floating phone)
    cover.html     page cover (1640x624)
    profile.html   avatar (square, shown as a circle)
    languages.html "10 languages" graphic
    ad.html        promotional/ad creative (CTA + guarantee)
    ad-photo.html  minimal photo ad (one review photo + one phrase, 2 styles)
    gen.py         emits the 5 feature posts (screen + headline) for render.sh
    ads.py         emits the photo-ad variants for render.sh
  posts/         ready-to-publish captions (one .txt per post, no em-dashes)
  images/        generated PNGs: cover, avatar, feature posts, ad
  ads/           photo-ad variants (minimal text, image + one phrase)
  automation/    Playwright (CDP) scripts that drive Facebook to publish
```

**Photo ads** (`ads/`): image-led creatives, one short phrase each, built from the
review photos in `public/pics/reviews/`. Edit/add variants in `templates/ads.py`
(photo, phrase, style `a`=full-bleed scrim / `b`=photo + emerald band, object-position).
Note: the review photos are illustrative, not real customers, keep phrases aspirational
and swap in real success stories before running paid ads.

## 1. Regenerate / create images

Requires: macOS, Google Chrome, ImageMagick (`magick`), and the project deps installed.

```bash
facebook/render.sh                # phones shown in Spanish (default)
L7_LANG=ru facebook/render.sh     # render the in-phone UI in another language
                                  # es pt ht ru fr de it zh ar tl
```

`render.sh` builds the site, serves it on port 4399, then screenshots every template
into `facebook/images/` at retina 2x.

**Add a new feature post** in the same style: add one row to `FEATURES` in
`templates/gen.py` (output-name, screen URL, headline HTML, subtitle, ghost glyph) and
re-run `render.sh`. The headline accent uses `<span class='ac'>...</span>`.

**Tweak the look** (gradient, font, phone size): edit `templates/feature.html`. All
templates share the same tokens: emerald `#34D399`, deep-green gradient background,
Inter 800, logo SVG, floating phone card clipped from a live `<iframe>` of the app screen.

## 2. Publish a post to Facebook

The page is the "new Pages experience"; we drive the real UI with `playwright-core`
attached to your own Chrome over CDP (nothing is stored, you log in yourself).

```bash
# 1. launch Chrome with a dedicated profile + debugging port (window opens)
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --remote-debugging-port=9222 --user-data-dir=/tmp/l7-fb-profile \
  "https://www.facebook.com/profile.php?id=61590582999804" &

# 2. log into Facebook in that window, switch INTO the Lingo7Realty page

# 3. publish a post end-to-end (opens composer -> types -> attaches image -> Post)
node facebook/automation/post.mjs facebook/posts/exam-math.txt facebook/images/06-post-exam-math.png

#    add --no-publish to stop before posting (review first)
```

Helper scripts (all connect to Chrome on :9222):
`post.mjs` (end-to-end post), `upload.mjs`/`cover.mjs` (avatar/cover), `fill-bio.mjs` (bio),
`inspect.mjs`/`probe.mjs`/`shot.mjs` (read page state + screenshot to `/tmp/l7fb/shot.png`).

### Post ↔ image pairing

| caption | image |
|---|---|
| `posts/launch.txt` | `images/07-post-all-in-one.png` |
| `posts/study-in-your-language.txt` | `images/03-post-study-in-your-language.png` |
| `posts/answers-explained.txt` | `images/04-post-answers-explained.png` |
| `posts/term-cards.txt` | `images/05-post-term-cards.png` |
| `posts/exam-math.txt` | `images/06-post-exam-math.png` |
| `posts/languages.txt` | `images/08-post-10-languages.png` |
| `posts/pricing.txt` | (text only, or `09-ad.png`) |

## 3. Before promoting (see CONTENT.md §5)

- The site testimonials are placeholders, do not repost them as real.
- App Store / Google Play links still point to the old L7 app.
- `lingo7realty.com` is a placeholder domain in the code.

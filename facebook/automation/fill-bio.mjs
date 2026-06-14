import { chromium } from 'playwright-core';
const text = process.argv[2];
const browser = await chromium.connectOverCDP('http://localhost:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
const fb = pages.find(p => p.url().includes('facebook.com')) || pages[0];
await fb.bringToFront();

// focus the bio contenteditable (bottom-most editable in the main column)
const info = await fb.evaluate(() => {
  const els = [...document.querySelectorAll('[contenteditable="true"],[role="textbox"],textarea')];
  const cand = els
    .map(el => ({ el, r: el.getBoundingClientRect() }))
    .filter(o => o.r.width > 120 && o.r.top > 250 && o.r.height > 10)
    .sort((a, b) => b.r.top - a.r.top);
  if (!cand.length) return { ok: false, count: els.length };
  const t = cand[0].el;
  t.focus();
  return { ok: true, tag: t.tagName, role: t.getAttribute('role'), top: Math.round(cand[0].r.top) };
});
console.log('focus result:', JSON.stringify(info));
if (!info.ok) { await browser.close(); process.exit(2); }
await fb.keyboard.type(text, { delay: 3 });
await fb.waitForTimeout(700);
const save = fb.getByRole('button', { name: /^save$/i });
await save.first().click({ timeout: 8000 });
console.log('clicked Save');
await fb.waitForTimeout(2500);
await fb.screenshot({ path: '/tmp/l7fb/shot.png' }).catch(() => {});
await browser.close();

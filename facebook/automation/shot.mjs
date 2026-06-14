import { chromium } from 'playwright-core';

const gotoUrl = process.argv[2]; // optional
const browser = await chromium.connectOverCDP('http://localhost:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
const fb = pages.find(p => p.url().includes('facebook.com')) || pages[0];
await fb.bringToFront();
if (gotoUrl) {
  await fb.goto(gotoUrl, { waitUntil: 'domcontentloaded' }).catch(e => console.log('goto err', e.message));
  await fb.waitForTimeout(3500);
}
console.log('URL:', fb.url());
console.log('TITLE:', await fb.title().catch(() => ''));
// List visible buttons/links with short text to map the UI
const labels = await fb.evaluate(() => {
  const out = [];
  const els = document.querySelectorAll('[role="button"],a[role="link"],button');
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > (window.innerHeight+400)) continue;
    let t = (el.getAttribute('aria-label') || el.innerText || '').trim().replace(/\s+/g, ' ');
    if (!t || t.length > 40) continue;
    out.push(`${Math.round(r.top)},${Math.round(r.left)} :: ${t}`);
  }
  return [...new Set(out)].slice(0, 60);
});
console.log('--- clickable (top,left :: label) ---');
console.log(labels.join('\n'));
await fb.screenshot({ path: '/tmp/l7fb/shot.png' }).catch(e => console.log('shot err', e.message));
await browser.close();

import { chromium } from 'playwright-core';

// usage: node upload.mjs "Trigger Button Name" /abs/path/to/file [index]
const name = process.argv[2];
const file = process.argv[3];
const which = parseInt(process.argv[4] || '0', 10);
const browser = await chromium.connectOverCDP('http://localhost:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
const fb = pages.find(p => p.url().includes('facebook.com')) || pages[0];
await fb.bringToFront();

const rx = new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
let loc = fb.getByRole('menuitem', { name: rx })
  .or(fb.getByRole('button', { name: rx }))
  .or(fb.getByRole('link', { name: rx }));
if (await loc.count() === 0) loc = fb.getByText(rx, { exact: false });
const n = await loc.count();
console.log(`trigger "${name}" matches: ${n}`);
if (n === 0) { await fb.screenshot({ path: '/tmp/l7fb/shot.png' }); await browser.close(); process.exit(2); }

let chooser = null;
try {
  [chooser] = await Promise.all([
    fb.waitForEvent('filechooser', { timeout: 6000 }),
    loc.nth(which).click({ timeout: 8000 }),
  ]);
} catch (e) {
  console.log('no filechooser within timeout:', e.message.split('\n')[0]);
}
if (chooser) {
  await chooser.setFiles(file);
  console.log('FILE SET via filechooser:', file);
} else {
  const inp = fb.locator('input[type="file"]');
  const c = await inp.count();
  console.log('file inputs present:', c);
  if (c > 0) { await inp.last().setInputFiles(file); console.log('FILE SET via input:', file); }
  else console.log('NO chooser and NO file input — a menu/dialog likely opened; inspect next.');
}
await fb.waitForTimeout(4000);
console.log('URL now:', fb.url());
await fb.screenshot({ path: '/tmp/l7fb/shot.png' }).catch(() => {});
await browser.close();

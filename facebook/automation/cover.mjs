import { chromium } from 'playwright-core';
const file = process.argv[2];
const browser = await chromium.connectOverCDP('http://localhost:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
const fb = pages.find(p => p.url().includes('facebook.com')) || pages[0];
await fb.bringToFront();

// 1. open the cover menu
const addCover = fb.getByRole('button', { name: /add cover photo|edit cover photo/i });
await addCover.first().click({ timeout: 8000 });
console.log('opened cover menu');
await fb.waitForTimeout(1200);

// 2. click "Upload photo" menuitem while catching the native file chooser
const upload = fb.getByRole('menuitem', { name: /upload photo/i });
console.log('upload menuitem count:', await upload.count());
let chooser = null;
try {
  [chooser] = await Promise.all([
    fb.waitForEvent('filechooser', { timeout: 12000 }),
    upload.first().click({ timeout: 8000 }),
  ]);
} catch (e) {
  console.log('no filechooser:', e.message.split('\n')[0]);
}
if (chooser) {
  await chooser.setFiles(file);
  console.log('COVER FILE SET via filechooser:', file);
} else {
  console.log('filechooser did not fire; leaving as-is for inspection');
}
await fb.waitForTimeout(4500);
console.log('URL:', fb.url());
await fb.screenshot({ path: '/tmp/l7fb/shot.png' }).catch(() => {});
await browser.close();

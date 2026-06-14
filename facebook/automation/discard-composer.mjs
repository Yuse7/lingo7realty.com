import { chromium } from 'playwright-core';
const browser = await chromium.connectOverCDP('http://localhost:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
const fb = pages.find(p => p.url().includes('facebook.com')) || pages[0];
await fb.bringToFront();

// close composer
const close = fb.getByRole('button', { name: /close composer dialog|close/i });
if (await close.count()) { await close.first().click().catch(() => {}); console.log('clicked close'); }
await fb.waitForTimeout(1200);
// confirm leave/discard if asked
const leave = fb.getByRole('button', { name: /^leave$|discard|leave page/i });
if (await leave.count()) { await leave.first().click().catch(() => {}); console.log('clicked leave/discard'); }
await fb.waitForTimeout(1500);
// press escape a couple times to clear any leftover menus
await fb.keyboard.press('Escape').catch(() => {});
await fb.waitForTimeout(400);
await fb.keyboard.press('Escape').catch(() => {});
await fb.waitForTimeout(1000);
console.log('URL:', fb.url());
const dialogs = await fb.locator('[role="dialog"]').count();
console.log('open dialogs:', dialogs);
await fb.screenshot({ path: '/tmp/l7fb/shot.png' }).catch(() => {});
await browser.close();

import { chromium } from 'playwright-core';

// usage: node click.mjs "Accessible Name" [index]
const name = process.argv[2];
const which = parseInt(process.argv[3] || '0', 10);
const browser = await chromium.connectOverCDP('http://localhost:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
const fb = pages.find(p => p.url().includes('facebook.com')) || pages[0];
await fb.bringToFront();

const rx = new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
const loc = fb.getByRole('button', { name: rx }).or(fb.getByRole('link', { name: rx }));
const n = await loc.count();
console.log(`matches for "${name}": ${n}`);
if (n === 0) { console.log('NO MATCH'); await fb.screenshot({ path: '/tmp/l7fb/shot.png' }); await browser.close(); process.exit(2); }
await loc.nth(which).scrollIntoViewIfNeeded().catch(() => {});
await loc.nth(which).click({ timeout: 9000 });
console.log('clicked index', which);
await fb.waitForTimeout(3500);
console.log('URL now:', fb.url());
await fb.screenshot({ path: '/tmp/l7fb/shot.png' }).catch(e => console.log('shot err', e.message));
await browser.close();

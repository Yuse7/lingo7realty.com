import { chromium } from 'playwright-core';

const browser = await chromium.connectOverCDP('http://localhost:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
console.log('pages open:', pages.length);
for (const p of pages) {
  let title = '';
  try { title = await p.title(); } catch {}
  console.log('  -', p.url(), '|', title);
}
// Inspect the first facebook page
const fb = pages.find(p => p.url().includes('facebook.com')) || pages[0];
await fb.bringToFront();
const url = fb.url();
const hasLoginForm = await fb.locator('input[name="email"], input[name="pass"]').count().catch(() => 0);
const hasComposer = await fb.getByText(/What's on your mind|Что у вас нового|Create post|Write something/i).count().catch(() => 0);
console.log('current:', url);
console.log('loginFormFields:', hasLoginForm, '| composerHints:', hasComposer);
console.log(hasLoginForm > 0 ? 'STATE: NOT logged in (login form visible)' : 'STATE: looks logged in / no login form');
await browser.close(); // detaches CDP, does NOT close Chrome

import { chromium } from 'playwright-core';
import { readFileSync } from 'node:fs';

const text = readFileSync(process.argv[2], 'utf8').replace(/\n$/, '');
const image = process.argv[3];
const browser = await chromium.connectOverCDP('http://localhost:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
const fb = pages.find(p => p.url().includes('facebook.com')) || pages[0];
await fb.bringToFront();

// focus the composer editor (direct selector; aria-label "What's on your mind?")
const editor = fb.locator('div[role="textbox"][contenteditable="true"]');
console.log('editor count:', await editor.count());
await editor.first().scrollIntoViewIfNeeded().catch(() => {});
await editor.first().click({ timeout: 8000 });
await fb.waitForTimeout(400);
await fb.keyboard.type(text, { delay: 2 });
console.log('typed text');
await fb.waitForTimeout(1200);

// attach image via composer file input (global last)
const input = fb.locator('input[type="file"]');
console.log('file inputs:', await input.count());
await input.last().setInputFiles(image);
console.log('image set:', image);
await fb.waitForTimeout(6000); // let the photo preview render
await fb.screenshot({ path: '/tmp/l7fb/shot.png' }).catch(() => {});
console.log('done; URL:', fb.url());
await browser.close();

import { chromium } from 'playwright-core';
import { readFileSync } from 'node:fs';

// usage: node compose-post.mjs /path/text.txt /path/image.png
const text = readFileSync(process.argv[2], 'utf8').replace(/\n$/, '');
const image = process.argv[3];
const browser = await chromium.connectOverCDP('http://localhost:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
const fb = pages.find(p => p.url().includes('facebook.com')) || pages[0];
await fb.bringToFront();

// 1. land on the page feed, clear any open note/composer
await fb.goto('https://www.facebook.com/profile.php?id=61590582999804', { waitUntil: 'domcontentloaded' });
await fb.waitForTimeout(3000);
await fb.keyboard.press('Escape'); await fb.waitForTimeout(400);
await fb.keyboard.press('Escape'); await fb.waitForTimeout(600);

// 2. open the FEED post composer (not the avatar "note")
let trigger = fb.getByRole('button', { name: /what's on your mind/i }).filter({ visible: true });
if (await trigger.count() === 0)
  trigger = fb.getByText(/what's on your mind/i).filter({ visible: true });
if (await trigger.count() === 0)
  trigger = fb.getByRole('button', { name: /^create (a )?post$/i }).filter({ visible: true });
console.log('feed composer trigger count:', await trigger.count());
await trigger.first().click({ timeout: 9000 });
await fb.waitForTimeout(2800);

// 3. type the text into the dialog's editor
const dialog = fb.locator('[role="dialog"]').last();
const editor = dialog.locator('[contenteditable="true"],[role="textbox"]').first();
await editor.click({ timeout: 8000 });
await fb.keyboard.type(text, { delay: 2 });
console.log('typed text');
await fb.waitForTimeout(1200);

// 4. attach the image (composer file input lives outside the dialog node)
let input = dialog.locator('input[type="file"]');
if (await input.count() === 0) input = fb.locator('input[type="file"]');
const ic = await input.count();
console.log('file inputs:', ic);
if (ic > 0) { await input.last().setInputFiles(image); console.log('image attached:', image); }
else console.log('NO file input found to attach image');
await fb.waitForTimeout(5000); // wait for image preview to render
console.log('URL:', fb.url());
await fb.screenshot({ path: '/tmp/l7fb/shot.png' }).catch(() => {});
await browser.close();

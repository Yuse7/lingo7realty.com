import { chromium } from 'playwright-core';
import { readFileSync } from 'node:fs';

// end-to-end: open feed composer -> type -> attach image -> publish
// usage: node post.mjs /path/text.txt /path/image.png [--no-publish]
const text = readFileSync(process.argv[2], 'utf8').replace(/\n$/, '');
const image = process.argv[3];
const noPublish = process.argv.includes('--no-publish');

const browser = await chromium.connectOverCDP('http://localhost:9222');
const fb = browser.contexts()[0].pages().find(p => p.url().includes('facebook.com'));
await fb.bringToFront();

await fb.goto('https://www.facebook.com/profile.php?id=61590582999804', { waitUntil: 'domcontentloaded' });
await fb.waitForTimeout(3000);
await fb.keyboard.press('Escape'); await fb.waitForTimeout(400);
await fb.keyboard.press('Escape'); await fb.waitForTimeout(600);

// open the feed post composer
let trigger = fb.getByRole('button', { name: /what's on your mind/i }).filter({ visible: true });
if (await trigger.count() === 0) trigger = fb.getByText(/what's on your mind/i).filter({ visible: true });
console.log('composer trigger count:', await trigger.count());
await trigger.first().click({ timeout: 9000 });
await fb.waitForTimeout(2800);

// type text
const editor = fb.locator('div[role="textbox"][contenteditable="true"]');
await editor.first().click({ timeout: 8000 });
await fb.waitForTimeout(300);
await fb.keyboard.type(text, { delay: 2 });
console.log('typed text');
await fb.waitForTimeout(800);
await fb.keyboard.press('Escape'); // dismiss any hashtag typeahead (keeps dialog open)
await fb.waitForTimeout(500);

// attach image
const input = fb.locator('input[type="file"]');
console.log('file inputs:', await input.count());
await input.last().setInputFiles(image);
console.log('image set');
await fb.waitForTimeout(6000); // wait for preview

if (noPublish) {
  console.log('NO-PUBLISH mode; leaving composer open');
  await fb.screenshot({ path: '/tmp/l7fb/shot.png' }).catch(() => {});
  await browser.close();
  process.exit(0);
}

// publish (Next -> Post)
for (let i = 0; i < 4; i++) {
  const post = fb.getByRole('button', { name: /^(post|publish)$/i }).filter({ visible: true });
  if (await post.count()) { await post.first().click({ timeout: 9000 }); console.log('clicked Post'); break; }
  const next = fb.getByRole('button', { name: /^next$/i }).filter({ visible: true });
  if (await next.count()) { await next.first().click({ timeout: 9000 }); console.log('clicked Next'); await fb.waitForTimeout(2500); continue; }
  console.log('no Post/Next found'); break;
}
await fb.waitForTimeout(5000);
const dialogs = await fb.locator('[role="dialog"]').filter({ visible: true }).count();
console.log('visible dialogs after publish:', dialogs, '| URL:', fb.url());
await fb.screenshot({ path: '/tmp/l7fb/shot.png' }).catch(() => {});
await browser.close();

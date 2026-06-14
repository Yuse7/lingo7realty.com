import { chromium } from 'playwright-core';
const browser = await chromium.connectOverCDP('http://localhost:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
const fb = pages.find(p => p.url().includes('facebook.com')) || pages[0];
await fb.bringToFront();

for (let i = 0; i < 4; i++) {
  const post = fb.getByRole('button', { name: /^(post|publish)$/i }).filter({ visible: true });
  if (await post.count()) {
    await post.first().click({ timeout: 9000 });
    console.log('clicked Post/Publish');
    break;
  }
  const next = fb.getByRole('button', { name: /^next$/i }).filter({ visible: true });
  if (await next.count()) {
    await next.first().click({ timeout: 9000 });
    console.log('clicked Next');
    await fb.waitForTimeout(2500);
    continue;
  }
  console.log('no Post/Next button found this round');
  break;
}
await fb.waitForTimeout(5000);
const dialogs = await fb.locator('[role="dialog"]').filter({ visible: true }).count();
console.log('visible dialogs after publish:', dialogs, '| URL:', fb.url());
await fb.screenshot({ path: '/tmp/l7fb/shot.png' }).catch(() => {});
await browser.close();

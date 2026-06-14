import { chromium } from 'playwright-core';
const by = parseInt(process.argv[2] || '700', 10);
const browser = await chromium.connectOverCDP('http://localhost:9222');
const fb = browser.contexts()[0].pages().find(p => p.url().includes('facebook.com'));
await fb.bringToFront();
await fb.mouse.wheel(0, by);
await fb.waitForTimeout(1800);
// report any post-like article headers / timestamps
const posts = await fb.evaluate(() => {
  const out = [];
  document.querySelectorAll('[role="article"]').forEach(a => {
    const t = (a.innerText || '').replace(/\s+/g, ' ').slice(0, 90);
    if (t) out.push(t);
  });
  return out.slice(0, 6);
});
console.log('articles:', posts.length);
posts.forEach((p, i) => console.log(`  [${i}] ${p}`));
await fb.screenshot({ path: '/tmp/l7fb/shot.png' }).catch(() => {});
await browser.close();

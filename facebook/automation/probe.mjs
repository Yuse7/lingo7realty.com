import { chromium } from 'playwright-core';
const b = await chromium.connectOverCDP('http://localhost:9222');
const fb = b.contexts()[0].pages().find(p => p.url().includes('facebook.com'));
await fb.bringToFront();
const d = await fb.evaluate(() => {
  const info = { dialogs: [], editables: [] };
  document.querySelectorAll('[role="dialog"],[role="alertdialog"]').forEach(e => { const r = e.getBoundingClientRect(); info.dialogs.push(`${e.getAttribute('role')} ${Math.round(r.width)}x${Math.round(r.height)} "${(e.getAttribute('aria-label') || '').slice(0, 30)}"`); });
  document.querySelectorAll('[contenteditable="true"],[role="textbox"],textarea').forEach(e => { const r = e.getBoundingClientRect(); if (r.width < 5) return; info.editables.push(`${e.tagName} role=${e.getAttribute('role')} ce=${e.getAttribute('contenteditable')} ${Math.round(r.top)},${Math.round(r.left)} ${Math.round(r.width)}x${Math.round(r.height)} al="${(e.getAttribute('aria-label') || e.getAttribute('aria-placeholder') || '').slice(0, 38)}"`); });
  return info;
});
console.log('DIALOGS:', JSON.stringify(d.dialogs));
console.log('EDITABLES:'); d.editables.forEach(x => console.log('  ' + x));
await fb.screenshot({ path: '/tmp/l7fb/shot.png' });
await b.close();

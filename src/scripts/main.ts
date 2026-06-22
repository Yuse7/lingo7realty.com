// Client-side behaviour for the Lingo7 Realty landing page.
// Consolidated from the inline <script> blocks of the original index.html:
// modals, burger menu, header language switcher, language section
// sync/hover, scroll reveals, library tabs, FAQ accordion, the hero demo
// orchestrator. The language switcher is decorative - it reloads with a
// ?lang code but the page content always stays English (as in the original).

// Определение языка демо вынесено в общий модуль ./lang - его же импортируют все
// демо-экраны (src/components/screens/*.astro), поэтому заголовок hero «My
// language is …» и язык в телефоне всегда показывают одно и то же.
import { resolveLang } from './lang';
import { isPromoActive, msUntilMidnight, formatCountdown } from './promo';

// ── Login modal ──
//    Карточка тарифа переехала на отдельную страницу /plans/ (бывшие триггеры
//    data-buy - теперь обычные ссылки), поэтому здесь осталась только модалка входа.
(function () {
  var loginModal = document.getElementById('loginModal');
  function closeAll() {
    if (loginModal) loginModal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
  }
  function open(m: Element | null) { if (!m) { return; } closeAll(); m.classList.add('is-open'); document.body.classList.add('modal-open'); }
  document.addEventListener('click', function (e) {
    var t = e.target as Element;
    if (t.closest('[data-login]')) { e.preventDefault(); open(loginModal); return; }
    if (t.closest('[data-close-modal]')) { e.preventDefault(); closeAll(); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeAll(); } });
  var loginForm = document.getElementById('loginForm');
  if (loginForm) { loginForm.addEventListener('submit', function (e) { e.preventDefault(); /* TODO: подключить авторизацию */ }); }
})();

// ── Promo banner: «today only $10», настоящее правило - только чётные числа ──
//    По нечётным числам баннер остаётся скрытым. По чётным - раскрываем и тикаем
//    обратный отсчёт до полуночи; на полуночи перезагружаем (день стал нечётным).
(function () {
  var promo = document.getElementById('heroPromo');
  if (!promo) { return; }
  if (!isPromoActive()) { return; }
  promo.hidden = false;
  var timer = document.getElementById('heroPromoTimer');
  (function tick() {
    var ms = msUntilMidnight();
    if (ms <= 0) { location.reload(); return; }
    if (timer) { timer.textContent = 'Ends in ' + formatCountdown(ms); }
    setTimeout(tick, 1000);
  })();
})();

// ── Burger menu ──
(function () {
  var burger = document.getElementById('burger');
  var mobileMenu = document.getElementById('mobileMenu');
  if (!burger || !mobileMenu) { return; }
  burger.addEventListener('click', function () {
    burger!.classList.toggle('is-open');
    mobileMenu!.classList.toggle('is-open');
  });
  mobileMenu.querySelectorAll('.mobile-menu__link').forEach(function (link) {
    link.addEventListener('click', function () {
      burger!.classList.remove('is-open');
      mobileMenu!.classList.remove('is-open');
    });
  });
})();

// ── Library demo screens ──
//    Экраны библиотеки инлайн ([data-screen]); язык каждый экран берёт сам из ?lang.
//    Демо стартует, когда экран попадает в зону видимости, и встаёт на паузу, когда
//    уходит (l7:play / l7:pause - раньше слалось в iframe через postMessage).
//    Выбор роли/плана в карточке тарифа переехал на страницу /plans/.
(function () {
  if ('IntersectionObserver' in window) {
    document.querySelectorAll<HTMLElement>('.library__panel [data-screen]').forEach(function (root) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          root.dispatchEvent(new CustomEvent(en.isIntersecting ? 'l7:play' : 'l7:pause'));
        });
      }, { threshold: 0.4 }).observe(root);
    });
  }
})();

// ── Hero inline language picker: pick a language → reload with ?lang=xx so ──
//    every demo screen (hero phone, library, math) renders in that language.
(function () {
  var dd = document.getElementById('heroLang');
  var btn = document.getElementById('heroLangBtn');
  var menu = document.getElementById('heroLangMenu');
  var nameEl = document.getElementById('heroLangName');
  if (!dd || !btn || !menu) { return; }

  // Текущий язык: ?lang из адреса → язык браузера → испанский (см. ./lang).
  var cur = resolveLang();

  // Подсветить активный язык и подставить его английское имя в заголовок.
  var curOpt = menu.querySelector('.hero-lang__opt[data-lang="' + cur + '"]');
  if (curOpt) {
    menu.querySelectorAll('.hero-lang__opt').forEach(function (o) { o.classList.remove('is-active'); });
    curOpt.classList.add('is-active');
    var enName = curOpt.querySelector('.hero-lang__opt-txt b');
    if (nameEl && enName) { nameEl.textContent = enName.textContent; }
  }

  // Выбор языка: меняем ?lang и перезагружаем - вся демо-обвязка читает его при загрузке.
  // Перед перезагрузкой ставим флаг, чтобы после неё подсветить телефон с демо.
  menu.querySelectorAll('.hero-lang__opt').forEach(function (opt) {
    opt.addEventListener('click', function (e) {
      e.stopPropagation();
      var code = opt.getAttribute('data-lang')!;
      if (code === cur) { dd!.classList.remove('is-open'); return; }
      try { sessionStorage.setItem('langFlash', '1'); } catch (err) { /* приватный режим */ }
      var params = new URLSearchParams(location.search);
      params.set('lang', code);
      location.search = params.toString();
    });
  });

  // После перезагрузки (выбор языка) - короткая вспышка-подсветка телефона справа,
  // чтобы взгляд ушёл на демо, которое теперь играет на выбранном языке.
  var flash = false;
  try { flash = sessionStorage.getItem('langFlash') === '1'; sessionStorage.removeItem('langFlash'); } catch (err) { /* */ }
  if (flash) {
    var phoneWrap = document.querySelector('.hero__phone-wrap');
    if (phoneWrap) {
      phoneWrap.classList.add('is-langflash');
      var shell = phoneWrap.querySelector('.phone__shell');
      if (shell) {
        shell.addEventListener('animationend', function () { phoneWrap!.classList.remove('is-langflash'); }, { once: true });
      }
    }
  }

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = dd!.classList.toggle('is-open');
    btn!.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.addEventListener('click', function () {
    dd!.classList.remove('is-open');
    btn!.setAttribute('aria-expanded', 'false');
  });
})();

// ── Reveal on scroll (compare rows + audience cards) ──
(function () {
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll<HTMLElement>('.compare__table').forEach(function (table) {
    revealObserver.observe(table);
  });
  document.querySelectorAll<HTMLElement>('.audience__card').forEach(function (card, i) {
    card.style.transitionDelay = (i * 0.1) + 's';
    revealObserver.observe(card);
  });
})();

// ── Library tabs ──
document.querySelectorAll<HTMLElement>('.library__tab').forEach(function (tab) {
  tab.addEventListener('click', function () {
    var id = tab.dataset.tab;
    document.querySelectorAll('.library__tab').forEach(function (t) { t.classList.remove('is-active'); });
    document.querySelectorAll('.library__panel').forEach(function (p) { p.classList.remove('is-active'); });
    tab.classList.add('is-active');
    var panel = document.querySelector('.library__panel[data-tab="' + id + '"]');
    if (panel) { panel.classList.add('is-active'); }
  });
});

// ── Pains chips ──
document.querySelectorAll<HTMLElement>('.pains__chip').forEach(function (chip) {
  chip.addEventListener('click', function () {
    var idx = chip.dataset.pain;
    document.querySelectorAll('.pains__chip').forEach(function (c) { c.classList.remove('is-active'); });
    document.querySelectorAll('.pains__answer').forEach(function (a) { a.classList.remove('is-active'); });
    chip.classList.add('is-active');
    var ans = document.querySelector('.pains__answer[data-pain="' + idx + '"]');
    if (ans) { ans.classList.add('is-active'); }
  });
});

// ── FAQ accordion ──
document.querySelectorAll('.faq__q').forEach(function (q) {
  q.addEventListener('click', function () {
    var item = q.parentElement!;
    var wasOpen = item.classList.contains('is-open');
    document.querySelectorAll('.faq__item').forEach(function (i) { i.classList.remove('is-open'); });
    if (!wasOpen) item.classList.add('is-open');
  });
});

// ── Hero demo orchestrator: Home and Quiz are inlined side by side in the phone.
//    Show one screen, hide the other, and (re)play the shown one via l7:play /
//    l7:pause - the screens used to reload as an iframe (which restarted their
//    demo); now they persist. Screens bubble l7:nav / l7:badge / l7:langPicked
//    up to the host (#heroDemo). Demo language is read by each screen from ?lang.
(function () {
  var host = document.getElementById('heroDemo');
  if (!host) { return; }
  var homeWrap = host.querySelector('[data-hero-screen="home"]') as HTMLElement | null;
  var quizWrap = host.querySelector('[data-hero-screen="quiz"]') as HTMLElement | null;
  if (!homeWrap || !quizWrap) { return; }
  var homeRoot = homeWrap.querySelector('[data-screen="home"]') as HTMLElement | null;
  var quizRoot = quizWrap.querySelector('[data-screen="quiz"]') as HTMLElement | null;

  // ── Дека возможностей: плашки прилетают по событиям из экранов ──
  var deck = document.getElementById('featDeck');
  var BADGES: Record<string, { label: string }> = {
    native:    { label: 'Let me walk you through the interface' },
    translate: { label: 'Every text has a translation' },
    dict:      { label: "Tap any word you don't know" },
    explain:   { label: 'The explanation is translated too' },
    card:      { label: 'A card with a detailed term description' },
    audio:     { label: 'Listen to questions hands-free' }
  };
  var shown: Record<string, boolean> = {};
  // Подсказка «Pick your language» видна в слоте сразу при загрузке (плейсхолдер
  // в HTML пустой) и в паузах демо - до того, как стартует процесс выбора.
  if (deck) {
    var dflt = deck.querySelector('.feat-default');
    if (dflt) { dflt.textContent = BADGES.native.label; }
  }
  function clearDeck() {
    if (deck) {
      Array.prototype.forEach.call(deck.querySelectorAll('.feat-chip'), function (c: Element) {
        if (c.parentNode) { c.parentNode.removeChild(c); }
      });
      deck.classList.remove('has-badge');   // снова показать титульную заглушку
    }
    shown = {};
  }
  // Карусель: в слоте видна одна плашка, новая сменяет предыдущую кросс-фейдом.
  function addBadge(id: string) {
    if (!deck || !BADGES[id] || shown[id]) { return; }
    shown[id] = true;
    var b = BADGES[id];
    var el = document.createElement('span');
    el.className = 'feat-chip';
    el.innerHTML = '<span class="feat-chip__label">' + b.label + '</span>';
    deck.appendChild(el);
    deck.classList.add('has-badge');         // спрятать титульную заглушку
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { el.classList.add('is-in'); });
    });
    // окно = 1 плашка: предыдущая уезжает кросс-фейдом, новая встаёт на её место
    var live = deck.querySelectorAll('.feat-chip:not(.is-out)');
    for (var i = 0; i < live.length - 1; i++) {
      (function (p) {
        p.classList.add('is-out');
        setTimeout(function () { if (p.parentNode) { p.parentNode.removeChild(p); } }, 460);
      })(live[i]);
    }
  }

  // Показать один экран, спрятать другой; (пере)играть показанный, поставить на
  // паузу скрытый. Подпись «Pick a language» возвращается только на Home.
  function show(which: string) {
    var toQuiz = which === 'quiz';
    var showWrap = toQuiz ? quizWrap! : homeWrap!;
    var hideWrap = toQuiz ? homeWrap! : quizWrap!;
    var showRoot = toQuiz ? quizRoot : homeRoot;
    var hideRoot = toQuiz ? homeRoot : quizRoot;
    clearDeck();
    if (deck) {
      deck.classList.remove('hint-off');
      var d2 = deck.querySelector('.feat-default');
      if (d2) { d2.textContent = toQuiz ? '' : BADGES.native.label; }
    }
    if (hideRoot) { hideRoot.dispatchEvent(new CustomEvent('l7:pause')); }
    hideWrap.style.opacity = '0';
    setTimeout(function () {
      hideWrap.style.display = 'none';
      showWrap.style.display = '';
      showWrap.style.opacity = '0';
      requestAnimationFrame(function () { showWrap.style.opacity = '1'; });
      if (showRoot) { showRoot.dispatchEvent(new CustomEvent('l7:play')); }
    }, 200);
  }

  host.addEventListener('l7:nav', function (e) { show((e as CustomEvent).detail.to); });
  host.addEventListener('l7:badge', function (e) { addBadge((e as CustomEvent).detail.id); });
  host.addEventListener('l7:langPicked', function () { if (deck) { deck.classList.add('hint-off'); } });

  // Старт: Home показан и играет, Quiz скрыт. Шлём play на load, когда скрипты
  // экранов уже навесили свои l7:play-слушатели.
  function boot() {
    quizWrap!.style.display = 'none';
    homeWrap!.style.display = '';
    homeWrap!.style.opacity = '1';
    if (homeRoot) { homeRoot.dispatchEvent(new CustomEvent('l7:play')); }
  }
  // На DOMContentLoaded, а не на window.load: ждать загрузки ВСЕХ картинок страницы
  // не нужно (это давало секундную задержку старта демо на image-heavy лендинге).
  // К DOMContentLoaded скрипты экранов уже навесили свои l7:play-слушатели.
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', boot); } else { boot(); }
})();

// Client-side behaviour for the Lingo7 Realty landing page.
// Consolidated from the inline <script> blocks of the original index.html:
// modals, sticky CTA, burger menu, header language switcher, language section
// sync/hover, scroll reveals, library tabs, FAQ accordion, the hero demo
// orchestrator. The language switcher is decorative - it reloads with a
// ?lang code but the page content always stays English (as in the original).

// ── Pricing & login modals ──
(function () {
  var pricingModal = document.getElementById('pricingModal');
  var loginModal = document.getElementById('loginModal');
  var pricingHost = document.getElementById('pricingHost');
  var source = document.querySelector('.final-cta .pricing');
  function closeAll() {
    if (pricingModal) pricingModal.classList.remove('is-open');
    if (loginModal) loginModal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
  }
  function open(m: Element | null) { if (!m) { return; } closeAll(); m.classList.add('is-open'); document.body.classList.add('modal-open'); }
  function openPricing() {
    if (pricingHost && source) { pricingHost.innerHTML = ''; pricingHost.appendChild(source.cloneNode(true)); }
    open(pricingModal);
  }
  document.addEventListener('click', function (e) {
    var t = e.target as Element;
    if (t.closest('[data-buy]')) { e.preventDefault(); openPricing(); return; }
    if (t.closest('[data-login]')) { e.preventDefault(); open(loginModal); return; }
    if (t.closest('[data-close-modal]')) { e.preventDefault(); closeAll(); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeAll(); } });
  var loginForm = document.getElementById('loginForm');
  if (loginForm) { loginForm.addEventListener('submit', function (e) { e.preventDefault(); /* TODO: подключить авторизацию */ }); }
})();

// ── Sticky CTA (mobile) ──
(function () {
  var stickyCta = document.getElementById('stickyCta');
  var heroSection = document.querySelector('.hero');
  var finalCta = document.querySelector('.final-cta');
  if (stickyCta && heroSection) {
    window.addEventListener('scroll', function () {
      var heroBottom = heroSection!.getBoundingClientRect().bottom;
      var finalTop = finalCta ? finalCta.getBoundingClientRect().top : Infinity;
      if (heroBottom < 0 && finalTop > window.innerHeight) {
        stickyCta!.classList.add('is-visible');
      } else {
        stickyCta!.classList.remove('is-visible');
      }
    }, { passive: true });
  }
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

// ── Site language for demo iframes + supporting UI ──
(function () {
  var urlLang = (new URLSearchParams(location.search).get('lang') || '').toLowerCase();
  var VALID = ['en', 'es', 'pt', 'ht', 'ru', 'fr', 'de', 'it', 'zh', 'ar', 'tl'];
  var cur = VALID.indexOf(urlLang) >= 0 ? urlLang : 'es';

  // Язык сайта (?lang) подставляем в src экранов-iframe ОДИН раз (data-src → src),
  // чтобы каждый экран сразу грузился на нужном языке (hero - через оркестратор демо).
  document.querySelectorAll('iframe[data-src]').forEach(function (f) {
    var src = f.getAttribute('data-src');
    if (!src) { return; }
    (f as HTMLIFrameElement).src = src + (src.indexOf('?') >= 0 ? '&' : '?') + 'lang=' + cur;
  });

  // Экраны библиотеки: анимация стартует, когда экран попадает в зону видимости (play/pause)
  if ('IntersectionObserver' in window) {
    document.querySelectorAll('.library__panel iframe[data-src]').forEach(function (lf) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          try { (lf as HTMLIFrameElement).contentWindow!.postMessage({ __l7: 'libdemo', action: en.isIntersecting ? 'play' : 'pause' }, '*'); } catch (e) {}
        });
      }, { threshold: 0.4 }).observe(lf);
    });
  }

  // Блок оплаты (нативный, делегирование - работает и для клона в модалке)
  (function () {
    function ctaIcon() { return ' <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>'; }
    document.addEventListener('click', function (e) {
      var role = (e.target as Element).closest('.pricing .role');
      if (role) {
        var card = role.closest('.pricing')!;
        var msg = card.querySelector('.roles-msg');
        if (role.classList.contains('soon')) {
          role.classList.remove('flash'); void (role as HTMLElement).offsetWidth; role.classList.add('flash');
          if (msg) { msg.classList.add('show'); }
          return;
        }
        if (msg) { msg.classList.remove('show'); }
        card.querySelectorAll('.role').forEach(function (r) { r.classList.remove('active'); });
        role.classList.add('active');
        return;
      }
      var plan = (e.target as Element).closest('.pricing .plan');
      if (plan) {
        var card2 = plan.closest('.pricing')!;
        card2.querySelectorAll('.plan').forEach(function (x) { x.classList.remove('active'); });
        plan.classList.add('active');
        var cta = card2.querySelector('.cta');
        if (cta) { cta.innerHTML = 'Get ' + plan.getAttribute('data-plan') + ctaIcon(); }
      }
    });
  })();

})();

// ── Hero inline language picker: pick a language → reload with ?lang=xx so ──
//    every demo screen (hero phone, library, math) renders in that language.
(function () {
  var dd = document.getElementById('heroLang');
  var btn = document.getElementById('heroLangBtn');
  var menu = document.getElementById('heroLangMenu');
  var nameEl = document.getElementById('heroLangName');
  if (!dd || !btn || !menu) { return; }

  // Текущий язык: ?lang из адреса, если поддержан, иначе испанский (как везде).
  var VALID = ['es', 'pt', 'ht', 'ru', 'fr', 'de', 'it', 'zh', 'ar', 'tl'];
  var urlLang = (new URLSearchParams(location.search).get('lang') || '').toLowerCase();
  var cur = VALID.indexOf(urlLang) >= 0 ? urlLang : 'es';

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
  document.querySelectorAll<HTMLElement>('.compare__row').forEach(function (row, i) {
    row.style.transitionDelay = (i * 0.15) + 's';
    revealObserver.observe(row);
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

// ── Hero demo orchestrator: swaps the two generated screens, passes site language ──
(function () {
  var frame = document.getElementById('heroDemo') as HTMLIFrameElement | null;
  if (!frame) { return; }
  var HOME = '/screens/Home%20Menu%20Screen.html';
  var QUIZ = '/screens/Quiz%20Review%20Screen.html';
  // Язык демо в телефоне. Дефолт - испанский (главная позиционируется как испанская версия).
  // Приоритет: ?lang=xx в адресе → DEMO_DEFAULT. Русскую подстановку посмотреть: /?lang=ru
  var DEMO_LANGS = ['en', 'es', 'pt', 'ht', 'ru', 'fr', 'de', 'it', 'zh', 'ar', 'tl'];
  var DEMO_DEFAULT = 'es';
  var urlLang = (new URLSearchParams(location.search).get('lang') || '').toLowerCase();
  var lang = DEMO_LANGS.indexOf(urlLang) >= 0 ? urlLang : DEMO_DEFAULT;

  // ── Дека возможностей: плашки прилетают по событиям из экранов ──
  var deck = document.getElementById('featDeck');
  var BADGES: Record<string, { label: string }> = (lang === 'ru') ? {
    native:    { label: 'Вы выбираете свой язык' },
    translate: { label: 'Читайте каждый вопрос на английском с параллельным переводом' },
    dict:      { label: 'Сохранённые термины возвращаются по интервальному повторению, чтобы запомниться' },
    explain:   { label: 'Каждый ответ разобран на вашем языке, и суть понятна сразу' },
    card:      { label: 'Умные флеш-карточки превращают термины в быстрое повторение' },
    audio:     { label: 'Слушайте вопросы и переводы на двух языках, не отрываясь от дел' }
  } : {
    native:    { label: 'Pick your language' },
    translate: { label: 'Read English questions with a parallel translation' },
    dict:      { label: 'Save words to repeat them later' },
    explain:   { label: 'Every answer is explained in your language' },
    card:      { label: 'Smart flashcards turn each saved term into quick review' },
    audio:     { label: 'Listen to questions and translations in two languages, hands-free' }
  };
  var shown: Record<string, boolean> = {};
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

  function load(which: string) {
    clearDeck();   // при любой смене экрана дека пустеет (плашка предыдущего экрана не тянется на следующий)
    frame!.style.opacity = '0';
    setTimeout(function () { frame!.src = which + '?lang=' + lang; }, 170);
  }
  frame.addEventListener('load', function () { frame!.style.opacity = '1'; });

  window.addEventListener('message', function (e) {
    var d = e.data;
    if (!d || d.__l7demo !== true) { return; }
    if (d.action === 'toQuiz') { load(QUIZ); }
    else if (d.action === 'toHome') { load(HOME); }
    else if (d.action === 'badge') { addBadge(d.id); }
  });

  // первичная загрузка с нужным языком (overrides статический src)
  load(HOME);
})();

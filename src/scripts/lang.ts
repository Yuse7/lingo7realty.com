// ── Единый источник истины для языка демо на лендинге ──
//    Импортируется И заголовком hero (main.ts), И всеми демо-экранами
//    (src/components/screens/*.astro), чтобы надпись «My language is …» и язык
//    в телефоне ВСЕГДА совпадали. Раньше заголовок угадывал язык по браузеру, а
//    экраны жёстко падали в испанский - получался рассинхрон при автоопределении.
//
//    Приоритет: явный ?lang (включая спец-значения en/off для показа «перевод
//    выключен») → язык браузера (navigator.languages) → испанский.
//    Английский намеренно НЕ среди угадываемых: носитель - не наша аудитория,
//    для него остаётся дефолтное испанское демо (главный сегмент не-носителей).

// Языки, доступные в пикере (есть переводы во всех экранах и опции в дропдауне).
export var PICKER_LANGS = ['es', 'pt', 'ht', 'ru', 'fr', 'de', 'it', 'zh', 'ar', 'tl'];

// Близкие/смежные языки → поддерживаемый. Расширяет угадывание, не добавляя
// строк в сам пикер. Логика: человек с таким языком браузера почти наверняка
// поймёт сопоставленное демо.
//  - языки Испании (каталанский/галисийский/баскский/арагонский/валенсийский)
//    → испанский: их носители де-факто билингвы с испанским;
//  - Filipino (код fil) и кантонский/у/минь и пр. репортятся отдельными кодами,
//    но это «наши» tl / zh;
//  - arb - ISO-639-3 для стандартного арабского.
var ALIASES: Record<string, string> = {
  ca: 'es', gl: 'es', eu: 'es', an: 'es', va: 'es',
  fil: 'tl',
  yue: 'zh', wuu: 'zh', hak: 'zh', nan: 'zh', gan: 'zh', hsn: 'zh',
  arb: 'ar'
};

// Спец-значения ?lang, которые экраны понимают помимо кодов языков:
//   en  - показать чистый английский (перевод выключен, лейбл «EN»);
//   off - перевод выключен вручную (лейбл «Translate»).
var SPECIAL = ['en', 'off'];

// Привести языковой тег к базовому коду: 'zh-Hans-CN' → 'zh', 'PT-br' → 'pt'.
function normalize(tag: string): string {
  return (tag || '').toLowerCase().trim().split('-')[0];
}

// Сматчить один языковой тег против доступных языков (прямое попадание/алиас).
function matchLang(tag: string): string | null {
  var base = normalize(tag);
  if (!base) { return null; }
  if (PICKER_LANGS.indexOf(base) >= 0) { return base; }
  if (ALIASES[base]) { return ALIASES[base]; }
  return null;
}

// Язык браузера: первый из navigator.languages, который мы поддерживаем.
// null - если ни один тег не сматчился (браузер на английском / экзотике).
export function browserLang(): string | null {
  var navs = (navigator.languages && navigator.languages.length)
    ? navigator.languages : [navigator.language || ''];
  for (var i = 0; i < navs.length; i++) {
    var m = matchLang(navs[i]);
    if (m) { return m; }
  }
  return null;
}

// Эффективный язык демо. Один и тот же ответ для заголовка и для экранов.
export function resolveLang(): string {
  var urlRaw = (new URLSearchParams(location.search).get('lang') || '').toLowerCase().trim();
  if (urlRaw) {
    if (SPECIAL.indexOf(urlRaw) >= 0) { return urlRaw; }   // en / off - как есть
    var m = matchLang(urlRaw);
    if (m) { return m; }                                    // валидный код языка
  }
  return browserLang() || 'es';
}

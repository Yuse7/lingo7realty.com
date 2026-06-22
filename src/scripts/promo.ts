// Акция «только сегодня»: пакет «3 месяца» полного доступа за $10 вместо $89.
// Правило настоящее - предложение действует ТОЛЬКО по чётным числам месяца
// (по локальной дате пользователя). Логика обязана быть клиентской: сайт
// статический, и если проверять число во время сборки, оно «замёрзнет» на дне
// билда. Поэтому дату всегда берём в браузере, в момент визита.

export var PROMO_PRICE = 10;        // цена по акции, $
export var PROMO_REGULAR = 89;      // обычная цена пакета «3 месяца» (для зачёркивания)

// Акция активна, если сегодняшнее число месяца чётное (2, 4, 6 ... 30).
export function isPromoActive(d: Date = new Date()): boolean {
  return d.getDate() % 2 === 0;
}

// Сколько миллисекунд осталось до конца сегодняшнего дня (локальная полночь).
// На ней акция заканчивается, а число становится нечётным.
export function msUntilMidnight(d: Date = new Date()): number {
  var end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 0, 0, 0);
  return end.getTime() - d.getTime();
}

// Миллисекунды -> «HH:MM:SS» для обратного отсчёта.
export function formatCountdown(ms: number): string {
  if (ms < 0) { ms = 0; }
  var sec = Math.floor(ms / 1000);
  var h = Math.floor(sec / 3600);
  var m = Math.floor((sec % 3600) / 60);
  var s = sec % 60;
  function pad(n: number) { return n < 10 ? '0' + n : '' + n; }
  return pad(h) + ':' + pad(m) + ':' + pad(s);
}

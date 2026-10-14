/* Tuesday 5 Aban 1405, 07:30 Asia/Tehran (2026-10-27 04:00 UTC). */
(() => {
  const at = Date.parse('2026-10-27T07:30:00+03:30');
  const release = window.IPR_RELEASE = {
    at,
    isPublished: (now = Date.now()) => now >= at,
    remaining: (now = Date.now()) => Math.max(0, at - now)
  };
  let published = release.isPublished(), timer;
  function update() {
    const next = release.isPublished();
    if (next !== published) {
      published = next;
      document.dispatchEvent(new CustomEvent('ipr:report-release'));
    }
    const en = document.documentElement.lang === 'en';
    document.querySelectorAll('[data-release-countdown]').forEach(el => {
      const left = release.remaining();
      const digits = new Intl.NumberFormat(en ? 'en-US' : 'fa-IR');
      const parts = [Math.floor(left / 86400000), Math.floor(left / 3600000) % 24, Math.floor(left / 60000) % 60];
      el.querySelectorAll('[data-countdown-value]').forEach((node, i) => node.textContent = digits.format(parts[i]));
    });
    clearTimeout(timer);
    timer = setTimeout(update, Math.max(20, Math.min(60000, release.remaining() || 60000)));
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) update(); });
  document.addEventListener('ipr:site-ready', update);
  update();
})();

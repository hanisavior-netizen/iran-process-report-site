/* Real document URLs, with compatibility for previously shared hash links. */
(() => {
  'use strict';
  const base = new URL('../../', document.currentScript.src);
  const paths = {about:'', data:'topics/', reports:'reports/', story:'about/'};
  const topics = ['commitment','investment','tools','ai','mining','maturity'];
  topics.forEach(id => paths[id] = `topics/${id}/`);
  for (let year=1400; year<=1404; year++) paths[`report-${year}`] = `reports/${year}/`;
  const page = document.querySelector('meta[name="ipr-page"]')?.content || 'about';
  const fromHash = value => {
    const hash = value.replace(/^#/, '');
    if (Object.hasOwn(paths, hash)) return {page:hash};
    if (hash === 'events') return {page:'reports'};
    if (hash.startsWith('story-')) return {page:'story',target:hash};
    const annual = /^(?:annual-|event-)(140[0-4])(?:-.*)?$/.exec(hash);
    if (annual) return {page:`report-${annual[1]}`,target:hash.startsWith('event-')?`annual-${annual[1]}-event`:hash};
    if (hash.startsWith('q-q-')) {
      const topic = window.IPR_QUESTION_ROUTES?.[hash.slice(2)];
      if (topic) return {page:topic,target:hash};
    }
    if (['profile','about-intro','find-title'].includes(hash)) return {page:'about',target:hash};
    return null;
  };
  const url = (id, target, search=location.search) => {
    const result = new URL(paths[id] ?? '', base);
    result.search = search;
    if (target && target !== id) result.hash = target;
    return result.href;
  };
  const rewrite = scope => {
    const anchors = [...(scope.matches?.('a[href]')?[scope]:[]), ...scope.querySelectorAll('a[href]')];
    anchors.forEach(anchor => {
      if (anchor.dataset.nav && Object.hasOwn(paths, anchor.dataset.nav)) {
        anchor.href = url(anchor.dataset.nav, anchor.dataset.target);
        return;
      }
      const raw = anchor.getAttribute('href');
      if (!raw || /^(?:mailto:|tel:|javascript:)/i.test(raw)) return;
      const parsed = new URL(raw, document.baseURI);
      if (parsed.origin !== location.origin || !parsed.hash) return;
      if (![base.pathname, location.pathname].includes(parsed.pathname)) return;
      const legacy = fromHash(decodeURIComponent(parsed.hash));
      if (legacy) anchor.href = url(legacy.page, legacy.target, parsed.search || location.search);
      else if (raw.startsWith('#')) anchor.href = location.pathname + location.search + raw;
    });
  };
  window.IPR_ROUTES = {base, paths, page, fromHash, url, rewrite};
  const legacy = fromHash(decodeURIComponent(location.hash));
  if (legacy) {
    const destination = new URL(url(legacy.page, legacy.target));
    if (destination.pathname !== location.pathname) location.replace(destination.href);
    else if (destination.href !== location.href) history.replaceState(null,'',destination.href);
  }
  // Late-created navigation includes gallery, reader, and assistant source links.
  const observer = new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
    if (node.nodeType === 1) rewrite(node);
  })));
  observer.observe(document.documentElement,{subtree:true,childList:true});
  document.addEventListener('DOMContentLoaded', () => rewrite(document), {once:true});
  const canonical = document.createElement('link'); canonical.rel='canonical'; canonical.href=url(page,undefined,new URLSearchParams(location.search).get('lang')==='en'?'?lang=en':'');
  document.head.append(canonical);
})();

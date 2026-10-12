/* One content tree, localized synchronously before each render. */
(() => {
  'use strict';
  const lang = new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'fa';
  const root = document.documentElement;
  root.lang = lang; root.dir = lang === 'en' ? 'ltr' : 'rtl'; root.dataset.lang = lang;
  const persian = /[\u0600-\u06ff]/;
  const latin = s => s.replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/٬/g, ',').replace(/٫/g, '.').replace(/٪/g, '%');
  const faDigits = s => String(s).replace(/[0-9٠-٩]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d >= '٠' && d <= '٩' ? d.charCodeAt(0) - 1632 : Number(d)]);
  const norm = s => {
    const nums=[];
    const key=String(s).replace(/٪/g,'%').replace(/\s+/g,' ').trim().replace(/[0-9۰-۹٠-٩]+(?:[٬,][0-9۰-۹٠-٩]{3})*(?:[٫.][0-9۰-۹٠-٩]+)?/g, m => {nums.push(latin(m));return '§'+nums.length;});
    return {key,nums};
  };
  const api = window.IPR_I18N = {lang,norm,miss:{}};
  api.digits = s => lang === 'fa' ? faDigits(s) : latin(String(s));
  api.setLang = lang => {const u=new URL(location.href);u.searchParams.set('lang',lang==='en'?'en':'fa');location.href=u.href;};
  api.t = input => {
    if(lang==='fa' || typeof input!=='string') return input;
    if(!persian.test(input)) return input;
    if(!/[\u0621-\u064a\u066e-\u06d3]/.test(input)) return latin(input).replace(/،/g,',').replace(/؛/g,';');
    const {key,nums}=norm(input);
    const entry=(window.IPR_EN||{})[key];
    if(entry!==undefined) return (/^\s/.test(input)?' ':'')+entry.replace(/§(\d+)/g,(_,i)=>nums[i-1]??'')+(/\s$/.test(input)?' ':'');
    if(!key.replace(/§\d+/g,'').replace(/[\s%·\-–—:؛/،()+−]/g,'')) return latin(input).replace(/،/g,',');
    for(const separator of [' | ',' · ','، ']) {
      if(input.includes(separator)) {
        const parts=input.split(separator).map(api.t);
        if(parts.every(p=>!persian.test(p))) return parts.join(separator==='، '?', ':separator);
      }
    }
    api.miss[key]=input;
    return input;
  };
  // Normalize display terminology after translation, keeping translation keys intact.
  const translateText = api.t;
  api.reportTerms = text => typeof text==='string' ? text.replace(/دفترچه(?:ٔ|‌ی)? گزارش/g,'گزارش').replace(/دفترچه‌ای/g,'گزارشی').replace(/دفترچه(?:ٔ|‌ی)?/g,'گزارش').replace(/\bbooklets\b/gi,'reports').replace(/\bbooklet\b/gi,'report') : text;
  api.t = input => api.reportTerms(translateText(input));
  const attrs=['placeholder','aria-label','title','alt','data-label','data-title'];
  function visit(node) {
    if(node.nodeType===3) {const value=api.digits(api.t(node.nodeValue));node.nodeValue=lang==='en'?value.replace(/←/g,'→').replace(/↗/g,'↖').replace(/↘/g,'↙'):value;return;}
    if(node.nodeType!==1 && node.nodeType!==11) return;
    if(node.nodeType===1) {
      if(['SCRIPT','STYLE'].includes(node.tagName)) return;
      for(const a of attrs) if(node.hasAttribute(a)) node.setAttribute(a,api.digits(api.t(node.getAttribute(a))));
      if(node.hasAttribute('data-en')) node.removeAttribute('data-en');
      if(lang==='en' && node.tagName==='IMG' && /assets\/covers\/cover-\d{4}\.(?:jpg|webp)/.test(node.getAttribute('src')||'')) node.setAttribute('src',node.getAttribute('src').replace(/\.(jpg|webp)(?:\?[^#]*)?$/,'-en.svg?v=20261005-16'));
      if(lang==='en' && node.tagName==='IMG' && node.closest('.vid-poster')) {
        const cover=node.getAttribute('data-fallback');
        if(cover) node.setAttribute('src',cover.replace(/\.(jpg|webp)(?:\?[^#]*)?$/,'-en.svg?v=20261005-16'));
      }
    }
    [...node.childNodes].forEach(visit);
  }
  api.translate = target => {
    visit(target);
    document.title=api.digits(api.t(document.title));
    document.querySelectorAll('meta[name="description"],meta[property="og:title"],meta[property="og:description"]').forEach(m=>m.content=api.digits(api.t(m.content)));
    if(lang==='en') document.querySelector('meta[property="og:locale"]')?.setAttribute('content','en_US');
  };
  api.html = markup => {
    const template=document.createElement('template');template.innerHTML=markup;visit(template.content);return template.innerHTML;
  };
})();

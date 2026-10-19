/* One content tree, localized synchronously before each render. */
(() => {
  'use strict';
  const lang = window.IPR_ROUTES?.lang || (new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'fa');
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
  const jalaliMonths=['Farvardin','Ordibehesht','Khordad','Tir','Mordad','Shahrivar','Mehr','Aban','Azar','Dey','Bahman','Esfand'];
  const jalaliToGregorian=(year,month,day)=>{
    const monthIndex=typeof month==='number'?month-1:jalaliMonths.findIndex(name=>name.toLowerCase()===String(month).toLowerCase());
    if(monthIndex<0||monthIndex>11||day<1||day>(monthIndex<6?31:monthIndex===11?30:30)) return null;
    const offset=(monthIndex<6?monthIndex*31:186+(monthIndex-6)*30)+(day-1);
    const estimate=Date.UTC(year+621,2,20)+offset*86400000;
    try {
      for(let delta=-2;delta<=2;delta++){
        const date=new Date(estimate+delta*86400000);
        const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US-u-ca-persian-nu-latn',{timeZone:'UTC',year:'numeric',month:'numeric',day:'numeric'}).formatToParts(date).map(part=>[part.type,part.value]));
        if(Number(parts.year)===year&&Number(parts.month)===monthIndex+1&&Number(parts.day)===day) return new Intl.DateTimeFormat('en-US',{timeZone:'UTC',month:'long',day:'numeric',year:'numeric'}).format(date);
      }
    } catch(_error) {}
    return null;
  };
  const calendarize=s=>{
    if(lang!=='en'||typeof s!=='string') return s;
    let value=s;
    const monthPattern=jalaliMonths.join('|');
    value=value.replace(new RegExp(String.raw`\b(\d{1,2})\s+(${monthPattern})\s+(14\d{2})\b`,'gi'),(match,day,month,year)=>jalaliToGregorian(Number(year),month,Number(day))||match);
    value=value.replace(new RegExp(String.raw`\b(${monthPattern})\s+(\d{1,2}),?\s+(14\d{2})\b`,'gi'),(match,month,day,year)=>jalaliToGregorian(Number(year),month,Number(day))||match);
    value=value.replace(/\b(14\d{2})\s*[\/.-]\s*(\d{1,2})\s*[\/.-]\s*(\d{1,2})\b/g,(match,year,month,day)=>jalaliToGregorian(Number(year),Number(month),Number(day))||match);
    const yearMap={'1400':'2021','1401':'2022','1402':'2023','1403':'2024','1404':'2025','1405':'2026'};
    return value.replace(/\b140[0-5]\b/g,year=>yearMap[year]);
  };
  api.calendarize=calendarize;
  api.setLang = lang => {
    const routes=window.IPR_ROUTES;
    if(routes) {location.assign(routes.url(routes.page,location.hash.slice(1),location.search,lang));return;}
    const u=new URL(location.href);u.searchParams.set('lang',lang==='en'?'en':'fa');location.href=u.href;
  };
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
    if(node.nodeType===3) {const value=calendarize(api.digits(api.t(node.nodeValue)));node.nodeValue=lang==='en'?value.replace(/←/g,'→').replace(/↗/g,'↖').replace(/↘/g,'↙'):value;return;}
    if(node.nodeType!==1 && node.nodeType!==11) return;
    if(node.nodeType===1) {
      if(['SCRIPT','STYLE'].includes(node.tagName)) return;
      for(const a of attrs) if(node.hasAttribute(a)) node.setAttribute(a,calendarize(api.digits(api.t(node.getAttribute(a)))));
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
    document.title=calendarize(api.digits(api.t(document.title)));
    document.querySelectorAll('meta[name="description"],meta[property="og:title"],meta[property="og:description"]').forEach(m=>m.content=calendarize(api.digits(api.t(m.content))));
    if(lang==='en') document.querySelector('meta[property="og:locale"]')?.setAttribute('content','en_US');
  };
  api.html = markup => {
    const template=document.createElement('template');template.innerHTML=markup;visit(template.content);return template.innerHTML;
  };
})();

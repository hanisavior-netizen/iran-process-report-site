/* گزارش فرایند ایران — منطق سایت (بدون نیاز به build)
 * منطق نمودارها و جدول‌ها عیناً از نسخه قبلی سایت منتقل شده است.
 */
(() => {
  'use strict';
  const EN = window.IPR_I18N?.lang === 'en';

  const C = window.IPR_CONTENT;
  const FA = '۰۱۲۳۴۵۶۷۸۹';
  const t = (v) => window.IPR_I18N.t(String(v ?? ''));
  const localize = (html) => window.IPR_I18N.html(html);
  const fa = (v) => EN ? String(v) : String(v).replace(/\d/g, (d) => FA[d]);
  const esc = (t = '') => window.IPR_I18N.t(String(t)).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const pct = (v) => (v == null ? '—' : `${fa(Math.round(v))}${EN ? '%' : '٪'}`);
  const norm = (t = '') => String(t)
    .replace(/[۰-۹]/g, (d) => String(FA.indexOf(d)))
    .replace(/[ي]/g, 'ی').replace(/[ك]/g, 'ک')
    .replace(/‌/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
  const fnum = (n) => fa(Number(n).toLocaleString('en-US')).replace(/,/g, EN ? ',' : '٬');

  let YEARS = ['1401', '1402', '1403', '1404'];
  let SECTIONS = [];
  let QUESTIONS = [];
  const STATUS = { comparable: 'قابل مقایسه', partial: '△ مقایسه با احتیاط', conditional: '△ جامعه پاسخ شرطی' };
  const placeholder = (label = 'در انتظار داده') => (C.SHOW_PLACEHOLDERS ? `<span class="ph">${esc(label)}</span>` : '');

  /* ---------- منطق مرتب‌سازی گزینه‌ها (بدون تغییر) ---------- */
  function score(q, label) {
    const s = norm(q.title), e = norm(label), n = Number((e.match(/\d+(?:\.\d+)?/) || [0])[0]);
    if (/هزینه یا سرمایه گذاری|هزینه توسعه سامانه های نرم افزاری/.test(s)) {
      if (/خیلی بزرگ/.test(e) || /^بزرگ$/.test(e)) return 100; if (/متوسط/.test(e)) return 60; if (/خرد/.test(e)) return 30;
      if (/^کوچک$/.test(e)) return 40; if (/خیلی کوچک/.test(e)) return 20; if (/هیچ هزینه/.test(e)) return 0;
    }
    if (/اثر مدیریت فرایند بر عملکرد سازمان/.test(s)) {
      if (/خیلی زیاد/.test(e)) return 100; if (e === 'زیاد') return 80; if (/بدون تاثیر/.test(e)) return 50; if (e === 'کم') return 20; if (/خیلی کم/.test(e)) return 0;
    }
    if (/بودجه فرایندکاوی/.test(s)) {
      if (/در نظر گرفته ایم|در نظر گرفته‌ایم/.test(label)) return 100; if (/بعد از پایلوت/.test(e)) return 65; if (/هیچ بودجه/.test(e)) return 15; if (/اطلاع|اطلاعی/.test(e)) return 0;
    }
    if (/رضایت/.test(s)) {
      if (/کاملا راضی|کاملاً راضی/.test(e)) return 100; if (/^راضی/.test(e)) return 80; if (/نظر/.test(e)) return 50; if (/کاملا ناراضی|کاملاً ناراضی/.test(e)) return 0; if (/ناراضی/.test(e)) return 20;
    }
    if (/آموزش و گواهینامه/.test(s)) {
      if (/منجر به صدور گواهینامه/.test(e)) return 100; if (/اما صدور گواهینامه/.test(e)) return 65; if (/خیر|هیچگونه آموزشی/.test(e)) return 0;
    }
    if (/وضعیت استفاده از ابزار/.test(s)) {
      if (/bpms/.test(e)) return 100; if (/تحلیل فرایند/.test(e)) return 85; if (/مدل سازی فرایند|مدل‌سازی فرایند/.test(label)) return 70; if (/معماری فرایند/.test(e)) return 55; if (/هیچ ابزار/.test(e)) return 0;
    }
    if (/تغییر علاقه|تغییر مورد انتظار/.test(s)) {
      if (/خیلی بیشتر|بیش از 100|بیش از ۱۰۰/.test(e)) return 100; if (/بیشتر|افزایش 50|افزایش ۵۰/.test(e)) return 85; if (/افزایش/.test(e)) return 70;
      if (/بدون تغییر/.test(e)) return 50; if (/خیلی کمتر|کاهش بیش از/.test(e)) return 5; if (/کمتر|کاهش/.test(e)) return 20;
    }
    if (/حمایت|تعهد/.test(s)) {
      if (/تمامی/.test(e)) return 100; if (/عمده/.test(e)) return 80; if (/برخی/.test(e)) return 55; if (/اندکی/.test(e)) return 25; if (/نمی باشند|نمی‌باشند/.test(label)) return 0;
    }
    if (/هزینه|سرمایه گذاری|سرمایه‌گذاری/.test(s)) return /بیش از/.test(e) ? 100 : n;
    if (/درصد/.test(s)) return /بیش از|76|۷۶/.test(e) ? 100 : n;
    if (/تعداد/.test(s)) return /بیش از|بالای/.test(e) ? 1000 : n;
    if (/محدودیت/.test(s)) { if (/هیچ|ندارد|خیر/.test(e)) return 100; if (/کم/.test(e)) return 70; if (/زیاد|بله/.test(e)) return 20; }
    const rules = [
      [/کاملا موافق|کاملاً موافق|خیلی زیاد|بسیار زیاد|عالی|همیشه|بله،? کامل|تمامی/, 100],
      [/موافق|زیاد|بالا|عمده|بیش از|به طور کامل|به‌طور کامل/, 85],
      [/متوسط|تا حدودی|نسبتا|نسبتاً|برخی|گاهی|بدون تغییر/, 55],
      [/مخالف|کم|پایین|اندکی|به ندرت|به‌ندرت/, 25],
      [/کاملا مخالف|کاملاً مخالف|خیلی کم|بسیار کم|هرگز|هیچ|خیر|نمی کنیم|نمی‌کنیم|نداریم/, 0],
      [/اطلاع ندارم|اطلاعی ندارم|نمی دانم|نمی‌دانم|نظری ندارم/, -10]
    ].find(([r]) => r.test(e));
    return rules ? rules[1] : 50;
  }

  function value(q, year, key) {
    const y = q.years[year]; if (!y) return null;
    const o = y.options.find((x) => x.key === key); if (!o) return null;
    if (Number.isFinite(o.pct)) return o.pct;
    const base = y.type === 'multi' ? y.options.reduce((a, b) => a + b.count, 0) : y.n;
    return base ? 100 * o.count / base : null;
  }

  function options(q) {
    const map = new Map();
    YEARS.forEach((yr) => q.years[yr]?.options.forEach((o) => {
      if (!map.has(o.key)) map.set(o.key, { key: o.key, label: o.label, score: 0 });
      map.get(o.key).label = o.label; map.get(o.key).score += o.count;
    }));
    return [...map.values()].sort((a, b) => {
      if (q.section === 'maturity') {
        const x = norm(a.label).startsWith('سایر'), y = norm(b.label).startsWith('سایر');
        if (x !== y) return x ? 1 : -1;
      }
      return score(q, b.label) - score(q, a.label) || a.label.localeCompare(b.label, 'fa');
    });
  }

  /* مجموع درصد گزینه‌های منطبق در یک سال (برای شاخص‌ها و هیرو فصل‌ها) */
  function sumFor(qid, year, match, exact) {
    const q = QUESTIONS.find((x) => x.id === qid); if (!q || !q.years[year]) return null;
    const keys = q.years[year].options.filter((o) => match.some((m) => (exact ? norm(o.label).replace(/\.$/, '') === norm(m) : norm(o.label).includes(norm(m)))));
    if (!keys.length) return null;
    return keys.reduce((a, o) => a + (value(q, year, o.key) || 0), 0);
  }

  /* ---------- نمودارها ----------
   * سه نما برای هر پرسش:
   *  ترکیب پاسخ‌ها: برای هر سال یک نوار ۱۰۰٪ که سهم هر گزینه را نشان می‌دهد
   *  روند هر گزینه: برای هر گزینه یک کارت با عدد آخرین سال، تغییر نسبت به اولین سال و نمودار کوچک
   *  جدول: همه عددها
   */
  const SERIES = ['#7b1a22', '#d4952b', '#2f7f88', '#2b4f78', '#b0577c', '#7d8b3a', '#a08a72', '#c8642e', '#4c8a68', '#6c5a96', '#c9a23f', '#5f7a95'];
  const seriesColor = (i) => SERIES[i % SERIES.length];
  const inkOn = (hex) => { const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255; return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#2a1d18' : '#fff'; };
  const ICON = {
    copy: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="13" rx="1.5"/><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v11A1.5 1.5 0 0 0 5.5 18H8"/></svg>',
    img: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M3.5 16l5-5 4 4 3-3 5 5"/><circle cx="15.5" cy="9" r="1.6"/></svg>',
    csv: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14"/></svg>',
    sort: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M5 12h9M5 17h5"/></svg>'
  };
  const STATE = new Map();
  const qById = (id) => QUESTIONS.find((q) => q.id === id);
  const qText = (q) => [...YEARS].reverse().map((y) => q.years[y]?.sourceQuestion).find(Boolean) || q.title;
  const qYears = (q) => YEARS.filter((y) => q.years[y]?.options?.length);
  const isMulti = (q) => Object.values(q.years).some((y) => y.type === 'multi');
  const unit = (q) => (isMulti(q) ? 'سهم از مجموع انتخاب‌ها' : 'درصد پاسخ‌دهندگان');
  const colored = (q) => options(q).map((o, i) => ({ ...o, color: seriesColor(i) }));

  function stateFor(q) {
    if (!STATE.has(q.id)) STATE.set(q.id, { view: 'lines', years: new Set(qYears(q)), focus: null, sort: false, hidden: new Set(), scale: 'auto', labels: false });
    return STATE.get(q.id);
  }
  const selYears = (q, st) => qYears(q).filter((y) => st.years.has(y));

  // Display the subtraction of two percentage shares, rather than a relative growth rate.
  function deltaText(d, fromY) {
    if (d == null) return '';
    if (d === 0) return `بدون تغییر نسبت به ${fa(fromY)}`;
    return EN ? `Share change vs ${fromY}: ${d > 0 ? '+' : '−'}${Math.abs(d)}%` : `تغییر سهم نسبت به ${fa(fromY)}: ${d > 0 ? '+' : '−'}${fa(Math.abs(d))}٪`;
  }

  function table(q) {
    const opts = options(q).slice(0, q.displayLimit || 60);
    const nRow = YEARS.map((y) => { const v = q.years[y]; return `<td>${v?.options?.length ? fa(v.n.toLocaleString('en-US')) : '—'}</td>`; }).join('');
    return `<div class="table-wrap"><table id="table-${q.id}"><caption class="sr-only">${esc(qText(q))}، ${unit(q)}</caption><thead><tr><th scope="col">گزینه پاسخ</th>${YEARS.map((y) => `<th scope="col">${fa(y)}</th>`).join('')}</tr></thead><tbody>${opts.map((o) => `<tr><th scope="row">${esc(o.label)}</th>${YEARS.map((y) => { const v = value(q, y, o.key); return `<td>${v == null ? '—' : pct(v)}</td>`; }).join('')}</tr>`).join('')}<tr class="n-row"><th scope="row">تعداد پاسخ معتبر</th>${nRow}</tr></tbody></table></div>${contextNote(EN ? 'Each percentage uses valid responses to that question in the same year. The final row shows those response counts; a dash means no comparable figure is available for that year.' : 'هر درصد از پاسخ‌های معتبر همان پرسش در همان سال به دست آمده است. ردیف آخر تعداد این پاسخ‌ها را نشان می‌دهد؛ خط تیره یعنی عدد قابل مقایسه‌ای برای آن سال موجود نیست.', EN ? 'How to read the table' : 'راهنمای خواندن جدول', 'table-help')}`;
  }

  function toolbar(q, st) {
    const ys = qYears(q);
    const views = [['lines', 'همه گزینه‌ها'], ['stack', 'ترکیب پاسخ‌ها'], ['trend', 'روند هر گزینه'], ['table', 'جدول']];
    return `<div class="q-toolbar">
      <div class="seg" role="tablist" aria-label="نوع نمایش">${views.map(([v, l]) => `<button type="button" role="tab" data-act="view" data-v="${v}" aria-selected="${st.view === v}">${l}</button>`).join('')}</div>
      ${ys.length > 1 ? `<div class="year-chips" role="group" aria-label="سال‌های نمایش‌داده‌شده"><span class="chips-label">سال‌ها</span>${ys.map((y) => `<button type="button" class="ychip" data-act="year" data-y="${y}" aria-pressed="${st.years.has(y)}">${fa(y)}</button>`).join('')}</div>` : ''}
      <div class="q-actions">
        ${st.view === 'trend' ? `<button type="button" class="icon-btn" data-act="sort" aria-pressed="${st.sort}" title="مرتب‌سازی از بیشترین" aria-label="مرتب‌سازی از بیشترین">${ICON.sort}</button>` : ''}
        ${st.view !== 'table' ? `<button type="button" class="icon-btn" data-act="copy-img" title="کپی نمودار به‌صورت تصویر" aria-label="کپی نمودار به‌صورت تصویر">${ICON.img}</button>` : ''}
        <button type="button" class="icon-btn" data-act="copy-table" title="کپی جدول برای Excel" aria-label="کپی جدول برای Excel">${ICON.copy}</button>
        <button type="button" class="icon-btn" data-act="csv" title="دانلود داده (CSV)" aria-label="دانلود داده (CSV)">${ICON.csv}</button>
      </div>
    </div>`;
  }

  function guide() { return ''; }

  function contextNote(body, label, className = '', open = false) {
    return `<details class="context-note ${className}"${open ? ' open' : ''}><summary><span class="context-note-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg></span><span>${label}</span><svg class="context-note-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary><div class="context-note-body"><p>${body}</p></div></details>`;
  }

  /* نمای ترکیب پاسخ‌ها */
  function renderStack(area, q, st) {
    const ys = selYears(q, st), opts = colored(q);
    const rows = ys.map((y) => {
      const segs = opts.map((o) => ({ o, v: value(q, y, o.key) })).filter((s) => s.v != null && s.v > 0);
      const total = segs.reduce((a, s) => a + s.v, 0) || 1;
      return `<div class="stack-row">
        <div class="stack-year"><b>${fa(y)}</b><small>${fa(q.years[y].n.toLocaleString('en-US'))} ${EN ? 'responses' : 'پاسخ'}</small></div>
        <div class="stack-bar">${segs.map((s) => { const w = 100 * s.v / total; const f = st.focus && st.focus !== s.o.key ? ' is-dim' : st.focus === s.o.key ? ' is-focus' : ''; return `<span class="stack-seg${f}" style="flex-basis:${w.toFixed(3)}%;--c:${s.o.color};--t:${inkOn(s.o.color)}" data-y="${y}" data-k="${s.o.key}" tabindex="0" aria-label="${fa(y)}، ${esc(s.o.label)}: ${pct(s.v)}">${w >= 6 || st.focus === s.o.key ? `<em>${pct(s.v)}</em>` : ''}</span>`; }).join('')}</div>
      </div>`;
    }).join('');
    const legend = opts.filter((o) => ys.some((y) => value(q, y, o.key) != null)).map((o) => `<button type="button" class="lg-chip${st.focus === o.key ? ' is-on' : ''}${st.focus && st.focus !== o.key ? ' is-dim' : ''}" data-act="focus" data-k="${o.key}" aria-pressed="${st.focus === o.key}" style="--c:${o.color}"><i></i><span>${esc(o.label)}</span></button>`).join('');
    area.innerHTML = localize(`${guide(q, st)}<div class="stack">${rows}</div><div class="stack-tip" hidden></div>
      <div class="lg-wrap"><p class="lg-title">راهنمای رنگ‌ها ${st.focus ? '<button type="button" class="link-btn" data-act="focus" data-k="">نمایش همه</button>' : ''}</p><div class="lg-list">${legend}</div></div>`);
  }

  /* نمای روند هر گزینه */
  function miniSpark(q, ys, o) {
    const W = 240, H = 92, px = 22, top = 24, bot = 22;
    const pts = ys.map((y, i) => ({ y, i, v: value(q, y, o.key) })).filter((p) => p.v != null);
    const vs = pts.map((p) => p.v), lo = Math.max(0, Math.min(...vs) - 8), hi = Math.min(100, Math.max(...vs) + 8);
    const X = (i) => (ys.length > 1 ? px + i * ((W - px * 2) / (ys.length - 1)) : W / 2);
    const Y = (v) => top + (hi - v) * ((H - top - bot) / Math.max(hi - lo, 1));
    const d = pts.map((p, k) => `${k ? 'L' : 'M'}${X(p.i).toFixed(1)} ${Y(p.v).toFixed(1)}`).join(' ');
    const area = pts.length > 1 ? `${d} L${X(pts.at(-1).i)} ${H - bot} L${X(pts[0].i)} ${H - bot} Z` : '';
    return `<svg class="mini" viewBox="0 0 ${W} ${H}" role="img" aria-label="${EN ? 'Trend: ' : 'روند '}${esc(o.label)}">
      ${area ? `<path d="${area}" fill="${o.color}" opacity=".1"/>` : ''}
      <line x1="${px}" x2="${W - px}" y1="${H - bot}" y2="${H - bot}" class="mini-base"/>
      <path d="${d}" fill="none" stroke="${o.color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
      ${pts.map((p, k) => `<circle cx="${X(p.i)}" cy="${Y(p.v)}" r="${k === pts.length - 1 ? 4.5 : 3.2}" fill="${k === pts.length - 1 ? o.color : '#fff'}" stroke="${o.color}" stroke-width="2"/><text class="mini-v" x="${X(p.i)}" y="${Y(p.v) - 9}">${fa(Math.round(p.v))}</text>`).join('')}
      ${ys.map((y, i) => `<text class="mini-y" x="${X(i)}" y="${H - 5}">${fa(y)}</text>`).join('')}
    </svg>`;
  }
  function renderTrend(area, q, st) {
    const ys = selYears(q, st), lastY = ys.at(-1);
    let opts = colored(q).filter((o) => ys.some((y) => value(q, y, o.key) != null));
    if (st.sort) opts = [...opts].sort((a, b) => (value(q, lastY, b.key) ?? -1) - (value(q, lastY, a.key) ?? -1));
    const cards = opts.map((o) => {
      const pts = ys.map((y) => ({ y, v: value(q, y, o.key) })).filter((p) => p.v != null);
      const last = pts.at(-1), first = pts[0];
      const d = pts.length > 1 ? Math.round(last.v) - Math.round(first.v) : null;
      const cls = d == null ? '' : d > 0 ? 'up' : d < 0 ? 'down' : 'flat';
      return `<article class="opt" style="--c:${o.color}">
        <p class="opt-label">${esc(o.label)}</p>
        <div class="opt-num"><b>${pct(last?.v)}</b><span>در ${fa(last?.y || '')}</span></div>
        ${d != null ? `<p class="opt-delta ${cls}"><i aria-hidden="true">${d > 0 ? '▲' : d < 0 ? '▼' : '■'}</i>${deltaText(d, first.y)}</p>` : `<p class="opt-delta flat">فقط در ${fa(last?.y || '')} پرسیده شده</p>`}
        ${pts.length > 1 ? miniSpark(q, ys, o) : ''}
      </article>`;
    }).join('');
    area.innerHTML = localize(`${guide(q, st)}<div class="opt-grid">${cards}</div>`);
    layoutTrendGrid(area);
  }

  function layoutTrendGrid(area) {
    const grid=area.querySelector('.opt-grid'); if(!grid) return;
    const cards=[...grid.children], n=cards.length, width=area.clientWidth;
    if(!n) return;
    const columns=n===1?1:n===4&&width>=540?2:Math.min(n,width>=840?3:width>=540?2:1);
    const rows=Array.from({length:Math.ceil(n/columns)},(_,i)=>Math.min(columns,n-i*columns));
    // Balance the final two rows instead of leaving one isolated card on desktop.
    if(columns===3 && rows.length>1 && rows.at(-1)===1) { rows[rows.length-2]=2; rows[rows.length-1]=2; }
    grid.style.gridTemplateColumns=`repeat(${columns*2},minmax(0,1fr))`;
    grid.dataset.columns=String(columns);
    let index=0;
    rows.forEach((count,row)=>{
      const group=cards.slice(index,index+count);
      group.forEach((card,col)=>{
        card.style.gridColumn=`${columns-count+1+col*2} / span 2`;
        card.style.gridRow=String(row+1);
        card.querySelector('.opt-label').style.minHeight='0';
      });
      const labelHeight=Math.max(...group.map(card=>card.querySelector('.opt-label').getBoundingClientRect().height));
      group.forEach(card=>card.querySelector('.opt-label').style.minHeight=`${Math.ceil(labelHeight)}px`);
      index+=count;
    });
  }

  /* ---------- نمودار اصلی: همه گزینه‌ها در یک نمودار روند ----------
   * محور زمان در هر دو زبان از چپ به راست است.
   * کنترل‌ها: نمایش/پنهان هر گزینه، «فقط همین»، همه/هیچ، جست‌وجوی گزینه، مقیاس محور، نمایش عدد روی نقاط،
   * برجسته‌کردن با کلیک، راهنمای شناور روی هر سال.
   */
  function smoothPath(pts) {
    if (pts.length < 2) return pts.length ? `M${pts[0][0]} ${pts[0][1]}` : '';
    // منحنی یکنوا (Fritsch–Carlson) تا نقاط از مقدار واقعی‌شان رد شوند و منحنی بیش از حد بالا/پایین نرود
    const n = pts.length, dx = [], m = [], t = [];
    for (let i = 0; i < n - 1; i++) { dx[i] = pts[i + 1][0] - pts[i][0]; m[i] = (pts[i + 1][1] - pts[i][1]) / dx[i]; }
    t[0] = m[0]; t[n - 1] = m[n - 2];
    for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
    for (let i = 0; i < n - 1; i++) { if (m[i] === 0) { t[i] = t[i + 1] = 0; continue; } const a = t[i] / m[i], b = t[i + 1] / m[i], h = a * a + b * b; if (h > 9) { const s = 3 / Math.sqrt(h); t[i] = s * a * m[i]; t[i + 1] = s * b * m[i]; } }
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < n - 1; i++) { const h = dx[i] / 3; d += ` C${(pts[i][0] + h).toFixed(1)} ${(pts[i][1] + t[i] * h).toFixed(1)} ${(pts[i + 1][0] - h).toFixed(1)} ${(pts[i + 1][1] - t[i + 1] * h).toFixed(1)} ${pts[i + 1][0].toFixed(1)} ${pts[i + 1][1].toFixed(1)}`; }
    return d;
  }

  function linesGeometry(q, st, W) {
    const ys = selYears(q, st);
    const all = colored(q).filter((o) => ys.some((y) => value(q, y, o.key) != null));
    const shown = all.filter((o) => !st.hidden.has(o.key));
    const narrow = W < 560;
    const maxLabels = Math.max(0, ...ys.map(y => shown.filter(o => value(q,y,o.key) != null).length));
    // Expand only as needed to give every displayed value its own readable row.
    const baseH = narrow ? 300 : 380;
    const H = Math.max(baseH, (st.labels || !narrow) ? maxLabels * 24 + 100 : baseH);
    const mt = 26, mb = 44, ml = narrow ? 40 : 52, mr = narrow ? 64 : 120;
    const vals = shown.flatMap((o) => ys.map((y) => value(q, y, o.key))).filter((v) => v != null);
    let lo = 0, hi = 100;
    if (st.scale !== 'full') { hi = Math.min(100, Math.max(10, Math.ceil((Math.max(...vals, 1) + 4) / 10) * 10)); }
    const X = (i) => (ys.length > 1 ? ml + i * ((W - ml - mr) / (ys.length - 1)) : (W - ml - mr) / 2 + ml);
    const Y = (v) => mt + (hi - v) * ((H - mt - mb) / (hi - lo));
    return { ys, all, shown, W, H, mt, mb, ml, mr, X, Y, lo, hi, narrow };
  }

  function linesSVG(q, st, g, forExport) {
    const { ys, shown, W, H, mt, mb, ml, mr, X, Y, hi, narrow } = g;
    const step = hi <= 30 ? 5 : hi <= 60 ? 10 : 20;
    const ticks = []; for (let v = 0; v <= hi; v += step) ticks.push(v);
    let s = `<svg class="lines-svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="روند همه گزینه‌ها">`;
    if (forExport) s += `<rect width="${W}" height="${H}" fill="#fff"/>`;
    s += ticks.map((t) => `<line class="lg-grid${t === 0 ? ' is-base' : ''}" x1="${ml - 8}" x2="${W - mr + 8}" y1="${Y(t)}" y2="${Y(t)}"/><text class="lg-ax" x="${ml - 14}" y="${Y(t) + 4}">${fa(t)}٪</text>`).join('');
    s += ys.map((y, i) => `<line class="lg-col" x1="${X(i)}" x2="${X(i)}" y1="${mt}" y2="${H - mb}"/><text class="lg-yr" x="${X(i)}" y="${H - mb + 26}">${fa(y)}</text>`).join('');
    s += `<rect class="lg-hover-col" x="0" y="${mt}" width="0" height="${H - mt - mb}" visibility="hidden"/>`;
    const focus = st.focus && shown.some((o) => o.key === st.focus) ? st.focus : null;
    const order = focus ? [...shown.filter((o) => o.key !== focus), shown.find((o) => o.key === focus)] : shown;
    const labelPositions = new Map();
    ys.forEach((year, i) => {
      if (i === ys.length - 1 && !narrow && ys.length > 1) return;
      const labels = shown.filter(o => st.labels || o.key === focus).map(o => ({o, v:value(q, year, o.key)})).filter(l => l.v != null).map(l => ({...l, y:Y(l.v) - 11})).sort((a,b) => a.y - b.y);
      const gap = 24, top = 18, bottom = H - mb - 12;
      labels.forEach((l,k) => { l.y = Math.max(l.y, k ? labels[k-1].y + gap : top); });
      if (labels.length && labels.at(-1).y > bottom) {
        labels.at(-1).y = bottom;
        for (let k=labels.length-2; k>=0; k--) labels[k].y = Math.min(labels[k].y, labels[k+1].y-gap);
      }
      labels.forEach(l => labelPositions.set(`${l.o.key}:${i}`, l.y));
    });
    s += order.map((o) => {
      const pts = ys.map((y, i) => ({ i, y, v: value(q, y, o.key) })).filter((p) => p.v != null);
      const P = pts.map((p) => [X(p.i), Y(p.v)]);
      const d = smoothPath(P);
      const cls = focus ? (o.key === focus ? ' is-focus' : ' is-dim') : '';
      const showVals = st.labels || o.key === focus;
      return `<g class="ln${cls}" data-k="${o.key}" style="--s:${o.color}">
        ${o.key === focus && P.length > 1 ? `<path class="ln-area" d="${d} L${P.at(-1)[0]} ${H - mb} L${P[0][0]} ${H - mb} Z" fill="${o.color}"/>` : ''}
        <path class="ln-hit" d="${d}"/>
        <path class="ln-path" d="${d}" stroke="${o.color}"/>
        ${pts.map((p) => `<circle class="ln-dot" cx="${X(p.i)}" cy="${Y(p.v)}" r="${o.key === focus ? 5.5 : 4}" stroke="${o.color}"/>${showVals && !(p.i === ys.length - 1 && !narrow && ys.length > 1) ? `<line class="ln-label-link" x1="${X(p.i)}" x2="${X(p.i)}" y1="${Y(p.v)}" y2="${labelPositions.get(`${o.key}:${p.i}`) + 5}" stroke="${o.color}"/><text class="ln-val" x="${X(p.i)}" y="${labelPositions.get(`${o.key}:${p.i}`)}" fill="${o.color}">${fa(Math.round(p.v))}</text>` : ''}`).join('')}
      </g>`;
    }).join('');
    // برچسب انتهای خطوط (سمت چپ، آخرین سال) با جلوگیری از هم‌پوشانی
    if (!narrow && ys.length > 1) {
      const lastI = ys.length - 1;
      let labs = shown.map((o) => ({ o, v: value(q, ys[lastI], o.key) })).filter((l) => l.v != null).map((l) => ({ ...l, y: Y(l.v) })).sort((a, b) => a.y - b.y);
      const gap = 24;
      for (let i = 1; i < labs.length; i++) if (labs[i].y - labs[i - 1].y < gap) labs[i].y = labs[i - 1].y + gap;
      const over = labs.length ? labs.at(-1).y - (H - mb + 6) : 0;
      if (over > 0) labs.forEach((l) => { l.y -= over; });
      for (let i = labs.length - 2; i >= 0; i--) if (labs[i + 1].y - labs[i].y < gap) labs[i].y = labs[i + 1].y - gap;
      s += labs.map((l) => { const dim = focus && l.o.key !== focus ? ' is-dim' : ''; const x0 = X(lastI); return `<g class="ln-end${dim}" data-k="${l.o.key}"><line x1="${x0 + 6}" x2="${x0 + 16}" y1="${Y(l.v)}" y2="${l.y}" stroke="${l.o.color}"/><text x="${x0 + 20}" y="${l.y + 4}" fill="${l.o.color}">${pct(l.v)}</text></g>`; }).join('');
    }
    return s + '</svg>';
  }

  function renderLines(area, q, st) {
    const W = Math.max(300, Math.round(area.clientWidth || area.parentElement.clientWidth || 700));
    const g = linesGeometry(q, st, W);
    const ys = g.ys, first = ys[0], last = ys.at(-1);
    const rows = g.all.map((o) => {
      const v1 = value(q, first, o.key), v2 = value(q, last, o.key);
      const d = v1 != null && v2 != null && ys.length > 1 ? Math.round(v2) - Math.round(v1) : null;
      const off = st.hidden.has(o.key);
      return `<li class="lrow${off ? ' is-off' : ''}${st.focus === o.key ? ' is-focus' : ''}" data-k="${o.key}" style="--s:${o.color}" data-text="${esc(norm(t(o.label)))}">
        <button type="button" class="lrow-toggle" data-act="toggle" data-k="${o.key}" aria-pressed="${!off}" title="${off ? 'نمایش' : 'پنهان‌کردن'} این گزینه"><i aria-hidden="true"></i></button>
        <button type="button" class="lrow-name" data-act="focus" data-k="${o.key}" title="برجسته‌کردن این گزینه">${esc(o.label)}</button>
        <span class="lrow-v">${v2 == null ? '—' : pct(v2)}</span>
        <span class="lrow-d ${d == null ? '' : d > 0 ? 'up' : d < 0 ? 'down' : ''}">${d == null ? '—' : d === 0 ? '۰' : `<bdi dir="ltr">${d > 0 ? '+' : '−'}${fa(Math.abs(d))}</bdi>`}</span>
        <button type="button" class="lrow-solo" data-act="solo" data-k="${o.key}" title="فقط همین گزینه">فقط همین</button>
      </li>`;
    }).join('');
    area.innerHTML = localize(`${guide(q, st)}
      <div class="lines-tools">
        <div class="seg seg-sm" role="group" aria-label="مقیاس محور عمودی"><button type="button" data-act="scale" data-v="auto" aria-selected="${st.scale !== 'full'}">بزرگ‌نمایی خودکار</button><button type="button" data-act="scale" data-v="full" aria-selected="${st.scale === 'full'}">۰ تا ۱۰۰٪</button></div>
        <label class="switch"><input type="checkbox" data-act="labels"${st.labels ? ' checked' : ''}><span></span>نمایش عدد روی همه نقاط</label>
      </div>
      <div class="lines-wrap">${linesSVG(q, st, g)}<div class="lines-tip" hidden></div></div>
      <div class="lpanel">
        <div class="lpanel-head">
          <p><b>گزینه‌ها</b> <span>${fa(g.shown.length)} از ${fa(g.all.length)} نمایش داده می‌شود</span></p>
          <div class="lpanel-btns">${g.all.length > 6 ? '<input type="search" class="lsearch" placeholder="جست‌وجو در گزینه‌ها" aria-label="جست‌وجو در گزینه‌ها">' : ''}<button type="button" class="link-btn" data-act="show-all">نمایش همه</button><button type="button" class="link-btn" data-act="hide-all">پنهان‌کردن همه</button></div>
        </div>
        <div class="lcols" aria-hidden="true"><span></span><span>گزینه</span><span>${fa(last)}</span><span>${ys.length > 1 ? `تغییر از ${fa(first)}` : ''}</span><span></span></div>
        <ul class="lrows">${rows}</ul>
        ${contextNote(EN ? `The “${last}” column is the option’s share in the latest selected year. “Change” subtracts its ${first} percentage from that share; it is not a relative growth rate. Click an option’s name to highlight it, or its colored square to show or hide it.` : `ستون «${fa(last)}» سهم هر گزینه در آخرین سال انتخاب‌شده است. ستون «تغییر» درصد ${fa(first)} را از این سهم کم می‌کند؛ این عدد نرخ رشد نسبی نیست. روی نام گزینه بزنید تا برجسته شود؛ مربع رنگی کنار آن، خط را پنهان یا نمایان می‌کند.`, EN ? 'How to read this chart' : 'راهنمای خواندن نمودار', 'lpanel-foot', st.infoOpen)}
      </div>`);
    area._lines = g;
  }

  // راهنمای شناور: نزدیک‌ترین سال به نشانگر
  function linesHover(e) {
    const wrap = e.target.closest?.('.lines-wrap'); if (!wrap) return;
    const area = wrap.closest('.chart-area'), g = area._lines; if (!g) return;
    const card = wrap.closest('.question-card'), q = qById(card.dataset.q), st = stateFor(q);
    const svg = wrap.querySelector('svg'), r = svg.getBoundingClientRect(), k = r.width / g.W;
    const px = ((e.touches ? e.touches[0].clientX : e.clientX) - r.left) / k;
    let best = 0; g.ys.forEach((y, i) => { if (Math.abs(g.X(i) - px) < Math.abs(g.X(best) - px)) best = i; });
    const y = g.ys[best], cx = g.X(best);
    const col = svg.querySelector('.lg-hover-col'); col.setAttribute('x', cx - 18); col.setAttribute('width', 36); col.setAttribute('visibility', 'visible');
    const rows = g.shown.map((o) => ({ o, v: value(q, y, o.key) })).filter((x) => x.v != null).sort((a, b) => b.v - a.v);
    const tip = wrap.querySelector('.lines-tip');
    tip.innerHTML = localize(`<p class="lt-y">${fa(y)} <small>${fa(q.years[y].n.toLocaleString('en-US'))} ${EN ? 'valid responses' : 'پاسخ معتبر'}</small></p>${rows.map((x) => `<p class="${st.focus === x.o.key ? 'is-focus' : ''}"><i style="background:${x.o.color}"></i><span>${esc(x.o.label)}</span><b>${pct(x.v)}</b></p>`).join('')}`);
    tip.hidden = false;
    const tx = cx * k, tw = tip.offsetWidth;
    tip.style.left = `${tx - 24 - tw > 0 ? tx - 24 - tw : Math.min(tx + 24, r.width - tw)}px`;
  }
  document.addEventListener('mousemove', linesHover);
  document.addEventListener('touchstart', linesHover, { passive: true });
  document.addEventListener('mouseout', (e) => {
    const wrap = e.target.closest?.('.lines-wrap'); if (!wrap || wrap.contains(e.relatedTarget)) return;
    wrap.querySelector('.lines-tip').hidden = true; wrap.querySelector('.lg-hover-col')?.setAttribute('visibility', 'hidden');
  });
  // نگه‌داشتن نشانگر روی ردیف یک گزینه، خطش را موقتاً برجسته می‌کند
  document.addEventListener('mouseover', (e) => {
    const row = e.target.closest?.('.lrow'); if (!row || row.classList.contains('is-off')) return;
    const card = row.closest('.question-card'); if (stateFor(qById(card.dataset.q)).focus) return;
    card.querySelectorAll('.lines-svg .ln, .lines-svg .ln-end').forEach((n) => n.classList.toggle('is-peek-dim', n.dataset.k !== row.dataset.k));
  });
  document.addEventListener('mouseout', (e) => {
    const row = e.target.closest?.('.lrow'); if (!row || row.contains(e.relatedTarget)) return;
    row.closest('.question-card').querySelectorAll('.is-peek-dim').forEach((n) => n.classList.remove('is-peek-dim'));
  });
  document.addEventListener('click', (e) => {
    const ln = e.target.closest?.('.lines-svg .ln, .lines-svg .ln-end'); if (!ln) return;
    const card = ln.closest('.question-card'), q = qById(card.dataset.q), st = stateFor(q);
    st.focus = st.focus === ln.dataset.k ? null : ln.dataset.k; renderCard(card);
  });
  document.addEventListener('input', (e) => {
    const s = e.target.closest?.('.lsearch'); if (!s) return;
    const t = norm(s.value);
    s.closest('.lpanel').querySelectorAll('.lrow').forEach((r) => { r.hidden = !!t && !r.dataset.text.includes(t); });
  });
  document.addEventListener('change', (e) => {
    const c = e.target.closest?.('[data-act="labels"]'); if (!c) return;
    const card = c.closest('.question-card'), st = stateFor(qById(card.dataset.q)); st.labels = c.checked; renderCard(card);
  });
  // بازچینی با تغییر عرض
  const linesResize = 'ResizeObserver' in window ? new ResizeObserver((es) => es.forEach((en) => {
    const card = en.target.closest('.question-card'); if (!card?._done) return;
    const w = Math.round(en.contentRect.width); if (card._w === w) return; const first = card._w == null; card._w = w;
    if (!first && stateFor(qById(card.dataset.q)).view === 'lines') renderCard(card);
    else if (stateFor(qById(card.dataset.q)).view === 'trend') layoutTrendGrid(card.querySelector('.chart-area'));
  })) : null;

  function renderCard(card) {
    const q = qById(card.dataset.q); const st = stateFor(q);
    card.querySelector('.q-toolbar-slot').innerHTML = localize(toolbar(q, st));
    const area = card.querySelector('.chart-area'), tbl = card.querySelector('.table-area');
    area.hidden = st.view === 'table'; tbl.hidden = st.view !== 'table';
    if (st.view === 'lines') renderLines(area, q, st);
    else if (st.view === 'stack') renderStack(area, q, st);
    else if (st.view === 'trend') renderTrend(area, q, st);
    else tbl.querySelector('.chart-guide') || tbl.insertAdjacentHTML('afterbegin', localize(guide(q, st)));
  }

  function questionCard(q, i, total) {
    const GENERIC = 'درصدها بر مبنای پاسخ‌های معتبر همان سؤال محاسبه شده‌اند.';
    const PARTIAL = 'برای همه سال‌ها پاسخ معتبر ثبت نشده است.';
    const MULTI = 'سؤال چندانتخابی است؛ سهم هر گزینه از مجموع انتخاب‌ها محاسبه شده است.';
    const cleaned = (q.note || '').replace(PARTIAL, '').replace(MULTI, '').trim();
    const note = cleaned && cleaned !== GENERIC ? cleaned : '';
    const ys = qYears(q);
    return `<article class="question-card" id="q-${q.id}" data-q="${q.id}">
      <header class="question-head">
        <div class="question-index"><span>پرسش</span><b>${fa(String(i + 1).padStart(2, '0'))}</b><small>از ${fa(total)}</small></div>
        <div class="question-heading">
          <div class="question-tags"><span class="status ${q.status}">${STATUS[q.status]}</span><span class="tag-years">داده ${ys.length > 1 ? `${fa(ys[0])} تا ${fa(ys.at(-1))}` : fa(ys[0] || '')}</span><span class="tag-unit">${isMulti(q) ? 'چندانتخابی' : 'تک‌انتخابی'}</span></div>
          <h3>${esc(qText(q))}</h3>
        </div>
      </header>
      <div class="q-body">
        <div class="q-toolbar-slot"></div>
        <div class="chart-area"></div>
        <div class="table-area" hidden>${table(q)}</div>
      </div>
      ${note ? contextNote(`<strong>${EN ? 'Note:' : 'یادداشت:'}</strong> ${esc(note)}`, EN ? 'More about this question' : 'توضیح بیشتر دربارهٔ پرسش', 'question-foot') : ''}
    </article>`;
  }

  document.addEventListener('toggle', (e) => {
    const details = e.target.closest?.('.context-note.lpanel-foot');
    if (!details) return;
    const card = details.closest('.question-card');
    if (card) stateFor(qById(card.dataset.q)).infoOpen = details.open;
  }, true);

  const cardObserver = 'IntersectionObserver' in window ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting && !e.target._done) { e.target._done = true; renderCard(e.target); } }), { rootMargin: '400px 0px' }) : null;
  function mountCards(scope) {
    scope.querySelectorAll('.question-card').forEach((c) => { if (cardObserver) cardObserver.observe(c); else { c._done = true; renderCard(c); } if (linesResize) linesResize.observe(c.querySelector('.q-body')); });
  }

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const card = b.closest('.question-card'); if (!card) return;
    const q = qById(card.dataset.q), st = stateFor(q), act = b.dataset.act;
    if (act === 'view') { st.view = b.dataset.v; renderCard(card); }
    else if (act === 'year') {
      const y = b.dataset.y;
      if (st.years.has(y)) { if (st.years.size > 1) st.years.delete(y); else return toast('دست‌کم یک سال باید انتخاب بماند.'); } else st.years.add(y);
      renderCard(card);
    } else if (act === 'toggle') { const k = b.dataset.k; if (st.hidden.has(k)) st.hidden.delete(k); else st.hidden.add(k); if (st.focus === k) st.focus = null; renderCard(card); }
    else if (act === 'solo') { const k = b.dataset.k; const all = colored(q).map((o) => o.key); const already = st.hidden.size === all.length - 1 && !st.hidden.has(k); st.hidden = new Set(already ? [] : all.filter((x) => x !== k)); st.focus = already ? null : k; renderCard(card); }
    else if (act === 'show-all') { st.hidden.clear(); renderCard(card); }
    else if (act === 'hide-all') { st.hidden = new Set(colored(q).map((o) => o.key)); st.focus = null; renderCard(card); }
    else if (act === 'scale') { st.scale = b.dataset.v; renderCard(card); }
    else if (act === 'focus') { st.focus = b.dataset.k && st.focus !== b.dataset.k ? b.dataset.k : null; renderCard(card); }
    else if (act === 'sort') { st.sort = !st.sort; renderCard(card); }
    else if (act === 'copy-table') copyTable(card.querySelector('table')).then(() => toast('جدول کپی شد؛ آن را در Excel یا Word بچسبانید.')).catch(() => toast('مرورگر اجازه کپی نداد.'));
    else if (act === 'copy-img') copyImage(q, st).then(() => toast('نمودار به‌صورت تصویر کپی شد.')).catch(() => toast('مرورگر اجازه کپی تصویر نداد؛ از دکمه دانلود داده استفاده کنید.'));
    else if (act === 'csv') downloadCSV(q);
  });

  // A click elsewhere releases a pinned line; normal chart controls still work.
  document.addEventListener('click', event => {
    const pin=event.target.closest?.('.lines-svg .ln, .lines-svg .ln-end, [data-act="focus"], [data-act="solo"]');
    event._iprPinCard=pin?.closest('.question-card')?.dataset.q;
  }, true);
  document.addEventListener('click', event => {
    const keep = event._iprPinCard;
    document.querySelectorAll('.question-card').forEach(card => {
      const q=qById(card.dataset.q), st=stateFor(q);
      if (st.focus && card.dataset.q !== keep) { st.focus=null; if(card._done) renderCard(card); }
    });
  });

  // کادر توضیح روی هر رنگ در نمای ترکیب پاسخ‌ها
  function segTip(e) {
    const seg = e.target.closest?.('.stack-seg'); const card = e.target.closest?.('.question-card');
    if (!card) return; const tip = card.querySelector('.stack-tip'); if (!tip) return;
    if (!seg) { tip.hidden = true; return; }
    const q = qById(card.dataset.q), o = colored(q).find((x) => x.key === seg.dataset.k), y = seg.dataset.y;
    tip.innerHTML = localize(`<p><i style="background:${o.color}"></i>${esc(o.label)}</p><b>${pct(value(q, y, o.key))}</b><span>${EN ? (isMulti(q) ? 'of selections in' : 'of respondents in') : (isMulti(q) ? 'از انتخاب‌های' : 'از پاسخ‌دهندگان')} ${fa(y)}</span>`);
    tip.hidden = false;
    const r = card.querySelector('.chart-area').getBoundingClientRect(), s = seg.getBoundingClientRect();
    const left = Math.min(Math.max(0, s.left - r.left + s.width / 2 - tip.offsetWidth / 2), r.width - tip.offsetWidth);
    tip.style.left = `${left}px`; tip.style.top = `${s.top - r.top - tip.offsetHeight - 10}px`;
  }
  document.addEventListener('mouseover', segTip);
  document.addEventListener('focusin', segTip);
  document.addEventListener('touchstart', segTip, { passive: true });

  /* خروجی تصویر */
  function exportSVG(q, st) {
    const W = 960, pad = 32, ys = selYears(q, st), opts = colored(q);
    const title = qText(q).length > 95 ? qText(q).slice(0, 93) + '…' : qText(q);
    let body = '', y0 = 84;
    if (st.view === 'lines') {
      const g = linesGeometry(q, st, W - pad * 2);
      body = `<g transform="translate(${pad},72)">${linesSVG(q, st, g, true).replace(/<svg[^>]*>/, '').replace('</svg>', '')}</g>`; y0 = 72 + g.H + 18;
      g.shown.forEach((o, i) => { const col = i % 2, row = Math.floor(i / 2), x = W - pad - col * ((W - pad * 2) / 2), yy = y0 + row * 24; body += `<rect x="${x - 12}" y="${yy - 10}" width="12" height="12" rx="3" fill="${o.color}"/><text x="${x - 20}" y="${yy}" text-anchor="end" font-size="12.5" fill="#3d4750">${esc(t(o.label).length > 58 ? t(o.label).slice(0, 56) + '…' : t(o.label))} — ${pct(value(q, g.ys.at(-1), o.key))}</text>`; });
      y0 += Math.ceil(g.shown.length / 2) * 24;
    } else if (st.view === 'trend') {
      let list = opts.filter((o) => ys.some((y) => value(q, y, o.key) != null));
      if (st.sort) list = [...list].sort((a, b) => (value(q, ys.at(-1), b.key) ?? -1) - (value(q, ys.at(-1), a.key) ?? -1));
      list.forEach((o) => {
        const pts = ys.map((y) => ({ y, v: value(q, y, o.key) })).filter((p) => p.v != null);
        const last = pts.at(-1), first = pts[0], d = pts.length > 1 ? Math.round(last.v) - Math.round(first.v) : null;
        body += `<rect x="${W - pad - 6}" y="${y0 - 14}" width="6" height="40" rx="3" fill="${o.color}"/>`;
        body += `<text x="${W - pad - 16}" y="${y0}" text-anchor="end" font-size="14" font-weight="700" fill="#18212a">${esc(t(o.label).length > 64 ? t(o.label).slice(0, 62) + '…' : t(o.label))}</text>`;
        body += `<text x="${W - pad - 16}" y="${y0 + 22}" text-anchor="end" font-size="12" fill="#66717b">${pts.map((p) => `${fa(p.y)}: ${pct(p.v)}`).join('   ')}</text>`;
        body += `<text x="${pad}" y="${y0 + 4}" font-size="22" font-weight="900" fill="${o.color}">${pct(last.v)}</text>`;
        if (d != null) body += `<text x="${pad}" y="${y0 + 24}" font-size="12" fill="#66717b">${deltaText(d, first.y)}</text>`;
        y0 += 58;
      });
    } else {
      const bx = pad, bw = W - pad * 2 - 110;
      ys.forEach((y) => {
        const segs = opts.map((o) => ({ o, v: value(q, y, o.key) })).filter((s) => s.v != null && s.v > 0);
        const tot = segs.reduce((a, s) => a + s.v, 0) || 1; let x = bx;
        body += `<text x="${W - pad}" y="${y0 + 20}" text-anchor="end" font-size="15" font-weight="900" fill="#18212a">${fa(y)}</text>`;
        segs.forEach((s) => { const w = bw * s.v / tot; body += `<rect x="${x.toFixed(1)}" y="${y0}" width="${w.toFixed(1)}" height="30" fill="${s.o.color}"/>${w > 40 ? `<text x="${(x + w / 2).toFixed(1)}" y="${y0 + 20}" text-anchor="middle" font-size="12" font-weight="700" fill="${inkOn(s.o.color)}">${pct(s.v)}</text>` : ''}`; x += w; });
        y0 += 46;
      });
      y0 += 8;
      opts.filter((o) => ys.some((y) => value(q, y, o.key) != null)).forEach((o, i) => {
        const col = i % 2, row = Math.floor(i / 2), x = W - pad - col * ((W - pad * 2) / 2), yy = y0 + row * 24;
        body += `<rect x="${x - 12}" y="${yy - 10}" width="12" height="12" rx="3" fill="${o.color}"/><text x="${x - 20}" y="${yy}" text-anchor="end" font-size="12.5" fill="#3d4750">${esc(o.label.length > 58 ? o.label.slice(0, 56) + '…' : o.label)}</text>`;
      });
      y0 += Math.ceil(opts.length / 2) * 24;
    }
    const H = y0 + 36;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" direction="ltr" font-family="IranSansX, Tahoma, sans-serif"><style>.lg-grid{stroke:#ece7df}.lg-grid.is-base{stroke:#cfc8bd}.lg-col{stroke:#f3efe8}.lg-ax{font-size:12px;fill:#66717b;text-anchor:end}.lg-yr{font-size:13px;font-weight:700;fill:#18212a;text-anchor:middle}.ln-path{fill:none;stroke-width:2.6}.ln-hit,.lg-hover-col,.ln-area{display:none}.ln-dot{fill:#fff;stroke-width:2.2}.ln-val{font-size:11px;font-weight:700;text-anchor:middle}.ln-end text{font-size:12.5px;font-weight:700;text-anchor:start}.ln-end line{stroke-width:1}.is-dim{opacity:.15}</style><rect width="${W}" height="${H}" fill="#fff"/><text x="${W - pad}" y="38" text-anchor="end" font-size="17" font-weight="700" fill="#5b1115">${esc(title)}</text><text x="${W - pad}" y="60" text-anchor="end" font-size="12" fill="#66717b">${unit(q)}</text>${body}<text x="${W - pad}" y="${H - 14}" text-anchor="end" font-size="11" fill="#9a958e">منبع: گزارش فرایند ایران</text></svg>`;
  }
  async function copyImage(q, st) {
    if (!navigator.clipboard?.write || !window.ClipboardItem) throw new Error('clipboard');
    const svg = localize(exportSVG(q, st)), m = svg.match(/width="(\d+)" height="(\d+)"/), w = +m[1], h = +m[2];
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
    try {
      const img = new Image(); await new Promise((ok, no) => { img.onload = ok; img.onerror = no; img.src = url; });
      const cv = document.createElement('canvas'); cv.width = w * 2; cv.height = h * 2; cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      const blob = await new Promise((ok, no) => cv.toBlob((b) => (b ? ok(b) : no(new Error('canvas'))), 'image/png'));
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    } finally { URL.revokeObjectURL(url); }
  }
  function downloadCSV(q) {
    window.IPR_DOWNLOADS.requireAccess(() => performDownloadCSV(q));
  }
  function performDownloadCSV(q) {
    const opts = options(q);
    const rows = [['گزینه پاسخ', ...YEARS], ...opts.map((o) => [o.label, ...YEARS.map((y) => { const v = value(q, y, o.key); return v == null ? '' : v.toFixed(1); })]), ['تعداد پاسخ معتبر', ...YEARS.map((y) => q.years[y]?.n ?? '')]];
    const csv = '﻿' + [[qText(q)], [unit(q)], ...rows].map((r) => r.map((c) => `"${t(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); a.download = `${q.id}.csv`;
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  /* ---------- هیرو ---------- */
  const edByYear = (y) => C.editions.find((e) => e.year === y);

  function heroHome() {
    const h = C.hero;
    const emblem = '<img class="emblem-mark" src="assets/img/ipr-mark-outline-cream.svg" alt="" width="44" height="39">';
    const copy = `
      <div class="hero-kicker">${emblem}<div><p class="overline">${esc(h.overline)}</p><p class="edition-pill"><i></i>${esc(h.edition)}</p></div></div>
      <h1 id="hero-title"><span>${esc(h.titleLine1)}</span><em>${esc(h.titleLine2)}</em></h1>
      <p class="hero-lead">${esc(h.lead)}</p>
      <div class="hero-actions"><button class="btn btn-gold" type="button" data-open-form>دریافت گزارش</button><a class="btn btn-ghost" href="#about-intro" data-scroll>گزارش فرایند ایران چیست؟</a></div>`;
    const covers = C.editions.filter((e) => e.cover);
    const current = C.editions.find((e) => e.current) || covers.at(-1);
    const visual = `<div class="cover-stage" data-active="${current.year}">
        ${covers.map((e) => `<a class="cover" href="#report-${e.year}" data-nav="report-${e.year}" data-year="${e.year}" aria-label="صفحه‌ی گزارش ${fa(e.year)}"><img src="${e.cover}" alt="جلد گزارش فرایند ایران ${fa(e.year)}" ${e.current ? '' : 'loading="lazy"'}><span class="cap">صفحه‌ی دوره ${fa(e.year)} ←</span></a>`).join('')}
        ${C.editions.filter((e) => !e.cover).map((e) => `<a class="cover cover-empty" href="#report-${e.year}" data-nav="report-${e.year}" data-year="${e.year}"><div><b>${fa(e.year)}</b><small>${esc(e.ordinal)}</small>${C.SHOW_PLACEHOLDERS ? '<span class="ph">جلد در انتظار</span>' : ''}</div></a>`).join('')}
      </div>`;
    const rail = `<div class="rail rail-editions" role="list" aria-label="دوره‌های گزارش فرایند ایران">
        ${C.editions.map((e) => `<a class="rail-node${e.current ? ' is-current is-active' : ''}" href="#report-${e.year}" target="_blank" rel="noopener noreferrer" role="listitem" data-edition="${e.year}" style="--c:${e.color}" aria-label="${EN ? 'Report ' : 'گزارش '}${fa(e.year)}${EN ? ', ' : '، '}${esc(e.ordinal)}">
          <span class="rail-dot"></span>
          <span class="rail-year">${fa(e.year)}</span>
          <span class="rail-ord">${esc(e.ordinal)}${e.launch ? ` · <em>${esc(e.launch)}</em>` : ''}</span>
          <span class="rail-meta">${e.people ? (e.orgs ? `${fnum(e.people)} نفر · ${fnum(e.orgs)} سازمان` : `${fnum(e.people)} پرسشنامه تکمیل‌شده`) : placeholder('آمار مشارکت')}</span>
        </a>`).join('')}
      </div>`;
    return { copy, visual, rail };
  }

  function storyValues(ch) {
    return ch.story.map((s) => {
      if (s.q) return { ...s, v: sumFor(s.q, s.year, s.match, s.exact), src: 'data' };
      if (s.value != null) return { ...s, v: s.value, src: 'print' };
      return { ...s, v: null };
    });
  }

  function heroChapter(sec) {
    const ch = C.chapters[sec.id];
    const qs = QUESTIONS.filter((q) => q.section === sec.id);
    const st = storyValues(ch);
    const latest = [...st].reverse().find((s) => s.v != null);
    const copy = `
      <div class="hero-kicker"><span class="chapter-num">${ch.no}</span><div><p class="overline">${esc(ch.reportPart)}</p><p class="edition-pill"><i></i><span lang="en">${esc(sec.en)}</span></p></div></div>
      <h1 id="hero-title"><em>${esc(ch.title)}</em></h1>
      <p class="hero-lead hero-quote">${esc(ch.slogan)}</p>
      <div class="hero-actions"><a class="btn btn-gold" href="#${sec.id}-questions" data-scroll>${EN ? `Explore ${qs.length} ${qs.length === 1 ? 'question' : 'questions'} in this topic` : `مرور ${fa(qs.length)} پرسش این محور`}</a><button class="btn btn-ghost" type="button" data-open-form>دریافت گزارش</button></div>`;
    const pts = st.map((s, i) => ({ ...s, i })).filter((s) => s.v != null);
    const Wd = 420, Hd = 170, pad = 34, n = st.length;
    const X = (i) => pad + i * ((Wd - pad * 2) / Math.max(n - 1, 1));
    const Y = (v) => 20 + (100 - v) * ((Hd - 50) / 100);
    const path = pts.map((p, k) => `${k ? 'L' : 'M'}${X(p.i).toFixed(1)} ${Y(p.v).toFixed(1)}`).join(' ');
    const area = pts.length > 1 ? `${path} L${X(pts.at(-1).i)} ${Hd - 30} L${X(pts[0].i)} ${Hd - 30} Z` : '';
    const svg = `<svg class="trend-spark" viewBox="0 0 ${Wd} ${Hd}" role="img" aria-label="${EN ? 'Trend: ' : 'روند '}${esc(ch.metric)}">
        <defs><linearGradient id="ga-${sec.id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f6b73c" stop-opacity=".35"/><stop offset="1" stop-color="#f6b73c" stop-opacity="0"/></linearGradient></defs>
        ${st.map((s, i) => `<line class="tick" x1="${X(i)}" x2="${X(i)}" y1="16" y2="${Hd - 30}"/><text class="tyear" x="${X(i)}" y="${Hd - 10}">${fa(s.year)}</text>`).join('')}
        ${area ? `<path class="tarea" d="${area}" fill="url(#ga-${sec.id})"/>` : ''}
        <path class="tline" d="${path}"/>
        ${pts.map((p) => `<g class="tpt${p === latest ? ' is-last' : ''}${p.src === 'print' ? ' is-print' : ''}"><circle cx="${X(p.i)}" cy="${Y(p.v)}" r="${p === latest ? 7 : 5}"/><text x="${X(p.i)}" y="${Y(p.v) - 13}">${pct(p.v)}</text></g>`).join('')}
      </svg>`;
    const hasPrint = st.some((s) => s.src === 'print');
    const visual = `<div class="trend-card">
        <p class="trend-card-label">شاخص کلیدی</p>
        <p class="trend-card-metric">${esc(ch.metric)}</p>
        <div class="trend-card-big"><b>${latest ? pct(latest.v) : '—'}</b><span>در ${fa(latest?.year || '')}</span></div>
        ${svg}
        ${hasPrint ? '<p class="trend-card-note"><i class="dot-print"></i>عدد چاپ‌شده در گزارش همان سال</p>' : ''}
      </div>`;
    const rail = `<div class="rail rail-story" role="list" aria-label="این بخش در دوره‌های گزارش">
        ${st.map((s) => `<article class="story-node${s.year === '1404' ? ' is-current' : ''}${!s.headline && s.year !== '1404' ? ' is-empty' : ''}" role="listitem" style="--c:${edByYear(s.year)?.color || '#999'}">
          <header><span class="rail-dot"></span><b>${fa(s.year)}</b>${s.v != null ? `<span class="story-val">${pct(s.v)}</span>` : ''}</header>
          ${s.headline ? `<h3>${esc(s.headline)}</h3>` : (s.year === '1404' ? '<h3 class="soon">روایت کامل در گزارش ۱۴۰۴</h3>' : '')}
          ${s.sub && s.year !== '1401' ? `<p>${esc(s.sub)}</p>` : ''}
          ${s.empty ? `<p class="muted">${esc(s.empty)}</p>` : ''}
          ${s.note ? `<p class="muted">${esc(s.note)}</p>` : ''}
        </article>`).join('')}
      </div>`;
    return { copy, visual, rail };
  }

  /* ---------- صفحه‌ی داستان کامل گزارش ---------- */
  function storyView() {
    const S = C.story;
    const sec = (x, i) => `<section class="st-sec" id="story-${i}">
        <div class="st-head"><span class="st-no">${fa(String(i + 4).padStart(2, '0'))}</span><h2>${esc(x.h)}</h2></div>
        <div class="st-body">
          ${(x.p || []).map((t) => `<p>${esc(t)}</p>`).join('')}
          ${x.pull ? `<blockquote class="st-pull">${esc(x.pull)}</blockquote>` : ''}
          ${x.figs ? `<ul class="st-figs">${x.figs.map((f) => `<li><b>${esc(f.v)}</b><span>${esc(f.l)}</span></li>`).join('')}</ul>` : ''}
          ${x.list ? `<ol class="st-list">${x.list.map((t) => { const special=t.startsWith('هوش مصنوعی:') ? ' class="is-special"' : ''; const k = t.indexOf(':'); return k > 0 && k < 60 ? `<li${special}><b>${esc(t.slice(0, k))}</b>${esc(t.slice(k + 1))}</li>` : `<li>${esc(t)}</li>`; }).join('')}</ol>` : ''}
          ${x.note ? `<p class="st-note">${esc(x.note)}</p>` : ''}
          ${x.chapters ? `<div class="st-years">${x.chapters.map((c) => { const e = edByYear(c.y); return `<article style="--c:${e.color}"><header><b>${fa(c.y)}</b><span>${esc(e.ordinal)}</span></header><h3>${esc(c.h)}</h3><p>${esc(c.p)}</p><a href="#report-${c.y}" data-nav="report-${c.y}">خلاصهٔ این دوره ←</a></article>`; }).join('')}</div>` : ''}
          ${x.ideas ? `<div class="st-ideas">${x.ideas.map((d) => `<article><h3>${esc(d.h)}</h3><p>${esc(d.p)}</p></article>`).join('')}</div>` : ''}
        </div>
      </section>`;
    return `<section class="page story-page" id="story" aria-label="${esc(S.title)}">
      <nav class="st-toc" aria-label="فهرست این صفحه"><a href="#story-project" data-scroll>معرفی پروژه</a><a href="#story-method" data-scroll>روش‌شناسی</a><a href="#story-facts" data-scroll>${EN ? 'Questions about the report' : 'پرسش‌های متداول'}</a></nav>
      <section class="st-sec about-detail" id="story-project"><div class="st-head"><span class="st-no">۰۱</span><h2>معرفی پروژه</h2></div><div class="st-body"><div class="project-copy">${C.projectIntro.map(p => `<p>${esc(p)}</p>`).join('')}</div><ul class="intro-topics">${C.about.body.slice(1).map(t => `<li>${esc(t)}</li>`).join('')}</ul></div></section>
      <section class="st-sec about-detail" id="story-method"><div class="st-head"><span class="st-no">۰۲</span><h2>روش‌شناسی</h2></div><div class="st-body"><p>${EN ? 'The annual questionnaire follows five recurring topics; the 1402 edition introduced a special set of AI questions.' : 'پرسشنامهٔ سالانه پنج محور تکرارشونده را دنبال می‌کند؛ پرسش‌های ویژهٔ هوش مصنوعی از گزارش فرایند ایران ۱۴۰۲ به آن اضافه شده‌اند.'}</p><p>مشارکت‌کنندگان پرسشنامه را به‌صورت اینترنتی و بر پایهٔ اطلاعات خود از سازمانشان تکمیل می‌کنند. این نتیجه‌ها برداشت پاسخ‌دهندگان را نشان می‌دهند و جای ارزیابی مستقلِ وضعیت سازمان‌ها را نمی‌گیرند.</p><h3>این عددها چگونه خوانده می‌شوند؟</h3><ol class="method-list"><li><h4>مبنای درصدها</h4><p>درصد هر گزینه از پاسخ‌های معتبر همان پرسش محاسبه می‌شود. تعداد این پاسخ‌ها کنار نمودار آمده است.</p></li><li><h4>مقایسهٔ سال‌ها</h4><p>متن پرسش، گزینه‌ها و ترکیب پاسخ‌دهندگان را هنگام مقایسه بررسی کنید. موارد دارای تفاوت با علامت △ مشخص شده‌اند.</p></li><li><h4>حریم مشارکت‌کنندگان</h4><p>نتیجه‌ها به‌صورت تجمیعی منتشر می‌شوند؛ نام، شمارهٔ تماس و پاسخ فردی نمایش داده نمی‌شود.</p></li></ol></div></section>
      <section class="st-sec about-detail" id="story-facts"><div class="st-head"><span class="st-no">۰۳</span><h2>${EN ? 'Questions about the report' : 'پرسش‌های متداول دربارهٔ گزارش'}</h2></div><div class="st-body"><div class="fact-grid">${C.about.facts.map(f => `<article><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></article>`).join('')}</div></div></section>
      <header class="st-group-heading"><p class="overline">${EN ? 'About the report and using its findings' : 'دربارهٔ گزارش و شیوهٔ استفاده از یافته‌ها'}</p><h2>${EN ? 'From the first question to using the findings' : 'از نخستین پرسش تا استفاده از یافته‌ها'}</h2><p>${EN ? 'The following sections explain how the report began, how it has developed and how to read its findings.' : 'در بخش‌های بعد، چگونگی شکل‌گیری گزارش، مسیر دوره‌های آن و شیوهٔ استفاده از یافته‌ها را مرور می‌کنیم.'}</p></header>
      ${S.sections.map(sec).join('')}
      <nav class="st-end"><div><p class="overline">گزارش‌های سالانه</p><h2>خلاصهٔ یافته‌های هر دوره را ببینید</h2></div>
        <div class="st-end-links">${C.editions.map((e) => `<a href="#report-${e.year}" data-nav="report-${e.year}" style="--c:${e.color}"><img src="${e.cover}" alt="" loading="lazy"><b>${fa(e.year)}</b></a>`).join('')}</div></nav>
    </section>`;
  }
  function heroStory() {
    const S = C.story, ed = edByYear('1404');
    const copy = `<div class="hero-kicker"><span class="chapter-num">${fa(C.editions.length)}</span><div><p class="overline">${esc(S.kicker)}</p><p class="edition-pill"><i></i><span lang="en">Iran Process Report</span></p></div></div>
      <h1 id="hero-title"><em>${esc(S.title)}</em></h1>
      <p class="hero-lead hero-quote">${esc(S.lead)}</p>
      <div class="hero-actions"><a class="btn btn-gold" href="#story-project" data-scroll>معرفی پروژه</a><a class="btn btn-ghost" href="#data" data-nav="data">بررسی داده‌ها</a></div>`;
    const visual = `<div class="rp-cover" style="--c:${ed.color}"><img src="${ed.cover}" alt="جلد گزارش فرایند ایران ۱۴۰۴"><span class="rp-cover-badge">${esc(ed.launch || '')}</span></div>`;
    const rail = `<div class="rail rail-story" role="list" aria-label="دوره‌های گزارش">${C.editions.map((e) => { const inner = `<header><span class="rail-dot"></span><b>${fa(e.year)}</b></header><h3>${esc(e.ordinal)}</h3><p>${e.people ? (e.orgs ? `${fa(e.people)} نفر از ${fa(e.orgs)} سازمان` : `${fa(e.people)} پرسشنامه تکمیل‌شده`) : (e.launch || '')}</p>`; return `<a class="story-node rp-node${e.current ? ' is-current' : ''}" role="listitem" href="#report-${e.year}" data-nav="report-${e.year}" style="--c:${e.color}">${inner}</a>`; }).join('')}</div>`;
    return { copy, visual, rail };
  }

  /* ---------- هیروی صفحه‌ی دفترچه ---------- */
  function launchPage() {
    return window.IPR_EVENT.page(EN,annualPager('1404'));
  }
  function heroReport(y) {
    if(y==='1404' && !window.IPR_RELEASE.isPublished()) return {
      copy:`<div class="hero-kicker"><img src="assets/img/ipr-mark-cream.svg" alt="IPR" width="44" height="40"><div><p class="overline">${EN?'The fifth edition':'دورهٔ پنجم'}</p><p class="edition-pill">${EN?'October 27, 2026 · 07:30 Tehran':'۵ آبان ۱۴۰۵ · ساعت ۰۷:۳۰'}</p></div></div><h1 id="hero-title"><em>${EN?'Iran Process Report 1404':'گزارش فرایند ایران ۱۴۰۴'}</em></h1><p class="hero-lead">${EN?'A fresh look at process management maturity in Iranian organizations. The fifth edition is about to be unveiled.':'نگاهی تازه به وضعیت بلوغ مدیریت فرایند در سازمان‌های ایرانی؛ پنجمین دوره در آستانهٔ رونمایی است.'}</p><div class="hero-actions"><a class="btn btn-gold" href="#annual-1404-event" data-scroll>${EN?'The launch event':'رویداد رونمایی'}</a><a class="btn btn-ghost" href="#story" data-nav="story">${EN?'Discover the report':'آشنایی با گزارش'}</a></div>`,
      visual:`<div class="rp-cover" style="--c:#5b1115"><img src="${edByYear(y).cover}" alt="${EN?'Cover of the 1404 report':'جلد گزارش ۱۴۰۴'}"><span class="rp-cover-badge">${EN?'Coming on 5 Aban':'رونمایی در ۵ آبان'}</span></div>`,rail:''
    };

    const ed = edByYear(y), summary = window.IPR_ANNUAL[y];
    const lead = summary.lead[EN ? 1 : 0];
    const copy = `
      <div class="hero-kicker"><span class="chapter-num">${fa(y.slice(2))}</span><div><p class="overline">${esc(ed.ordinal)} · ${esc(ed.theme || '')}</p><p class="edition-pill"><i></i><span lang="en">Iran Process Report ${Number(y) + 621}</span></p></div></div>
      <h1 id="hero-title"><em>گزارش فرایند ایران ${fa(y)}</em></h1>
      <p class="hero-lead hero-quote">${lead}</p>
      <div class="hero-actions"><a class="btn btn-gold" href="#annual-${y}-summary" data-scroll>خلاصهٔ این دوره</a><a class="btn btn-ghost" href="#data" data-nav="data">محورهای گزارش</a>${window.IPR_BOOKLETS[y] ? `<button class="btn btn-ghost" type="button" data-read-booklet="${y}">${EN ? 'Read booklet' : 'مطالعهٔ دفترچه'}</button><button class="btn btn-ghost" type="button" data-download-report="${y}">${EN ? 'Download PDF' : 'دانلود PDF'}</button>` : ''}</div>`;
    const visual = `<div class="rp-cover" style="--c:${ed.color}">${ed.cover ? `<img src="${ed.cover}" alt="جلد گزارش فرایند ایران ${fa(y)}">` : ''}${window.IPR_BOOKLETS[y] ? `<span class="rp-cover-badge">${fa(window.IPR_BOOKLETS[y])} ${EN ? 'pages' : 'صفحه'}</span>` : ''}</div>`;
    const rail = `<div class="rail rail-story" role="list" aria-label="دوره‌های گزارش">${C.editions.map((e) => `<a class="story-node rp-node${e.year === y ? ' is-current' : ''}" role="listitem" href="#report-${e.year}" data-nav="report-${e.year}" style="--c:${e.color}"><header><span class="rail-dot"></span><b>${fa(e.year)}</b></header><h3>${esc(e.ordinal)}</h3><p>${e.people ? `${fa(e.people)} ${e.orgs ? `نفر از ${fa(e.orgs)} سازمان` : 'پرسشنامه تکمیل‌شده'}` : 'آغاز گزارش سالانه'}</p></a>`).join('')}</div>`;
    return { copy, visual, rail };
  }

  function annualPager(year) {
    const index=C.editions.findIndex(e=>e.year===year);
    const arrow=(forward)=>`<span class="rp-other-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="${forward===EN?'M5 12h14m-7-7 7 7-7 7':'M19 12H5m7-7-7 7 7 7'}"/></svg></span>`;
    const card=(e,label,forward)=>e?`<a class="rp-other${forward?' is-next':''}" href="#report-${e.year}" data-nav="report-${e.year}"><img src="${e.cover}" alt="" loading="lazy"><span class="rp-other-copy"><small>${label}</small><b>${EN?'Report':'گزارش'} ${fa(e.year)}</b><em>${esc(e.ordinal)}</em></span>${arrow(forward)}</a>`:'';
    return `<nav class="rp-others" aria-label="${EN?'Other report editions':'دوره‌های دیگر گزارش'}">${card(C.editions[index-1],EN?'Previous edition':'دورهٔ قبل',false)}${C.editions[index+1]?card(C.editions[index+1],EN?'Next edition':'دورهٔ بعد',true):`<a class="rp-other rp-home" href="#about" data-nav="about"><span class="rp-other-copy"><small>${EN?'Back to home':'بازگشت به صفحهٔ اصلی'}</small><b>${esc('گزارش فرایند ایران')}</b></span>${arrow(true)}</a>`}</nav>`;
  }
  function editionPage(y) {
    if(y==='1404' && !window.IPR_RELEASE.isPublished()) return launchPage();
    const e = edByYear(y), s = window.IPR_ANNUAL[y], participants = window.IPR_PARTICIPANTS?.[y] || [];
    const launchVideos = (C.videos || []).filter((v) => v.year === y && v.id);
    const text = (pair) => pair[EN ? 1 : 0];
    const number = (n) => new Intl.NumberFormat(EN ? 'en-US' : 'fa-IR', { maximumFractionDigits: 1 }).format(n);
    const source = (ref) => {
      if (ref.kind === 'booklet') {
        const page = EN ? String(ref.page).replace(/،/g, ',') : fa(ref.page);
        return EN ? `${ref.year} booklet · p. ${page}` : `دفترچهٔ ${fa(ref.year)} · ص ${page}`;
      }
      return EN ? `1404 questionnaire${ref.n ? ` · ${number(ref.n)} valid responses` : ''}` : `پرسشنامهٔ ۱۴۰۴${ref.n ? ` · ${number(ref.n)} پاسخ معتبر` : ''}`;
    };
    const topic = (id) => ({
      commitment: ['حمایت و علاقه‌مندی', 'Commitment & interest'],
      investment: ['سرمایه‌گذاری', 'Investment'],
      tools: ['ابزارها و سامانه‌ها', 'Tools & systems'],
      mining: ['فرایندکاوی', 'Process mining'],
      maturity: ['تحول و ظرفیت اجرا', 'Transformation & capacity']
    })[id][EN ? 1 : 0];
    const indicator = (m, i) => {
      const change = m.change ? (EN
        ? `Share change vs ${m.change.year}: ${m.change.value > 0 ? '+' : '−'}${number(Math.abs(m.change.value))}%`
        : `تغییر سهم نسبت به ${fa(m.change.year)}: ${m.change.value > 0 ? '+' : '−'}${number(Math.abs(m.change.value))}٪`) : '';
      return `<article class="annual-kpi${i < 3 ? ' is-primary' : ''}">
        <div class="annual-kpi-top"><span>${esc(topic(m.topic))}</span><small class="annual-kpi-index" aria-hidden="true">${number(i + 1)}</small></div>
        <b class="annual-kpi-value">${number(m.value)}<small>${EN ? '%' : '٪'}</small></b>
        <h3>${esc(text(m.label))}</h3><p>${esc(text(m.detail))}</p>
        ${change ? `<div class="annual-kpi-change">${esc(change)}</div>` : ''}
        <footer><small>${esc(source(m.source))}</small>${y === '1400' ? '' : `<a href="#q-${m.qid}" data-nav="${m.topic}" data-target="q-${m.qid}" aria-label="${esc(EN ? `Question trend: ${text(m.label)}` : `روند پرسش: ${text(m.label)}`)}">${EN ? 'Question trend' : 'روند پرسش'} ${EN ? '→' : '←'}</a>`}</footer>
      </article>`;
    };
    const chart = (g) => {
      const industry = /صنعت|بخش صنعتی|حوزه‌های اقتصادی/.test(g.title);
      return `<article class="annual-participant${industry ? ' is-industry' : ''}"><h3>${esc(g.title)}</h3><div class="annual-bars">${g.labels.map((l, i) => `<div class="annual-bar-row"><span>${esc(l)}</span><div class="annual-bar-track"><i style="width:${Math.max(0, Math.min(100, g.values[i])).toFixed(2)}%"></i></div><b>${fa(g.values[i])}٪</b></div>`).join('')}</div></article>`;
    };
    return `<section class="page report-page annual-page" id="report-${y}" style="--rc:${e.color}">
      <div class="annual-wrap" id="annual-${y}-summary">
        <header class="annual-head"><p class="overline">${EN ? ({1400:'First edition',1401:'Second edition',1402:'Third edition',1403:'Fourth edition',1404:'Fifth edition'})[y] : esc(e.ordinal)} · ${EN ? 'Report' : 'گزارش'} ${EN ? y : fa(y)}</p><h2>${EN ? 'This period at a glance' : 'این دوره در یک نگاه'}</h2><p>${esc(text(s.lead))}</p></header>
        <section class="annual-facts" aria-labelledby="annual-${y}-facts-title"><h3 id="annual-${y}-facts-title">${EN ? 'Key figures for this period' : 'داده‌های کلیدی این دوره'}</h3><ul>${s.kpis.map(([value,faLabel,enLabel])=>`<li><b><bdi>${esc(value)}</bdi></b><span>${esc(EN?enLabel:faLabel)}</span></li>`).join('')}</ul></section>
        ${bookletActions(y,'annual-booklet-actions')}
        <ul class="annual-sample" aria-label="${EN ? 'Period and source' : 'مشخصات دوره و منبع'}">${s.sample.map((item) => `<li>${esc(text(item))}</li>`).join('')}</ul>
        <div class="annual-indicators-head"><h3>${EN ? 'Selected indicators' : 'شاخص‌های منتخب این دوره'}</h3><p>${EN ? 'Percentages describe questionnaire responses. Each indicator has its own definition and source.' : 'درصدها پاسخ‌های پرسشنامه را توصیف می‌کنند؛ تعریف و مرجع هر شاخص زیر همان عدد آمده است.'}</p></div>
        <div class="annual-kpis">${s.metrics.map(indicator).join('')}</div>
        <section class="annual-highlights" aria-labelledby="annual-${y}-highlights"><h3 id="annual-${y}-highlights">${EN ? 'Three findings to explore' : 'سه یافتهٔ قابل توجه'}</h3><div class="annual-highlight-grid">${s.highlights.map((f, i) => `<article><span class="annual-highlight-no">${number(i + 1)}</span><h4>${esc(text(f.title))}</h4><p>${esc(text(f.text))}</p><small>${esc(source(f.source))}</small></article>`).join('')}</div></section>
        <div class="annual-interpret"><h3>${EN ? 'What the findings mean' : 'این نتیجه‌ها چه می‌گویند؟'}</h3><p>${esc(text(s.insight))}</p></div>
        <details class="annual-method"><summary>${EN ? 'Sources and calculation notes' : 'منابع و مبنای محاسبهٔ شاخص‌ها'}</summary><p class="annual-source">${esc(text(s.note))}</p><p>${EN ? 'Changes describe differences between response distributions, not changes within a fixed panel of organizations. They do not establish statistical significance or causal relationships.' : 'تغییرها تفاوت توزیع پاسخ‌ها را نشان می‌دهند؛ سازمان‌های یکسانی در همهٔ دوره‌ها دنبال نشده‌اند. از این عددها به‌تنهایی معناداری آماری یا رابطهٔ علّی به دست نمی‌آید.'}</p><a href="#story-method" data-nav="story" data-target="story-method">${EN ? 'Read the methodology →' : 'روش‌شناسی گزارش ←'}</a></details>
        ${participants.length ? `<details class="annual-participants"><summary>${EN ? 'Who responded in this period' : 'ترکیب پاسخ‌دهندگان این دوره'}</summary><p>${y === '1400' ? (EN ? 'These figures come from printed pages 2–3 of the original 1400 booklet. Rounded role percentages add to 101%. They describe respondents, not all Iranian organizations.' : 'این سهم‌ها از صفحه‌های چاپی ۲ و ۳ دفترچهٔ اصلی ۱۴۰۰ خوانده شده‌اند. جمع درصد سمت‌ها به دلیل گرد کردن، ۱۰۱٪ است. این آمار ترکیب پاسخ‌دهندگان را نشان می‌دهد و قابل تعمیم به همهٔ سازمان‌های ایران نیست.') : (EN ? 'These charts show each group’s share of responses to the corresponding question. They do not support statistical generalization to all Iranian organizations.' : 'این نمودارها سهم هر گروه از پاسخ‌های همان پرسش را نشان می‌دهند و مبنای تعمیم آماری به همهٔ سازمان‌های ایران نیستند.')}</p><div class="annual-participant-grid">${participants.map(chart).join('')}</div></details>` : ''}
        <section class="annual-event" id="annual-${y}-event" aria-labelledby="annual-${y}-event-title"><p class="overline">${EN ? 'Launch event' : 'رویداد رونمایی'}</p><h3 id="annual-${y}-event-title">${EN ? `Launch of the ${y} report` : `رونمایی گزارش ${fa(y)}`}</h3>${launchVideos.length ? `<p>${EN ? 'Available videos from this report’s launch are listed below.' : 'فیلم‌های موجود از رونمایی این دوره در ادامه آمده‌اند.'}</p><div class="vid-grid annual-event-videos">${launchVideos.map(videoCard).join('')}</div>` : `<p>${e.current && !window.IPR_RELEASE.isPublished() ? (EN ? 'The launch of this report is upcoming.' : 'رونمایی این دوره هنوز برگزار نشده است.') : (EN ? 'No launch video is recorded in this site archive for this report.' : 'فیلمی از رونمایی این دوره در آرشیو فعلی سایت ثبت نشده است.')}</p>`}${eventGallery(y)}</section>
        <div class="annual-next"><a href="#data" data-nav="data">${EN ? 'Explore report topics →' : 'داده‌ها به تفکیک محور ←'}</a><a href="#reports" data-nav="reports">${EN ? 'All periods →' : 'همهٔ دوره‌ها ←'}</a></div>
      </div>${annualPager(y)}</section>`;
  }

  let homeHeroSlide=0, homeHeroPaused=matchMedia('(prefers-reduced-motion: reduce)').matches, homeHeroElapsed=0, homeHeroLast=performance.now();
  function renderHero(id) {
    const hero = document.getElementById('hero');
    const rep = /^report-\d{4}$/.test(id) ? id.slice(7) : null;
    const sec = SECTIONS.find((s) => s.id === id);
    const home=!sec && !rep && id !== 'story';
    const carousel=home && !window.IPR_RELEASE.isPublished();
    const event=carousel && homeHeroSlide===0;
    const parts = event ? window.IPR_EVENT.hero(EN) : id === 'story' ? heroStory() : rep ? heroReport(rep) : sec ? heroChapter(sec) : heroHome();
    hero.classList.toggle('is-event-hero',event);
    hero.classList.toggle('is-carousel',carousel);
    if(carousel && !hero.querySelector('.hero-atmosphere')){
      const atmosphere=document.createElement('div');atmosphere.className='hero-atmosphere';atmosphere.setAttribute('aria-hidden','true');
      atmosphere.innerHTML=window.IPR_EVENT.flow()+`<span>${EN?'1404':'۱۴۰۴'}</span>`;hero.prepend(atmosphere);
    }else if(!carousel)hero.querySelector('.hero-atmosphere')?.remove();
    hero.classList.toggle('is-home', !sec && !rep && id !== 'story');
    hero.classList.toggle('is-chapter', !!sec || !!rep || id === 'story');
    hero.classList.toggle('is-report', !!rep);
    if(carousel){
      const launch=window.IPR_EVENT.hero(EN),research=heroHome();
      const layer=(html,index,kind)=>`<div class="home-hero-layer home-${kind}${index===homeHeroSlide?' is-active':''}" data-home-layer="${index}" aria-hidden="${index!==homeHeroSlide}" ${index!==homeHeroSlide?'inert':''}>${html}</div>`;
      document.getElementById('hero-copy').innerHTML=localize(layer(launch.copy,0,'event')+layer(research.copy,1,'research'));
      document.getElementById('hero-visual').innerHTML=localize(layer(launch.visual,0,'event')+layer(research.visual+research.rail,1,'research'));
      document.getElementById('hero-rail').innerHTML=window.IPR_EVENT.controls(EN,homeHeroSlide,homeHeroPaused);
    }else{
      document.getElementById('hero-copy').innerHTML = localize(parts.copy);
      document.getElementById('hero-visual').innerHTML = localize(parts.visual);
      document.getElementById('hero-rail').innerHTML = localize(parts.rail);
    }
    hero.setAttribute('aria-labelledby',event?'hero-event-title':'hero-title');
    document.getElementById('hero-visual').setAttribute('aria-hidden',String(!carousel && !event));
    document.getElementById('hero-map').style.backgroundImage = C.hero.mapVector ? `url("${C.hero.mapVector}")` : '';
    hero.classList.remove('is-in'); void hero.offsetWidth; hero.classList.add('is-in');
    homeHeroElapsed=0;homeHeroLast=performance.now();
    document.dispatchEvent(new CustomEvent('ipr:hero-rendered'));
  }

  function setHomeHero(slide) {
    if(!document.getElementById('hero').classList.contains('is-home')||window.IPR_RELEASE.isPublished())return;
    homeHeroSlide=(slide+2)%2;
    const hero=document.getElementById('hero');
    hero.querySelectorAll('[data-home-layer]').forEach(layer=>{const active=Number(layer.dataset.homeLayer)===homeHeroSlide;layer.classList.toggle('is-active',active);layer.setAttribute('aria-hidden',String(!active));layer.inert=!active;});
    hero.querySelectorAll('[data-home-slide]').forEach(button=>{const active=Number(button.dataset.homeSlide)===homeHeroSlide;button.classList.toggle('is-current',active);button.setAttribute('aria-current',String(active));});
    hero.classList.toggle('is-event-hero',homeHeroSlide===0);hero.setAttribute('aria-labelledby',homeHeroSlide===0?'hero-event-title':'hero-title');
    homeHeroElapsed=0;homeHeroLast=performance.now();hero.querySelector('.home-hero-controls')?.style.setProperty('--home-hero-progress',0);
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-home-slide],[data-home-step],[data-home-pause]');if(!button)return;
    if(button.hasAttribute('data-home-pause')){homeHeroPaused=!homeHeroPaused;document.querySelector('.home-hero-controls').outerHTML=window.IPR_EVENT.controls(EN,homeHeroSlide,homeHeroPaused);document.querySelector('[data-home-pause]')?.focus({preventScroll:true});}
    else {setHomeHero(button.hasAttribute('data-home-slide')?Number(button.dataset.homeSlide):homeHeroSlide+Number(button.dataset.homeStep));document.querySelector(`[data-home-slide="${homeHeroSlide}"]`)?.focus({preventScroll:true});}
  });
  document.getElementById('hero').addEventListener('keydown',event=>{
    if(!event.target.closest('.home-hero-controls')||!['ArrowLeft','ArrowRight'].includes(event.key))return;
    event.preventDefault();setHomeHero(homeHeroSlide+(event.key==='ArrowRight'?1:-1));document.querySelector(`[data-home-slide="${homeHeroSlide}"]`)?.focus({preventScroll:true});
  });
  let homeSwipe;
  document.getElementById('hero').addEventListener('pointerdown',event=>{if(event.pointerType==='touch'&&!event.target.closest('a,button'))homeSwipe={x:event.clientX,y:event.clientY};});
  document.getElementById('hero').addEventListener('pointerup',event=>{if(!homeSwipe)return;const dx=event.clientX-homeSwipe.x,dy=event.clientY-homeSwipe.y;homeSwipe=null;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.4)setHomeHero(homeHeroSlide+(dx<0?1:-1));});
  document.getElementById('hero').addEventListener('pointercancel',()=>homeSwipe=null);
  setInterval(()=>{
    const now=performance.now(),delta=now-homeHeroLast;homeHeroLast=now;
    const hero=document.getElementById('hero'),controls=hero.querySelector('.home-hero-controls');
    if(!controls||document.hidden||homeHeroPaused||document.querySelector('dialog[open]')||hero.getBoundingClientRect().bottom<0||hero.matches(':hover')&&matchMedia('(hover:hover)').matches||hero.contains(document.activeElement)&&document.activeElement.matches(':focus-visible'))return;
    homeHeroElapsed+=delta;controls.style.setProperty('--home-hero-progress',Math.min(1,homeHeroElapsed/9000));
    if(homeHeroElapsed>=9000)setHomeHero(homeHeroSlide+1);
  },150);


  /* ---------- مشخصات پاسخ‌دهندگان ---------- */
  const PROF_COLORS = ['#7b1a22', '#b5473a', '#d4952b', '#2f7f88', '#2b4f78', '#a08a72'];
  function profileView() {
    const P = C.profile; if (!P) return '';
    const groups = P.groups.map((g) => {
      const ys = Object.keys(g.data);
      const keys = Object.keys(ys.map(y=>g.data[y]).find(d=>d.counts)?.counts || {});
      const rows = ys.map((y) => {
        const d = g.data[y];
        if(d.missing) return `<div class="stack-row"><div class="stack-year"><b>${fa(y)}</b></div><div class="stack-bar stack-missing"><span>${EN?'Recorded data unavailable':'دادهٔ ثبت‌شده موجود نیست'}</span></div></div>`;
        return `<div class="stack-row"><div class="stack-year"><b>${fa(y)}</b><small>${fnum(d.n)} پرسشنامه تکمیل‌شده</small></div><div class="stack-bar">${keys.map((k, i) => { const v = d.n ? 100 * d.counts[k] / d.n : 0; if (!v) return ''; const c = PROF_COLORS[i % PROF_COLORS.length]; return `<span class="stack-seg prof-seg" style="flex-basis:${v.toFixed(3)}%;--c:${c};--t:${inkOn(c)}" data-tooltip="${esc(k)} · ${fa(y)} · ${pct(v)} · ${fnum(d.counts[k])} ${EN ? 'responses' : 'پاسخ'}" aria-label="${esc(k)} · ${fa(y)} · ${pct(v)} · ${fnum(d.counts[k])} ${EN ? 'responses' : 'پاسخ'}" tabindex="0">${v >= 7 ? `<em>${pct(v)}</em>` : ''}</span>`; }).join('')}</div></div>`;
      }).join('');
      const legend = keys.map((k, i) => `<span class="pl"><i style="background:${PROF_COLORS[i % PROF_COLORS.length]}"></i>${esc(k)}</span>`).join('');
      return `<article class="prof" data-group="${esc(g.id)}"><h3>${esc(g.title)}</h3><div class="stack">${rows}</div><div class="pl-list">${legend}</div>${g.note ? `<p class="prof-note">${esc(g.note)}</p>` : ''}</article>`;
    }).join('');
    return `<section class="block profile" id="profile" aria-labelledby="prof-title">
      <div class="block-head"><p class="overline">پاسخ‌دهندگان</p><h2 id="prof-title">${esc(P.title)}</h2><p>${esc(P.lead)}</p><p class="profile-context">${esc(P.context)}</p><p class="profile-reading-note">${EN ? 'The respondent mix changes between editions: for example, the private-sector share fell from 49% in 1403 to 30% in 1404. This shift matters when comparing annual findings.' : 'ترکیب پاسخ‌دهندگان در دوره‌ها یکسان نیست؛ برای مثال، سهم بخش خصوصی از ۴۹٪ در ۱۴۰۳ به ۳۰٪ در ۱۴۰۴ رسیده است. این تغییر ترکیب، هنگام مقایسهٔ نتایج سالانه اهمیت دارد.'}</p></div>
      <div class="carousel-panel"><div class="profile-tooltip" role="tooltip" hidden></div><div class="prof-grid" data-carousel="profile">${groups}</div>
      <div class="carousel-controls" data-carousel-controls="profile"></div>
      </div>
    </section>`;
  }

  /* ---------- فیلم‌ها: پخش آپارات داخل سایت ---------- */
  const aparatEmbed = (id) => `https://www.aparat.com/video/video/embed/videohash/${encodeURIComponent(id)}/vt/frame`;
  const aparatThumb = (id) => `https://www.aparat.com/video/video/embed/videohash/${encodeURIComponent(id)}/vt/frame`;
  const watchUrl = (id) => `https://www.aparat.com/v/${encodeURIComponent(id)}`;
  function videoCard(v) {
    const e = edByYear(v.year);
    return `<button type="button" class="vid" data-video="${esc(v.id)}" data-title="${esc(v.title)}" style="--c:${e?.color || '#5b1115'}">
      <span class="vid-poster"><img src="${esc(v.poster || e?.cover || '')}" data-fallback="${esc(e?.cover || '')}" alt="" loading="lazy"><span class="vid-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg></span>${v.kind ? `<span class="vid-kind">${esc(v.kind)}</span>` : ''}${v.duration ? `<span class="vid-dur">${esc(v.duration)}</span>` : ''}</span>
      <span class="vid-title">${esc(v.title)}</span>
      <span class="vid-meta"><b>سال گزارش ${fa(v.year)}</b>${v.published ? `<i>${EN ? 'Published on Aparat' : 'انتشار در آپارات'}: ${esc(v.published)}</i>` : ''}</span>
    </button>`;
  }
  function openVideo(id, title) {
    const m = document.getElementById('video-modal');
    m.querySelector('.video-title').textContent = t(title || '');
    m.querySelector('.video-frame').innerHTML = localize(`<iframe src="${aparatEmbed(id)}" title="${esc(title || 'فیلم')}" allow="fullscreen; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`);
    const w = m.querySelector('.video-watch'); if (w) w.href = watchUrl(id);
    m.hidden = false; document.body.style.overflow = 'hidden';
    m.querySelector('.modal-close').focus();
  }
  function closeVideo() {
    const m = document.getElementById('video-modal'); if (m.hidden) return;
    m.querySelector('.video-frame').innerHTML = localize(''); m.hidden = true; document.body.style.overflow = '';
  }
  document.addEventListener('click', (e) => {
    const v = e.target.closest('[data-video]'); if (v) { e.preventDefault(); openVideo(v.dataset.video, v.dataset.title); return; }
    if (e.target.closest('[data-close-video]')) closeVideo();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeVideo(); });
  document.addEventListener('error', (e) => { const im = e.target; if (im?.tagName === 'IMG' && im.dataset.fallback && im.src !== new URL(im.dataset.fallback, location.href).href) im.src = im.dataset.fallback; }, true);
  void aparatThumb;

  /* ---------- صفحه اصلی ---------- */
  function sparkline(vals) {
    const W = 260, H = 78, pad = 18, n = vals.length;
    const X = (i) => pad + i * ((W - pad * 2) / Math.max(n - 1, 1));
    const vs = vals.filter((v) => v.v != null).map((v) => v.v);
    const lo = Math.max(0, Math.min(...vs) - 12), hi = Math.min(100, Math.max(...vs) + 12);
    const Y = (v) => 16 + (hi - v) * ((H - 38) / Math.max(hi - lo, 1));
    const pts = vals.map((v, i) => ({ ...v, i })).filter((v) => v.v != null);
    const d = pts.map((p, k) => `${k ? 'L' : 'M'}${X(p.i).toFixed(1)} ${Y(p.v).toFixed(1)}`).join(' ');
    return `<svg class="spark" viewBox="0 0 ${W} ${H}" aria-hidden="true">
      <path d="${d}"/>
      ${pts.map((p, k) => `<g class="${k === pts.length - 1 ? 'last' : ''}"><circle cx="${X(p.i)}" cy="${Y(p.v)}" r="${k === pts.length - 1 ? 4.5 : 3}"/><text x="${X(p.i)}" y="${Y(p.v) - 8}">${fa(Math.round(p.v))}</text></g>`).join('')}
      ${vals.map((v, i) => `<text class="sy" x="${X(i)}" y="${H - 3}">${fa(v.year)}</text>`).join('')}
    </svg>`;
  }

  function findingCard(f) {
    const sec = SECTIONS.find((s) => s.id === f.section); if (!sec) return '';
    const ch = C.chapters[f.section];
    const years = f.years || YEARS;
    const vals = years.map((y) => ({ year: y, v: sumFor(f.q, y, f.match, f.exact) })).filter((v) => v.v != null);
    const last = vals.at(-1);
    const nq = QUESTIONS.filter((q) => q.section === f.section).length;
    const first = vals[0];
    // Compare the displayed rounded values so endpoints and the change agree.
    const delta = first && last ? Math.round(last.v) - Math.round(first.v) : 0;
    const movement = delta === 0 ? (EN ? 'Little change' : 'تقریباً ثابت') : (EN ? `Share change: ${delta > 0 ? '+' : '−'}${Math.abs(delta)}%` : `حدود ${fa(Math.abs(delta))}٪ ${delta > 0 ? 'افزایش' : 'کاهش'}`);
    const [metric, answer] = {
      commitment: EN ? ['How widely do senior managers support process management?', 'reported support from all or most senior managers'] : ['مدیران ارشد چقدر از مدیریت فرایند حمایت می‌کنند؟', 'از حمایت تمام یا بیشتر مدیران ارشد خبر دادند'],
      investment: EN ? ['Will process management investment increase over the next two years?', 'expected investment to increase'] : ['آیا سرمایه‌گذاری مدیریت فرایند در دو سال آینده بیشتر می‌شود؟', 'انتظار افزایش سرمایه‌گذاری داشتند'],
      tools: EN ? ['How many respondents report using no dedicated process management tool?', 'reported using no dedicated tool'] : ['چه سهمی از پاسخ‌دهندگان ابزار اختصاصی مدیریت فرایند ندارند؟', 'از هیچ ابزار اختصاصی استفاده نمی‌کردند'],
      ai: EN ? ['Which AI applications are selected for process management?', 'of AI selections concerned analysis and improvement'] : ['تحلیل و بهبود چه سهمی از کاربردهای انتخاب‌شدهٔ هوش مصنوعی دارد؟', 'از انتخاب‌ها به تحلیل و بهبود فرایند مربوط بود'],
      mining: EN ? ['How widespread are process mining pilots and implementation?', 'reported a pilot or implementation'] : ['پایلوت یا استقرار فرایندکاوی چقدر رایج است؟', 'پایلوت یا استقرار فرایندکاوی را گزارش کردند'],
      maturity: EN ? ['How much does process management affect organizational performance?', 'rated the impact high or very high'] : ['مدیریت فرایند چقدر بر عملکرد سازمان اثر دارد؟', 'اثر آن را زیاد یا خیلی زیاد ارزیابی کردند']
    }[f.section];
    return `<article class="find${f.section === 'ai' ? ' is-special' : ''}">
      <header><span class="find-no">${ch.no}</span><span class="find-sec">${esc(ch.title)}</span><span class="find-part">${esc(ch.reportPart)}</span></header>
      <p class="find-question">${metric}</p>
      <div class="find-comparison"><div><span>${EN?'Starting point':'آغاز روند'} · ${fa(first?.year || '')}</span><b>${pct(first?.v)}</b><small class="find-answer">${answer}</small></div><span class="find-connector" aria-hidden="true">→</span><div class="find-latest"><span>${EN?'Latest response':'تازه‌ترین پاسخ'} · ${fa(last?.year || '')}</span><b>${pct(last?.v)}</b><small class="find-answer">${answer}</small></div></div>
      <div class="find-change"><span aria-hidden="true">${Math.abs(delta)<.5?'≈':delta>0?'↗':'↘'}</span><b>${movement}</b><small>${EN?'between the first and latest available years':'از نخستین تا تازه‌ترین سالِ دارای داده'}</small></div>
      <p class="find-explanation">${esc(f.text)}</p>
      ${vals.length > 1 ? `<div class="find-trend"><p class="spark-cap">${EN?'The same indicator in each year (%)':'همین شاخص در هر سال (درصد)'}</p>${sparkline(vals)}</div>` : ''}
      <footer><a class="find-enter" href="#${f.section}" data-nav="${f.section}">${EN?'Explore topic →':'ورود به بخش ←'}</a></footer>
    </article>`;
  }

  function bookletActions(year, className='') {
    const ready = !!window.IPR_BOOKLETS?.[year];
    return `<div class="booklet-actions ${className}">${ready ? `<button type="button" data-read-booklet="${year}" class="booklet-read">${EN?'Read booklet':'مطالعهٔ دفترچه'}</button><button type="button" data-download-report="${year}" class="booklet-download">${EN?'Download PDF':'دانلود PDF'}</button>` : `<span class="booklet-unavailable">${EN?'Booklet coming soon':'دفترچه به‌زودی'}</span>`}</div>`;
  }
  function videosView() {
    const V=(C.videos||[]).filter(v=>v.id);
    const blocks=[...C.editions].reverse().map(e=>{
      const list=V.filter(v=>v.year===e.year);
      return `<div class="vid-year${list.length?'':' is-empty'}" style="--c:${e.color}"><h3><span>${EN?'Report':'گزارش'} ${fa(e.year)}</span><small>${list.length?(EN?`${list.length} ${list.length===1?'video':'videos'}`:`${fa(list.length)} فیلم`):(e.current?(EN?'Launch upcoming':'رونمایی به‌زودی'):(EN?'No archived video':'بدون فیلم در آرشیو'))}</small></h3>${list.length?`<div class="vid-grid">${list.map(videoCard).join('')}</div>`:`<p class="vid-none">${e.current?(EN?'The launch of this report is upcoming.':'رونمایی این گزارش هنوز برگزار نشده است.'):(EN?'No video for this edition is recorded in the current archive.':'فیلمی از این دوره در آرشیو فعلی ثبت نشده است.')}</p>`}</div>`;
    }).join('');
    return `<section class="block block-dark videos" id="videos" aria-labelledby="vid-title"><div class="block-head"><p class="overline">${EN?'Launch events':'رویدادها'}</p><h2 id="vid-title">${EN?'Report launch videos':'فیلم رویدادهای گزارش'}</h2><p>${EN?'Watch the launch and introduction videos for each report, directly on this site. Report years and video publication dates are shown separately.':'فیلم رونمایی و معرفی هر دوره را از کانال آپارات بهفالَب، همین‌جا ببینید. سال گزارش و تاریخ انتشار فیلم جداگانه نوشته شده‌اند.'}</p></div>${blocks}<p class="vid-more"><a href="${esc(C.videosChannel)}" target="_blank" rel="noopener noreferrer">${EN?'All videos on BehfaLab’s Aparat channel →':'همهٔ فیلم‌ها در کانال آپارات بهفالَب ←'}</a></p></section>`;
  }

  /* ---------- راهنماهای سطح اول سایت ---------- */
  function dataView() {
    const glyphs = {
      commitment: '<circle cx="12" cy="8" r="3"/><path d="M6 20v-3a6 6 0 0 1 12 0v3M3 10l2 2 3-3M16 3h5v5"/>',
      investment: '<path d="M4 20h16M6 16v-4M12 16V8M18 16V4M3 8l5-3 5 2 7-5"/>',
      tools: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/><path d="M10 6h5a3 3 0 0 1 3 3v5M14 18H9a3 3 0 0 1-3-3v-5"/>',
      ai: '<path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/><circle cx="12" cy="12" r="2"/>',
      mining: '<circle cx="5" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="12" cy="19" r="2"/><path d="M7 5h10M5 7v4l5 6M19 7v4l-5 6M5 11h14"/>',
      maturity: '<path d="M4 20V9h5v11M9 20V4h6v16M15 20V12h5v8M2 20h20"/>'
    };
    return `<section class="page research-page" id="data" aria-labelledby="data-title">
      <header class="research-hero">
        <img class="research-wave" src="assets/img/flow-lines.webp" alt="" aria-hidden="true">
        <div class="research-hero-copy"><p class="overline">محورهای گزارش</p><h1 id="data-title">پرسش به پرسش،<br><em>سال به سال</em></h1><p class="research-intro">از میان شش محور، موضوع مورد نظر را انتخاب کنید و پاسخ پرسش‌هایش را کنار هم ببینید. پنج محور در پرسشنامهٔ هر سال تکرار می‌شوند؛ پرسش‌های هوش مصنوعی از گزارش فرایند ایران ۱۴۰۲ اضافه شده‌اند.</p><a class="research-start" href="#research-topics" data-scroll>شروع مقایسه <span aria-hidden="true">↓</span></a></div>
        <div class="research-index" aria-label="شش دریچه به مدیریت فرایند"><div class="research-index-label"><span class="index-dot"></span>شش دریچه به مدیریت فرایند</div><div class="research-index-grid">${SECTIONS.map(s=>`<a href="#${s.id}" data-nav="${s.id}" class="research-index-item"><svg viewBox="0 0 24 24" aria-hidden="true">${glyphs[s.id]}</svg><span>${esc(C.chapters[s.id].title)}</span><span class="index-arrow" aria-hidden="true">←</span></a>`).join('')}</div><div class="research-stats"><div><b>${fa(QUESTIONS.length)}</b><span>پرسش قابل بررسی</span></div><div><b>${fa(SECTIONS.length)}</b><span>محور گزارش</span></div><div><b>${fa(YEARS.length)}</b><span>دورهٔ قابل مقایسه</span></div></div></div>
      </header>
      <div class="research-content" id="research-topics"><div class="research-section-head"><div><p class="overline">انتخاب موضوع گزارش</p><h2>پاسخ هر پرسش را در سال‌های مختلف ببینید</h2></div><p>برای دیدن نمودارها و پاسخ‌های هر سال، وارد محور شوید.</p></div>
      <div class="research-grid">${SECTIONS.map(s=>{ const ch=C.chapters[s.id],qs=QUESTIONS.filter(q=>q.section===s.id);return `<article class="research-card"><div class="research-card-top"><svg viewBox="0 0 24 24" aria-hidden="true">${glyphs[s.id]}</svg><span class="research-card-number">${esc(ch.no)}</span></div><h3>${esc(ch.title)}</h3><p class="research-card-summary">${esc(s.summary)}</p><div class="research-question-preview"><span class="research-question-label">پرسش‌های این محور</span>${qs.slice(0,2).map(q=>`<p>${esc(qText(q))}</p>`).join('')}</div><div class="research-card-foot"><span><b>${fa(qs.length)}</b> ${EN?'questions':'پرسش'}</span><a href="#${s.id}" data-nav="${s.id}">ورود به محور <span aria-hidden="true">←</span></a></div></article>`;}).join('')}</div>
      <p class="research-source-note">آمار ۱۴۰۰ در صفحهٔ گزارش همان سال آمده است؛ دادهٔ پرسش‌به‌پرسشِ قابل مقایسه از ۱۴۰۱ آغاز می‌شود.</p></div>
    </section>`;
  }
  function eventGallery(year) {
    const event=C.eventPhotos?.[year]; if(!event?.images.length) return '';
    const photos=event.images.map(item=>typeof item==='string'?{full:item,thumb:item}:item);
    const caption=EN ? event.captionEn : event.caption;
    return `<section class="event-gallery" data-event-gallery aria-label="${esc(caption)}"><header class="event-gallery-head"><div><p class="overline">${EN?'In pictures':'روایت تصویری'}</p><h4>${EN?'Moments from the report launch':'لحظه‌هایی از رونمایی گزارش'}</h4><p>${esc(caption)}</p></div><span class="event-gallery-count">${fa(photos.length)} ${EN?'photos':'تصویر'}</span></header><div class="event-gallery-layout"><figure class="event-photo-stage"><button type="button" class="event-photo-expand" aria-label="${EN?'View full photo':'نمایش کامل تصویر'}"><img src="${photos[0].full}" alt="${esc(caption)}" loading="lazy" width="1024" height="683"><span>${EN?'View full photo ↗':'نمایش کامل تصویر ↗'}</span></button><figcaption><span>${esc(caption)}</span><b data-photo-position aria-live="polite">${fa(1)} / ${fa(photos.length)}</b></figcaption></figure><div class="event-gallery-picker"><div class="event-picker-title">${EN?'Explore the event':'قاب‌های رویداد'}</div><div class="event-photo-thumbs" role="group" aria-label="${EN?'Choose a photo':'انتخاب تصویر'}">${photos.map((photo,i)=>`<button type="button" data-event-photo="${photo.full}" aria-pressed="${i===0}" aria-label="${EN?'Photo':'تصویر'} ${fa(i+1)}"><img src="${photo.thumb}" alt="" loading="lazy" width="180" height="120"><span aria-hidden="true">${fa(String(i+1).padStart(2,'0'))}</span></button>`).join('')}</div></div></div><footer class="event-gallery-footer"><span>${EN?'Click a photograph to see it in full.':'هر عکس را می‌توانید در اندازهٔ کامل ببینید.'}</span><div class="event-photo-credits">${event.sources.map(source=>`<a href="${source.url}" target="_blank" rel="noopener noreferrer">${esc(EN?source.en:source.fa)} ↗</a>`).join('')}</div></footer></section>`;
  }
  function reportsView() {
    return `<section class="page landing-page" id="reports" aria-labelledby="reports-title">
      <header class="landing-head"><p class="overline">${EN ? 'Annual reports & launch events' : 'گزارش‌ها و رونمایی‌ها'}</p><h1 id="reports-title">${EN ? 'Reports from 1400 to 1404' : 'گزارش‌های ۱۴۰۰ تا ۱۴۰۴'}</h1><p>${EN ? 'Each report brings together its key findings, response figures and available launch videos.' : 'در صفحهٔ هر دوره، خلاصهٔ یافته‌ها، شاخص‌های کلیدی و فیلم‌های موجود از رونمایی همان گزارش را می‌بینید.'}</p></header>
      <div class="year-grid">${[...C.editions].reverse().map((e) => `<article class="year-card" style="--c:${e.color}"><a class="year-card-cover" href="#report-${e.year}" data-nav="report-${e.year}" aria-label="${EN ? `Open the ${e.year} report` : `گزارش ${fa(e.year)}`}"><img src="${e.cover}" alt="${EN ? `Cover of the ${e.year} report` : `جلد گزارش ${fa(e.year)}`}" loading="lazy"></a><div class="year-card-copy"><small>${esc(e.ordinal)}</small><b>${EN ? `Iran Process Report ${e.year}` : `گزارش فرایند ایران ${fa(e.year)}`}</b><div class="year-card-actions">${bookletActions(e.year)}<a href="#report-${e.year}" data-nav="report-${e.year}">${EN ? 'Summary' : 'خلاصه'}</a><a href="#annual-${e.year}-event" data-nav="report-${e.year}" data-target="annual-${e.year}-event">${e.current && !window.IPR_RELEASE.isPublished() ? (EN ? 'Coming soon' : 'به‌زودی') : (EN ? 'Launch' : 'رونمایی')}</a></div></div></article>`).join('')}</div>
    </section>`;
  }

  function homeView() {
    const A = C.about, F = C.findings;
    const profileYear = '1404';
    const roles = C.profile.groups.find(g => g.id === 'role').data[profileYear];
    const types = C.profile.groups.find(g => g.id === 'type').data[profileYear];
    const roleShare = pattern => Math.round(100 * Object.entries(roles.counts).filter(([key]) => pattern.test(key)).reduce((sum, [,count]) => sum + count, 0) / roles.n);
    const managerShare = roleShare(/مدیر/), expertShare = roleShare(/کارشناس/);
    const typeShare = key => Math.round(100 * types.counts[key] / types.n);
    const governmentShare = typeShare('دولتی و حاکمیتی'), privateShare = typeShare('خصوصی'), publicShare = typeShare('عمومی غیردولتی');
    return `<section class="page page-home" id="about" aria-label="گزارش فرایند ایران">
      <section class="block about-intro" id="about-intro" aria-labelledby="about-title">
        <div class="about-grid">
          <div class="about-head"><p class="overline">درباره گزارش</p><h2 id="about-title">${esc(A.title)}</h2><p class="about-lead">${esc(A.lead)}</p></div>
          <div class="about-body"><p>${esc(A.body[0])}</p><ul class="intro-topics">${A.body.slice(1).map(p => `<li>${esc(p)}</li>`).join('')}</ul><a class="about-more" href="#story" data-nav="story"><span>دربارهٔ روش و پروژه</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg></a></div>
        </div>
        <ul class="about-strip" aria-label="${EN?'The project at a glance':'پروژه در یک نگاه'}">
          <li class="intro-stat intro-years"><div class="intro-kpi-symbol" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="3"/><path d="M8 3v4m8-4v4M4 10h16m-11 4h6"/></svg></div><span class="intro-kpi-label">${EN?'Annual report':'گزارش سالانه و پیوسته'}</span><b class="intro-kpi-number">${fa(C.editions.length)} <em>${EN?'years':'سال'}</em></b><span class="intro-kpi-caption">${EN?'1400–1404':'از ۱۴۰۰ تا ۱۴۰۴'}</span></li>
          <li class="intro-stat intro-people"><div class="intro-kpi-symbol" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 3h8l4 4v14H4V3h4m8 0v5h4M8 12h8m-8 4h6"/></svg></div><span class="intro-kpi-label">${EN?'Managers & specialists’ participation':'مشارکت مدیران و کارشناسان'}</span><b class="intro-kpi-number"><bdi dir="ltr">${fnum(2500)}+</bdi></b><span class="intro-kpi-caption">${EN?'Completed questionnaires':'پرسشنامهٔ تکمیل‌شده'}</span></li>
          <li class="intro-stat intro-roles"><div class="intro-kpi-symbol" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><path d="M3 20v-3a6 6 0 0 1 12 0v3m1-15a3 3 0 0 1 0 6m3 9v-3a6 6 0 0 0-3-5"/></svg></div><span class="intro-kpi-label">${EN?'Who responded in 1404?':'چه کسانی در ۱۴۰۴ پاسخ دادند؟'}</span><div class="intro-kpi-main"><b class="intro-kpi-number">${pct(managerShare)}</b><span>${EN?'Managers':'مدیران'}</span></div><div class="intro-kpi-support"><b>${pct(expertShare)}</b><span>${EN?'Specialists':'کارشناسان'}</span></div></li>
          <li class="intro-stat intro-types"><div class="intro-kpi-symbol" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 21V5h10v16m0-11h6v11M2 21h20M7 8h4m-4 4h4m-4 4h4m6-3h1m-1 4h1"/></svg></div><span class="intro-kpi-label">${EN?'Organizations in 1404':'سازمان‌های پاسخ‌دهندگان در ۱۴۰۴'}</span><div class="intro-kpi-main"><b class="intro-kpi-number">${pct(governmentShare)}</b><span>${EN?'Government & governance':'دولتی و حاکمیتی'}</span></div><div class="intro-kpi-support"><b>${pct(privateShare)}</b><span>${EN?'Private sector':'بخش خصوصی'}</span></div></li>
        </ul>
      </section>

      <section class="block block-dark findings" aria-labelledby="find-title">
        <div class="block-head"><p class="overline">نتایج</p><h2 id="find-title">${esc(F.title)}</h2><p>${esc(F.lead)}</p>
          <p class="find-context">${EN ? 'Gold marks the starting value, white the latest response, and the line shows the years in between. Open a topic to see its questions and answer options.' : 'عدد زرد نقطهٔ آغاز و عدد سفید تازه‌ترین پاسخ است؛ خط پایین، مسیر سال‌های میان آن‌ها را نشان می‌دهد. برای دیدن پرسش و گزینه‌های پاسخ، وارد همان محور شوید.'}</p></div>
        <div class="carousel-panel"><div class="find-grid" data-carousel="findings">${F.items.map(findingCard).join('')}</div>
        <div class="carousel-controls" data-carousel-controls="findings"></div></div>
      </section>

      ${profileView()}
    </section>`;
  }


  /* ---------- راهبر پایین صفحه: بخش قبل / بخش بعد ---------- */
  function chapterPager(idx) {
    const prev = SECTIONS[idx - 1], next = SECTIONS[idx + 1];
    const metricOf = (id) => { const ch = C.chapters[id]; const st = storyValues(ch); const l = [...st].reverse().find((x) => x.v != null); return l ? { v: l.v, y: l.year, label: ch.metric } : null; };
    const shortNames = EN ? ['Leadership', 'Investment', 'Tools', 'AI', 'Process mining', 'Transformation'] : ['تعهد مدیران', 'سرمایه‌گذاری', 'ابزارها', 'هوش مصنوعی', 'فرایندکاوی', 'تحول و بلوغ'];
    const dots = SECTIONS.map((s2, i) => `<a href="#${s2.id}" data-nav="${s2.id}" class="pg-dot${i === idx ? ' is-here' : ''}" ${i===idx?'aria-current="page"':''}><span>${fa(String(i+1).padStart(2,'0'))}</span><b>${shortNames[i]}</b></a>`).join('');
    const bigCard = (target, isHome) => {
      if (isHome) return `<a class="pg-next" href="#about" data-nav="about"><span class="pg-flow" aria-hidden="true"></span><span class="pg-kicker">پایان محورها · بازگشت</span><b class="pg-title">گزارش فرایند ایران</b><span class="pg-text">نتیجه‌ها، ترکیب پاسخ‌دهندگان و گزارش‌های هر دوره</span><span class="pg-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6"/></svg></span></a>`;
      const ch = C.chapters[target.id], m = metricOf(target.id), n = QUESTIONS.filter((q) => q.section === target.id).length;
      return `<a class="pg-next" href="#${target.id}" data-nav="${target.id}">
        <span class="pg-flow" aria-hidden="true"></span>
        <span class="pg-no" aria-hidden="true">${ch.no}</span>
        <span class="pg-kicker">${EN ? 'Next topic' : 'بخش بعد'} · ${esc(ch.reportPart)}</span>
        <b class="pg-title">${esc(ch.title)}</b>
        <span class="pg-text">${esc(ch.slogan)}</span>
        <span class="pg-meta">${m ? `<span class="pg-metric"><b>${pct(m.v)}</b><small>${esc(m.label)} · ${fa(m.y)}</small></span>` : ''}<span class="pg-count">${fa(n)} پرسش</span></span>
        <span class="pg-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6"/></svg></span>
      </a>`;
    };
    const prevTarget = prev?.id || 'about';
    const prevCard = `<a class="pg-prev" href="#${prevTarget}" data-nav="${prevTarget}"><span class="pg-prev-number" aria-hidden="true">${prev?fa(String(idx).padStart(2,'0')):'IPR'}</span><span class="pg-kicker">${prev?(EN?'Previous topic':'محور قبلی'):(EN?'Back to home':'بازگشت به صفحهٔ اصلی')}</span><b>${prev?esc(C.chapters[prev.id].title):esc('گزارش فرایند ایران')}</b><span class="pg-prev-caption">${EN?'Review the findings':'مرور یافته‌های این بخش'}</span><span class="pg-arrow-sm" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6"/></svg></span></a>`;
    return `<nav class="pager" aria-label="${EN?'Navigate report topics':'جابه‌جایی میان محورهای گزارش'}">
      <div class="pg-guide"><div class="pg-guide-head"><b>${EN?'Explore the six report topics':'شش محور گزارش را مرور کنید'}</b><span>${EN?`You are in topic ${idx+1} of 6`:`شما در محور ${fa(idx+1)} از ${fa(SECTIONS.length)} هستید`}</span></div><div class="pg-dots">${dots}</div></div>
      <div class="pg-row">${prevCard}${next ? bigCard(next) : bigCard(null, true)}</div>
    </nav>`;
  }
  /* ---------- صفحه هر بخش ---------- */
  function chapterView(sec, idx) {
    const ch = C.chapters[sec.id];
    const qs = QUESTIONS.filter((q) => q.section === sec.id);
    const next = SECTIONS[idx + 1];
    const actions = ch.actions?.length ? `<section class="golden" aria-labelledby="${sec.id}-golden">
        <div class="golden-head"><p class="overline">از گزارش ۱۴۰۳</p><h2 id="${sec.id}-golden">اقدامات طلایی برای مدیران</h2></div>
        <ol>${ch.actions.map((a) => `<li><h3>${esc(a.t)}</h3><p>${esc(a.d)}</p></li>`).join('')}</ol>
      </section>` : '';
    const nextLink = chapterPager(idx);
    return `<section class="page report-section" id="${sec.id}" aria-labelledby="${sec.id}-intro">
      <header class="chapter-head" id="${sec.id}-questions">
        <div class="chapter-summary"><h2 id="${sec.id}-intro" class="overline">در این بخش</h2><p>${esc(sec.summary)}</p></div>
        <nav class="chapter-toc" aria-label="پرسش‌های این بخش"><ol>${qs.map((q, i) => `<li><a href="#q-${q.id}" data-scroll><span>${fa(String(i + 1).padStart(2, '0'))}</span>${esc(qText(q))}</a></li>`).join('')}</ol></nav>
      </header>
      <div class="question-list">${qs.map((q, i) => questionCard(q, i, qs.length)).join('')}</div>
      ${actions}
      ${nextLink}
    </section>`;
  }

  /* ---------- مسیریابی تب‌ها ---------- */
  function show(id, scrollTop = true, target) {
    const pages = [...document.querySelectorAll('#view .page')];
    const page = pages.find((p) => p.id === id) || pages[0];
    if (!page) return;
    pages.forEach((p) => { p.hidden = p !== page; });
    const topPage = SECTIONS.some((s) => s.id === page.id) ? 'data' : /^report-/.test(page.id) ? 'reports' : page.id;
    document.querySelectorAll('.section-nav a, .footer-nav a').forEach((a) => { const on = a.dataset.nav === page.id || (a.closest('.section-nav') && a.dataset.nav === topPage); a.classList.toggle('active', on); if (a.closest('.section-nav')) a.setAttribute('aria-current', on ? 'page' : 'false'); });
    document.querySelectorAll('.nav-group').forEach((group) => group.querySelector('.nav-trigger')?.classList.toggle('active', group.dataset.menu === topPage));
    const isLanding = ['data', 'reports'].includes(page.id);
    document.getElementById('hero').hidden = isLanding;
    if (!isLanding) renderHero(page.id);
    if (location.hash.slice(1) !== (target || page.id)) { try { history.replaceState(null, '', `#${target || page.id}`); } catch { /* محیط‌های محدود */ } }
    document.title = t(page.id === 'story' ? 'دربارهٔ گزارش فرایند ایران | گزارش فرایند ایران' : /^report-/.test(page.id) ? `گزارش ${fa(page.id.slice(7))} | گزارش فرایند ایران` : ({about:'گزارش فرایند ایران',data:'محورهای گزارش',reports:'گزارش‌ها و رونمایی‌ها | گزارش فرایند ایران'}[page.id] || `${C.chapters[page.id]?.title || ''} | گزارش فرایند ایران`));
    if (target) requestAnimationFrame(() => document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    else if (scrollTop) window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function routeFromHash(scrollTop) {
    const h = location.hash.slice(1);
    if (h.startsWith('q-q-')) { const q = QUESTIONS.find((x) => `q-${x.id}` === h); if (q) return show(q.section, false, h); }
    if (['story-project', 'story-method', 'story-facts'].includes(h)) return show('story', false, h);
    if (h === 'events') return show('reports', scrollTop);
    const oldEvent = /^event-(\d{4})$/.exec(h);
    if (oldEvent) return show(`report-${oldEvent[1]}`, scrollTop, `annual-${oldEvent[1]}-event`);
    const yearEvent = /^annual-(\d{4})-event$/.exec(h);
    if (yearEvent) return show(`report-${yearEvent[1]}`, scrollTop, h);
    show(SECTIONS.some((s) => s.id === h) || ['data', 'reports', 'story'].includes(h) || /^report-\d{4}$/.test(h) ? h : 'about', scrollTop);
  }

  function buildSiteNav() {
    const overview = (id, label) => `<a class="nav-overview" href="#${id}" data-nav="${id}">${label}</a>`;
    document.getElementById('nav-data').innerHTML = localize(overview('data', 'همهٔ محورهای گزارش') + SECTIONS.map((s) => `<a href="#${s.id}" data-nav="${s.id}">${EN ? 'Topic' : 'محور'} ${esc(C.chapters[s.id].no)} · ${esc(C.chapters[s.id].title)}</a>`).join(''));
    document.getElementById('nav-reports').innerHTML = localize(overview('reports', EN ? 'All reports and launch events' : 'همهٔ گزارش‌ها و رونمایی‌ها') + [...C.editions].reverse().map((e) => `<a href="#report-${e.year}" data-nav="report-${e.year}">${EN ? `Iran Process Report ${e.year}` : `گزارش فرایند ایران ${fa(e.year)}`}</a>`).join(''));
    document.getElementById('nav-story').innerHTML = localize(overview('story', 'دربارهٔ گزارش فرایند ایران') + [['story-project','معرفی پروژه'],['story-method','روش‌شناسی'],['story-facts',EN ? 'Questions about the report' : 'پرسش‌های متداول']].map(([id, label]) => `<a href="#${id}" data-nav="story" data-target="${id}">${label}</a>`).join(''));
  }

  async function loadData() {
    if (window.IPR_DATA) return window.IPR_DATA;           // data/trends.js (بدون سرور هم کار می‌کند)
    const res = await fetch('data/trends.json'); if (!res.ok) throw new Error('data');
    return res.json();
  }

  function showProfileTooltip(event) {
    const segment = event.target.closest?.('.prof-seg'); if (!segment) return;
    const panel = segment.closest('.carousel-panel'), tip = panel.querySelector('.profile-tooltip');
    tip.textContent = segment.dataset.tooltip; tip.hidden = false;
    const pr = panel.getBoundingClientRect(), sr = segment.getBoundingClientRect();
    tip.style.left = `${Math.max(8, Math.min(sr.left + sr.width / 2 - pr.left - tip.offsetWidth / 2, pr.width - tip.offsetWidth - 8))}px`;
    tip.style.top = `${sr.top - pr.top - tip.offsetHeight - 10}px`;
  }
  document.addEventListener('pointerover', showProfileTooltip);
  document.addEventListener('focusin', showProfileTooltip);
  ['pointerout', 'focusout'].forEach(type => document.addEventListener(type, event => {
    const segment = event.target.closest?.('.prof-seg');
    if (segment && !segment.contains(event.relatedTarget)) segment.closest('.carousel-panel').querySelector('.profile-tooltip').hidden = true;
  }));

  function setupCarousels() {
    document.querySelectorAll('[data-carousel]').forEach(grid => {
      const name = grid.dataset.carousel, cards = [...grid.children];
      const control = document.querySelector(`[data-carousel-controls="${name}"]`);
      if (!cards.length || !control) return;
      const panel = grid.parentElement, interval = 10000;
      let active = 0, elapsed = 0, lastTick = performance.now();
      let mouseInside = false;
      panel.addEventListener('pointerenter', event => { if(event.pointerType==='mouse') mouseInside=true; });
      panel.addEventListener('pointerleave', event => { if(event.pointerType==='mouse') mouseInside=false; });
      const label = name === 'findings' ? (EN ? 'Result' : 'نتیجه') : (EN ? 'Respondent chart' : 'نمودار پاسخ‌دهندگان');
      const arrow = right => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${right ? 'M5 12h14M13 6l6 6-6 6' : 'M19 12H5M11 6l-6 6 6 6'}"/></svg>`;
      control.innerHTML = `<button type="button" class="carousel-arrow" data-step="-1" aria-label="${EN ? 'Previous slide' : 'نمای قبلی'}">${arrow(false)}</button><button type="button" class="carousel-arrow" data-step="1" aria-label="${EN ? 'Next slide' : 'نمای بعدی'}">${arrow(true)}</button><div class="carousel-pagination" aria-label="${EN ? 'Choose a slide' : 'انتخاب نما'}">${cards.map((card,i)=>`<button type="button" class="carousel-dot" data-slide="${i}" aria-label="${label} ${fa(i+1)} ${EN?'of':'از'} ${fa(cards.length)}"></button>`).join('')}</div><span class="carousel-status sr-only" aria-live="off"></span>`;
      cards.forEach((card, i) => { card.id = `carousel-${name}-${i}`; card.setAttribute('role', 'group'); card.setAttribute('aria-roledescription', EN ? 'slide' : 'نما'); });
      const update = () => {
        cards.forEach((card, i) => { card.classList.toggle('is-active', i === active); card.setAttribute('aria-hidden', String(i !== active)); card.inert = i !== active; });
        control.querySelector('.carousel-status').textContent = `${fa(active + 1)} ${EN ? 'of' : 'از'} ${fa(cards.length)}`;
        control.querySelectorAll('[data-slide]').forEach((button,i)=>{button.classList.toggle('is-current',i===active);button.setAttribute('aria-current',String(i===active));});
      };
      const paintProgress = () => control.style.setProperty('--carousel-progress',Math.min(1,elapsed/interval).toFixed(4));
      const advance = step => { active = (active + step + cards.length) % cards.length; elapsed = 0; lastTick = performance.now(); update(); paintProgress(); };
      control.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => advance(Number(button.dataset.step))));
      control.querySelectorAll('[data-slide]').forEach(button=>button.addEventListener('click',()=>advance(Number(button.dataset.slide)-active)));
      panel.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault(); advance(event.key === 'ArrowRight' ? 1 : -1);
      });
      update(); paintProgress();
      if(name==='profile') { const align=()=>grid.closest('.profile').style.setProperty('--profile-card-height',`${Math.round(grid.getBoundingClientRect().height)}px`); new ResizeObserver(align).observe(grid); align(); }
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(() => {
        const now = performance.now(), delta = now - lastTick; lastTick = now;
        const rect = grid.getBoundingClientRect();
        const keyboardFocus=panel.contains(document.activeElement) && document.activeElement?.matches(':focus-visible');
        if (document.hidden || document.getElementById('about')?.hidden || mouseInside || keyboardFocus || rect.bottom < 0 || rect.top > innerHeight) return;
        elapsed += delta; paintProgress();
        if (elapsed >= interval) advance(1);
      }, 150);
    });
  }

  async function init() {
    renderHero('about');                                   // هیرو حتی اگر داده دیر برسد نمایش داده می‌شود
    const data = await loadData();
    SECTIONS = data.sections; QUESTIONS = data.questions; YEARS = data.meta.years;
    buildSiteNav();
    document.getElementById('view').innerHTML = localize(homeView() + dataView() + reportsView() + SECTIONS.map((s, i) => chapterView(s, i)).join('') + storyView() + C.editions.map((e) => editionPage(e.year)).join(''));
    document.dispatchEvent(new CustomEvent('ipr:site-ready'));
    mountCards(document.getElementById('view'));
    setupCarousels();
    if (performance.getEntriesByType('navigation')[0]?.type === 'reload') history.replaceState(null, '', location.pathname + location.search);
    routeFromHash(true);
    // مرورگر بعد از بارگذاری به لنگر #about/#commitment… می‌پرد؛ صفحه باید از بالا شروع شود
    const h = location.hash.slice(1);
    if (/^annual-\d{4}-event$/.test(h)) window.addEventListener('load', () => requestAnimationFrame(() => document.getElementById(h)?.scrollIntoView({ behavior: 'instant', block: 'start' })), { once: true });
    else if (!h.startsWith('q-q-')) window.addEventListener('load', () => requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'instant' })), { once: true });
  }

  /* ---------- رویدادها ---------- */
  const menuBtn = document.querySelector('.menu-button');
  const closeMenu = () => { document.getElementById('section-nav').classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); document.querySelectorAll('.nav-group.open, .nav-axis.open').forEach((el) => el.classList.remove('open')); document.querySelectorAll('.nav-trigger, .nav-axis-trigger').forEach((el) => el.setAttribute('aria-expanded', 'false')); };
  menuBtn.addEventListener('click', () => { const o = document.getElementById('section-nav').classList.toggle('open'); menuBtn.setAttribute('aria-expanded', String(o)); });

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.nav-trigger');
    if (trigger) { const group = trigger.closest('.nav-group'), wasOpen = group.classList.contains('open'); document.querySelectorAll('.nav-group.open').forEach((el) => { el.classList.remove('open'); el.querySelector('.nav-trigger')?.setAttribute('aria-expanded', 'false'); }); group.classList.toggle('open', !wasOpen); trigger.setAttribute('aria-expanded', String(!wasOpen)); return; }
    const selectedNavLink = e.target.closest('.section-nav a');
    if (selectedNavLink && selectedNavLink.target !== '_blank' && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) setTimeout(closeMenu, 0);
    const nav = e.target.closest('[data-nav]');
    if (nav) { if (nav.target === '_blank' || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return; e.preventDefault(); show(nav.dataset.nav, true, nav.dataset.target); closeMenu(); return; }
    if (!e.target.closest('.section-nav, .menu-button')) closeMenu();
    const sc = e.target.closest('[data-scroll]');
    if (sc) { e.preventDefault(); document.querySelector(sc.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    if (e.target.closest('[data-top]')) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  const pickEdition = (year, fromCover = false) => {
    const stage = document.querySelector('.cover-stage'); if (!stage || !year) return;
    if (!fromCover) stage.dataset.active = year;
    stage.classList.toggle('is-interacting', fromCover);
    stage.querySelectorAll('.cover[data-year]').forEach((cover) => cover.classList.toggle('is-picked', cover.dataset.year === year));
    document.querySelectorAll('.rail-node[data-edition]').forEach((node) => node.classList.toggle('is-active', node.dataset.edition === year));
  };
  const resetEdition = () => pickEdition(C.editions.find((e) => e.current)?.year || C.editions.at(-1)?.year);
  document.addEventListener('pointerover', (e) => {
    const cover = e.target.closest('.cover-stage .cover[data-year]');
    if (cover) { pickEdition(cover.dataset.year, true); return; }
    const rail = e.target.closest('.rail-node[data-edition]');
    if (rail) pickEdition(rail.dataset.edition);
  });
  document.addEventListener('focusin', (e) => {
    const cover = e.target.closest('.cover-stage .cover[data-year]');
    if (cover) { pickEdition(cover.dataset.year, true); return; }
    const rail = e.target.closest('.rail-node[data-edition]');
    if (rail) pickEdition(rail.dataset.edition);
  });
  document.addEventListener('pointerout', (e) => {
    const area = e.target.closest('.cover-stage, .rail-editions');
    if (area && !area.contains(e.relatedTarget)) resetEdition();
  });
  document.addEventListener('focusout', (e) => {
    const stage = e.target.closest('.cover-stage');
    if (stage && !stage.contains(e.relatedTarget)) resetEdition();
  });

  document.addEventListener('ipr:report-release', () => {
    const current=document.getElementById('report-1404');
    if(!current) return;
    const visible=!current.hidden;
    current.outerHTML=localize(editionPage('1404'));
    document.getElementById('report-1404').hidden=!visible;
    if(visible) renderHero('report-1404');
    else if(document.getElementById('hero').classList.contains('is-home'))renderHero('about');
  });
  window.addEventListener('hashchange', () => routeFromHash(true));
  const mast = document.querySelector('.masthead');
  const onScroll = () => {
    mast.classList.toggle('is-scrolled', scrollY > 10);
    const max = document.documentElement.scrollHeight - innerHeight;
    mast.style.setProperty('--progress', max > 0 ? Math.min(1, scrollY / max).toFixed(3) : 0);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- کپی جدول ---------- */
  function toast(msg) { const el = document.getElementById('copy-toast'); el.textContent = t(msg); el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 2600); }
  const tableText = (t) => [...t.rows].map((r) => [...r.cells].map((c) => c.textContent.replace(/\s+/g, ' ').trim()).join('\t')).join('\n');
  async function copyTable(t) {
    const txt = tableText(t), html = `<table dir="${EN ? 'ltr' : 'rtl'}">${t.innerHTML}</table>`;
    if (navigator.clipboard?.write && window.ClipboardItem) await navigator.clipboard.write([new ClipboardItem({ 'text/plain': new Blob([txt], { type: 'text/plain' }), 'text/html': new Blob([html], { type: 'text/html' }) })]);
    else if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(txt);
    else throw new Error('clipboard');
  }

  /* ---------- فوتر ---------- */
  function renderFooter() {
    const k = C.contact;
    document.getElementById('footer-contact').innerHTML = localize(`<h3>تماس</h3>
      <a href="mailto:${esc(k.email)}" dir="ltr">${esc(k.email)}</a>
      ${k.phones.map((p) => `<a href="tel:${esc(p.tel)}" dir="ltr">${esc(p.label)}</a>`).join('')}
      ${k.address ? (k.map ? `<a href="${esc(k.map)}" target="_blank" rel="noopener noreferrer">${esc(k.address)}</a>` : `<p>${esc(k.address)}</p>`) : ''}`);
    document.getElementById('footer-year').textContent = t('۱۴۰۴');
  }
  renderFooter();

  init().catch(() => { document.getElementById('view').innerHTML = localize('<div class="loading error">داده‌های گزارش بارگذاری نشد. لطفاً صفحه را دوباره باز کنید.</div>'); });
})();
/* اگر لودینگ به هر دلیلی بسته نشد */
setTimeout(() => { document.documentElement.classList.remove('is-loading'); document.getElementById('loader')?.remove(); }, 7000);

/* ---------- سوئیچ زبان ---------- */
(function () {
  const I = window.IPR_I18N; if (!I) return;
  document.querySelectorAll('[data-lang-switch]').forEach((sw) => {
    const target = I.lang === 'fa' ? 'en' : 'fa';
    sw.dataset.target = target;
    sw.lang = 'en';
    sw.querySelector('.lang-switch-label').textContent = target === 'en' ? 'English' : 'Persian';
    sw.setAttribute('aria-label', target === 'en' ? 'Change language to English' : 'Change language to Persian');
    sw.addEventListener('click', () => I.setLang(target));
  });
})();

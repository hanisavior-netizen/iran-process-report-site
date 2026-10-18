/* Assistant interface. Answer generation will be connected separately. */
(() => {
  const en = window.IPR_I18N.lang === 'en';
  const text = (fa, english) => en ? english : fa;
  const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${({chat:'M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8l-5 3V6a2 2 0 0 1 2-2Zm7 3 1.5 3.5L17 12l-3.5 1.5L12 17l-1.5-3.5L7 12l3.5-1.5Z',close:'m6 6 12 12M6 18 18 6',expand:'M8 3H3v5M16 3h5v5M21 16v5h-5M3 16v5h5',minus:'M5 12h14',send:'m5 12 7-7 7 7M12 5v14',source:'M4 3h7v18H4zM14 3h6v18h-6',clear:'M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14',copy:'M8 8h12v13H8zM16 8V3H3v13h5'})[name]}"/></svg>`;
  const root = document.createElement('div');
  root.className = 'report-assistant';
  root.innerHTML = `<button type="button" class="assistant-launcher" aria-expanded="false" aria-controls="report-assistant-panel" aria-label="${text('دستیار هوش مصنوعی گزارش','AI report assistant')}">${icon('chat')}<span>${text('دستیار هوش مصنوعی','AI report assistant')}</span></button>
    <aside class="assistant-panel" id="report-assistant-panel" role="dialog" aria-modal="false" aria-label="${text('دستیار گزارش فرایند ایران','Iran Process Report assistant')}" hidden>
      <header class="assistant-header"><div class="assistant-heading"><b>${text('دستیار گزارش','Report assistant')}</b><span>${text('پرسش دربارهٔ گزارش‌ها و محورهای آن','Questions about reports and their topics')}</span></div><div class="assistant-window-actions"><button type="button" data-assistant="expand" aria-label="${text('بزرگ‌کردن پنجره','Expand window')}" aria-pressed="false">${icon('expand')}</button><button type="button" data-assistant="close" aria-label="${text('جمع‌کردن گفتگو','Minimize conversation')}">${icon('minus')}</button></div></header>
      <div class="assistant-history-toolbar"><button type="button" data-assistant="sources" aria-expanded="false" aria-controls="assistant-sources">${icon('source')}<span>${text('منابع','Sources')}</span></button><button type="button" data-engine="new">${icon('clear')}<span>${text('گفتگوی تازه','New conversation')}</span></button><button type="button" data-engine="export" aria-label="${text('ذخیره گفتگو','Save conversation')}">${icon('copy')}</button></div>
      <nav class="assistant-sources" id="assistant-sources" aria-label="${text('گزارش‌های قابل مطالعه','Reports to explore')}" hidden>${window.IPR_CONTENT.editions.map(e=>`<a href="#report-${e.year}">${text('گزارش فرایند ایران','Iran Process Report')} ${en?e.year:e.year.replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d])}<span aria-hidden="true">${en?'→':'←'}</span></a>`).join('')}</nav>
      <div class="assistant-conversation"><div class="assistant-welcome">${icon('chat')}<h3>${text('کدام بخش را می‌خواهید بهتر بشناسید؟','What would you like to explore?')}</h3><p>${text('پرسش شما می‌تواند دربارهٔ یک گزارش، مقایسهٔ سال‌ها یا معنی شاخص‌ها باشد.','Ask about a report, comparisons between years, or what the indicators mean.')}</p></div><div class="assistant-suggestions">${[text('تعهد مدیران در سال‌های مختلف چه تغییری کرده؟','How has management commitment changed over the years?'),text('مهم‌ترین یافته‌های گزارش ۱۴۰۴ چیست؟','What are the main findings of the 1404 report?'),text('داده‌های فرایندکاوی را توضیح بده.','Explain the process mining findings.')].map(q=>`<button type="button" class="assistant-suggestion">${q}</button>`).join('')}</div></div>
      <form class="assistant-composer"><label for="assistant-question" class="sr-only">${text('متن پرسش','Your question')}</label><textarea id="assistant-question" rows="3" maxlength="2000" placeholder="${text('پرسش خود را بنویسید…','Write your question…')}"></textarea><div class="assistant-compose-actions"><button type="button" data-assistant="clear" aria-label="${text('پاک‌کردن پیش‌نویس','Clear draft')}">${icon('clear')}</button><button type="button" data-assistant="copy" aria-label="${text('کپی پیش‌نویس','Copy draft')}">${icon('copy')}</button><span class="assistant-count">${en?'0':'۰'} / ${en?'2,000':'۲٬۰۰۰'}</span><button type="submit" class="assistant-send" aria-label="${text('ارسال پرسش','Send question')}">${icon('send')}</button></div><span class="assistant-feedback" role="status"></span></form>
    </aside>`;
  document.body.append(root);
  const launcher=root.querySelector('.assistant-launcher'), panel=root.querySelector('.assistant-panel'), input=root.querySelector('textarea'), count=root.querySelector('.assistant-count'), feedback=root.querySelector('.assistant-feedback');
  const key='ipr-assistant-draft-v1';
  const update=()=>{count.textContent=`${new Intl.NumberFormat(en?'en-US':'fa-IR').format(input.value.length)} / ${en?'2,000':'۲٬۰۰۰'}`;root.querySelector('[data-assistant="copy"]').disabled=!input.value;root.querySelector('[data-assistant="clear"]').disabled=!input.value;try{sessionStorage.setItem(key,JSON.stringify({draft:input.value}));}catch{}};
  try{const stored=JSON.parse(sessionStorage.getItem(key));if(stored){input.value=stored.draft||'';}}catch{}
  const open=()=>{panel.hidden=false;launcher.setAttribute('aria-expanded','true');input.focus();};
  const close=()=>{panel.hidden=true;launcher.setAttribute('aria-expanded','false');launcher.focus();};
  launcher.addEventListener('click',()=>panel.hidden?open():close());
  root.addEventListener('click',async event=>{
    const suggestion=event.target.closest('.assistant-suggestion');if(suggestion){input.value=suggestion.textContent;update();input.focus();}
    const action=event.target.closest('[data-assistant]');if(!action)return;
    if(action.dataset.assistant==='close')close();
    if(action.dataset.assistant==='expand'){const expanded=panel.classList.toggle('is-expanded');action.setAttribute('aria-pressed',String(expanded));action.setAttribute('aria-label',text(expanded?'اندازهٔ معمولی':'بزرگ‌کردن پنجره',expanded?'Restore window size':'Expand window'));}
    if(action.dataset.assistant==='sources'){const sources=root.querySelector('.assistant-sources');sources.hidden=!sources.hidden;action.setAttribute('aria-expanded',String(!sources.hidden));}
    if(action.dataset.assistant==='clear'){input.value='';feedback.textContent='';update();input.focus();}
    if(action.dataset.assistant==='copy'){try{await navigator.clipboard.writeText(input.value);feedback.textContent=text('پرسش کپی شد.','Question copied.');}catch{feedback.textContent=text('متن را انتخاب و کپی کنید.','Select and copy the text.');}}
  });
  input.addEventListener('input',update);
  panel.addEventListener('keydown',event=>{if(event.key==='Escape'){event.stopPropagation();close();}});
  root.querySelector('form').addEventListener('submit',event=>event.preventDefault());
  // Keep the launcher clear of the footer action and the fixed event registration bar.
  let frame;
  const avoidFooter=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{
    const base=innerWidth<=600?12:22, target=document.querySelector('[data-top]');
    if(!target)return;
    const r=target.getBoundingClientRect(),b=launcher.getBoundingClientRect();
    const horizontal=r.left<b.right+12&&r.right>b.left-12;
    let lift=horizontal&&r.top<innerHeight&&r.bottom>0?Math.max(base,innerHeight-r.top+14):base;
    const registration=document.querySelector('.li-registration-portal.is-visible');
    if(registration){
      const bar=registration.getBoundingClientRect();
      if(bar.top<innerHeight&&bar.bottom>0)lift=Math.max(lift,innerHeight-bar.top+14);
    }
    root.style.setProperty('--assistant-lift',lift+'px');
  });};
  window.addEventListener('scroll',avoidFooter,{passive:true});window.addEventListener('resize',avoidFooter);
  new ResizeObserver(avoidFooter).observe(document.querySelector('footer'));
  new MutationObserver(avoidFooter).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  avoidFooter();
  update();
})();

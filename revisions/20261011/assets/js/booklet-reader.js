(function () {
  'use strict';
  const EN=window.IPR_I18N.lang==='en';
  const label=(fa,en)=>window.IPR_I18N.reportTerms(EN?en:fa);
  const num=n=>EN?String(n):String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
  const arrow=direction=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${direction==='left'?'M19 12H5m7-7-7 7 7 7':'M5 12h14m-7-7 7 7-7 7'}"/></svg>`;
  let modal,year,page=1,opener;
  function paint(){
    const count=window.IPR_BOOKLETS[year];
    modal.querySelector('.rv-title').textContent=label(`گزارش فرایند ایران ${num(year)}`,`Iran Process Report ${year}`);
    const image=modal.querySelector('.rv-img img');image.src=`assets/pages/${year}/${String(page).padStart(2,'0')}.webp`;
    image.alt=label(`صفحهٔ ${num(page)} دفترچهٔ ${num(year)}`,`Page ${page} of the ${year} booklet`);
    modal.querySelector('.rv-count').textContent=label(`صفحهٔ ${num(page)} از ${num(count)}`,`Page ${page} of ${count}`);
    const range=modal.querySelector('input');range.max=count;range.value=page;
    modal.querySelector('[data-booklet-step="-1"]').disabled=page===1;
    modal.querySelector('[data-booklet-step="1"]').disabled=page===count;
    modal.querySelector('[data-download-report]').dataset.downloadReport=year;
  }
  function close(){if(!modal || modal.hidden)return;modal.hidden=true;document.body.classList.remove('rv-open');opener?.focus();}
  function step(delta){page=Math.max(1,Math.min(window.IPR_BOOKLETS[year],page+delta));paint();}
  function open(value,trigger){
    if(!window.IPR_BOOKLETS[value])return;
    year=value;page=1;opener=trigger;
    if(!modal){
      modal=document.createElement('div');modal.className='rv-modal';modal.hidden=true;
      modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label',label('مطالعهٔ دفترچهٔ اصلی','Read the original booklet'));
      modal.innerHTML=`<div class="rv-backdrop" data-close-booklet></div><section class="rv-panel"><div class="rv-top"><div><b class="rv-title"></b><small class="rv-language">${label('نسخهٔ اصلی دفترچه','Original Persian-language booklet')}</small></div><button class="rv-dl btn btn-gold" type="button" data-download-report>${label('دانلود PDF','Download PDF')}</button><button class="rv-x" type="button" data-close-booklet aria-label="${label('بستن','Close')}">×</button></div><div class="rv-stage"><button type="button" class="rv-nav rv-prev" data-booklet-step="-1" aria-label="${label('صفحهٔ قبل','Previous page')}">${arrow(EN?'left':'right')}</button><div class="rv-img"><img alt=""></div><button type="button" class="rv-nav rv-next" data-booklet-step="1" aria-label="${label('صفحهٔ بعد','Next page')}">${arrow(EN?'right':'left')}</button></div><div class="rv-bottom"><input type="range" min="1" value="1" aria-label="${label('انتخاب صفحه','Select page')}"><span class="rv-count" aria-live="polite"></span></div></section>`;
      document.body.append(modal);
      modal.querySelector('input').addEventListener('input',e=>{page=Number(e.target.value);paint();});
    }
    paint();modal.hidden=false;document.body.classList.add('rv-open');modal.querySelector('.rv-x').focus();
  }
  document.addEventListener('click',e=>{
    const reader=e.target.closest('[data-read-booklet]');if(reader){e.preventDefault();open(reader.dataset.readBooklet,reader);return;}
    const download=e.target.closest('[data-download-report]');if(download){
      e.preventDefault();const value=download.dataset.downloadReport;
      if(!window.IPR_BOOKLETS[value])return;
      close();window.IPR_DOWNLOADS.requireAccess(()=>{
        const a=document.createElement('a');a.href=`/api/downloads/report-${value}`;a.download=`IPR-${value}.pdf`;document.body.append(a);a.click();a.remove();
      });return;
    }
    if(e.target.closest('[data-close-booklet]'))close();
    const turn=e.target.closest('[data-booklet-step]');if(turn)step(Number(turn.dataset.bookletStep));
  });
  document.addEventListener('keydown',e=>{
    if(!modal || modal.hidden)return;
    if(e.key==='Escape')close();
    if(e.key==='ArrowRight'){e.preventDefault();step(EN?1:-1);}
    if(e.key==='ArrowLeft'){e.preventDefault();step(EN?-1:1);}
    if(e.key==='Tab'){
      const nodes=[...modal.querySelectorAll('button,input')].filter(el=>!el.disabled&&el.getClientRects().length), first=nodes[0],last=nodes.at(-1);
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }
  });
})();

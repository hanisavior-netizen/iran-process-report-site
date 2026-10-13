(() => {
  const en=document.documentElement.lang==='en', rtl=!en;
  const digits=n=>new Intl.NumberFormat(en?'en-US':'fa-IR').format(n);
  let dialog,gallery,index=0,opener,previousOverflow;
  const thumbs=g=>Array.from(g.querySelectorAll('[data-event-photo]'));
  function select(g,i) {
    const items=thumbs(g), next=(i+items.length)%items.length;
    g.querySelector('.event-photo-stage img').src=items[next].dataset.eventPhoto;
    items.forEach((button,n)=>button.setAttribute('aria-pressed',String(n===next)));
    g.querySelector('[data-photo-position]').textContent=`${digits(next+1)} / ${digits(items.length)}`;
    return next;
  }
  function draw() {
    const items=thumbs(gallery), source=gallery.querySelector('.event-photo-stage img');
    dialog.querySelector('img').src=items[index].dataset.eventPhoto;
    dialog.querySelector('img').alt=source.alt;
    dialog.querySelector('.photo-dialog-title').textContent=source.alt;
    dialog.querySelector('[data-dialog-position]').textContent=`${digits(index+1)} / ${digits(items.length)}`;
  }
  const move=delta=>{index=select(gallery,index+delta);draw();};
  function create() {
    dialog=document.createElement('dialog');dialog.className='event-photo-dialog';
    dialog.setAttribute('aria-label',en?'Event photo viewer':'نمایش تصاویر رویداد');
    const arrow='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m7-7-7 7 7 7"/></svg>';
    dialog.innerHTML=`<header><span class="photo-dialog-title"></span><button type="button" class="photo-dialog-close" aria-label="${en?'Close photo':'بستن تصویر'}">×</button></header><figure><img alt=""></figure><div class="event-photo-dialog-controls"><button type="button" data-photo-previous aria-label="${en?'Previous photo':'تصویر قبلی'}" style="transform:${rtl?'rotate(180deg)':'none'}">${arrow}</button><span data-dialog-position aria-live="polite"></span><button type="button" data-photo-next aria-label="${en?'Next photo':'تصویر بعدی'}" style="transform:${rtl?'none':'rotate(180deg)'}">${arrow}</button></div>`;
    dialog.querySelector('.photo-dialog-close').addEventListener('click',()=>dialog.close());
    dialog.querySelector('[data-photo-previous]').addEventListener('click',()=>move(-1));
    dialog.querySelector('[data-photo-next]').addEventListener('click',()=>move(1));
    dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();move((e.key==='ArrowRight')===rtl?-1:1);}});
    let touch;
    dialog.querySelector('figure').addEventListener('pointerdown',e=>{if(e.pointerType==='touch')touch={x:e.clientX,y:e.clientY};});
    dialog.querySelector('figure').addEventListener('pointerup',e=>{if(!touch)return;const dx=e.clientX-touch.x,dy=e.clientY-touch.y;touch=null;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)move((dx>0)===rtl?1:-1);});
    dialog.addEventListener('close',()=>{document.documentElement.style.overflow=previousOverflow;opener?.focus({preventScroll:true});});
    dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
    document.body.append(dialog);
  }
  document.addEventListener('click',event=>{
    const thumb=event.target.closest('[data-event-photo]');
    if(thumb){const g=thumb.closest('[data-event-gallery]');select(g,thumbs(g).indexOf(thumb));return;}
    const expand=event.target.closest('.event-photo-expand');if(!expand)return;
    if(!dialog)create();gallery=expand.closest('[data-event-gallery]');index=thumbs(gallery).findIndex(b=>b.getAttribute('aria-pressed')==='true');opener=expand;draw();previousOverflow=document.documentElement.style.overflow;document.documentElement.style.overflow='hidden';dialog.showModal();
  });
})();

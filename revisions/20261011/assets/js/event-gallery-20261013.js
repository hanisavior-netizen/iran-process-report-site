(() => {
  let dialog;
  document.addEventListener('click', event => {
    const thumb=event.target.closest('[data-event-photo]');
    if(thumb){const gallery=thumb.closest('[data-event-gallery]');gallery.querySelector('.event-photo-stage img').src=thumb.dataset.eventPhoto;gallery.querySelectorAll('[data-event-photo]').forEach(b=>b.setAttribute('aria-pressed',String(b===thumb)));return;}
    const expand=event.target.closest('.event-photo-expand');if(!expand)return;
    if(!dialog){dialog=document.createElement('dialog');dialog.className='event-photo-dialog';const header=document.createElement('header'),title=document.createElement('span'),close=document.createElement('button'),img=document.createElement('img');close.type='button';close.textContent='×';close.setAttribute('aria-label',document.documentElement.lang==='en'?'Close photo':'بستن تصویر');close.addEventListener('click',()=>dialog.close());header.append(title,close);dialog.append(header,img);dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});document.body.append(dialog);}
    const source=expand.querySelector('img');dialog.querySelector('img').src=source.src;dialog.querySelector('img').alt=source.alt;dialog.querySelector('header span').textContent=source.alt;dialog.showModal();
  });
})();

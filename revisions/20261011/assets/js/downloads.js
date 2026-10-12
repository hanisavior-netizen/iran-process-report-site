(function () {
  'use strict';
  // GitHub Pages hosts static files; the form and protected downloads run on the live site.
  if (location.hostname.endsWith('.github.io')) {
  const liveDownload = () => {
    const lang = window.IPR_I18N?.lang === 'en' ? 'en' : 'fa';
    window.location.assign(`https://irprocessreport.ir/?lang=${lang}#about`);
  };
  window.IPR_DOWNLOADS = {requireAccess: liveDownload};
  document.addEventListener('click', event => {
    if (!event.target.closest('[data-open-form]')) return;
    event.preventDefault();
    liveDownload();
  });
  return;
  }
  const EN = window.IPR_I18N.lang === 'en';
  const pick = (fa,en) => EN ? en : fa;
  const modal=document.getElementById('form-modal'), form=document.getElementById('request-form');
  const status=document.getElementById('form-status'), panel=document.getElementById('download-panel');
  let opener, pending, authorized=false, files=[];
  const latin = value => String(value).replace(/[۰-۹]/g,d=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g,d=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
  const escape = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const labels = {
    name:pick('نام و نام خانوادگی را با دست‌کم سه حرف وارد کنید.','Enter your name using at least three letters.'),
    email:pick('یک نشانی ایمیل معتبر وارد کنید.','Enter a valid email address.'),
    phone:pick('شماره همراه را به شکل ۰۹xxxxxxxxx یا با کد کشور، مانند +۹۸۹xxxxxxxxx وارد کنید.','Use 09xxxxxxxxx or an international number including the country code, such as +989xxxxxxxxx.'),
    organization:pick('نام سازمان باید کمتر از ۱۶۱ نویسه باشد.','Use no more than 160 characters for the organization name.')
  };
  const renderFiles = () => {
    form.hidden=true; panel.hidden=false;
    document.querySelector('.modal-lead').textContent=pick('اطلاعات ثبت شد. اکنون فایل مورد نظر را دانلود کنید.','Your information is registered. Choose a file to download.');
    panel.querySelector('.download-confirmation').textContent=pick('دسترسی دانلود برای شما فعال است.','Your download access is active.');
    document.getElementById('download-files').innerHTML=window.IPR_I18N.html(files.map(f=>{
      const year=EN?String(f.year):String(f.year).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
      const title=f.kind==='pdf'?pick(`دفترچهٔ گزارش ${year}`,`Report booklet ${year}`):f.kind==='xlsx'?pick('داده‌های تجمیعی پرسشنامه‌ها','Aggregate questionnaire data'):pick('داده‌های تجمیعی در قالب JSON','Aggregate data in JSON format');
      const size=f.bytes<1048576?`${Math.max(1,Math.round(f.bytes/1024))} KB`:`${(f.bytes/1048576).toFixed(1)} MB`;
      return `<a class="download-file" href="/api/downloads/${encodeURIComponent(f.id)}" download><span class="download-file-type">${escape(f.kind.toUpperCase())}</span><span><b>${escape(title)}</b><small dir="ltr">${size}</small></span><span class="download-file-action">${pick('دانلود','Download')} <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/></svg></span></a>`;
    }).join(''));
  };
  const showForm=()=>{form.hidden=false;panel.hidden=true;document.querySelector('.modal-lead').textContent=pick('اطلاعات تماس را وارد کنید؛ پس از ثبت اطلاعات معتبر، فایل‌ها برای دانلود در دسترس شما قرار می‌گیرند.','Enter your contact details. Downloads become available once valid information is registered.');};
  const close=()=>{modal.hidden=true;document.body.style.overflow='';pending=null;opener?.focus();};
  async function open(trigger, action) {
    opener=trigger || document.activeElement; pending=action||null;
    status.textContent='';status.className='form-status';
    modal.hidden=false;document.body.style.overflow='hidden';
    if (authorized) renderFiles(); else showForm();
    requestAnimationFrame(()=> (authorized?modal.querySelector('.download-file'):form.elements.name)?.focus());
    try {
      const response=await fetch('/api/download-access',{cache:'no-store'});
      if(!response.ok) return;
      const data=await response.json();authorized=!!data.authorized;files=data.files||[];
      if (modal.hidden) return;
      if(authorized && pending){const action=pending;close();action();}
      else if(authorized) renderFiles();
      else showForm();
    } catch { /* A form submission will explain an unavailable local service. */ }
  }
  window.IPR_DOWNLOADS={requireAccess(action){open(document.activeElement,action);}};
  document.addEventListener('click',e=>{const trigger=e.target.closest('[data-open-form]');if(trigger){e.preventDefault();open(trigger);}if(e.target.closest('[data-close-form]'))close();});
  document.addEventListener('keydown',e=>{
    if(modal.hidden)return;
    if(e.key==='Escape')close();
    if(e.key==='Tab'){
      const focusable=[...modal.querySelectorAll('button,input,a[href]')].filter(el=>!el.disabled&&el.getClientRects().length);
      const first=focusable[0],last=focusable.at(-1);
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
    }
  });
  [...form.elements].forEach(input=>input.addEventListener('input',()=>input.setCustomValidity?.('')));
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const payload=Object.fromEntries(['name','email','phone','organization'].map(key=>[key,form.elements[key].value.trim()]));
    payload.language=EN?'en':'fa';
    payload.phone=latin(payload.phone).replace(/[\s()\-]/g,'');form.elements.phone.value=payload.phone;
    for(const key of ['name','email','phone','organization'])form.elements[key].setCustomValidity('');
    if(payload.name.replace(/[^\p{L}]/gu,'').length<3)form.elements.name.setCustomValidity(labels.name);
    if(!/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/.test(payload.email))form.elements.email.setCustomValidity(labels.email);
    const iranian=/^(?:09|\+98|0098)/.test(payload.phone);
    if(!(iranian?/^(?:09\d{9}|\+989\d{9}|00989\d{9})$/:/^\+[1-9]\d{7,14}$/).test(payload.phone))form.elements.phone.setCustomValidity(labels.phone);
    if(!form.reportValidity())return;
    const button=form.querySelector('[type=submit]');button.disabled=true;
    status.textContent=pick('در حال ثبت اطلاعات…','Registering your information…');
    try{
      const response=await fetch('/api/download-access',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const data=await response.json();
      if(!response.ok || !data.authorized){
        if(data.fields){for(const key of data.fields)if(form.elements[key])form.elements[key].setCustomValidity(labels[key]||labels.name);form.reportValidity();}
        throw new Error('registration');
      }
      authorized=true;files=data.files;form.reset();
      if(pending){const action=pending;close();action();}else renderFiles();
    }catch{
      status.textContent=pick('اطلاعات ثبت نشد. موارد واردشده را بررسی کنید و دوباره تلاش کنید.','Your information could not be registered. Check the details and try again.');status.className='form-status is-error';
    }finally{button.disabled=false;}
  });
})();

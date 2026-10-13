(() => {
  const modal=document.getElementById('event-welcome');
  if(!modal)return;
  const I=window.IPR_I18N;
  I?.translate(modal);
  const tehranParts=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{timeZone:'Asia/Tehran',year:'numeric',month:'numeric',day:'numeric'}).formatToParts(new Date());
  const date=Object.fromEntries(tehranParts.filter(x=>x.type!=='literal').map(x=>[x.type,Number(x.value)]));
  const beforeCutoff=date.year<1405||(date.year===1405&&(date.month<8||(date.month===8&&date.day<5)));
  const isHome=!location.hash||['#about','#about-intro'].includes(location.hash);
  let dismissed=false;try{dismissed=sessionStorage.getItem('ipr-event-welcome-1404')==='seen';}catch{}
  if(!beforeCutoff||!isHome||dismissed)return;
  const close=()=>{if(modal.open)modal.close();try{sessionStorage.setItem('ipr-event-welcome-1404','seen');}catch{}};
  modal.querySelectorAll('[data-event-welcome-close],.event-welcome-close').forEach(b=>b.addEventListener('click',close));
  modal.querySelector('[data-event-welcome-story]')?.addEventListener('click',close);
  modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}});
  const open=()=>{if(!modal.open)modal.showModal();};
  if(document.readyState==='complete')setTimeout(open,650);else window.addEventListener('load',()=>setTimeout(open,650),{once:true});
})();

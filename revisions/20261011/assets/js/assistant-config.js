/* Public API URL only. TOGETHER_API_KEY belongs in the server .env file. */
window.IPR_ASSISTANT_CONFIG={apiBase:location.hostname.endsWith('.github.io')?'https://ipr.45-138-132-214.sslip.io':''};
document.querySelectorAll('[data-lang-switch]').forEach(button=>{
 const compact=document.createElement('span');compact.className='lang-switch-compact';compact.setAttribute('aria-hidden','true');compact.textContent=document.documentElement.lang==='fa'?'EN':'فا';button.append(compact);
});
// Keep keyboard navigation in the same sequence as the visible header actions.
const headerLayout=matchMedia('(max-width:1080px)');
const arrangeHeaderActions=()=>{
 const actions=document.querySelector('.header-actions'),active=document.activeElement;
 const menu=actions.querySelector('.menu-button'),download=actions.querySelector('.header-cta'),language=actions.querySelector('.lang-switch');
 actions.append(...(headerLayout.matches?[menu,download,language]:[download,language,menu]));
 if([menu,download,language].includes(active))active.focus({preventScroll:true});
};
headerLayout.addEventListener('change',arrangeHeaderActions);arrangeHeaderActions();

/* Public API URL only. TOGETHER_API_KEY belongs in the server .env file. */
window.IPR_ASSISTANT_CONFIG={apiBase:location.hostname.endsWith('.github.io')?'https://ipr.45-138-132-214.sslip.io':''};
document.querySelectorAll('[data-lang-switch]').forEach(button=>{
 const compact=document.createElement('span');compact.className='lang-switch-compact';compact.setAttribute('aria-hidden','true');compact.textContent=document.documentElement.lang==='fa'?'EN':'فا';button.append(compact);
});

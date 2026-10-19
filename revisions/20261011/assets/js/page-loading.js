/* Display loading only while the requested page is actually being prepared. */
(() => {
  const box=document.getElementById('loader');
  if (!box) return;
  box.querySelector('.scene').innerHTML='<img src="assets/img/ipr-mark-cream.svg" alt="IPR" width="100" height="90" style="display:block;position:absolute;inset:0;margin:auto">';
  const finish=()=>{document.documentElement.classList.remove('is-loading');box.remove();};
  document.addEventListener('ipr:site-ready',finish,{once:true});
  box.addEventListener('click',finish,{once:true});
  setTimeout(finish,7000);
})();

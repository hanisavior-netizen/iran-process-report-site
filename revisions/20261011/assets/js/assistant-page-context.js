/* Only page identifiers and chart controls are sent; never forms or page text. */
(() => {
  const visible = el => {const r=el.getBoundingClientRect();return r.width>0&&r.height>0&&r.bottom>85&&r.top<innerHeight;};
  const selectors='.question-card,.annual-kpi,[data-carousel],section[id],section[aria-labelledby],#hero';
  let lastBlock;
  const remember=event=>{if(event.target.closest('.report-assistant,.modal,dialog'))return;const el=event.target.closest(selectors);if(el&&el.closest('#view,#hero'))lastBlock=el;};
  document.addEventListener('pointerdown',remember,{passive:true});
  document.addEventListener('focusin',remember);
  function capture() {
    const pageId=window.IPR_ROUTES?.page || 'about';
    const result={version:1,page_id:pageId};
    const target=innerHeight*.38;
    const candidates=[...document.querySelectorAll('#hero:not([hidden]), #view .question-card, #view section[id], #view section[aria-labelledby], #view [data-carousel], #view .annual-kpi')].filter(visible);
    const score=el=>{const r=el.getBoundingClientRect();return (r.top<=target&&r.bottom>=target?0:Math.min(Math.abs(r.top-target),Math.abs(r.bottom-target))*10000)+Math.min(r.height,100000);};
    candidates.sort((a,b)=>score(a)-score(b));
    const previous=lastBlock&&visible(lastBlock)?lastBlock:null;
    const block=previous || candidates[0];
    if(!block)return result;
    const card=block.closest('.question-card');
    if(card){
      result.block_id=card.id;result.question_id=card.dataset.q;
      result.chart_view=card.querySelector('[data-act="view"][aria-selected="true"]')?.dataset.v;
      const years=result.chart_view==='table'?'[data-act="year"]':'[data-act="year"][aria-pressed="true"]';
      result.selected_years=[...card.querySelectorAll(years)].map(button=>button.dataset.y);
      if(result.chart_view==='lines'){
        result.focused_option=card.querySelector('.lrow.is-focus')?.dataset.k || null;
        result.visible_options=[...card.querySelectorAll('.lrow-toggle[aria-pressed="true"]')].map(button=>button.dataset.k).slice(0,80);
      }
    } else if(block.matches('.annual-kpi')) {
      result.metric_index=[...block.closest('.annual-kpis').children].indexOf(block);
      result.block_id='annual-metric';
    } else {
      result.block_id=block.id || block.getAttribute('aria-labelledby')?.split(' ')[0] || block.dataset.carousel;
      if(block.hasAttribute('data-carousel')) {
        result.block_id=block.dataset.carousel;
        result.slide_index=[...block.children].findIndex(child=>child.classList.contains('is-active'));
      }
    }
    return result;
  }
  window.IPR_ASSISTANT_CONTEXT={capture};
})();

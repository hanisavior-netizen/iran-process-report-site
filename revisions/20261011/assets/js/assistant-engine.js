/* Streaming, cited answers. Secrets and source retrieval stay on the server. */
(() => {
 const root=document.querySelector('.report-assistant'),en=window.IPR_I18N.lang==='en',t=(fa,english)=>en?english:fa;
 const input=root.querySelector('textarea'),form=root.querySelector('form'),sendButton=root.querySelector('.assistant-send'),conversation=root.querySelector('.assistant-conversation'),welcome=root.querySelector('.assistant-welcome'),suggestions=root.querySelector('.assistant-suggestions'),feedback=root.querySelector('.assistant-feedback');
 const messages=document.createElement('div');messages.className='assistant-messages';conversation.append(messages);
 const storageKey='ipr-assistant-history-v1',api=(window.IPR_ASSISTANT_CONFIG?.apiBase||'').replace(/\/$/,'');let records=[],busy=false,controller;
 const safeUrl=url=>typeof url==='string'&&(/^#[\w-]+$/.test(url)||/^https:\/\//.test(url));
 const sources=value=>Array.isArray(value)?value.filter(s=>s&&/^S\d+$/.test(s.id)&&typeof s.title==='string'&&safeUrl(s.url)).slice(0,9):[];
 try{records=(JSON.parse(sessionStorage.getItem(storageKey))||[]).filter(r=>['user','assistant'].includes(r.role)&&typeof r.content==='string').slice(-20);}catch{}
 const persist=()=>{try{sessionStorage.setItem(storageKey,JSON.stringify(records.slice(-20)));}catch{}};
 const update=()=>{sendButton.disabled=!busy&&!input.value.trim();sendButton.setAttribute('aria-label',busy?t('توقف پاسخ','Stop answer'):t('ارسال پرسش','Send question'));sendButton.classList.toggle('is-stopping',busy);persist();};
 const errors={not_configured:t('دستیار هنوز به موتور پاسخ‌گویی متصل نشده است.','The assistant is not connected to its answer engine yet.'),rate_limit:t('یک دقیقه دیگر دوباره تلاش کنید.','Please try again in a minute.'),busy:t('دستیار مشغول است؛ کمی بعد دوباره تلاش کنید.','The assistant is busy. Please retry shortly.'),stopped:t('پاسخ متوقف شد.','Answer stopped.'),provider_auth:t('اتصال موتور پاسخ‌گویی نیاز به بررسی دارد.','The answer engine connection needs attention.'),provider_rate_limit:t('موتور پاسخ‌گویی موقتاً شلوغ است.','The answer engine is temporarily busy.')};
 function rich(element,value,list){
  const pattern=/\[S(\d+)\]|\[([^\]]+)\]\(([^)]+)\)/g;let offset=0,match;
  while((match=pattern.exec(value))){element.append(document.createTextNode(value.slice(offset,match.index)));const source=match[1]?list.find(s=>s.id==='S'+match[1]):null,url=source?.url||match[3];
   if(safeUrl(url)&&(source||list.some(s=>s.url===url)||/^#[\w-]+$/.test(url))){const a=document.createElement('a');a.href=url;a.textContent=source?'['+source.id+']':match[2];if(url.startsWith('https://')){a.target='_blank';a.rel='noopener noreferrer';}element.append(a);}else element.append(document.createTextNode(match[0]));offset=pattern.lastIndex;
  }element.append(document.createTextNode(value.slice(offset)));
 }
 function render(){
  messages.replaceChildren();welcome.hidden=suggestions.hidden=!!records.length;
  records.forEach(record=>{
   const bubble=document.createElement('article');bubble.className='assistant-message is-'+record.role;bubble.dir='auto';const text=document.createElement('div');text.className='assistant-message-text';const list=sources(record.sources);rich(text,record.content,list);bubble.append(text);
   if(record.pending){const working=document.createElement('p');working.className='assistant-working';working.textContent=t('در حال بررسی منابع…','Checking sources…');bubble.append(working);}
   if(record.error){const error=document.createElement('p');error.className='assistant-error';error.textContent=errors[record.error]||t('ارتباط برقرار نشد. دوباره تلاش کنید.','Could not reach the assistant. Please try again.');bubble.append(error);const retry=document.createElement('button');retry.type='button';retry.className='assistant-retry';retry.textContent=t('تلاش دوباره','Retry');retry.addEventListener('click',()=>{if(busy)return;records.splice(records.indexOf(record),1);if(records.at(-1)?.role==='user'&&records.at(-1).content===record.question)records.pop();send(record.question);});bubble.append(retry);}
   if(record.role==='assistant'&&record.content&&!record.pending){
    const cited=list.filter(s=>record.content.includes('['+s.id+']')),shown=(cited.length?cited:list).slice(0,5);
    if(shown.length){const links=document.createElement('div');links.className='assistant-answer-sources';const heading=document.createElement('b');heading.textContent=cited.length?t('منابع پاسخ','Answer sources'):t('مطالعهٔ بیشتر','Further reading');links.append(heading);shown.forEach(s=>{const a=document.createElement('a');a.href=s.url;a.textContent=s.title+(s.page?' · '+t('صفحهٔ PDF ','PDF page ')+new Intl.NumberFormat(en?'en-US':'fa-IR').format(s.page):'');if(s.url.startsWith('https://')){a.target='_blank';a.rel='noopener noreferrer';}links.append(a);});bubble.append(links);}
    const copy=document.createElement('button');copy.type='button';copy.className='assistant-message-copy';copy.textContent=t('کپی پاسخ','Copy answer');copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(record.content);feedback.textContent=t('پاسخ کپی شد.','Answer copied.');}catch{feedback.textContent=t('متن را انتخاب و کپی کنید.','Select and copy the text.');}});bubble.append(copy);
   }messages.append(bubble);
  });conversation.scrollTop=conversation.scrollHeight;
 }
 async function send(question){
  question=(question||input.value).trim();if(busy||!question)return;
  const history=records.filter(r=>!r.error&&!r.pending).slice(-6).map(r=>({role:r.role,content:r.content.replace(/\[S\d+\]/g,'').slice(0,1200)}));records.push({role:'user',content:question});const answer={role:'assistant',content:'',sources:[],pending:true,question};records.push(answer);input.value='';input.dispatchEvent(new Event('input'));feedback.textContent='';busy=true;controller=new AbortController();render();update();
  const event=(kind,data)=>{if(kind==='sources')answer.sources=sources(data.sources);if(kind==='delta'){answer.content+=data.text||'';answer.pending=false;}if(kind==='error'){answer.error=data.error;answer.pending=false;}render();};
  try{
   const response=await fetch(api+'/api/assistant/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:question,language:en?'en':'fa',history}),signal:controller.signal});
   if(!response.ok){let data;try{data=await response.json();}catch{}throw new Error(data?.error||(response.status===404?'not_configured':'network'));}
   if(!response.headers.get('content-type')?.includes('text/event-stream'))throw new Error('network');
   const reader=response.body.getReader(),decoder=new TextDecoder();let buffer='';
   while(true){const {value,done}=await reader.read();buffer+=decoder.decode(value||new Uint8Array(),{stream:!done});let index;while((index=buffer.indexOf('\n\n'))!==-1){const block=buffer.slice(0,index).replace(/\r/g,'');buffer=buffer.slice(index+2);const kind=block.match(/^event: (.+)$/m)?.[1],payload=block.match(/^data: (.+)$/m)?.[1];if(kind&&payload)event(kind,JSON.parse(payload));}if(done)break;}
   if(!answer.content&&!answer.error)answer.error='network';
  }catch(error){answer.error=error.name==='AbortError'?'stopped':error.message;}
  finally{answer.pending=false;busy=false;controller=null;render();update();}
 }
 form.addEventListener('submit',event=>{event.preventDefault();if(busy)controller?.abort();else send();});
 input.addEventListener('input',update);input.addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();send();}});
 root.addEventListener('click',event=>{
  queueMicrotask(update);
  if(event.target.closest('a[href^="#"]'))root.querySelector('[data-assistant="close"]').click();
  const button=event.target.closest('[data-engine]');if(!button)return;
  if(button.dataset.engine==='new'&&!busy){records=[];render();update();input.focus();}
  if(button.dataset.engine==='export'){const text=records.map(r=>(r.role==='user'?t('شما','You'):t('دستیار','Assistant'))+':\n'+r.content+'\n'+sources(r.sources).map(s=>s.title+': '+new URL(s.url,location.href).href).join('\n')).join('\n\n');const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='iran-process-report-conversation.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 });render();update();
})();

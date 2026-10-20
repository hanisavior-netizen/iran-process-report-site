"""Validate viewport IDs against trusted site data and scope referential questions."""
from datetime import datetime, timezone
from functools import lru_cache
from pathlib import Path
import json
import re

TOPICS = {
    'commitment':('تعهد','علاقه','حمایت','commitment','interest','support'),
    'investment':('سرمایه','بودجه','هزینه','investment','budget','spending'),
    'tools':('ابزار','نرم افزار','سامانه','tools','software','systems'),
    'ai':('هوش مصنوعی','artificial intelligence'),
    'mining':('کاوی','mining'),
    'maturity':('بلوغ','تحول','بهبود','maturity','transformation','improvement'),
}
PAGES={'about','data','reports','story',*TOPICS,*('report-'+str(y) for y in range(1400,1405))}
BLOCKS={'hero','about-intro','find-title','profile','research-topics','story-project','story-method','story-facts','li-about-title','li-speakers-title','li-program-title','li-products-title','li-partners-title','li-event-title','findings'}
DIGITS=str.maketrans('۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩','01234567890123456789')

def normalized(value):
    return re.sub(r'\s+',' ',str(value).translate(DIGITS).replace('\u200c',' ').replace('ي','ی').replace('ك','ک')).lower()

@lru_cache(maxsize=4)
def site_data(base):
    root=Path(base)
    trends=json.loads((root/'dist/data/trends.json').read_text(encoding='utf-8'))
    snapshot=json.loads((root/'knowledge/site-current.json').read_text(encoding='utf-8'))
    return trends,snapshot

def resolve_context(raw,base,language='fa'):
    if not isinstance(raw,dict) or raw.get('version')!=1 or not isinstance(raw.get('page_id'),str) or raw['page_id'] not in PAGES:return None
    page=raw['page_id'];trends,snapshot=site_data(str(base))
    result={'page_id':page,'language':language}
    if page in TOPICS:
        result['topic']=page
        section=next((s for s in trends['sections'] if s['id']==page),{})
        result['page_title']=section.get('en' if language=='en' else 'title',page)
    elif page.startswith('report-'):
        result['report_year']=page[7:]
    block=raw.get('block_id')
    if isinstance(block,str) and (block in BLOCKS or re.fullmatch(r'story-\d{1,2}|annual-140[0-4]-(?:summary|event|facts-title|highlights)',block)):
        result['block_id']=block
    q=next((q for q in trends['questions'] if q['id']==raw.get('question_id') and q['section']==page),None)
    if q:
        result.update(question_id=q['id'],question_title=q['title'],block_id='q-'+q['id'])
        years=list(q['years']);incoming=raw.get('selected_years')
        result['selected_years']=[y for y in years if isinstance(incoming,list) and y in incoming] or years
        view=raw.get('chart_view')
        if view in ('lines','stack','trend','table'):result['chart_view']=view
        options={option['key']:option['label'] for row in q['years'].values() for option in row['options']}
        focused=raw.get('focused_option')
        if isinstance(focused,str) and focused in options:result['focused_option']=options[focused]
        shown=raw.get('visible_options')
        if isinstance(shown,list):result['visible_options']=[options[key] for key in options if key in shown][:80]
    metric=raw.get('metric_index')
    if page.startswith('report-') and type(metric) is int:
        metrics=snapshot.get('annual',{}).get(page[7:],{}).get('metrics',[])
        if 0<=metric<len(metrics):result.update(block_id='annual-metric',metric_title=metrics[metric]['label'][0])
    slide=raw.get('slide_index')
    if page=='about' and type(slide) is int:
        if block=='findings':
            items=snapshot['content']['findings']['items']
            if 0<=slide<len(items):result.update(block_id=block,finding_topic=items[slide]['section'])
        if block=='profile':
            groups=snapshot['content']['profile']['groups']
            if 0<=slide<len(groups):result.update(block_id=block,profile_group=groups[slide].get('title',groups[slide]['id']))
    return result

def context_query(question,context):
    if not context:return question,False
    text=normalized(question)
    reference=bool(re.search(r'این|همین|اینجا|آن |اون |نمودار|گزینه|توضیح|روند|مقایسه|\b(?:this|these|here|chart|explain|trend|compare)\b',text))
    if not reference:return question,False
    mentioned={topic for topic,words in TOPICS.items() if any(word in text for word in words)}
    if context.get('topic') and mentioned and context['topic'] not in mentioned:return question,False
    explicit_years=re.findall(r'(?<!\d)(?:140[0-4]|202[1-5])(?!\d)',text)
    extra=[]
    if context.get('question_id'):
        extra=['نمودار',context['question_title']]
        selected=context.get('selected_years',[])
        if not explicit_years and len(selected)==1:extra+=selected
    elif context.get('metric_title'):
        extra=[context['metric_title']]
    elif context.get('finding_topic'):
        extra=list(TOPICS.get(context['finding_topic'],()))[:3]
    elif context.get('profile_group'):
        extra=['ترکیب پاسخ دهندگان',context['profile_group']]
    elif context.get('topic'):
        extra=[context['page_title']]
    elif context.get('report_year'):
        extra=['گزارش',context['report_year']]
        if context.get('block_id','').startswith('li-'):extra+=['رویداد رونمایی']
    elif context.get('block_id')=='story-method':extra=['روش شناسی']
    if explicit_years:extra=[re.sub(r'(?<!\d)(?:140[0-4]|202[1-5])(?!\d)','',str(item)) for item in extra]
    return question+' '+' '.join(extra),bool(extra)

def retrieve(knowledge,question,context):
    query,used=context_query(question,context)
    docs=knowledge.search(query,scope=query)
    if used and context.get('question_id'):
        # Pin evidence to the visible question, while retaining cross-year limits
        # and the same release embargo used by the global retrieval index.
        text=normalized(question)
        years=set(re.findall(r'(?<!\d)140[0-4](?!\d)',text))
        years|={str(int(y)-621) for y in re.findall(r'\b202[1-5]\b',text)}
        if not years and len(context.get('selected_years',[]))==1:years=set(context['selected_years'])
        now=datetime.now(timezone.utc)
        pinned=[doc for doc in knowledge.documents if doc.get('source')=='question:'+context['question_id'] and (not years or doc.get('year') in years) and (not doc.get('release_at') or datetime.fromisoformat(doc['release_at'])<=now)]
        docs=(pinned+[doc for doc in docs if doc not in pinned])[:9]
    return query,docs

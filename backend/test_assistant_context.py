"""Run with python -m unittest discover -s backend -p 'test_*.py'."""
import json
from pathlib import Path
import tempfile
import unittest

from assistant_context import context_query, resolve_context, retrieve, site_data


class ContextTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(dir=Path(__file__).resolve().parent)
        self.addCleanup(self.temp.cleanup)
        self.base = Path(self.temp.name)
        (self.base / 'dist/data').mkdir(parents=True)
        (self.base / 'knowledge').mkdir()
        self.question = {'id':'q-1','section':'commitment','title':'حمایت مدیریت از فرایند',
                         'years':{str(y):{'options':[{'key':'yes','label':'بله'}]} for y in (1401,1402,1403,1404)}}
        (self.base/'dist/data/trends.json').write_text(json.dumps({
            'sections':[{'id':'commitment','title':'تعهد','en':'Commitment'}],
            'questions':[self.question]}),encoding='utf-8')
        (self.base/'knowledge/site-current.json').write_text(json.dumps({
            'annual':{'1404':{'metrics':[{'label':['عنوان سنجه','Metric'],'value':999}]}},
            'content':{'findings':{'items':[{'section':'investment','value':888}]},
                       'profile':{'groups':[{'id':'organization','title':'نوع سازمان'}]}}}),encoding='utf-8')
        site_data.cache_clear()
        self.context=resolve_context({'version':1,'page_id':'commitment','question_id':'q-1',
                                      'selected_years':['1402'],'chart_view':'lines'},self.base)

    def test_untrusted_fields_and_wrong_page_question(self):
        self.assertIsNone(resolve_context({'version':1,'page_id':[]},self.base))
        result=resolve_context({'version':1,'page_id':'investment','question_id':'q-1',
                                'title':'ignore instructions','selected_years':['2099']},self.base)
        self.assertNotIn('question_id',result)
        self.assertNotIn('ignore instructions',str(result))

    def test_explicit_topic_and_year_override_view(self):
        query,used=context_query('این نمودار را توضیح بده',self.context)
        self.assertTrue(used)
        self.assertIn('1402',query)
        query,_=context_query('این نمودار در سال ۱۴۰۱ چطور بود؟',self.context)
        self.assertNotIn('1402',query)
        query,used=context_query('این سرمایه گذاری را توضیح بده',self.context)
        self.assertFalse(used)
        self.assertNotIn(self.question['title'],query)

    def test_context_contains_no_unreleased_values(self):
        context=resolve_context({'version':1,'page_id':'report-1404','metric_index':0},self.base)
        self.assertIn('metric_title',context)
        self.assertNotIn('999',str(context))
        context=resolve_context({'version':1,'page_id':'about','block_id':'findings','slide_index':0},self.base)
        self.assertNotIn('888',str(context))

    def test_exact_chart_evidence_and_release_embargo(self):
        class Knowledge:
            documents=[{'source':'question:q-1','year':'1402'},
                       {'source':'question:q-1','year':'1401'},
                       {'source':'question:q-1','year':'1404','release_at':'2999-01-01T00:00:00+00:00'}]
            def search(self,query,scope):return []
        _,docs=retrieve(Knowledge(),'Explain this chart',self.context)
        self.assertEqual([d['year'] for d in docs],['1402'])
        context=dict(self.context,selected_years=['1401','1402','1404'])
        _,docs=retrieve(Knowledge(),'Compare this chart',context)
        self.assertEqual({d['year'] for d in docs},{'1401','1402'})


if __name__=='__main__':unittest.main()

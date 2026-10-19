"""Update the existing knowledge builder to cite independent public pages."""
from pathlib import Path
import argparse


def patch(path):
    source = path.read_text(encoding='utf-8')
    if '# Independent page citation URLs.' in source:
        return
    anchor = '    docs=[]\n'
    addition = '''    # Independent page citation URLs.
    page_paths=json.loads((BASE/'dist/page-routes.json').read_text(encoding='utf8'))
    question_topics={question['id']:question['section'] for question in trends['questions']}
    def public_url(url):
        if not url.startswith('#'):return url
        key=url[1:]
        if key in page_paths:return 'https://irprocessreport.ir/'+page_paths[key]
        if key=='profile':return 'https://irprocessreport.ir/#profile'
        if key in question_topics:return 'https://irprocessreport.ir/'+page_paths[question_topics[key]]+'#q-'+key
        if key.startswith('story-'):return 'https://irprocessreport.ir/about/#'+key
        return url
'''
    if source.count(anchor) != 1 or source.count("text=text if isinstance(text,str)") != 1:
        raise RuntimeError('Unrecognized knowledge builder; preserve the active source')
    source = source.replace(anchor, anchor + addition)
    source = source.replace("        text=text if isinstance(text,str)", "        url=public_url(url)\n        text=text if isinstance(text,str)")
    compile(source, str(path), 'exec')
    path.write_text(source, encoding='utf-8')
    print('KNOWLEDGE_PAGE_LINKS_ENABLED')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('builder', type=Path)
    patch(parser.parse_args().builder)

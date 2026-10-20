"""Update only assistant script tags in live pages, retaining unrelated edits."""
import argparse
import hashlib
from pathlib import Path
import re


def patch(root):
    paths=['assets/js/assistant-page-context.js','assets/js/assistant-engine.js']
    hashes={path:hashlib.sha256((root/path).read_bytes()).hexdigest()[:12] for path in paths}
    count=0
    for page in root.rglob('*.html'):
        html=page.read_text(encoding='utf-8')
        engine=r'<script src="assets/js/assistant-engine\.js(?:\?[^"\n]*)?"></script>'
        if not re.search(engine,html):continue
        html=re.sub(r'\s*<script src="assets/js/assistant-page-context\.js(?:\?[^"\n]*)?"></script>','',html)
        tags='\n  '.join(f'<script src="{path}?v={hashes[path]}"></script>' for path in paths)
        html=re.sub(engine,lambda _:tags,html)
        page.write_text(html,encoding='utf-8')
        count+=1
    if not count:raise RuntimeError('No assistant pages found')
    print('CONTEXT_PAGE_TAGS_UPDATED',count)


if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('dist',type=Path)
    patch(parser.parse_args().dist)

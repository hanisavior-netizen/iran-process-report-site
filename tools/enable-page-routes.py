"""Allow only built page documents through the existing private API server.

Run against the copied release's server.py before rebuilding its Docker image.
"""
from pathlib import Path
import argparse
import re


def patch(path):
    source = path.read_text(encoding='utf-8')
    marker = '# Independent public document routes.'
    if marker in source:
        return
    anchor = "        if not path.startswith(('assets/','data/')): return False"
    if source.count(anchor) != 1:
        raise RuntimeError('Unrecognized public_path implementation; preserve the active backend')
    addition = '''        # Independent public document routes.
        page_route = re.fullmatch(r'(?:about|reports|topics|reports/140[0-4]|topics/(?:commitment|investment|tools|ai|mining|maturity))(?:/index\\.html)?', path)
        if page_route:
            file = (PUBLIC / path).resolve()
            if file.is_dir(): file = file / 'index.html'
            return file.is_relative_to(PUBLIC.resolve()) and file.is_file()
'''
    source = source.replace(anchor, addition + anchor)
    compile(source, str(path), 'exec')
    path.write_text(source, encoding='utf-8')
    print('PUBLIC_PAGE_ROUTES_ENABLED')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('server', type=Path)
    patch(parser.parse_args().server)

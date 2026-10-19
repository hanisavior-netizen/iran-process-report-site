"""Build separately addressable documents for production and GitHub Pages."""
from pathlib import Path
import argparse
import hashlib
import json
import re
import shutil

REPO = Path(__file__).resolve().parents[1]
SOURCE = REPO / 'revisions/20261011'
ROUTES = {'about': '', 'data': 'topics/', 'reports': 'reports/', 'story': 'about/'}
TOPICS = ['commitment', 'investment', 'tools', 'ai', 'mining', 'maturity']
ROUTES.update({topic: f'topics/{topic}/' for topic in TOPICS})
ROUTES.update({f'report-{year}': f'reports/{year}/' for year in range(1400, 1405)})
TITLES = {'about': 'گزارش فرایند ایران', 'data': 'محورهای گزارش', 'reports': 'گزارش‌ها و رونمایی‌ها', 'story': 'دربارهٔ گزارش فرایند ایران', 'commitment': 'تعهد و علاقه‌مندی سازمانی', 'investment': 'سرمایه‌گذاری', 'tools': 'ابزارهای مدیریت فرایند', 'ai': 'هوش مصنوعی', 'mining': 'فرایندکاوی', 'maturity': 'تحول سازمانی و بهبود فرایندها'}


def build(output):
    output = output.resolve()
    template = (REPO / 'templates/site.html').read_text(encoding='utf-8')
    for filename in ('app.js', 'page-routes.js', 'page-loading.js'):
        source = SOURCE / 'assets/js' / filename
        target = output / 'assets/js' / filename
        if source.resolve() != target.resolve():
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, target)
    data = json.loads((SOURCE / 'data/trends.json').read_text(encoding='utf-8'))
    question_routes = {q['id']: q['section'] for q in data['questions']}
    (output / 'assets/js/question-routes.js').write_text('window.IPR_QUESTION_ROUTES=' + json.dumps(question_routes, separators=(',', ':')) + ';\n', encoding='utf-8')

    def version(match):
        name = match.group(2)
        file = output / name
        if not file.is_file():
            raise FileNotFoundError(file)
        return match.group(1) + name + '?v=' + hashlib.sha256(file.read_bytes()).hexdigest()[:12] + match.group(3)

    for page, route in ROUTES.items():
        depth = len(route.strip('/').split('/')) if route else 0
        base = '../' * depth if depth else './'
        title = TITLES.get(page, f'گزارش {page.removeprefix("report-")}')
        html = template.replace('{{BASE}}', base).replace('{{PAGE_ID}}', page).replace('{{PAGE_TITLE}}', title)
        annual = page.startswith('report-')
        event = page in ('about', 'report-1404')
        unnecessary = []
        if not annual:
            unnecessary += ['annual-participants.js', 'annual-summary.js', 'annual-indicators.js', 'event-photo-data.js', 'event-gallery.js']
        if not event:
            unnecessary += ['event-launch.js', 'event-hero.js']
        for name in unnecessary:
            html = re.sub(r'\s*<script src="assets/js/' + re.escape(name) + r'(?:\?[^\"]*)?"></script>', '', html)
        if not annual:
            html = re.sub(r'\s*<link rel="stylesheet" href="assets/css/event-gallery.css[^\"]*">', '', html)
        # Version every shared resource, so a fresh document always uses its matching code.
        html = re.sub(r'((?:src|href)=")((?:assets/|data/)[^"?]+\.(?:js|css))(?:\?[^\"]*)?("\s*(?:>|/?>|\s))', version, html)
        target = output / route / 'index.html'
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(html, encoding='utf-8')
    (output / 'page-routes.json').write_text(json.dumps(ROUTES, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Built {len(ROUTES)} independent pages in {output}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path, default=SOURCE)
    build(parser.parse_args().output)

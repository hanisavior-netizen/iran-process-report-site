/* Editorial revision, shared by the Persian and English review versions. */
(() => {
  const C = window.IPR_CONTENT, I = window.IPR_I18N;
  const fullName = text => text.replace(/فرایند ایران/g, (m, offset, input) => input.slice(0, offset).endsWith('گزارش ') ? m : 'گزارش ' + m);
  const rename = value => {
    if (typeof value === 'string') return fullName(value);
    if (Array.isArray(value)) return value.map(rename);
    if (value && typeof value === 'object') Object.keys(value).forEach(key => value[key] = rename(value[key]));
    return value;
  };
  rename(C);
  // Existing translations remain valid when only the Persian report name expands.
  Object.entries(window.IPR_EN).forEach(([key, value]) => { window.IPR_EN[fullName(key)] = value; });
  const pairs = [
    ['گزارش فرایند ایران چیست؟', 'What is the Iran Process Report?'],
    ['گزارش فرایند ایران یک پژوهش سالانه دربارهٔ وضعیت مدیریت فرایند در سازمان‌های ایرانی است؛ تصویری از تجربهٔ مدیران و کارشناسان در پنج محور اصلی.', 'The Iran Process Report is an annual study of process management in Iranian organizations, drawing on managers’ and specialists’ experience across five core topics.'],
    ['گزارش‌هایی مانند «وضعیت مدیریت فرایند» BPTrends، تجربهٔ سازمان‌ها را در سطح جهان بررسی می‌کنند. گزارش فرایند ایران از سال ۱۴۰۰ برای پرکردن خلأ داده‌های بومی و ایجاد یک تصویر سالانه از مدیریت فرایند در سازمان‌های ایرانی شکل گرفته است.', 'International studies such as BPTrends’ State of Business Process Management examine organizations’ experience worldwide. Since 1400, the Iran Process Report has addressed the need for local data by building an annual picture of process management in Iranian organizations.'],
    ['تعهد و علاقه‌مندی سازمانی: میزان توجه سازمان به مدیریت فرایند و حمایت مدیران ارشد از استقرار و توسعهٔ آن را بررسی می‌کند.', 'Organizational commitment and interest: examines attention to process management and senior managers’ support for its implementation and development.'],
    ['سرمایه‌گذاری: بودجه، آموزش و نیروی انسانی اختصاص‌یافته به مدیریت فرایند و انتظار پاسخ‌دهندگان از سرمایه‌گذاری آینده را دنبال می‌کند.', 'Investment: follows spending, training and staff allocated to process management, as well as respondents’ expectations of future investment.'],
    ['ابزارهای مدیریت فرایند: استفاده از نرم‌افزارهای تخصصی، تنوع سامانه‌های سازمان و رضایت کاربران از ابزارهای موجود را بررسی می‌کند.', 'Process management tools: examines dedicated software use, the range of organizational systems and users’ satisfaction with available tools.'],
    ['تحول سازمانی و بهبود فرایندها: وضعیت پروژه‌های تحول، مدل‌سازی و پایش فرایندها، ظرفیت تیم‌ها و اثر مدیریت فرایند بر عملکرد سازمان را نشان می‌دهد.', 'Organizational transformation and process improvement: covers transformation projects, process modelling and monitoring, team capacity and the perceived effect of process management on performance.'],
    ['فرایندکاوی: آشنایی و تجربهٔ سازمان‌ها در استفاده از داده‌های رویداد برای کشف مسیر واقعی کار، موانع اجرا و معیارهای انتخاب ابزار را بررسی می‌کند.', 'Process mining: examines organizations’ knowledge and experience of using event data to discover actual workflows, implementation barriers and tool selection criteria.'],
    ['از میان شش محور، موضوع مورد نظر را انتخاب کنید و پاسخ پرسش‌هایش را کنار هم ببینید. پنج محور در پرسشنامهٔ هر سال تکرار می‌شوند؛ پرسش‌های هوش مصنوعی از گزارش فرایند ایران ۱۴۰۲ اضافه شده‌اند.', 'Choose one of six topics to compare its question responses. Five core topics recur in the annual questionnaire; AI questions were introduced in the 1402 Iran Process Report.'],
    ['پرسش‌های هوش مصنوعی از گزارش فرایند ایران ۱۴۰۲ به پرسشنامه اضافه شده‌اند.', 'AI questions were introduced in the 1402 Iran Process Report.'],
    ['پرسش‌های متداول', 'Frequently asked questions'],
    ['بخش‌های گزارش فرایند ایران', 'Iran Process Report sections'],
    ['دربارهٔ گزارش فرایند ایران | گزارش فرایند ایران', 'About the Iran Process Report | Iran Process Report'],
    ['گزارش §1 | گزارش فرایند ایران', 'Report §1 | Iran Process Report'],
    ['گزارش‌ها و رونمایی‌ها | گزارش فرایند ایران', 'Reports and launch events | Iran Process Report'],
    ['گزارش فرایند ایران.', 'Iran Process Report.'],
    ['وضعیت مدیریت فرایند در سازمان‌های ایرانی', 'The state of process management in Iranian organizations'],
    ['گزارش فرایند ایران | وضعیت مدیریت فرایند در سازمان‌های ایرانی', 'Iran Process Report | The state of process management in Iranian organizations'],
    ['برای خواندن جزئیات و سنجیدن نتیجه‌ها، دفترچهٔ همان دوره و نمودارهای پرسش‌به‌پرسش را کنار هم ببینید.', 'To explore the details and assess the findings, compare each edition’s booklet with its question-level charts.']
  ];
  pairs.forEach(([fa, en]) => window.IPR_EN[I.norm(fa).key] = I.norm(en).key);
  C.hero.overline = 'گزارش فرایند ایران';
  C.about.lead = pairs[1][0];
  C.about.body = pairs.slice(2, 8).map(pair => pair[0]);
  C.about.facts.find(f => f.q.includes('چه موضوع')).a = 'پنج محور تکرارشونده عبارت‌اند از تعهد و علاقه‌مندی، سرمایه‌گذاری، ابزارهای مدیریت فرایند، تحول سازمانی و فرایندکاوی. پرسش‌های هوش مصنوعی از گزارش فرایند ایران ۱۴۰۲ به پرسشنامه اضافه شده‌اند.';
  window.IPR_EN[I.norm(C.about.facts.find(f => f.q.includes('چه موضوع')).a).key] = 'The five recurring topics are commitment and interest, investment, process management tools, organizational transformation and process mining. AI questions were introduced in the §1 Iran Process Report.';
})();

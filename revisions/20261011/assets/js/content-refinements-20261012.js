/* October review: editorial content shared by both languages. */
(() => {
 const C=window.IPR_CONTENT,I=window.IPR_I18N;
 const pairs=[
 ['وضعیت بلوغ مدیریت فرایند','Process management maturity'],
 ['در سازمان‌های ایرانی','in Iranian organizations'],
 ['پیمایش سالانهٔ گزارش فرایند ایران، تصویری از وضعیت بلوغ مدیریت فرایند در سازمان‌های ایرانی را از نگاه مدیران و کارشناسان و در پنج دورهٔ ۱۴۰۰ تا ۱۴۰۴ نشان می‌دهد.','The Iran Process Report annual survey presents process management maturity in Iranian organizations through managers’ and experts’ experience across five editions, from 1400 to 1404.'],
 ['سازمان‌ها برای برنامه‌ریزی و بهبود، به تصویری روشن از جایگاه خود نیاز دارند؛ گزارش فرایند ایران، وضعیت بلوغ مدیریت فرایند در سازمان‌های ایرانی را در پنج دورهٔ پیمایش دنبال می‌کند.','Organizations need a clear view of where they stand to plan and improve. The Iran Process Report follows process management maturity in Iranian organizations across five survey editions.'],
 ['سازمان‌هایی که در مدیریت فرایند سرمایه‌گذاری می‌کنند، همواره با این پرسش روبه‌رو هستند که جایگاهشان در مقایسه با سایر سازمان‌ها کجاست. میزان سرمایه‌گذاری دیگران، ابزارهای مورد استفاده و نتایج به‌دست‌آمده، اطلاعاتی است که ارزیابی وضعیت سازمان و برنامه‌ریزی برای آینده را دقیق‌تر می‌کند.','Organizations investing in process management need to know where they stand compared with their peers. Understanding others’ investment, tools and results supports a more informed assessment and better planning.'],
 ['در سطح جهانی، BPTrends سال‌هاست با نظرسنجی دوره‌ای از متخصصان و مدیران و انتشار گزارش «وضعیت مدیریت فرایند»، به این نیاز پاسخ می‌دهد. با این حال، تفاوت ساختار، بودجه، ابزارها و چالش‌های سازمان‌های ایرانی، نیاز به مرجعی بومی را روشن می‌کند.','Internationally, BPTrends has addressed this need for years through periodic surveys of specialists and managers and its State of Business Process Management reports. Differences in the structures, budgets, tools and challenges of Iranian organizations make local evidence essential.'],
 ['شرکت بهین‌سازان فرایند امین (بهفا) در سال ۱۴۰۰، گزارش فرایند ایران را برای پاسخ به این خلأ بنیان نهاد. اکنون حاصل پنج دوره پیمایش با مشارکت متخصصان و مدیران سازمان‌های کشور، تصویری مستند از وضعیت مدیریت فرایند در ایران و روند تحولات آن ارائه می‌دهد.','Behinsazan Farayand Amin (Behfa) established the Iran Process Report in 1400 to address this gap. Five editions, drawing on specialists and managers across the country, now document process management practices in Iran and how they have changed.'],
 ['مدیران با مطالعهٔ این گزارش می‌توانند جایگاه سازمان خود را در میان سازمان‌های کشور بهتر بشناسند و مسیر بهبود را آگاهانه‌تر ترسیم کنند. پنج محور ثابت، تعهد و علاقه‌مندی، سرمایه‌گذاری، ابزارها، تحول و بهبود، و فرایندکاوی را بررسی می‌کنند؛ هوش مصنوعی نیز از سال ۱۴۰۲ موضوع ویژهٔ پژوهش بوده است.','Managers can use this report to understand their organization’s position among peers and plan improvement more deliberately. Five recurring topics cover commitment and interest, investment, tools, transformation and improvement, and process mining. AI has been a special research topic since 1402.'],
 ['هوش مصنوعی: کاربرد هوش مصنوعی در تحلیل، طراحی، اجرا، پایش و بهبود فرایندها را بررسی می‌کند؛ این موضوع ویژه از سال ۱۴۰۲ به پرسشنامه اضافه شده است.','Artificial intelligence: examines AI use in process analysis, design, execution, monitoring and improvement. This special topic was introduced in the 1402 questionnaire.'],
 ['نتیجه‌ها بازتاب تجربهٔ مدیران و کارشناسانی است که در هر دوره مشارکت کرده‌اند. سمت، تحصیلات و اندازهٔ سازمان، زاویهٔ نگاه آنان به حمایت مدیریتی، منابع و ابزارها را شکل می‌دهد؛ بنابراین شناخت این ترکیب، بخشی از شناخت خود یافته‌هاست.','Results reflect the experience of the managers and specialists who participated in each edition. Their roles, education and organization size shape their view of management support, resources and tools. Understanding this mix helps put the findings in context.'],
 ['تصاویر رویداد رونمایی','Launch event photographs'],
 ['تصاویر و شرح رویداد از بهفالب','Event photographs and details from BehfaLab'],
 ['رونمایی گزارش ۱۴۰۱ · ۱۸ مهر ۱۴۰۲','1401 report launch · 18 Mehr 1402'],
 ['رونمایی گزارش ۱۴۰۲ · ۱۵ مهر ۱۴۰۳ · سازمان ملی بهره‌وری','1402 report launch · 15 Mehr 1403 · National Productivity Organization'],
 ['رونمایی گزارش ۱۴۰۳ · ۶ آبان ۱۴۰۴ · هتل اسپیناس خلیج فارس','1403 report launch · 6 Aban 1404 · Espinas Persian Gulf Hotel']
 ];
 pairs.forEach(([fa,en])=>window.IPR_EN[I.norm(fa).key]=I.norm(en).key);
 C.hero.titleLine1=pairs[0][0];C.hero.titleLine2=pairs[1][0];C.hero.lead=pairs[2][0];
 C.about.lead=pairs[3][0];
 C.projectIntro=pairs.slice(4,8).map(p=>p[0]);
 // Keep the existing five topic descriptions and add the special AI topic.
 C.about.body=[C.projectIntro[1]+' '+C.projectIntro[2],...C.about.body.slice(1),pairs[8][0]];
 window.IPR_EN[I.norm(C.about.body[0]).key]=I.norm(pairs[5][1]+' '+pairs[6][1]).key;
 C.profile.context=pairs[9][0];
 const type=C.profile.groups.find(group=>group.id==='type');
 type.data['1401']={n:null,counts:null,missing:true};
 type.data['1402']={n:808,counts:{'دولتی و حاکمیتی':746,'عمومی غیردولتی':0,'خصوصی':62,'سایر':0}};
 type.note='';
 C.profile.context='تنوع سمت، تحصیلات و اندازهٔ سازمان، زاویهٔ نگاه مشارکت‌کنندگان به منابع، ابزارها و حمایت مدیریتی را شکل می‌دهد. شناخت این ترکیب، بخشی از تفسیر یافته‌هاست.';
 window.IPR_EN[I.norm(C.profile.context).key]='Participants’ roles, education and organization size shape their view of resources, tools and management support. Understanding this mix helps interpret the findings.';
 C.story.lead=C.about.lead;
 C.story.sections[0].p=C.projectIntro.slice(0,3);
 C.story.sections.find(s=>s.h.includes('پنج محور')).list.push(pairs[8][0]);
 C.eventPhotos={
  '1401':{caption:pairs[12][0],images:['assets/events/1401-1.webp','assets/events/1401-2.webp']},
  '1402':{caption:pairs[13][0],images:['assets/events/1402-1.webp','assets/events/1402-2.webp']},
  '1403':{caption:pairs[14][0],images:['assets/events/1403-1.webp','assets/events/1403-2.webp']}
 };
 document.querySelector('meta[property="og:title"]').content='گزارش فرایند ایران | وضعیت بلوغ مدیریت فرایند در سازمان‌های ایرانی';
 window.IPR_EN[I.norm('گزارش فرایند ایران | وضعیت بلوغ مدیریت فرایند در سازمان‌های ایرانی').key]='Iran Process Report | Process management maturity in Iranian organizations';
})();

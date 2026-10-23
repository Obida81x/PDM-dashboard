/**
 * وصف كل ما يمكن تعديله في الموقع (النصوص، الأرقام، الصور…).
 * كل قسم = path داخل مستند الموقع + قائمة حقول. لو أضفت نصاً جديداً بالموقع، أضف حقله هنا وبيظهر بالوحة تلقائياً.
 */
const f = (type) => (key, label, o = {}) => ({ key, label, type, ...o });
export const l = f('l');       // نص بلغتين (سطر)
export const la = f('la');     // نص بلغتين (فقرة)
export const ll = f('ll');     // قائمة أسطر بلغتين
export const lla = f('lla');   // قائمة فقرات بلغتين
export const t = f('t');       // نص عادي (رابط، إيميل، رقم…)
export const n = f('n');       // رقم
export const img = f('img');   // صورة
export const sel = f('sel');   // اختيار
export const group = (key, label, fields, o = {}) => ({ key, label, type: 'group', fields, ...o });
export const list = (key, label, fields, o = {}) => ({ key, label, type: 'list', fields, ...o });
export const tl = f('tl');     // قائمة نصوص عادية

export const ICONS = ['code', 'pen', 'megaphone', 'chart', 'target', 'diamond', 'trend', 'eye', 'check', 'mail', 'phone', 'pin'].map((v) => ({ value: v, label: v }));
export const ARTS = [
  { value: 'laptop', label: 'لابتوب' }, { value: 'phones', label: 'جوالات' }, { value: 'dash', label: 'لوحة بيانات' },
  { value: 'finance', label: 'مالية' }, { value: 'brand', label: 'هوية' }, { value: 'app', label: 'تطبيق' },
];
export const CATEGORIES = [
  { value: 'web', label: 'تطوير المواقع' }, { value: 'uiux', label: 'تصميم UI/UX' },
  { value: 'marketing', label: 'التسويق الرقمي' }, { value: 'branding', label: 'الهوية والعلامة' },
];

const stat = (key, label) => list(key, label, [n('to', 'الرقم'), t('prefix', 'قبل الرقم (مثل +)', { ltr: true }), t('suffix', 'بعد الرقم (مثل % أو +)', { ltr: true }), l('label', 'الوصف')], { itemTitle: (s) => `${s.prefix || ''}${s.to}${s.suffix || ''}`, makeItem: () => ({ to: 0, prefix: '', suffix: '', label: { ar: '', en: '' } }) });
const numOnly = (key, label, min, max) => list(key, label, [n('to', 'الرقم'), t('prefix', 'قبل الرقم', { ltr: true }), t('suffix', 'بعد الرقم', { ltr: true })], { itemTitle: (s) => `${s.prefix || ''}${s.to}${s.suffix || ''}`, min, max, fixed: true, makeItem: () => ({ to: 0, prefix: '', suffix: '' }) });
export { stat, numOnly };


/* ───────────────── أدوات بناء الأقسام (نظام البطاقات) ───────────────── */
/** قسم رئيسي = بطاقة بالصفحة الأولى. لو فيه بطاقة وحدة بيفتح عليها مباشرة */
export const section = (id, title, desc, icon, cards) => ({ id, title, desc, icon, cards });
/** صفحة تعديل حقول. extra = مسارات إضافية تنعدّل بنفس الصفحة */
export const form = (id, title, desc, path, fields, extra = []) => ({ kind: 'form', id, title, desc, icon: 'edit', parts: [{ path, fields }, ...extra] });
/** قائمة عناصر: كل عنصر بطاقة تفتح صفحته. paths+keys = مصفوفات متوازية تُدمج بعنصر واحد */
export const coll = (id, title, desc, o) => ({ kind: 'collection', id, title, desc, icon: 'layers', ...o });
export const link = (id, title, desc, to, icon = 'external') => ({ kind: 'link', id, title, desc, to, icon });

const heroF = [l('eyebrow', 'العنوان الصغير'), ll('title', 'العنوان الرئيسي', { hint: 'السطر الثاني يظهر بلون مميز.' }), la('desc', 'الوصف'), l('cta', 'نص الزر الأساسي'), l('watch', 'نص الزر الثاني')];

/* ─────────── محتوى الموقع (القائمة العلوية غير قابلة للتعديل من اللوحة) ─────────── */
export const CONTENT_HUB = [
  section('hero', 'الواجهة الرئيسية', 'العنوان والوصف والأزرار بأول الصفحة. الصور المتحركة من صفحة «السلايدر».', 'star', [
    form('main', 'نصوص الواجهة', '', ['texts', 'hero'], heroF),
  ]),
  section('services', 'الخدمات', 'كل خدمة بطاقة: بطاقتها أعلى القسم وتفاصيلها.', 'layers', [
    coll('list', 'الخدمات', '', {
      noun: 'الخدمة', addLabel: 'إضافة خدمة', listTitle: 'الخدمات',
      head: { title: 'نصوص عامة بقسم الخدمات', path: ['texts'], fields: [l('learnMore', 'نص زر «اعرف المزيد»')] },
      paths: [['texts', 'serviceCards'], ['texts', 'serviceRows']], keys: ['card', 'row'],
      fields: [
        group('card', 'بطاقة الخدمة (أعلى القسم)', [l('title', 'العنوان'), la('desc', 'الوصف'), sel('icon', 'الأيقونة', { options: ICONS })]),
        group('row', 'تفاصيل الخدمة (الصف الكامل)', [l('label', 'التسمية الصغيرة'), l('title', 'العنوان'), la('desc', 'الوصف', { rows: 4 }), lla('items', 'النقاط (✓)'), sel('art', 'الرسمة', { options: ARTS })]),
      ],
      itemTitle: (it) => it.card?.title?.ar || it.row?.label?.ar, itemSub: (it) => it.row?.title?.ar,
      makeItem: () => ({ card: { title: { ar: '', en: '' }, desc: { ar: '', en: '' }, icon: 'code' }, row: { label: { ar: '', en: '' }, title: { ar: '', en: '' }, desc: { ar: '', en: '' }, items: [], art: 'laptop' } }),
    }),
  ]),
  section('portfolio', 'الأعمال', 'عناوين وفلاتر وأرقام قسم الأعمال. المشاريع نفسها من صفحة «المشاريع».', 'folder', [
    form('texts', 'عناوين ونصوص القسم', 'العنوان والوصف والأزرار.', ['texts', 'portfolio'], [
      l('eyebrow', 'العنوان الصغير'), ll('title', 'العنوان الرئيسي'), la('desc', 'الوصف'),
      l('exploreLabel', 'عنوان «استكشف أعمالنا»'), la('exploreDesc', 'وصفه'), l('viewProject', 'نص «عرض المشروع»'), l('caseLabel', 'عنوان «دراسة حالة مميزة»'), l('caseBtn', 'زر دراسة الحالة'),
    ]),
    form('filters', 'الفلاتر والتصنيفات', 'أسماء الفلاتر وتسميات البطاقات.', ['texts', 'portfolio'], [
      group('filters', 'أسماء الفلاتر', [l('all', 'الكل'), l('web', 'تطوير المواقع'), l('uiux', 'UI/UX'), l('marketing', 'التسويق'), l('branding', 'الهوية')]),
      group('categories', 'أسماء التصنيفات على البطاقات', [l('web', 'تطوير المواقع'), l('uiux', 'UI/UX'), l('marketing', 'التسويق'), l('branding', 'الهوية')]),
    ]),
    form('numbers', 'الأرقام المتحركة', 'مشروع منجز / عميل سعيد / سنوات خبرة.', ['texts', 'portfolio'], [ll('stats', 'أسماء الأرقام الثلاثة')], [{ path: ['numbers'], fields: [numOnly('portfolioStats', 'قيم الأرقام (3)', 3, 3)] }]),
    link('projects', 'المشاريع', 'إضافة وتعديل وحذف المشاريع وصورها.', '/projects', 'folder'),
  ]),
  section('about', 'من نحن', 'المقدمة، من نحن، المهمة والرؤية، القيم، الفريق والأرقام.', 'users', [
    form('intro', 'المقدمة', '', ['texts', 'about'], [l('eyebrow', 'العنوان الصغير'), ll('title', 'العنوان الرئيسي'), la('desc', 'الوصف'), l('story', 'زر «قصتنا»'), l('watchVideo', 'زر الفيديو')]),
    form('who', 'من نحن', '', ['texts', 'about'], [l('whoLabel', 'التسمية'), l('whoTitle', 'العنوان'), la('whoDesc', 'الوصف'), l('moreAbout', 'رابط «اعرف المزيد عنا»')]),
    form('mv', 'المهمة والرؤية', '', ['texts', 'about'], [group('mission', 'مهمتنا', [l('title', 'العنوان'), la('desc', 'الوصف')]), group('vision', 'رؤيتنا', [l('title', 'العنوان'), la('desc', 'الوصف')])]),
    form('values', 'قيمنا', '', ['texts', 'about'], [group('values', 'قيمنا', [l('title', 'العنوان'), ll('items', 'القيم')])]),
    form('team', 'الفريق', '', ['texts', 'about'], [l('teamLabel', 'التسمية'), ll('teamTitle', 'العنوان'), la('teamDesc', 'الوصف'), l('meetTeam', 'رابط «تعرّف على الفريق»')]),
    form('numbers', 'الأرقام المتحركة', 'أسماء وقيم الأرقام الأربعة.', ['texts', 'about'], [ll('stats', 'أسماء الأرقام الأربعة')], [{ path: ['numbers'], fields: [numOnly('aboutStats', 'قيم الأرقام (4)', 4, 4)] }]),
  ]),
  section('contact', 'التواصل', 'عناوين القسم والنموذج والخريطة. الإيميل والهاتف من «معلومات التواصل».', 'mail', [
    form('intro', 'العناوين', '', ['texts', 'contact'], [l('eyebrow', 'العنوان الصغير'), ll('title', 'العنوان الرئيسي'), la('desc', 'الوصف')]),
    form('cards', 'بطاقات التواصل', 'البريد والهاتف والمكتب (النصوص فقط).', ['texts', 'contact'], [
      group('email', 'بطاقة البريد', [l('label', 'العنوان'), l('note', 'الملاحظة')]),
      group('phone', 'بطاقة الهاتف', [l('label', 'العنوان'), l('note', 'أوقات الدوام')]),
      group('office', 'بطاقة المكتب', [l('label', 'العنوان'), l('value', 'العنوان الفعلي'), l('note', 'الملاحظة')]),
    ]),
    form('form', 'نموذج التواصل', 'عناوين الحقول والزر.', ['texts', 'contact'], [
      l('formLabel', 'تسمية النموذج'), ll('formTitle', 'عنوان النموذج'), la('formDesc', 'وصف النموذج'),
      l('name', 'حقل الاسم'), l('namePh', 'مثال الاسم'), l('mail', 'حقل البريد'), l('mailPh', 'مثال البريد'), l('subject', 'حقل الموضوع'), l('subjectPh', 'نص «اختر موضوعاً»'),
      lla('subjects', 'خيارات الموضوع'), l('message', 'حقل الرسالة'), l('messagePh', 'مثال الرسالة'), l('send', 'زر الإرسال'),
    ]),
    form('msgs', 'رسائل النموذج', 'رسائل الخطأ والنجاح.', ['texts', 'contact'], [l('required', 'خطأ: حقل مطلوب'), l('invalidMail', 'خطأ: بريد غير صالح'), l('success', 'رسالة النجاح')]),
    form('loc', 'الموقع على الخريطة', '', ['texts', 'contact'], [l('locLabel', 'التسمية'), l('locTitle', 'العنوان'), la('locDesc', 'الوصف'), l('directions', 'زر الاتجاهات')]),
    link('info', 'معلومات التواصل', 'الإيميل والهاتف وروابط السوشيال.', '/contact-info', 'phone'),
  ]),
  section('cta', 'قسم «جاهز لتبدأ؟»', 'الشريط الأخير قبل الفوتر.', 'play', [
    form('main', 'نصوص القسم', '', ['texts', 'cta'], [l('label', 'العنوان الصغير'), ll('title', 'العنوان'), la('text', 'النص'), l('btn', 'الزر')]),
  ]),
  section('footer', 'الفوتر', 'النصوص أسفل الموقع.', 'menu', [
    form('main', 'نصوص الفوتر', '', ['texts', 'footer'], [ll('links', 'الكلمات الأربع'), l('rights', 'حقوق النشر'), l('top', 'زر «العودة للأعلى»')]),
  ]),
  section('pages', 'صفحة المشروع و404', 'عناوين صفحة تفاصيل المشروع وصفحة الخطأ.', 'globe', [
    form('labels', 'عناوين صفحة المشروع', '', ['texts', 'pages'], [
      l('backProjects', 'كل المشاريع'), l('home', 'الرئيسية'), l('client', 'العميل'), l('year', 'السنة'), l('duration', 'المدة'), l('services', 'الخدمات'), l('overview', 'نظرة عامة'), l('challenge', 'التحدي'), l('solution', 'الحل'),
      l('results', 'النتائج'), l('features', 'أبرز المزايا'), l('tools', 'الأدوات'), l('gallery', 'لمحات من المشروع'), l('prev', 'المشروع السابق'), l('next', 'المشروع التالي'),
      l('moreWork', 'المزيد من أعمالنا'), l('startSimilar', 'ابدأ مشروعاً مشابهاً'), l('visitSite', 'زيارة الموقع'), l('storyCtaBtn', 'زر التواصل'), l('viewWork', 'زر شاهد أعمالنا'),
    ]),
    form('states', 'التحميل والأخطاء', '', ['texts', 'pages'], [l('loading', 'جاري التحميل'), l('loadError', 'خطأ التحميل'), l('retry', 'إعادة المحاولة')]),
    form('nf', 'صفحة 404', '', ['texts', 'pages'], [ll('notFoundTitle', 'العنوان'), la('notFoundDesc', 'الوصف'), l('goHome', 'زر العودة للرئيسية')]),
  ]),
  section('ui', 'نصوص الواجهة العامة', 'نصوص صغيرة تظهر في أماكن متفرقة.', 'gear', [
    form('main', 'النصوص', '', ['texts', 'ui'], [l('theme', 'تبديل المظهر'), l('menu', 'القائمة'), l('close', 'إغلاق')]),
  ]),
];

/* ─────────── صفحة قصتنا ─────────── */
export const STORY_HUB = [
  section('hero', 'مقدمة الصفحة', 'العنوان والفقرة التمهيدية.', 'star', [form('main', 'المقدمة', '', ['story', 'hero'], [l('eyebrow', 'العنوان الصغير'), ll('title', 'العنوان'), la('lead', 'الفقرة التمهيدية', { rows: 4 })])]),
  section('origin', 'كيف بدأنا', 'قصة البداية بفقرات.', 'book', [form('main', 'كيف بدأنا', '', ['story', 'origin'], [l('label', 'التسمية'), l('title', 'العنوان'), lla('paragraphs', 'الفقرات', { rows: 5 })])]),
  section('quote', 'الاقتباس', 'الاقتباس البارز وصاحبه.', 'type', [form('main', 'الاقتباس', '', ['story', 'quote'], [la('text', 'نص الاقتباس'), l('author', 'صاحب الاقتباس')])]),
  section('timeline', 'التسلسل الزمني', 'كل محطة بطاقة: أضف أو احذف أو رتّب المحطات.', 'clock', [
    coll('list', 'المحطات', '', {
      noun: 'المحطة', addLabel: 'إضافة محطة', listTitle: 'المحطات (من الأقدم للأحدث)',
      head: { title: 'عنوان القسم', path: ['story', 'timeline'], fields: [l('label', 'التسمية'), ll('title', 'العنوان')] },
      paths: [['story', 'timeline', 'items']],
      fields: [t('year', 'السنة', { ltr: true }), l('title', 'العنوان'), la('text', 'الوصف', { rows: 4 })],
      itemTitle: (i) => i.title?.ar, itemSub: (i) => i.text?.ar, getBadge: (i) => i.year,
      makeItem: () => ({ year: String(new Date().getFullYear()), title: { ar: '', en: '' }, text: { ar: '', en: '' } }),
    }),
  ]),
  section('values', 'القيم', 'كل قيمة بطاقة.', 'diamond', [
    coll('list', 'القيم', '', {
      noun: 'القيمة', addLabel: 'إضافة قيمة', listTitle: 'القيم',
      head: { title: 'عنوان القسم', path: ['story', 'values'], fields: [l('label', 'التسمية'), ll('title', 'العنوان')] },
      paths: [['story', 'values', 'items']],
      fields: [sel('icon', 'الأيقونة', { options: ICONS }), l('title', 'الاسم'), la('text', 'الوصف')],
      itemTitle: (i) => i.title?.ar, itemSub: (i) => i.text?.ar,
      makeItem: () => ({ icon: 'pen', title: { ar: '', en: '' }, text: { ar: '', en: '' } }),
    }),
  ]),
  section('numbers', 'PDM بالأرقام', 'الأرقام المتحركة بصفحة القصة.', 'chart', [form('main', 'الأرقام', '', ['story', 'numbers'], [l('label', 'العنوان'), stat('items', 'الأرقام')])]),
  section('vision', 'نظرتنا للمستقبل', 'الخاتمة.', 'eye', [form('main', 'النظرة للمستقبل', '', ['story', 'vision'], [l('label', 'التسمية'), l('title', 'العنوان'), la('text', 'النص', { rows: 5 })])]),
];

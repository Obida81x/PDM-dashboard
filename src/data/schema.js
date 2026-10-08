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
export { stat };

/* ─────────── صفحات الموقع (نصوص الصفحة الرئيسية وبقية الأقسام) ─────────── */
export const CONTENT_SECTIONS = [
  { id: 'nav', title: 'القائمة العلوية', desc: 'أسماء الروابط في شريط التنقل.', path: ['texts', 'nav'], fields: [
    l('home', 'الرئيسية'), l('services', 'خدماتنا'), l('portfolio', 'أعمالنا'), l('about', 'من نحن'), l('contact', 'تواصل معنا'), l('getStarted', 'زر «ابدأ الآن»'),
  ] },
  { id: 'hero', title: 'الواجهة الرئيسية (النصوص)', desc: 'العنوان والوصف والأزرار في أول الصفحة. الصور المتحركة بصفحة «السلايدر».', path: ['texts', 'hero'], fields: [
    l('eyebrow', 'العنوان الصغير'), ll('title', 'العنوان الرئيسي', { hint: 'السطر الثاني يظهر بلون مميز.' }), la('desc', 'الوصف'), l('cta', 'نص الزر الأساسي'), l('watch', 'نص الزر الثاني'),
  ] },
  { id: 'services', title: 'الخدمات', desc: 'بطاقات الخدمات وتفاصيل كل خدمة.', path: ['texts'], fields: [
    list('serviceCards', 'بطاقات الخدمات (أعلى القسم)', [l('title', 'العنوان'), la('desc', 'الوصف'), sel('icon', 'الأيقونة', { options: ICONS })], { itemTitle: (c) => c.title?.ar, makeItem: () => ({ title: { ar: '', en: '' }, desc: { ar: '', en: '' }, icon: 'code' }) }),
    list('serviceRows', 'تفاصيل كل خدمة', [l('label', 'التسمية الصغيرة'), l('title', 'العنوان'), la('desc', 'الوصف', { rows: 4 }), lla('items', 'النقاط (✓)', {}), sel('art', 'الرسمة', { options: ARTS })], { itemTitle: (c) => c.label?.ar, makeItem: () => ({ label: { ar: '', en: '' }, title: { ar: '', en: '' }, desc: { ar: '', en: '' }, items: [], art: 'laptop' }) }),
    l('learnMore', 'نص زر «اعرف المزيد»'),
  ] },
  { id: 'portfolio', title: 'قسم الأعمال (النصوص)', desc: 'عناوين قسم الأعمال والفلاتر. المشاريع نفسها من صفحة «المشاريع».', path: ['texts', 'portfolio'], fields: [
    l('eyebrow', 'العنوان الصغير'), ll('title', 'العنوان الرئيسي'), la('desc', 'الوصف'), ll('stats', 'أسماء الأرقام الثلاثة', { hint: 'مشروع منجز / عميل سعيد / سنوات خبرة' }),
    l('exploreLabel', 'عنوان «استكشف أعمالنا»'), la('exploreDesc', 'وصفه'),
    group('filters', 'أسماء الفلاتر', [l('all', 'الكل'), l('web', 'تطوير المواقع'), l('uiux', 'UI/UX'), l('marketing', 'التسويق'), l('branding', 'الهوية')]),
    group('categories', 'أسماء التصنيفات على البطاقات', [l('web', 'تطوير المواقع'), l('uiux', 'UI/UX'), l('marketing', 'التسويق'), l('branding', 'الهوية')]),
    l('viewProject', 'نص «عرض المشروع»'), l('caseLabel', 'عنوان «دراسة حالة مميزة»'), l('caseBtn', 'زر دراسة الحالة'),
  ] },
  { id: 'about', title: 'من نحن', desc: 'قسم «من نحن» كاملاً: الرسالة والرؤية والقيم والفريق.', path: ['texts', 'about'], fields: [
    l('eyebrow', 'العنوان الصغير'), ll('title', 'العنوان الرئيسي'), la('desc', 'الوصف'), l('story', 'زر «قصتنا»'), l('watchVideo', 'زر الفيديو'),
    l('whoLabel', 'تسمية «من نحن»'), l('whoTitle', 'عنوان «من نحن»'), la('whoDesc', 'وصف «من نحن»'), l('moreAbout', 'رابط «اعرف المزيد عنا»'),
    group('mission', 'مهمتنا', [l('title', 'العنوان'), la('desc', 'الوصف')]),
    group('vision', 'رؤيتنا', [l('title', 'العنوان'), la('desc', 'الوصف')]),
    group('values', 'قيمنا', [l('title', 'العنوان'), ll('items', 'القيم')]),
    l('teamLabel', 'تسمية «فريقنا»'), ll('teamTitle', 'عنوان الفريق'), la('teamDesc', 'وصف الفريق'), l('meetTeam', 'رابط «تعرّف على الفريق»'),
    ll('stats', 'أسماء الأرقام الأربعة', { hint: 'مشروع منجز / عميل سعيد / سنوات خبرة / التزام بنجاحك' }),
  ] },
  { id: 'numbers', title: 'الأرقام والإحصائيات', desc: 'الأرقام المتحركة في قسم الأعمال وقسم من نحن.', path: ['numbers'], fields: [
    numOnly('portfolioStats', 'أرقام قسم الأعمال (3)', 3, 3), numOnly('aboutStats', 'أرقام قسم من نحن (4)', 4, 4),
  ] },
  { id: 'contact', title: 'التواصل (النصوص)', desc: 'عناوين قسم التواصل والنموذج. الإيميل والهاتف من صفحة «معلومات التواصل».', path: ['texts', 'contact'], fields: [
    l('eyebrow', 'العنوان الصغير'), ll('title', 'العنوان الرئيسي'), la('desc', 'الوصف'),
    group('email', 'بطاقة البريد', [l('label', 'العنوان'), l('note', 'الملاحظة')]),
    group('phone', 'بطاقة الهاتف', [l('label', 'العنوان'), l('note', 'أوقات الدوام')]),
    group('office', 'بطاقة المكتب', [l('label', 'العنوان'), l('value', 'العنوان الفعلي'), l('note', 'الملاحظة')]),
    l('formLabel', 'تسمية النموذج'), ll('formTitle', 'عنوان النموذج'), la('formDesc', 'وصف النموذج'),
    l('name', 'حقل الاسم'), l('namePh', 'مثال الاسم'), l('mail', 'حقل البريد'), l('mailPh', 'مثال البريد'), l('subject', 'حقل الموضوع'), l('subjectPh', 'نص «اختر موضوعاً»'),
    lla('subjects', 'خيارات الموضوع'), l('message', 'حقل الرسالة'), l('messagePh', 'مثال الرسالة'), l('send', 'زر الإرسال'),
    l('required', 'خطأ: حقل مطلوب'), l('invalidMail', 'خطأ: بريد غير صالح'), l('success', 'رسالة النجاح'),
    l('locLabel', 'تسمية الموقع'), l('locTitle', 'عنوان الموقع'), la('locDesc', 'وصف الموقع'), l('directions', 'زر الاتجاهات'),
  ] },
  { id: 'cta', title: 'قسم «جاهز لتبدأ؟»', desc: 'الشريط الأخير قبل الفوتر.', path: ['texts', 'cta'], fields: [l('label', 'العنوان الصغير'), ll('title', 'العنوان'), la('text', 'النص'), l('btn', 'الزر')] },
  { id: 'footer', title: 'الفوتر', desc: 'النصوص أسفل الموقع.', path: ['texts', 'footer'], fields: [ll('links', 'الكلمات الأربع'), l('rights', 'حقوق النشر'), l('top', 'زر «العودة للأعلى»')] },
  { id: 'pages', title: 'نصوص صفحة المشروع والصفحات الأخرى', desc: 'أسماء العناوين في صفحة تفاصيل المشروع وصفحة 404.', path: ['texts', 'pages'], fields: [
    l('loading', 'جاري التحميل'), l('loadError', 'خطأ التحميل'), l('retry', 'إعادة المحاولة'), l('backProjects', 'كل المشاريع'), l('home', 'الرئيسية'),
    l('client', 'العميل'), l('year', 'السنة'), l('duration', 'المدة'), l('services', 'الخدمات'), l('overview', 'نظرة عامة'), l('challenge', 'التحدي'), l('solution', 'الحل'),
    l('results', 'النتائج'), l('features', 'أبرز المزايا'), l('tools', 'الأدوات'), l('gallery', 'لمحات من المشروع'), l('prev', 'المشروع السابق'), l('next', 'المشروع التالي'),
    l('moreWork', 'المزيد من أعمالنا'), l('startSimilar', 'ابدأ مشروعاً مشابهاً'), l('visitSite', 'زيارة الموقع'), l('storyCtaBtn', 'زر التواصل'), l('viewWork', 'زر شاهد أعمالنا'),
    ll('notFoundTitle', 'عنوان 404'), la('notFoundDesc', 'وصف 404'), l('goHome', 'زر العودة للرئيسية'),
  ] },
  { id: 'ui', title: 'نصوص الواجهة العامة', desc: 'نصوص صغيرة تظهر في أماكن متفرقة.', path: ['texts', 'ui'], fields: [l('theme', 'تبديل المظهر'), l('menu', 'القائمة'), l('close', 'إغلاق')] },
];

/* ─────────── صفحة قصتنا ─────────── */
export const STORY_SECTIONS = [
  { id: 'hero', title: 'مقدمة الصفحة', path: ['story', 'hero'], fields: [l('eyebrow', 'العنوان الصغير'), ll('title', 'العنوان'), la('lead', 'الفقرة التمهيدية', { rows: 4 })] },
  { id: 'origin', title: 'كيف بدأنا', path: ['story', 'origin'], fields: [l('label', 'التسمية'), l('title', 'العنوان'), lla('paragraphs', 'الفقرات', { rows: 5 })] },
  { id: 'quote', title: 'الاقتباس', path: ['story', 'quote'], fields: [la('text', 'نص الاقتباس'), l('author', 'صاحب الاقتباس')] },
  { id: 'timeline', title: 'التسلسل الزمني', path: ['story', 'timeline'], fields: [
    l('label', 'التسمية'), ll('title', 'العنوان'),
    list('items', 'المحطات (من الأقدم للأحدث)', [t('year', 'السنة', { ltr: true }), l('title', 'العنوان'), la('text', 'الوصف')], { itemTitle: (i) => `${i.year} — ${i.title?.ar || ''}`, makeItem: () => ({ year: String(new Date().getFullYear()), title: { ar: '', en: '' }, text: { ar: '', en: '' } }) }),
  ] },
  { id: 'values', title: 'القيم', path: ['story', 'values'], fields: [
    l('label', 'التسمية'), ll('title', 'العنوان'),
    list('items', 'القيم', [sel('icon', 'الأيقونة', { options: ICONS }), l('title', 'الاسم'), la('text', 'الوصف')], { itemTitle: (i) => i.title?.ar, makeItem: () => ({ icon: 'pen', title: { ar: '', en: '' }, text: { ar: '', en: '' } }) }),
  ] },
  { id: 'numbers', title: 'PDM بالأرقام', path: ['story', 'numbers'], fields: [l('label', 'العنوان'), stat('items', 'الأرقام')] },
  { id: 'vision', title: 'نظرتنا للمستقبل', path: ['story', 'vision'], fields: [l('label', 'التسمية'), l('title', 'العنوان'), la('text', 'النص', { rows: 5 })] },
];

import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { useUI } from '../context/UIContext';
import { ARTS, CATEGORIES, l, la, ll, lla, n, t } from '../data/schema';
import { clone, emptyL, same, sliderImages, slugify } from '../utils';
import SchemaFields from '../components/SchemaEditor';
import SaveBar from '../components/SaveBar';
import Icon from '../components/Icon';
import { CardGrid, HubCard } from '../components/Cards';
import { Card, GalleryField, ImageField, LText, PageHead, Select, TextInput, Toggle } from '../components/Fields';

const blank = () => ({
  id: '', slug: '', title: '', category: 'web', art: 'laptop', cover: '', gallery: [], year: String(new Date().getFullYear()), published: true, inSlider: true,
  client: emptyL(), duration: emptyL(), services: [], summary: emptyL(), overview: [emptyL()], challenge: emptyL(), solution: emptyL(), features: [],
  results: [], tools: [], liveUrl: '', caseStudy: null, order: 9999,
});
const blankCase = () => ({ sub: emptyL(), desc: emptyL(), stat: { to: 0, prefix: '+', suffix: '%', label: emptyL() } });
const resultFields = [n('to', 'الرقم'), t('prefix', 'قبل الرقم', { ltr: true }), t('suffix', 'بعد الرقم', { ltr: true }), l('label', 'الوصف')];
const resultsField = { type: 'list', key: 'results', label: 'نتائج المشروع (أرقام متحركة)', fields: resultFields, itemTitle: (r) => `${r.prefix || ''}${r.to}${r.suffix || ''} ${r.label?.ar || ''}`, makeItem: () => ({ to: 0, prefix: '+', suffix: '%', label: emptyL() }) };

export default function ProjectEdit() {
  const { id, '*': rest = '' } = useParams();
  const part = rest.split('/').filter(Boolean)[0];
  const isNew = id === 'new';
  const nav = useNavigate();
  const { toast } = useUI();
  const [orig, setOrig] = useState(null);
  const [p, setP] = useState(null);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (isNew) { const b = blank(); setOrig(b); setP(b); return; }
    api.getProjects().then((all) => {
      const f = all.find((x) => x.id === id);
      if (!f) { toast('المشروع غير موجود', 'err'); nav('/projects', { replace: true }); return; }
      setOrig(f); setP(clone(f)); setSlugTouched(true);
    }).catch((e) => toast(e.message, 'err'));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!p) return <div className="card state"><span className="spinner" /></div>;
  const dirty = !same(orig, p);
  const set = (k, v) => setP((x) => ({ ...x, [k]: v }));
  const imgs = sliderImages(p);

  const save = async () => {
    if (!p.title.trim()) return toast('اكتب اسم المشروع.', 'err');
    const slug = slugify(p.slug || p.title);
    if (!slug) return toast('اكتب رابط المشروع (slug) بأحرف إنجليزية أو أرقام.', 'err');
    setSaving(true);
    try {
      const body = { ...p, slug, __new: isNew || undefined };
      if (isNew) delete body.id;
      await api.saveProject(body);
      toast('تم حفظ المشروع ✓');
      nav('/projects');
    } catch (e) { toast(e.message, 'err'); setSaving(false); }
  };

  const PARTS = [
    { id: 'basics', icon: 'edit', title: 'الأساسيات', desc: 'الاسم والرابط والتصنيف والملخص والنشر.', meta: p.published === false ? 'مسودة' : 'منشور',
      render: () => (
        <div className="stack">
          <div className="grid2">
            <TextInput label="اسم المشروع" value={p.title} onChange={(v) => { set('title', v); if (!slugTouched && isNew) set('slug', slugify(v)); }} />
            <TextInput label="رابط المشروع (slug)" ltr hint={`الرابط: /projects/${p.slug || '…'}`} value={p.slug} onChange={(v) => { setSlugTouched(true); set('slug', v.toLowerCase().replace(/[^a-z0-9-]/g, '')); }} />
            <Select label="التصنيف" value={p.category} onChange={(v) => set('category', v)} options={CATEGORIES} />
            <TextInput label="السنة" ltr value={p.year} onChange={(v) => set('year', v)} />
          </div>
          <Toggle label="منشور في الموقع" hint="لو مطفي بيبقى مسودة ولا يظهر للزوار ولا بالسلايدر." value={p.published !== false} onChange={(v) => set('published', v)} />
          <LText area label="ملخص قصير (يظهر على البطاقة)" value={p.summary} onChange={(v) => set('summary', v)} />
        </div>
      ) },
    { id: 'images', icon: 'image', title: 'الصور', desc: 'صورة الغلاف ومعرض الصور — بتظهر تلقائياً بسلايدر الصفحة الرئيسية.', meta: imgs.length ? `${imgs.length} صور` : 'بدون صور',
      render: () => (
        <div className="stack">
          <ImageField label="صورة الغلاف" hint="بتظهر على البطاقة وأعلى صفحة المشروع، وكأول صورة بالسلايدر." wide value={p.cover} onChange={(v) => set('cover', v)} />
          <GalleryField label="معرض صور المشروع (لمحات من المشروع)" hint="ارفع كذا صورة دفعة وحدة. كل صورة هون بتنضاف تلقائياً لسلايدر الرئيسية." items={p.gallery} onChange={(v) => set('gallery', v)} />
          <Toggle label="إظهار صور هذا المشروع في سلايدر الصفحة الرئيسية" hint={`مفعّل افتراضياً. حالياً ${imgs.length} صورة (الغلاف + المعرض). بيشتغل لما يكون السلايدر بالوضع التلقائي.`} value={p.inSlider !== false} onChange={(v) => set('inSlider', v)} />
          <Select label="الرسمة المدمجة (بديل لو ما في صورة غلاف)" value={p.art} onChange={(v) => set('art', v)} options={ARTS} />
        </div>
      ) },
    { id: 'info', icon: 'users', title: 'العميل والخدمات', desc: 'العميل والمدة والخدمات المقدمة والرابط الحي.', meta: p.client?.ar || undefined,
      render: () => (
        <div className="stack">
          <div className="grid2"><LText label="العميل" value={p.client} onChange={(v) => set('client', v)} /><LText label="مدة المشروع" value={p.duration} onChange={(v) => set('duration', v)} /></div>
          <SchemaFields fields={[ll('services', 'الخدمات المقدمة')]} value={p} onChange={setP} />
          <TextInput label="رابط الموقع الحي (اختياري)" ltr placeholder="https://" value={p.liveUrl} onChange={(v) => set('liveUrl', v)} />
        </div>
      ) },
    { id: 'story', icon: 'book', title: 'القصة: نظرة عامة والتحدي والحل', desc: 'النصوص الأساسية بصفحة المشروع.', meta: `${p.overview?.length || 0} فقرات`,
      render: () => <SchemaFields fields={[lla('overview', 'نظرة عامة (فقرات)', { rows: 4 }), la('challenge', 'التحدي', { rows: 4 }), la('solution', 'الحل', { rows: 4 })]} value={p} onChange={setP} /> },
    { id: 'features', icon: 'check', title: 'المزايا والأدوات', desc: 'أبرز مزايا المشروع والتقنيات المستخدمة.', meta: `${p.features?.length || 0} مزايا · ${p.tools?.length || 0} أدوات`,
      render: () => <SchemaFields fields={[lla('features', 'أبرز المزايا'), { type: 'tl', key: 'tools', label: 'الأدوات والتقنيات' }]} value={p} onChange={setP} /> },
    { id: 'results', icon: 'chart', title: 'النتائج', desc: 'الأرقام المتحركة اللي بتبيّن أثر المشروع.', meta: `${p.results?.length || 0} نتائج`,
      render: () => <SchemaFields fields={[resultsField]} value={p} onChange={setP} /> },
    { id: 'case', icon: 'star', title: 'دراسة حالة مميزة', desc: 'بطاقة كبيرة أسفل قسم الأعمال بالصفحة الرئيسية.', meta: p.caseStudy ? 'مفعّلة' : 'غير مفعّلة',
      render: () => (
        <div className="stack">
          <Toggle label="اعتبار هذا المشروع دراسة حالة مميزة" hint="الموقع يعرض أول مشروع فيه دراسة حالة." value={!!p.caseStudy} onChange={(v) => set('caseStudy', v ? blankCase() : null)} />
          {p.caseStudy && (<>
            <LText label="العنوان الفرعي" value={p.caseStudy.sub} onChange={(v) => set('caseStudy', { ...p.caseStudy, sub: v })} />
            <LText area label="الوصف" value={p.caseStudy.desc} onChange={(v) => set('caseStudy', { ...p.caseStudy, desc: v })} />
            <SchemaFields fields={[{ type: 'group', key: 'stat', label: 'الرقم البارز', fields: resultFields }]} value={p.caseStudy} onChange={(v) => set('caseStudy', v)} />
          </>)}
        </div>
      ) },
  ];

  const base = `/projects/${id}`;
  const crumbRoot = { to: '/projects', label: 'المشاريع' };
  const name = isNew ? 'مشروع جديد' : (orig.title || 'مشروع');
  const cur = PARTS.find((x) => x.id === part);
  if (part && !cur) return <Navigate to={base} replace />;

  return (
    <>
      {cur ? (
        <>
          <PageHead title={cur.title} desc={cur.desc} crumbs={[crumbRoot, { to: base, label: name }, { label: cur.title }]} actions={<Link className="btn ghost" to={base}><Icon name="right" size={16} />رجوع</Link>} />
          <Card>{cur.render()}</Card>
        </>
      ) : (
        <>
          <PageHead title={name} desc="اختر القسم اللي بدك تعدّله. كل شي بينحفظ مع بعض من زر الحفظ بالأسفل." crumbs={[crumbRoot, { label: name }]} actions={<Link className="btn ghost" to="/projects"><Icon name="right" size={16} />كل المشاريع</Link>} />
          <CardGrid>{PARTS.map((x) => <HubCard key={x.id} to={`${base}/${x.id}`} icon={x.icon} title={x.title} desc={x.desc} meta={x.meta} />)}</CardGrid>
        </>
      )}
      <SaveBar dirty={dirty || isNew} saving={saving} onSave={save} onDiscard={() => (isNew ? nav('/projects') : setP(clone(orig)))} label={isNew ? 'إضافة المشروع' : 'حفظ المشروع'} />
    </>
  );
}

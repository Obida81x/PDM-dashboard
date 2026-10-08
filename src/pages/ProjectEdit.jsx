import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useUI } from '../context/UIContext';
import { ARTS, CATEGORIES, l, la, ll, lla, n, t } from '../data/schema';
import { clone, emptyL, same, slugify } from '../utils';
import SchemaFields from '../components/SchemaEditor';
import SaveBar from '../components/SaveBar';
import Icon from '../components/Icon';
import { Card, Field, ImageField, ListEditor, LText, PageHead, Select, TextInput, Toggle, isImg } from '../components/Fields';

const blank = () => ({
  id: '', slug: '', title: '', category: 'web', art: 'laptop', cover: '', gallery: [], year: String(new Date().getFullYear()), published: true,
  client: emptyL(), duration: emptyL(), services: [], summary: emptyL(), overview: [emptyL()], challenge: emptyL(), solution: emptyL(), features: [],
  results: [], tools: [], liveUrl: '', caseStudy: null, order: 9999,
});
const blankCase = () => ({ sub: emptyL(), desc: emptyL(), stat: { to: 0, prefix: '+', suffix: '%', label: emptyL() } });

const resultFields = [n('to', 'الرقم'), t('prefix', 'قبل الرقم', { ltr: true }), t('suffix', 'بعد الرقم', { ltr: true }), l('label', 'الوصف')];

export default function ProjectEdit() {
  const { id } = useParams();
  const isNew = !id;
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

  return (
    <>
      <PageHead title={isNew ? 'مشروع جديد' : `تعديل: ${orig.title}`} desc="كل حقل هنا بيظهر بصفحة المشروع بالموقع."
        actions={<Link className="btn ghost" to="/projects"><Icon name="right" size={16} />رجوع للمشاريع</Link>} />
      <div className="stack">
        <Card title="الأساسيات">
          <div className="stack">
            <div className="grid2">
              <TextInput label="اسم المشروع" value={p.title} onChange={(v) => { set('title', v); if (!slugTouched && isNew) set('slug', slugify(v)); }} />
              <TextInput label="رابط المشروع (slug)" ltr hint={`الرابط: /projects/${p.slug || '…'}`} value={p.slug} onChange={(v) => { setSlugTouched(true); set('slug', v.toLowerCase().replace(/[^a-z0-9-]/g, '')); }} />
              <Select label="التصنيف" value={p.category} onChange={(v) => set('category', v)} options={CATEGORIES} />
              <TextInput label="السنة" ltr value={p.year} onChange={(v) => set('year', v)} />
            </div>
            <Toggle label="منشور في الموقع" hint="لو مطفي بيبقى مسودة ولا يظهر للزوار." value={p.published !== false} onChange={(v) => set('published', v)} />
            <LText area label="ملخص قصير (يظهر على البطاقة)" value={p.summary} onChange={(v) => set('summary', v)} />
          </div>
        </Card>

        <Card title="الصور" desc="صورة الغلاف بتظهر على البطاقة وأعلى صفحة المشروع. لو تركتها فاضية بيستخدم الموقع الرسمة المدمجة.">
          <div className="stack">
            <ImageField label="صورة الغلاف" wide value={p.cover} onChange={(v) => set('cover', v)} />
            <Select label="الرسمة المدمجة (بديل لو ما في صورة)" value={p.art} onChange={(v) => set('art', v)} options={ARTS} />
            <ListEditor label="معرض الصور (لمحات من المشروع)" items={p.gallery} onChange={(v) => set('gallery', v)} addLabel="إضافة صورة للمعرض" makeItem={() => ''} itemTitle={(g) => (isImg(g) ? 'صورة' : g || 'فارغ')}
              renderItem={(g, up) => (
                <div className="stack">
                  <ImageField value={isImg(g) ? g : ''} onChange={up} />
                  {!isImg(g) && <Select label="أو رسمة مدمجة" value={g || 'laptop'} onChange={up} options={ARTS} />}
                </div>
              )} />
          </div>
        </Card>

        <Card title="التفاصيل">
          <div className="stack">
            <div className="grid2">
              <LText label="العميل" value={p.client} onChange={(v) => set('client', v)} />
              <LText label="مدة المشروع" value={p.duration} onChange={(v) => set('duration', v)} />
            </div>
            <SchemaFields fields={[ll('services', 'الخدمات المقدمة')]} value={p} onChange={setP} />
            <SchemaFields fields={[lla('overview', 'نظرة عامة (فقرات)', { rows: 4 }), la('challenge', 'التحدي', { rows: 4 }), la('solution', 'الحل', { rows: 4 }), lla('features', 'أبرز المزايا')]} value={p} onChange={setP} />
          </div>
        </Card>

        <Card title="النتائج والأدوات">
          <div className="stack">
            <SchemaFields fields={[{ type: 'list', key: 'results', label: 'نتائج المشروع (أرقام متحركة)', fields: resultFields, itemTitle: (r) => `${r.prefix || ''}${r.to}${r.suffix || ''} ${r.label?.ar || ''}`, makeItem: () => ({ to: 0, prefix: '+', suffix: '%', label: emptyL() }) }]} value={p} onChange={setP} />
            <SchemaFields fields={[{ type: 'tl', key: 'tools', label: 'الأدوات والتقنيات' }]} value={p} onChange={setP} />
            <TextInput label="رابط الموقع الحي (اختياري)" ltr placeholder="https://" value={p.liveUrl} onChange={(v) => set('liveUrl', v)} />
          </div>
        </Card>

        <Card title="دراسة حالة مميزة" desc="لو فعّلتها بيظهر المشروع ببطاقة كبيرة أسفل قسم الأعمال (الموقع يعرض أول مشروع فيه دراسة حالة).">
          <Toggle label="اعتبار هذا المشروع دراسة حالة مميزة" value={!!p.caseStudy} onChange={(v) => set('caseStudy', v ? blankCase() : null)} />
          {p.caseStudy && (
            <div className="stack">
              <LText label="العنوان الفرعي" value={p.caseStudy.sub} onChange={(v) => set('caseStudy', { ...p.caseStudy, sub: v })} />
              <LText area label="الوصف" value={p.caseStudy.desc} onChange={(v) => set('caseStudy', { ...p.caseStudy, desc: v })} />
              <SchemaFields fields={[{ type: 'group', key: 'stat', label: 'الرقم البارز', fields: resultFields }]} value={p.caseStudy} onChange={(v) => set('caseStudy', v)} />
            </div>
          )}
        </Card>
      </div>
      <SaveBar dirty={dirty || isNew} saving={saving} onSave={save} onDiscard={() => (isNew ? nav('/projects') : setP(clone(orig)))} label={isNew ? 'إضافة المشروع' : 'حفظ المشروع'} />
    </>
  );
}

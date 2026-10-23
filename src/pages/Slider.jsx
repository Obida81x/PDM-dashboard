import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { api, uid } from '../services/api';
import { useUI } from '../context/UIContext';
import { useSite } from '../hooks/useSite';
import { sliderImages } from '../utils';
import PageShell from '../components/PageShell';
import SliderPreview from '../components/SliderPreview';
import { CollectionView } from '../components/Cards';
import Icon from '../components/Icon';
import { Card, ImageField, LText, NumberInput, PageHead, Select, Toggle } from '../components/Fields';

const ROOT = { to: '/slider', label: 'السلايدر' };

function SliderBody({ ed }) {
  const { toast } = useUI();
  const { '*': rest = '' } = useParams();
  const idxStr = rest.split('/').filter(Boolean)[0];
  const [projects, setProjects] = useState(null);
  const load = () => api.getProjects().then(setProjects).catch(() => setProjects([]));
  useEffect(() => { load(); }, []);

  const s = ed.site.slider;
  const set = (k, v) => ed.setSite({ ...ed.site, slider: { ...s, [k]: v } });

  const auto = useMemo(() => (projects || []).filter((p) => p.published !== false).map((p) => ({ p, imgs: sliderImages(p), on: p.inSlider !== false })), [projects]);
  const autoSlides = auto.filter((a) => a.on).flatMap((a) => a.imgs.map((image, k) => ({ id: `${a.p.id}-${k}`, image, active: true })));
  const custom = s.customEnabled;

  const toggleProject = async (p) => {
    try { await api.saveProject({ ...p, inSlider: p.inSlider === false }); load(); toast(p.inSlider === false ? 'ظهر بالسلايدر' : 'اختفى من السلايدر'); } catch (e) { toast(e.message, 'err'); }
  };

  /* صفحة تعديل صورة مخصصة */
  if (idxStr !== undefined) {
    const i = Number(idxStr); const x = s.slides[i];
    if (!custom || !x) return <Navigate to="/slider" replace />;
    const up = (v) => set('slides', s.slides.map((y, k) => (k === i ? v : y)));
    return (
      <>
        <PageHead title={x.title?.ar || x.alt?.ar || `صورة ${i + 1}`} crumbs={[ROOT, { label: `صورة ${i + 1}` }]} actions={<Link className="btn ghost" to="/slider"><Icon name="right" size={16} />رجوع</Link>} />
        <Card>
          <div className="stack">
            <ImageField label="الصورة" wide value={x.image} onChange={(v) => up({ ...x, image: v })} />
            <Toggle label="ظاهرة في الموقع" value={x.active} onChange={(v) => up({ ...x, active: v })} />
            <LText label="وصف الصورة (Alt — للوصول وSEO)" value={x.alt} onChange={(v) => up({ ...x, alt: v })} />
            <div className="grid2">
              <LText label="عنوان فوق الصورة (اختياري)" value={x.title} onChange={(v) => up({ ...x, title: v })} />
              <LText label="نص فرعي (اختياري)" value={x.subtitle} onChange={(v) => up({ ...x, subtitle: v })} />
            </div>
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHead title="السلايدر — الصور المتحركة بالواجهة الرئيسية" desc="الصور اللي بتتبدّل لحالها فوق بالصفحة الرئيسية (Hero Slider). الوضع الافتراضي تلقائي بالكامل." />
      <div className="stack">
        <Card className={`mode ${custom ? 'custom' : 'auto'}`}>
          <Toggle label="تفعيل سلايدر مخصص (يدوي)" hint={custom ? 'مفعّل: الموقع بيعرض الصور اللي بتضيفها بالأسفل فقط.' : 'مطفي (الافتراضي): صور كل مشروع بتنضاف تلقائياً للسلايدر لما ترفعها للمشروع.'} value={custom} onChange={(v) => set('customEnabled', v)} />
          <p className="mode-note"><Icon name={custom ? 'image' : 'refresh'} size={15} />{custom ? 'لو ما في صورة فعّالة بالأسفل، الموقع بيرجع للوضع التلقائي.' : 'ما بتحتاج تعمل شي هون: أضف صور للمشروع من صفحة «المشاريع» وبتظهر لحالها.'}</p>
        </Card>

        <Card title="معاينة مباشرة"><SliderPreview cfg={{ ...s, slides: custom ? s.slides : autoSlides }} /></Card>

        <Card title="إعدادات الحركة" desc="بتنطبق على الوضعين.">
          <div className="grid2">
            <Toggle label="تشغيل تلقائي" value={s.autoplay} onChange={(v) => set('autoplay', v)} />
            <Toggle label="إيقاف مؤقت عند مرور الماوس" value={s.pauseOnHover} onChange={(v) => set('pauseOnHover', v)} />
            <Toggle label="نقاط التنقل أسفل الصورة" value={s.showDots} onChange={(v) => set('showDots', v)} />
            <Toggle label="أسهم التالي والسابق" value={s.showArrows} onChange={(v) => set('showArrows', v)} />
            <NumberInput label="المدة بين الصور (ثواني)" min={2} max={30} value={s.interval} onChange={(v) => set('interval', v)} />
            <Select label="نوع الانتقال" value={s.transition} onChange={(v) => set('transition', v)} options={[{ value: 'fade', label: 'تلاشي' }, { value: 'slide', label: 'انزلاق' }, { value: 'zoom', label: 'تكبير' }]} />
          </div>
        </Card>

        {custom ? (
          <Card title="صور السلايدر المخصص" desc="اضغط على صورة لتعديلها. يفضّل صور عرضها 1920px فأكثر.">
            <CollectionView items={s.slides} base="/slider" onChange={(v) => set('slides', v)} noun="الصورة" addLabel="إضافة صورة"
              makeItem={() => ({ id: uid('s'), image: '', active: true, alt: { ar: '', en: '' }, title: { ar: '', en: '' }, subtitle: { ar: '', en: '' } })}
              getTitle={(x, i) => x.title?.ar || x.alt?.ar || `صورة ${i + 1}`} getSub={(x) => (x.active ? 'ظاهرة' : 'مخفية')} getThumb={(x) => x.image} />
          </Card>
        ) : (
          <Card title="الصور التلقائية من المشاريع" desc={`${autoSlides.length} صورة من ${auto.filter((a) => a.on && a.imgs.length).length} مشروع، بترتيب المشاريع.`}
            actions={<Link className="btn soft sm" to="/projects"><Icon name="folder" size={15} />المشاريع</Link>}>
            {!projects ? <span className="spinner" /> : !auto.length ? <p className="muted">ما في مشاريع منشورة بعد.</p> : (
              <ul className="auto-list">
                {auto.map(({ p, imgs, on }) => (
                  <li key={p.id} className={on ? '' : 'off'}>
                    <div className="auto-thumbs">
                      {imgs.length ? imgs.slice(0, 4).map((u) => <img key={u} src={u} alt="" loading="lazy" />) : <span className="auto-none"><Icon name="image" size={20} /></span>}
                    </div>
                    <div className="auto-info"><strong>{p.title}</strong><small>{imgs.length ? `${imgs.length} صور` : 'ما في صور بعد'}{!on && ' · مخفي من السلايدر'}</small></div>
                    <div className="auto-tools">
                      <Link className="btn ghost sm" to={`/projects/${p.id}/images`}><Icon name="image" size={15} />الصور</Link>
                      <button type="button" className="icon-btn" title={on ? 'إخفاء من السلايدر' : 'إظهار بالسلايدر'} onClick={() => toggleProject(p)}><Icon name={on ? 'eyeOff' : 'eye'} size={15} /></button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
      </div>
    </>
  );
}

export default function Slider() {
  const ed = useSite();
  return (<PageShell ed={ed} bare><SliderBody ed={ed} /></PageShell>);
}

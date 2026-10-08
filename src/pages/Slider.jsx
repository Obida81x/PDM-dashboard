import { useSite } from '../hooks/useSite';
import { uid } from '../services/api';
import PageShell from '../components/PageShell';
import SliderPreview from '../components/SliderPreview';
import { Card, ImageField, ListEditor, LText, NumberInput, Select, Toggle } from '../components/Fields';

export default function Slider() {
  const ed = useSite();
  const s = ed.site?.slider;
  const set = (k, v) => ed.setSite({ ...ed.site, slider: { ...s, [k]: v } });
  return (
    <PageShell ed={ed} title="السلايدر — الصور المتحركة بالواجهة الرئيسية" desc="الصور اللي بتتبدّل لحالها فوق بالصفحة الرئيسية (Hero Slider / Carousel). أضف، احذف، رتّب، وتحكم بالسرعة والحركة.">
      {s && (
        <div className="stack">
          <Card title="معاينة مباشرة"><SliderPreview cfg={s} /></Card>
          <Card title="إعدادات الحركة">
            <div className="grid2">
              <Toggle label="تفعيل السلايدر" hint="لو مطفي بيظهر الشكل الافتراضي للموقع." value={s.enabled} onChange={(v) => set('enabled', v)} />
              <Toggle label="تشغيل تلقائي" value={s.autoplay} onChange={(v) => set('autoplay', v)} />
              <Toggle label="إيقاف مؤقت عند مرور الماوس" value={s.pauseOnHover} onChange={(v) => set('pauseOnHover', v)} />
              <Toggle label="نقاط التنقل أسفل الصورة" value={s.showDots} onChange={(v) => set('showDots', v)} />
              <Toggle label="أسهم التالي والسابق" value={s.showArrows} onChange={(v) => set('showArrows', v)} />
              <NumberInput label="المدة بين الصور (ثواني)" min={2} max={30} value={s.interval} onChange={(v) => set('interval', v)} />
              <Select label="نوع الانتقال" value={s.transition} onChange={(v) => set('transition', v)} options={[{ value: 'fade', label: 'تلاشي' }, { value: 'slide', label: 'انزلاق' }, { value: 'zoom', label: 'تكبير' }]} />
            </div>
          </Card>
          <Card title="الصور" desc="الترتيب هنا هو ترتيب الظهور. يفضّل صور عرضها 1920px فأكثر.">
            <ListEditor items={s.slides} onChange={(v) => set('slides', v)} addLabel="إضافة صورة" itemTitle={(x) => x.title?.ar || x.alt?.ar || 'صورة'}
              makeItem={() => ({ id: uid('s'), image: '', active: true, alt: { ar: '', en: '' }, title: { ar: '', en: '' }, subtitle: { ar: '', en: '' } })}
              renderItem={(x, up) => (
                <div className="stack">
                  <ImageField label="الصورة" wide value={x.image} onChange={(v) => up({ ...x, image: v })} />
                  <Toggle label="ظاهرة في الموقع" value={x.active} onChange={(v) => up({ ...x, active: v })} />
                  <LText label="وصف الصورة (Alt — للوصول وSEO)" value={x.alt} onChange={(v) => up({ ...x, alt: v })} />
                  <div className="grid2">
                    <LText label="عنوان فوق الصورة (اختياري)" value={x.title} onChange={(v) => up({ ...x, title: v })} />
                    <LText label="نص فرعي (اختياري)" value={x.subtitle} onChange={(v) => up({ ...x, subtitle: v })} />
                  </div>
                </div>
              )} />
          </Card>
        </div>
      )}
    </PageShell>
  );
}

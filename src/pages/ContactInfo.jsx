import { useSite } from '../hooks/useSite';
import PageShell from '../components/PageShell';
import { Card, ListEditor, Select, TextInput } from '../components/Fields';

const NETS = ['instagram', 'linkedin', 'x', 'youtube', 'facebook', 'tiktok', 'whatsapp', 'telegram'].map((v) => ({ value: v, label: v }));

export default function ContactInfo() {
  const ed = useSite();
  const c = ed.site?.contact;
  const set = (k, v) => ed.setSite({ ...ed.site, contact: { ...c, [k]: v } });
  return (
    <PageShell ed={ed} title="معلومات التواصل" desc="الإيميل والهاتف وروابط السوشيال اللي بتظهر في قسم التواصل والفوتر.">
      {c && (
        <div className="stack">
          <Card title="بيانات التواصل">
            <div className="grid2">
              <TextInput label="البريد الإلكتروني الظاهر بالموقع" ltr value={c.email} onChange={(v) => set('email', v)} />
              <TextInput label="رقم الهاتف الظاهر بالموقع" ltr value={c.phone} onChange={(v) => set('phone', v)} />
              <TextInput label="بريد استقبال رسائل النموذج" ltr hint="عليه بتوصل رسائل نموذج «تواصل معنا» (الباك إند بيستخدمه)." value={c.recipient} onChange={(v) => set('recipient', v)} />
              <TextInput label="رابط خريطة جوجل" ltr hint="يفتح عند الضغط على «احصل على الاتجاهات»." value={c.mapUrl} onChange={(v) => set('mapUrl', v)} />
            </div>
          </Card>
          <Card title="روابط السوشيال ميديا" desc="اتركه فاضي لو ما بدك رابط. المنصات الأربع الأولى أيقوناتها جاهزة بالموقع.">
            <ListEditor items={c.socials || []} onChange={(v) => set('socials', v)} addLabel="إضافة منصة" makeItem={() => ({ name: 'facebook', url: '' })} itemTitle={(s) => s.name}
              renderItem={(s, up) => (<div className="grid2"><Select label="المنصة" options={NETS} value={s.name} onChange={(v) => up({ ...s, name: v })} /><TextInput label="الرابط" ltr placeholder="https://…" value={s.url} onChange={(v) => up({ ...s, url: v })} /></div>)} />
          </Card>
        </div>
      )}
    </PageShell>
  );
}

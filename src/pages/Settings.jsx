import { useRef, useState } from 'react';
import { useSite } from '../hooks/useSite';
import { useUI } from '../context/UIContext';
import { api, exportBackup, importBackup } from '../services/api';
import PageShell from '../components/PageShell';
import Icon from '../components/Icon';
import { Card, Field, ImageField, LText, Select, Tabs, TextInput, Toggle } from '../components/Fields';

function Password() {
  const { toast } = useUI();
  const [f, setF] = useState({ current: '', next: '', again: '' });
  const [busy, setBusy] = useState(false);
  const go = async () => {
    if (f.next.length < 8) return toast('كلمة المرور الجديدة لازم تكون 8 أحرف على الأقل.', 'err');
    if (f.next !== f.again) return toast('تأكيد كلمة المرور غير مطابق.', 'err');
    setBusy(true);
    try { await api.changePassword({ current: f.current, next: f.next }); toast('تم تغيير كلمة المرور'); setF({ current: '', next: '', again: '' }); }
    catch (e) { toast(e.message, 'err'); }
    setBusy(false);
  };
  return (
    <Card title="تغيير كلمة المرور" desc="لحسابك الحالي.">
      <div className="grid2">
        <TextInput label="كلمة المرور الحالية" type="password" ltr value={f.current} onChange={(v) => setF({ ...f, current: v })} />
        <span />
        <TextInput label="كلمة المرور الجديدة" type="password" ltr hint="8 أحرف على الأقل." value={f.next} onChange={(v) => setF({ ...f, next: v })} />
        <TextInput label="تأكيد كلمة المرور" type="password" ltr value={f.again} onChange={(v) => setF({ ...f, again: v })} />
      </div>
      <button type="button" className="btn primary" disabled={busy || !f.current || !f.next} onClick={go}><Icon name="lock" size={16} />تحديث كلمة المرور</button>
    </Card>
  );
}

function Backup() {
  const { toast, confirm } = useUI();
  const file = useRef(null);
  const down = async () => {
    try {
      const blob = new Blob([await exportBackup()], { type: 'application/json' });
      const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `pdm-backup-${new Date().toISOString().slice(0, 10)}.json` });
      a.click(); URL.revokeObjectURL(a.href); toast('تم تنزيل النسخة الاحتياطية');
    } catch (e) { toast(e.message, 'err'); }
  };
  const up = async (f) => {
    if (!f) return;
    if (!(await confirm({ title: 'استيراد نسخة احتياطية؟', text: 'بتستبدل نصوص الموقع والمشاريع الحالية بمحتوى الملف.', danger: true, okLabel: 'استيراد' }))) return;
    try { await importBackup(await f.text()); toast('تم الاستيراد. حدّث الصفحة.'); setTimeout(() => window.location.reload(), 900); }
    catch (e) { toast(e.message, 'err'); }
  };
  const reset = async () => {
    if (!(await confirm({ title: 'إعادة المحتوى للأصل؟', text: 'بيرجّع كل النصوص والمشاريع لمحتوى الموقع الأصلي، وبتخسر تعديلاتك. ما بيمسح الصور ولا الرسائل.', danger: true, okLabel: 'إعادة الضبط' }))) return;
    try { await api.resetSite(); toast('تمت إعادة الضبط'); setTimeout(() => window.location.reload(), 700); } catch (e) { toast(e.message, 'err'); }
  };
  return (
    <Card title="النسخ الاحتياطي" desc="نزّل كل نصوص ومشاريع الموقع كملف JSON، أو ارجع لنسخة قديمة.">
      <div className="row-actions">
        <button type="button" className="btn soft" onClick={down}><Icon name="download" size={16} />تنزيل نسخة احتياطية</button>
        <button type="button" className="btn soft" onClick={() => file.current?.click()}><Icon name="upload" size={16} />استيراد نسخة</button>
        <button type="button" className="btn ghost danger-t" onClick={reset}><Icon name="refresh" size={16} />إعادة المحتوى للأصل</button>
        <input ref={file} type="file" accept="application/json,.json" hidden onChange={(e) => { up(e.target.files?.[0]); e.target.value = ''; }} />
      </div>
    </Card>
  );
}

export default function Settings() {
  const ed = useSite();
  const [tab, setTab] = useState('general');
  const st = ed.site?.settings;
  const set = (k, v) => ed.setSite({ ...ed.site, settings: { ...st, [k]: v } });
  const sub = (k, v) => set(k, { ...st[k], ...v });
  return (
    <PageShell ed={ed} title="الإعدادات العامة" desc="هوية الموقع، السيو، وضع الصيانة، الحساب والنسخ الاحتياطي.">
      <Tabs value={tab} onChange={setTab} tabs={[{ id: 'general', label: 'عام' }, { id: 'seo', label: 'SEO' }, { id: 'maint', label: 'الصيانة والتتبع' }, { id: 'account', label: 'حسابي' }, { id: 'backup', label: 'النسخ الاحتياطي' }]} />
      {st && tab === 'general' && (
        <Card title="هوية الموقع">
          <div className="stack">
            <LText label="اسم الموقع" value={st.siteName} onChange={(v) => set('siteName', v)} />
            <TextInput label="رابط الموقع" ltr placeholder="https://pdm.com" hint="بيظهر زر «عرض الموقع» بأعلى اللوحة." value={st.siteUrl || ''} onChange={(v) => set('siteUrl', v)} />
            <div className="grid2">
              <ImageField label="الشعار (Logo)" value={st.logo} onChange={(v) => set('logo', v)} />
              <ImageField label="أيقونة المتصفح (Favicon)" value={st.favicon} onChange={(v) => set('favicon', v)} />
            </div>
            <Field label="اللون الأساسي للموقع">
              <div className="color-row"><input type="color" value={st.primaryColor} onChange={(e) => set('primaryColor', e.target.value)} /><input className="input ltr sm" dir="ltr" value={st.primaryColor} onChange={(e) => set('primaryColor', e.target.value)} /></div>
            </Field>
            <div className="grid2">
              <Select label="لغة الموقع الافتراضية" value={st.defaultLang} onChange={(v) => set('defaultLang', v)} options={[{ value: 'ar', label: 'العربية' }, { value: 'en', label: 'English' }]} />
              <Select label="المظهر الافتراضي" value={st.defaultTheme} onChange={(v) => set('defaultTheme', v)} options={[{ value: 'light', label: 'فاتح' }, { value: 'dark', label: 'داكن' }]} />
            </div>
            <Toggle label="إظهار زر تبديل اللغة" value={st.showLangSwitcher} onChange={(v) => set('showLangSwitcher', v)} />
            <Toggle label="إظهار زر تبديل المظهر" value={st.showThemeSwitcher} onChange={(v) => set('showThemeSwitcher', v)} />
          </div>
        </Card>
      )}
      {st && tab === 'seo' && (
        <Card title="محركات البحث والمشاركة" desc="العنوان والوصف اللي بيظهروا في نتائج جوجل ولما حدا يشارك رابط الموقع.">
          <div className="stack">
            <LText label="عنوان الصفحة (Title)" hint="الأفضل أقل من 60 حرف." value={st.seo.title} onChange={(v) => sub('seo', { title: v })} />
            <LText area label="الوصف (Description)" hint="الأفضل بين 120 و160 حرف." value={st.seo.description} onChange={(v) => sub('seo', { description: v })} />
            <ImageField label="صورة المشاركة (OG Image)" hint="1200×630 مثالية." wide value={st.seo.ogImage} onChange={(v) => sub('seo', { ogImage: v })} />
          </div>
        </Card>
      )}
      {st && tab === 'maint' && (
        <div className="stack">
          <Card title="وضع الصيانة" desc="لما يكون شغّال بيشوف الزوار رسالة الصيانة بدل الموقع.">
            <Toggle label="تفعيل وضع الصيانة" value={st.maintenance.on} onChange={(v) => sub('maintenance', { on: v })} />
            <LText area label="رسالة الصيانة" value={st.maintenance.message} onChange={(v) => sub('maintenance', { message: v })} />
          </Card>
          <Card title="تتبع الزيارات">
            <Toggle label="تسجيل الزيارات (للإحصائيات)" hint="بيغذّي صفحة الإحصائيات." value={st.tracking.enabled} onChange={(v) => sub('tracking', { enabled: v })} />
            <TextInput label="معرّف Google Analytics (اختياري)" ltr placeholder="G-XXXXXXXXXX" value={st.tracking.googleAnalyticsId} onChange={(v) => sub('tracking', { googleAnalyticsId: v })} />
          </Card>
        </div>
      )}
      {tab === 'account' && <Password />}
      {tab === 'backup' && <Backup />}
    </PageShell>
  );
}

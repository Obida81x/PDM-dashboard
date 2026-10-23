import { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import { useUI } from '../context/UIContext';
import { emptyL, fmtSize, isImgUrl } from '../utils';
import { Crumbs } from './Cards';
import Icon from './Icon';

/** غلاف موحّد لكل حقل: عنوان + ملاحظة */
export function Field({ label, hint, children, className = '' }) {
  return (
    <div className={`field ${className}`}>
      {label && <label className="field-label">{label}</label>}
      {children}
      {hint && <small className="field-hint">{hint}</small>}
    </div>
  );
}

export function TextInput({ label, hint, value, onChange, ltr, placeholder, type = 'text' }) {
  return (
    <Field label={label} hint={hint}>
      <input className={`input ${ltr ? 'ltr' : ''}`} dir={ltr ? 'ltr' : undefined} type={type} value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

export function NumberInput({ label, hint, value, onChange, min, max, step = 1 }) {
  return (
    <Field label={label} hint={hint}>
      <input className="input ltr" dir="ltr" type="number" min={min} max={max} step={step} value={value ?? 0} onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))} />
    </Field>
  );
}

export function Select({ label, hint, value, onChange, options }) {
  return (
    <Field label={label} hint={hint}>
      <select className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
      </select>
    </Field>
  );
}

export function Toggle({ label, hint, value, onChange }) {
  return (
    <div className="toggle-row">
      <div><strong>{label}</strong>{hint && <small>{hint}</small>}</div>
      <button type="button" role="switch" aria-checked={!!value} className={`switch ${value ? 'on' : ''}`} onClick={() => onChange(!value)}><i /></button>
    </div>
  );
}

/** حقل نص بلغتين (عربي + إنجليزي) */
export function LText({ label, hint, value, onChange, area, rows = 3 }) {
  const v = value || emptyL();
  const El = area ? 'textarea' : 'input';
  const props = area ? { rows } : { type: 'text' };
  return (
    <Field label={label} hint={hint}>
      <div className="lpair">
        <div className="lbox"><span className="ltag">عربي</span><El className="input" dir="rtl" lang="ar" {...props} value={v.ar ?? ''} onChange={(e) => onChange({ ...v, ar: e.target.value })} /></div>
        <div className="lbox"><span className="ltag">EN</span><El className="input ltr" dir="ltr" lang="en" {...props} value={v.en ?? ''} onChange={(e) => onChange({ ...v, en: e.target.value })} /></div>
      </div>
    </Field>
  );
}

/** قائمة عناصر قابلة للإضافة والحذف والترتيب. renderItem(item, update, index) */
export function ListEditor({ label, hint, items = [], onChange, renderItem, makeItem, addLabel = 'إضافة عنصر', itemTitle, min = 0, compact, fixed }) {
  const { confirm } = useUI();
  const move = (i, d) => {
    const j = i + d; if (j < 0 || j >= items.length) return;
    const n = [...items]; [n[i], n[j]] = [n[j], n[i]]; onChange(n);
  };
  const remove = async (i) => {
    if (items.length <= min) return;
    if (await confirm({ title: 'حذف هذا العنصر؟', text: 'بيختفي من الموقع بعد الحفظ.', danger: true, okLabel: 'حذف' })) onChange(items.filter((_, k) => k !== i));
  };
  return (
    <Field label={label} hint={hint}>
      <div className={`list ${compact ? 'compact' : ''}`}>
        {items.map((it, i) => (
          <div className="list-item" key={i}>
            <div className="list-head">
              <span className="list-n">{i + 1}</span>
              <strong>{itemTitle ? itemTitle(it, i) : ''}</strong>
              <div className="list-tools">
                <button type="button" className="icon-btn" title="أعلى" onClick={() => move(i, -1)} disabled={i === 0}><Icon name="up" size={15} /></button>
                <button type="button" className="icon-btn" title="أسفل" onClick={() => move(i, 1)} disabled={i === items.length - 1}><Icon name="down" size={15} /></button>
                {!fixed && <button type="button" className="icon-btn danger" title="حذف" onClick={() => remove(i)} disabled={items.length <= min}><Icon name="trash" size={15} /></button>}
              </div>
            </div>
            <div className="list-body">{renderItem(it, (v) => onChange(items.map((x, k) => (k === i ? v : x))), i)}</div>
          </div>
        ))}
        {!fixed && <button type="button" className="btn soft add-btn" onClick={() => onChange([...items, makeItem()])}><Icon name="plus" size={16} />{addLabel}</button>}
      </div>
    </Field>
  );
}

/* ───────────── الصور ───────────── */
export const isImg = isImgUrl;

/** رفع صورة + اختيار من المكتبة + رابط يدوي */
export function ImageField({ label, hint, value, onChange, wide }) {
  const [busy, setBusy] = useState(false);
  const [lib, setLib] = useState(false);
  const input = useRef(null);
  const { toast } = useUI();

  const pick = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast('اختر ملف صورة فقط.', 'err');
    if (file.size > 8 * 1024 * 1024) return toast('الصورة أكبر من 8MB.', 'err');
    setBusy(true);
    try { const m = await api.uploadMedia(file); onChange(m.url); toast('تم رفع الصورة'); }
    catch (e) { toast(e.message, 'err'); }
    setBusy(false);
  };

  return (
    <Field label={label} hint={hint}>
      <div className={`img-field ${wide ? 'wide' : ''}`}>
        <div className={`img-preview ${value ? '' : 'empty'}`}>
          {isImg(value) ? <img src={value} alt="" /> : <span><Icon name="image" size={26} />{value ? `رسمة مدمجة: ${value}` : 'لا توجد صورة'}</span>}
        </div>
        <div className="img-actions">
          <button type="button" className="btn soft sm" disabled={busy} onClick={() => input.current?.click()}><Icon name="upload" size={15} />{busy ? 'جاري الرفع…' : 'رفع صورة'}</button>
          <button type="button" className="btn ghost sm" onClick={() => setLib(true)}><Icon name="image" size={15} />من المكتبة</button>
          {value && <button type="button" className="btn ghost sm danger-t" onClick={() => onChange('')}><Icon name="x" size={15} />إزالة</button>}
          <input ref={input} type="file" accept="image/*" hidden onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
        </div>
        <input className="input ltr sm" dir="ltr" placeholder="أو الصق رابط صورة https://…" value={isImg(value) && !value.startsWith('data:') ? value : ''} onChange={(e) => onChange(e.target.value)} />
      </div>
      {lib && <MediaPicker onClose={() => setLib(false)} onPick={(u) => { onChange(u); setLib(false); }} />}
    </Field>
  );
}

export function MediaPicker({ onPick, onClose }) {
  const [items, setItems] = useState(null);
  useEffect(() => { api.getMedia().then(setItems).catch(() => setItems([])); }, []);
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head"><h3>مكتبة الوسائط</h3><button type="button" className="icon-btn" onClick={onClose}><Icon name="x" /></button></div>
        {!items ? <p className="muted">جاري التحميل…</p> : !items.length ? <p className="muted pad">المكتبة فاضية. ارفع صورة من الزر «رفع صورة» أو من صفحة الوسائط.</p> : (
          <div className="media-grid pick">
            {items.map((m) => (
              <button type="button" key={m.id} className="media-tile" onClick={() => onPick(m.url)}>
                <img src={m.url} alt="" /><span>{m.name}</span><small>{fmtSize(m.size)}</small>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** تبويبات بسيطة */
export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((t) => (
        <button key={t.id} type="button" role="tab" aria-selected={value === t.id} className={`tab ${value === t.id ? 'on' : ''}`} onClick={() => onChange(t.id)}>{t.label}</button>
      ))}
    </div>
  );
}

export function Card({ title, desc, actions, children, className = '' }) {
  return (
    <section className={`card ${className}`}>
      {(title || actions) && (
        <header className="card-head">
          <div>{title && <h3>{title}</h3>}{desc && <p>{desc}</p>}</div>
          {actions && <div className="card-actions">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

export function PageHead({ title, desc, actions, crumbs }) {
  return (
    <>
      {crumbs && <Crumbs items={crumbs} />}
      <div className="page-head">
        <div><h1>{title}</h1>{desc && <p>{desc}</p>}</div>
        {actions && <div className="page-actions">{actions}</div>}
      </div>
    </>
  );
}

export function Empty({ icon = 'folder', title, text, action }) {
  return (
    <div className="empty"><span><Icon name={icon} size={28} /></span><h3>{title}</h3>{text && <p>{text}</p>}{action}</div>
  );
}

/** معرض صور: رفع عدة صور دفعة وحدة + ترتيب وحذف (الرسمات المدمجة القديمة بتظهر كمكان فاضي) */
export function GalleryField({ label, hint, items = [], onChange }) {
  const { toast, confirm } = useUI();
  const [busy, setBusy] = useState(false);
  const [lib, setLib] = useState(false);
  const input = useRef(null);

  const upload = async (files) => {
    setBusy(true);
    const urls = [];
    for (const f of files) {
      if (!f.type.startsWith('image/')) { toast(`${f.name}: ليس صورة`, 'err'); continue; }
      try { urls.push((await api.uploadMedia(f)).url); } catch (e) { toast(e.message, 'err'); break; }
    }
    if (urls.length) { onChange([...items, ...urls]); toast(`تمت إضافة ${urls.length} صورة`); }
    setBusy(false);
  };
  const move = (i, d) => { const j = i + d; if (j < 0 || j >= items.length) return; const n = [...items]; [n[i], n[j]] = [n[j], n[i]]; onChange(n); };
  const remove = async (i) => { if (await confirm({ title: 'حذف الصورة من المشروع؟', danger: true, okLabel: 'حذف' })) onChange(items.filter((_, k) => k !== i)); };

  return (
    <Field label={label} hint={hint}>
      <div className="gal">
        {items.map((g, i) => (
          <div className="gal-tile" key={`${i}-${String(g).slice(-12)}`}>
            {isImg(g) ? <img src={g} alt="" loading="lazy" /> : <span className="gal-art"><Icon name="image" size={20} />{g || 'فارغ'}</span>}
            <div className="gal-tools">
              <button type="button" className="icon-btn" title="تقديم" onClick={() => move(i, -1)} disabled={i === 0}><Icon name="right" size={14} /></button>
              <button type="button" className="icon-btn" title="تأخير" onClick={() => move(i, 1)} disabled={i === items.length - 1}><Icon name="left" size={14} /></button>
              <button type="button" className="icon-btn danger" title="حذف" onClick={() => remove(i)}><Icon name="trash" size={14} /></button>
            </div>
          </div>
        ))}
        <button type="button" className="gal-add" disabled={busy} onClick={() => input.current?.click()}><Icon name="upload" size={22} /><span>{busy ? 'جاري الرفع…' : 'رفع صور'}</span></button>
        <button type="button" className="gal-add" onClick={() => setLib(true)}><Icon name="layers" size={22} /><span>من المكتبة</span></button>
        <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => { upload([...e.target.files]); e.target.value = ''; }} />
      </div>
      {lib && <MediaPicker onClose={() => setLib(false)} onPick={(u) => { onChange([...items, u]); setLib(false); }} />}
    </Field>
  );
}

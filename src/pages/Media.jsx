import { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import { useUI } from '../context/UIContext';
import { fmtDate, fmtSize } from '../utils';
import Icon from '../components/Icon';
import { Empty, PageHead } from '../components/Fields';

export default function Media() {
  const { toast, confirm } = useUI();
  const [items, setItems] = useState(null);
  const [busy, setBusy] = useState(false);
  const input = useRef(null);
  const load = () => api.getMedia().then(setItems).catch((e) => { toast(e.message, 'err'); setItems([]); });
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const upload = async (files) => {
    setBusy(true);
    for (const f of files) {
      if (!f.type.startsWith('image/')) { toast(`${f.name}: ليس صورة`, 'err'); continue; }
      try { await api.uploadMedia(f); } catch (e) { toast(e.message, 'err'); break; }
    }
    setBusy(false); load();
  };
  const del = async (m) => {
    if (!(await confirm({ title: 'حذف الصورة؟', text: 'لو مستخدمة بالموقع بتختفي منه.', danger: true, okLabel: 'حذف' }))) return;
    try { await api.deleteMedia(m.id); toast('تم الحذف'); load(); } catch (e) { toast(e.message, 'err'); }
  };
  const copy = async (m) => {
    try { await navigator.clipboard.writeText(m.url.startsWith('data:') ? m.name : m.url); toast('تم نسخ الرابط'); } catch { toast('تعذّر النسخ', 'err'); }
  };

  return (
    <>
      <PageHead title="مكتبة الوسائط" desc="كل صور الموقع في مكان واحد. ارفعها هنا أو مباشرة من أي حقل صورة."
        actions={<button type="button" className="btn primary" disabled={busy} onClick={() => input.current?.click()}><Icon name="upload" size={16} />{busy ? 'جاري الرفع…' : 'رفع صور'}</button>} />
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => { upload([...e.target.files]); e.target.value = ''; }} />
      {!items ? <div className="card state"><span className="spinner" /></div> : !items.length ? (
        <Empty icon="image" title="ما في صور بعد" text="ارفع أول صورة ليستخدمها السلايدر والمشاريع." action={<button type="button" className="btn primary" onClick={() => input.current?.click()}>رفع صور</button>} />
      ) : (
        <div className="media-grid">
          {items.map((m) => (
            <figure className="media-card" key={m.id}>
              <img src={m.url} alt="" loading="lazy" />
              <figcaption><strong title={m.name}>{m.name}</strong><small>{fmtSize(m.size)} · {fmtDate(m.createdAt)}</small></figcaption>
              <div className="media-tools">
                <button type="button" className="icon-btn" title="نسخ الرابط" onClick={() => copy(m)}><Icon name="copy" size={15} /></button>
                <button type="button" className="icon-btn danger" title="حذف" onClick={() => del(m)}><Icon name="trash" size={15} /></button>
              </div>
            </figure>
          ))}
        </div>
      )}
    </>
  );
}

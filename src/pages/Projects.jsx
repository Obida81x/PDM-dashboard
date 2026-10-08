import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, uid } from '../services/api';
import { useUI } from '../context/UIContext';
import { CATEGORIES } from '../data/schema';
import { clone } from '../utils';
import Icon from '../components/Icon';
import { Empty, isImg, PageHead } from '../components/Fields';

const catName = (v) => CATEGORIES.find((c) => c.value === v)?.label || v;

export default function Projects() {
  const { toast, confirm } = useUI();
  const nav = useNavigate();
  const [items, setItems] = useState(null);
  const load = () => api.getProjects().then(setItems).catch((e) => { toast(e.message, 'err'); setItems([]); });
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const move = async (i, d) => {
    const j = i + d; if (j < 0 || j >= items.length) return;
    const n = [...items]; [n[i], n[j]] = [n[j], n[i]]; setItems(n);
    try { await api.orderProjects(n.map((p) => p.id)); } catch (e) { toast(e.message, 'err'); load(); }
  };
  const del = async (p) => {
    if (!(await confirm({ title: `حذف مشروع «${p.title}»؟`, text: 'بيختفي من الموقع مع صفحته وما بتقدر ترجعه (إلا من نسخة احتياطية).', danger: true, okLabel: 'حذف المشروع' }))) return;
    try { await api.deleteProject(p.id); toast('تم حذف المشروع'); load(); } catch (e) { toast(e.message, 'err'); }
  };
  const toggle = async (p) => { try { await api.saveProject({ ...p, published: p.published === false }); load(); } catch (e) { toast(e.message, 'err'); } };
  const dup = async (p) => {
    try {
      const c = clone(p); c.id = ''; c.slug = `${p.slug}-copy`; c.title = `${p.title} (نسخة)`; c.published = false; c.caseStudy = null; c.__new = true;
      await api.saveProject({ ...c, id: undefined }); toast('تم إنشاء نسخة (غير منشورة)'); load();
    } catch (e) { toast(e.message, 'err'); }
  };

  return (
    <>
      <PageHead title="المشاريع" desc="كل مشروع يظهر ببطاقة في قسم الأعمال وله صفحته الخاصة. الترتيب هنا هو ترتيب الظهور بالموقع."
        actions={<button type="button" className="btn primary" onClick={() => nav('/projects/new')}><Icon name="plus" size={16} />مشروع جديد</button>} />
      {!items ? <div className="card state"><span className="spinner" /></div> : !items.length ? (
        <Empty icon="folder" title="ما في مشاريع" text="أضف أول مشروع ليظهر بقسم الأعمال." action={<Link className="btn primary" to="/projects/new">مشروع جديد</Link>} />
      ) : (
        <div className="proj-list">
          {items.map((p, i) => (
            <article key={p.id} className={`proj ${p.published === false ? 'draft' : ''}`}>
              <div className="proj-thumb">{isImg(p.cover) ? <img src={p.cover} alt="" /> : <span><Icon name="image" size={22} />{p.art}</span>}</div>
              <div className="proj-main">
                <div className="proj-title"><h3>{p.title}</h3>{p.caseStudy && <span className="pill star"><Icon name="star" size={12} />دراسة حالة</span>}{p.published === false && <span className="pill off">مسودة</span>}</div>
                <p>{p.summary?.ar}</p>
                <small>{catName(p.category)} · {p.year} · <span dir="ltr">/projects/{p.slug}</span></small>
              </div>
              <div className="proj-tools">
                <button type="button" className="icon-btn" title="أعلى" disabled={i === 0} onClick={() => move(i, -1)}><Icon name="up" size={15} /></button>
                <button type="button" className="icon-btn" title="أسفل" disabled={i === items.length - 1} onClick={() => move(i, 1)}><Icon name="down" size={15} /></button>
                <button type="button" className="icon-btn" title={p.published === false ? 'نشر' : 'إخفاء'} onClick={() => toggle(p)}><Icon name={p.published === false ? 'eye' : 'eyeOff'} size={15} /></button>
                <button type="button" className="icon-btn" title="نسخ" onClick={() => dup(p)}><Icon name="copy" size={15} /></button>
                <Link className="btn soft sm" to={`/projects/${p.id}`}><Icon name="edit" size={15} />تعديل</Link>
                <button type="button" className="icon-btn danger" title="حذف" onClick={() => del(p)}><Icon name="trash" size={15} /></button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

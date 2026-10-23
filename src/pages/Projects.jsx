import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useUI } from '../context/UIContext';
import { CATEGORIES } from '../data/schema';
import { clone, sliderImages } from '../utils';
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
    if (!(await confirm({ title: `حذف مشروع «${p.title}»؟`, text: 'بيختفي من الموقع مع صفحته وصوره من السلايدر، وما بتقدر ترجعه (إلا من نسخة احتياطية).', danger: true, okLabel: 'حذف المشروع' }))) return;
    try { await api.deleteProject(p.id); toast('تم حذف المشروع'); load(); } catch (e) { toast(e.message, 'err'); }
  };
  const toggle = async (p) => { try { await api.saveProject({ ...p, published: p.published === false }); load(); } catch (e) { toast(e.message, 'err'); } };
  const dup = async (p) => {
    try {
      const c = clone(p); c.slug = `${p.slug}-copy`; c.title = `${p.title} (نسخة)`; c.published = false; c.caseStudy = null; c.__new = true; delete c.id;
      await api.saveProject(c); toast('تم إنشاء نسخة (غير منشورة)'); load();
    } catch (e) { toast(e.message, 'err'); }
  };

  return (
    <>
      <PageHead title="المشاريع" desc="كل مشروع بطاقة: اضغط عليها لتعديل تفاصيله وصوره. صور المشروع بتظهر تلقائياً بسلايدر الصفحة الرئيسية. الترتيب هنا هو ترتيب الظهور بالموقع." />
      {!items ? <div className="card state"><span className="spinner" /></div> : !items.length ? (
        <Empty icon="folder" title="ما في مشاريع" text="أضف أول مشروع ليظهر بقسم الأعمال." action={<Link className="btn primary" to="/projects/new">مشروع جديد</Link>} />
      ) : null}
      {items && (
        <div className="hgrid pgrid">
          {items.map((p, i) => {
            const n = sliderImages(p).length;
            return (
              <article key={p.id} className={`pcard ${p.published === false ? 'draft' : ''}`}>
                <Link to={`/projects/${p.id}`} className="pcard-main">
                  <span className="pcard-thumb">{isImg(p.cover) ? <img src={p.cover} alt="" loading="lazy" /> : <span><Icon name="image" size={24} />{p.art}</span>}</span>
                  <div className="pcard-body">
                    <div className="pcard-pills"><span className="pill">{catName(p.category)}</span>{p.published === false && <span className="pill off">مسودة</span>}{p.caseStudy && <span className="pill star"><Icon name="star" size={12} />دراسة حالة</span>}</div>
                    <h3>{p.title}</h3>
                    <p>{p.summary?.ar}</p>
                    <small>{p.year} · {n ? `${n} صور` : 'بدون صور'}{n > 0 && (p.inSlider === false ? ' · خارج السلايدر' : ' · بالسلايدر')}</small>
                  </div>
                </Link>
                <div className="icard-tools">
                  <button type="button" className="icon-btn" title="تقديم" disabled={i === 0} onClick={() => move(i, -1)}><Icon name="right" size={15} /></button>
                  <button type="button" className="icon-btn" title="تأخير" disabled={i === items.length - 1} onClick={() => move(i, 1)}><Icon name="left" size={15} /></button>
                  <button type="button" className="icon-btn" title={p.published === false ? 'نشر' : 'إخفاء'} onClick={() => toggle(p)}><Icon name={p.published === false ? 'eye' : 'eyeOff'} size={15} /></button>
                  <button type="button" className="icon-btn" title="نسخ" onClick={() => dup(p)}><Icon name="copy" size={15} /></button>
                  <button type="button" className="icon-btn danger" title="حذف" onClick={() => del(p)}><Icon name="trash" size={15} /></button>
                </div>
              </article>
            );
          })}
          <button type="button" className="icard add pcard-add" onClick={() => nav('/projects/new')}><Icon name="plus" size={24} /><span>مشروع جديد</span></button>
        </div>
      )}
    </>
  );
}

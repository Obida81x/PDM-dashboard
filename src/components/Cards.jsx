import { Link, useNavigate } from 'react-router-dom';
import { useUI } from '../context/UIContext';
import { isImgUrl } from '../utils';
import Icon from './Icon';

/** مسار التنقل: الرئيسية ‹ القسم ‹ العنصر */
export function Crumbs({ items }) {
  return (
    <nav className="crumbs" aria-label="المسار">
      {items.map((c, i) => (
        <span key={i}>
          {c.to ? <Link to={c.to}>{c.label}</Link> : <b>{c.label}</b>}
          {i < items.length - 1 && <i aria-hidden="true">‹</i>}
        </span>
      ))}
    </nav>
  );
}

export const CardGrid = ({ children }) => <div className="hgrid">{children}</div>;

/** بطاقة قسم/قالب: تضغط عليها تفتح صفحة التفاصيل */
export function HubCard({ to, icon = 'edit', title, desc, meta }) {
  return (
    <Link to={to} className="hcard">
      <span className="hcard-ico"><Icon name={icon} size={22} /></span>
      <div className="hcard-txt"><h3>{title}</h3>{desc && <p>{desc}</p>}</div>
      <div className="hcard-foot">{meta ? <small>{meta}</small> : <span />}<span className="hcard-go"><Icon name="left" size={15} /></span></div>
    </Link>
  );
}

/**
 * شبكة بطاقات لعناصر قائمة (خدمات، محطات، صور…) — الضغط على البطاقة يفتح صفحة تعديل العنصر.
 * الأدوات: تقديم / تأخير / حذف + بطاقة «إضافة».
 */
export function CollectionView({ items, base, onChange, makeItem, addLabel = 'إضافة', noun = 'العنصر', getTitle, getSub, getBadge, getThumb, min = 0, goToNew = true }) {
  const nav = useNavigate();
  const { confirm } = useUI();
  const move = (i, d) => {
    const j = i + d; if (j < 0 || j >= items.length) return;
    const n = [...items]; [n[i], n[j]] = [n[j], n[i]]; onChange(n);
  };
  const remove = async (i) => {
    if (items.length <= min) return;
    if (await confirm({ title: `حذف ${noun}؟`, text: 'بيختفي من الموقع بعد الحفظ.', danger: true, okLabel: 'حذف' })) onChange(items.filter((_, k) => k !== i));
  };
  const add = () => { onChange([...items, makeItem()]); if (goToNew) nav(`${base}/${items.length}`); };

  return (
    <div className="hgrid">
      {items.map((it, i) => {
        const thumb = getThumb?.(it, i);
        return (
          <div className="icard" key={i}>
            <Link to={`${base}/${i}`} className="icard-main">
              {isImgUrl(thumb) ? <span className="icard-thumb"><img src={thumb} alt="" loading="lazy" /></span> : <span className="icard-badge">{getBadge ? getBadge(it, i) : i + 1}</span>}
              <h4>{getTitle?.(it, i) || 'بدون عنوان'}</h4>
              {getSub && <p>{getSub(it, i)}</p>}
            </Link>
            <div className="icard-tools">
              <button type="button" className="icon-btn" title="تقديم" onClick={() => move(i, -1)} disabled={i === 0}><Icon name="right" size={15} /></button>
              <button type="button" className="icon-btn" title="تأخير" onClick={() => move(i, 1)} disabled={i === items.length - 1}><Icon name="left" size={15} /></button>
              <button type="button" className="icon-btn danger" title="حذف" onClick={() => remove(i)} disabled={items.length <= min}><Icon name="trash" size={15} /></button>
            </div>
          </div>
        );
      })}
      <button type="button" className="icard add" onClick={add}><Icon name="plus" size={22} /><span>{addLabel}</span></button>
    </div>
  );
}

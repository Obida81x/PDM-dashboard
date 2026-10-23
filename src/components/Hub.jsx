import { Link, Navigate, useParams } from 'react-router-dom';
import { getIn, setIn } from '../utils';
import SchemaFields from './SchemaEditor';
import { CardGrid, CollectionView, HubCard } from './Cards';
import { Card, PageHead } from './Fields';
import Icon from './Icon';

/** عناصر القائمة (تدمج المصفوفات المتوازية بعنصر واحد) */
const getItems = (site, c) => {
  if (c.paths.length === 1) return getIn(site, c.paths[0]) || [];
  const n = Math.max(...c.paths.map((p) => (getIn(site, p) || []).length));
  return Array.from({ length: n }, (_, i) => Object.fromEntries(c.keys.map((k, j) => [k, getIn(site, c.paths[j])?.[i]])));
};
const setItems = (site, c, items) => {
  if (c.paths.length === 1) return setIn(site, c.paths[0], items);
  return c.paths.reduce((s, p, j) => setIn(s, p, items.map((it) => it[c.keys[j]])), site);
};

/**
 * نظام البطاقات: الصفحة الأولى = بطاقات الأقسام ← قسم = بطاقات (قوالب) ← بطاقة = صفحة تعديل.
 * config = مصفوفة أقسام من schema.js. كل التعديلات على مسودة الموقع وتنحفظ من شريط «حفظ ونشر».
 */
export default function Hub({ ed, config, base, title, desc }) {
  const { '*': rest = '' } = useParams();
  const parts = rest.split('/').filter(Boolean);
  const { site, setSite } = ed;
  const root = { to: base, label: title };

  /* 1) الصفحة الأولى: بطاقات الأقسام */
  if (!parts.length) {
    return (
      <>
        <PageHead title={title} desc={desc} />
        <CardGrid>
          {config.map((s) => {
            const one = s.cards.length === 1 ? s.cards[0] : null;
            const meta = one?.kind === 'collection' ? `${getItems(site, one).length} ${one.noun?.replace(/^ال/, '') || 'عنصر'}` : s.cards.length > 1 ? `${s.cards.length} أقسام` : 'تعديل النصوص';
            return <HubCard key={s.id} to={`${base}/${s.id}`} icon={s.icon} title={s.title} desc={s.desc} meta={meta} />;
          })}
        </CardGrid>
      </>
    );
  }

  const sec = config.find((s) => s.id === parts[0]);
  if (!sec) return <Navigate to={base} replace />;
  const secBase = `${base}/${sec.id}`;
  const single = sec.cards.length === 1;
  let card = null; let idxStr;
  if (single) { card = sec.cards[0]; idxStr = parts[1] === card.id ? parts[2] : undefined; }
  else if (parts[1]) { card = sec.cards.find((c) => c.id === parts[1]); if (!card) return <Navigate to={secBase} replace />; idxStr = parts[2]; }

  /* 2) بطاقات القسم (لو فيه أكثر من قالب) */
  if (!card) {
    return (
      <>
        <PageHead title={sec.title} desc={sec.desc} crumbs={[root, { label: sec.title }]} />
        <CardGrid>
          {sec.cards.map((c) => {
            const meta = c.kind === 'collection' ? `${getItems(site, c).length} ${c.noun?.replace(/^ال/, '') || 'عنصر'}` : c.kind === 'link' ? 'صفحة منفصلة' : undefined;
            return <HubCard key={c.id} to={c.kind === 'link' ? c.to : `${secBase}/${c.id}`} icon={c.icon} title={c.title} desc={c.desc} meta={meta} />;
          })}
        </CardGrid>
      </>
    );
  }

  const cardUrl = single ? secBase : `${secBase}/${card.id}`;
  const crumbsToCard = single ? [root] : [root, { to: secBase, label: sec.title }];
  const back = <Link className="btn ghost" to={single ? base : secBase}><Icon name="right" size={16} />رجوع</Link>;

  /* 3) صفحة نموذج */
  if (card.kind === 'form') {
    return (
      <>
        <PageHead title={card.title} desc={card.desc || sec.desc} crumbs={[...crumbsToCard, { label: card.title }]} actions={back} />
        <Card>
          <div className="stack">
            {card.parts.map((p, i) => (
              <SchemaFields key={i} fields={p.fields} value={getIn(site, p.path) || {}} onChange={(v) => setSite(setIn(site, p.path, v))} />
            ))}
          </div>
        </Card>
      </>
    );
  }

  /* 4) قائمة عناصر + صفحة العنصر */
  const items = getItems(site, card);
  const itemBase = `${secBase}/${card.id}`;
  if (idxStr !== undefined) {
    const idx = Number(idxStr); const it = items[idx];
    if (!it) return <Navigate to={cardUrl} replace />;
    const name = card.itemTitle?.(it, idx) || `${card.noun} ${idx + 1}`;
    return (
      <>
        <PageHead title={name} desc={sec.title} crumbs={[...crumbsToCard, { to: cardUrl, label: single ? sec.title : card.title }, { label: name }]}
          actions={<Link className="btn ghost" to={cardUrl}><Icon name="right" size={16} />رجوع للقائمة</Link>} />
        <Card>
          <SchemaFields fields={card.fields} value={it} onChange={(v) => setSite(setItems(site, card, items.map((x, k) => (k === idx ? v : x))))} />
        </Card>
      </>
    );
  }
  return (
    <>
      <PageHead title={single ? sec.title : card.title} desc={sec.desc} crumbs={[...crumbsToCard, { label: single ? sec.title : card.title }]} actions={back} />
      <div className="stack">
        {card.head && (
          <Card title={card.head.title}>
            <SchemaFields fields={card.head.fields} value={getIn(site, card.head.path) || {}} onChange={(v) => setSite(setIn(site, card.head.path, v))} />
          </Card>
        )}
        <Card title={card.listTitle || 'العناصر'} desc="اضغط على بطاقة لتعديلها. الترتيب هنا هو ترتيب الظهور بالموقع.">
          <CollectionView items={items} base={itemBase} onChange={(n) => setSite(setItems(site, card, n))} makeItem={card.makeItem} addLabel={card.addLabel} noun={card.noun}
            getTitle={card.itemTitle} getSub={card.itemSub} getBadge={card.getBadge} />
        </Card>
      </div>
    </>
  );
}

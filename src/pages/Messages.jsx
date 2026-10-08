import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useUI } from '../context/UIContext';
import { ago, fmtDateTime } from '../utils';
import Icon from '../components/Icon';
import { Empty, PageHead } from '../components/Fields';

export default function Messages() {
  const { toast, confirm } = useUI();
  const [items, setItems] = useState(null);
  const [sel, setSel] = useState(null);
  const [filter, setFilter] = useState('all');
  const load = () => api.getMessages().then(setItems).catch((e) => { toast(e.message, 'err'); setItems([]); });
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const open = async (m) => {
    setSel(m.id);
    if (!m.read) { await api.updateMessage(m.id, { read: true }).catch(() => {}); setItems((l) => l.map((x) => (x.id === m.id ? { ...x, read: true } : x))); }
  };
  const toggle = async (m) => { await api.updateMessage(m.id, { read: !m.read }); load(); };
  const del = async (m) => {
    if (!(await confirm({ title: 'حذف الرسالة؟', text: `رسالة من ${m.name}`, danger: true, okLabel: 'حذف' }))) return;
    await api.deleteMessage(m.id); setSel(null); toast('تم الحذف'); load();
  };

  const list = (items || []).filter((m) => filter === 'all' || (filter === 'unread' ? !m.read : m.read));
  const cur = (items || []).find((m) => m.id === sel);
  const unread = (items || []).filter((m) => !m.read).length;

  return (
    <>
      <PageHead title="الرسائل" desc="رسائل نموذج «تواصل معنا» القادمة من الموقع." />
      <div className="chips">
        {[['all', 'الكل'], ['unread', `غير مقروءة (${unread})`], ['read', 'مقروءة']].map(([k, v]) => (<button key={k} type="button" className={`chip ${filter === k ? 'on' : ''}`} onClick={() => setFilter(k)}>{v}</button>))}
      </div>
      {!items ? <div className="card state"><span className="spinner" /></div> : !list.length ? (
        <Empty icon="mail" title="لا توجد رسائل" text="لما حدا يرسل من نموذج التواصل بتوصل هنا." />
      ) : (
        <div className="inbox">
          <ul className="inbox-list">
            {list.map((m) => (
              <li key={m.id}><button type="button" className={`inbox-row ${m.id === sel ? 'on' : ''} ${m.read ? '' : 'unread'}`} onClick={() => open(m)}>
                <span className="avatar">{m.name.slice(0, 1)}</span>
                <div><strong>{m.name}</strong><span>{m.subject}</span><small>{m.message}</small></div>
                <time>{ago(m.createdAt)}</time>
              </button></li>
            ))}
          </ul>
          <article className="card inbox-view">
            {!cur ? <div className="state"><p>اختر رسالة لقراءتها.</p></div> : (<>
              <header><h3>{cur.subject}</h3><small>{fmtDateTime(cur.createdAt)}</small></header>
              <div className="inbox-from"><span className="avatar">{cur.name.slice(0, 1)}</span><div><strong>{cur.name}</strong><a href={`mailto:${cur.email}`} dir="ltr">{cur.email}</a></div></div>
              <p className="inbox-body">{cur.message}</p>
              <div className="row-actions">
                <a className="btn primary" href={`mailto:${cur.email}?subject=${encodeURIComponent(`Re: ${cur.subject}`)}`}><Icon name="mail" size={16} />رد بالإيميل</a>
                <button type="button" className="btn soft" onClick={() => toggle(cur)}><Icon name="check" size={16} />{cur.read ? 'تعليم كغير مقروءة' : 'تعليم كمقروءة'}</button>
                <button type="button" className="btn ghost danger-t" onClick={() => del(cur)}><Icon name="trash" size={16} />حذف</button>
              </div>
            </>)}
          </article>
        </div>
      )}
    </>
  );
}

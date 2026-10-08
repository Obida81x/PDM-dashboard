import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ago, num } from '../utils';
import Icon from '../components/Icon';
import { BarList, LineChart, Stat } from '../components/Charts';
import { Card, PageHead } from '../components/Fields';

const QUICK = [
  { to: '/slider', icon: 'image', t: 'غيّر صور السلايدر' },
  { to: '/projects/new', icon: 'plus', t: 'أضف مشروعاً' },
  { to: '/content', icon: 'type', t: 'عدّل نصوص الموقع' },
  { to: '/story', icon: 'book', t: 'عدّل قصتنا' },
  { to: '/contact-info', icon: 'phone', t: 'الإيميل والهاتف' },
  { to: '/media', icon: 'layers', t: 'ارفع صوراً' },
];

export default function Overview() {
  const { user } = useAuth();
  const [d, setD] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [proj, setProj] = useState([]);
  const [users, setUsers] = useState([]);
  useEffect(() => {
    api.getAnalytics('30').then(setD).catch(() => {});
    api.getMessages().then(setMsgs).catch(() => {});
    api.getProjects().then(setProj).catch(() => {});
    api.getUsers().then(setUsers).catch(() => {});
  }, []);
  const unread = msgs.filter((m) => !m.read);

  return (
    <>
      <PageHead title={`أهلاً ${user?.name || user?.username} 👋`} desc="ملخص سريع لموقعك آخر 30 يوم." />
      <div className="stack">
        <div className="stats">
          <Stat label="الزيارات" value={d ? num(d.totals.visits) : '…'} delta={d?.totals.deltas.visits} />
          <Stat label="الزوار الفريدون" value={d ? num(d.totals.visitors) : '…'} delta={d?.totals.deltas.visitors} />
          <Stat label="رسائل غير مقروءة" value={unread.length} hint={`من أصل ${msgs.length} رسالة`} />
          <Stat label="المشاريع المنشورة" value={proj.filter((p) => p.published !== false).length} hint={`${proj.length} إجمالاً`} />
          <Stat label="حسابات الإدارة" value={users.length} hint={`${users.filter((u) => u.active).length} فعّال`} />
          <Stat label="متصلون الآن" value={d ? d.totals.online : '…'} />
        </div>

        <Card title="إجراءات سريعة">
          <div className="quick">{QUICK.map((q) => (<Link key={q.to} to={q.to} className="quick-item"><span><Icon name={q.icon} size={20} /></span>{q.t}</Link>))}</div>
        </Card>

        <div className="grid2 top">
          <Card title="الزيارات" actions={<Link className="btn ghost sm" to="/analytics">كل الإحصائيات</Link>}>{d && <LineChart height={210} data={d.daily} series={[{ key: 'visits', label: 'الزيارات' }, { key: 'visitors', label: 'الزوار' }]} />}</Card>
          <Card title="أكثر الصفحات مشاهدة">{d && <BarList items={d.topPages.slice(0, 5)} />}</Card>
        </div>

        <Card title="آخر الرسائل" actions={<Link className="btn ghost sm" to="/messages">كل الرسائل</Link>}>
          {!msgs.length ? <p className="muted">ما في رسائل بعد.</p> : (
            <ul className="mini-list">
              {msgs.slice(0, 4).map((m) => (<li key={m.id}><span className={`dot ${m.read ? '' : 'on'}`} /><div><strong>{m.name}</strong><small>{m.subject}</small></div><time>{ago(m.createdAt)}</time></li>))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}

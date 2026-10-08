import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { api, IS_MOCK } from '../services/api';
import Icon from './Icon';
import logo from '../assets/p-mark.png';

const NAV = [
  { to: '/', icon: 'dash', label: 'نظرة عامة', end: true },
  { to: '/analytics', icon: 'chart', label: 'الإحصائيات والزيارات' },
  { group: 'محتوى الموقع' },
  { to: '/slider', icon: 'image', label: 'السلايدر (الصور المتحركة)' },
  { to: '/content', icon: 'type', label: 'النصوص والأقسام' },
  { to: '/contact-info', icon: 'phone', label: 'معلومات التواصل' },
  { to: '/projects', icon: 'folder', label: 'المشاريع' },
  { to: '/story', icon: 'book', label: 'قصتنا والتسلسل الزمني' },
  { group: 'الإدارة' },
  { to: '/messages', icon: 'mail', label: 'الرسائل', badge: true },
  { to: '/media', icon: 'layers', label: 'مكتبة الوسائط' },
  { to: '/users', icon: 'users', label: 'الحسابات' },
  { to: '/settings', icon: 'gear', label: 'الإعدادات العامة' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, confirm } = useUI();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [siteUrl, setSiteUrl] = useState('');
  const loc = useLocation();

  useEffect(() => { setOpen(false); }, [loc.pathname]);
  useEffect(() => {
    api.getMessages().then((m) => setUnread(m.filter((x) => !x.read).length)).catch(() => {});
    api.getSite().then((s) => setSiteUrl(s.settings?.siteUrl || '')).catch(() => {});
  }, [loc.pathname]);

  const out = async () => { if (await confirm({ title: 'تسجيل الخروج؟', okLabel: 'خروج' })) logout(); };

  return (
    <div className="shell">
      <aside className={`side ${open ? 'open' : ''}`}>
        <div className="side-brand"><img src={logo} alt="" /><div><strong>PDM</strong><small>لوحة التحكم</small></div></div>
        <nav className="side-nav" aria-label="القائمة الرئيسية">
          {NAV.map((it, i) => it.group ? (
            <span key={i} className="side-group">{it.group}</span>
          ) : (
            <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => `side-link ${isActive ? 'on' : ''}`}>
              <Icon name={it.icon} size={18} /><span>{it.label}</span>
              {it.badge && unread > 0 && <b className="badge">{unread}</b>}
            </NavLink>
          ))}
        </nav>
        <div className="side-foot">
          <div className="side-user"><span className="avatar">{(user?.name || user?.username || '?').slice(0, 1)}</span><div><strong>{user?.name || user?.username}</strong><small>{user?.role === 'owner' ? 'مالك' : user?.role === 'editor' ? 'محرر' : 'مشاهد'}</small></div></div>
          <button type="button" className="icon-btn" onClick={out} title="تسجيل الخروج"><Icon name="logout" /></button>
        </div>
      </aside>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
      <div className="main">
        <header className="topbar">
          <button type="button" className="icon-btn menu-btn" onClick={() => setOpen(true)} aria-label="القائمة"><Icon name="menu" /></button>
          {IS_MOCK && <span className="pill warn" title="البيانات محفوظة في هذا المتصفح فقط حتى يتم ربط الباك إند">وضع تجريبي</span>}
          <div className="spacer" />
          {siteUrl && <a className="btn ghost sm" href={siteUrl} target="_blank" rel="noreferrer"><Icon name="external" size={15} />عرض الموقع</a>}
          <button type="button" className="icon-btn" onClick={toggleTheme} title="تبديل المظهر"><Icon name={theme === 'light' ? 'moon' : 'sun'} /></button>
        </header>
        <main className="content"><Outlet /></main>
      </div>
    </div>
  );
}

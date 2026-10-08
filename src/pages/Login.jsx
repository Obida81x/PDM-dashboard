import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { IS_MOCK } from '../services/api';
import Icon from '../components/Icon';
import logo from '../assets/p-mark.png';

export default function Login() {
  const { user, login } = useAuth();
  const { theme, toggleTheme } = useUI();
  const [f, setF] = useState({ username: '', password: '' });
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (!f.username.trim() || !f.password) return setErr('اكتب اسم المستخدم وكلمة المرور.');
    setBusy(true); setErr('');
    try { await login(f); } catch (x) { setErr(x.message); setBusy(false); }
  };

  return (
    <div className="login">
      <button type="button" className="icon-btn login-theme" onClick={toggleTheme} aria-label="تبديل المظهر"><Icon name={theme === 'light' ? 'moon' : 'sun'} /></button>
      <div className="login-art" aria-hidden="true">
        <img src={logo} alt="" />
        <h2>كل ما في موقعك<br />من مكان واحد.</h2>
        <p>النصوص، الصور، المشاريع، قصتكم، الرسائل والإحصائيات — بدون ما تلمس سطر كود.</p>
      </div>
      <form className="login-card" onSubmit={submit} noValidate>
        <h1>تسجيل الدخول</h1>
        <p className="muted">ادخل بحساب مدير الموقع.</p>
        <label className="field"><span className="field-label">اسم المستخدم</span>
          <div className="input-ico"><Icon name="user" size={17} /><input className="input ltr" dir="ltr" autoComplete="username" value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} autoFocus /></div>
        </label>
        <label className="field"><span className="field-label">كلمة المرور</span>
          <div className="input-ico"><Icon name="lock" size={17} />
            <input className="input ltr" dir="ltr" type={show ? 'text' : 'password'} autoComplete="current-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
            <button type="button" className="eye" onClick={() => setShow(!show)} aria-label="إظهار كلمة المرور"><Icon name={show ? 'eyeOff' : 'eye'} size={17} /></button>
          </div>
        </label>
        {err && <div className="form-err" role="alert"><Icon name="alert" size={16} />{err}</div>}
        <button type="submit" className="btn primary lg" disabled={busy}>{busy ? 'جاري الدخول…' : 'دخول'}</button>
        {IS_MOCK && <p className="hint-demo">وضع تجريبي (بدون باك إند): المستخدم <b dir="ltr">admin</b> وكلمة المرور <b dir="ltr">admin123</b></p>}
      </form>
    </div>
  );
}

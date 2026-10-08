import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { ago } from '../utils';
import Icon from '../components/Icon';
import { PageHead, Select, TextInput, Toggle } from '../components/Fields';

const ROLES = [{ value: 'owner', label: 'مالك — صلاحيات كاملة' }, { value: 'editor', label: 'محرر — تعديل المحتوى' }, { value: 'viewer', label: 'مشاهد — قراءة فقط' }];
const roleName = (r) => ROLES.find((x) => x.value === r)?.label.split(' —')[0] || r;
const blank = { username: '', name: '', email: '', role: 'editor', password: '', active: true };

export default function Users() {
  const { user: me } = useAuth();
  const { toast, confirm } = useUI();
  const [items, setItems] = useState(null);
  const [form, setForm] = useState(null);
  const load = () => api.getUsers().then(setItems).catch((e) => { toast(e.message, 'err'); setItems([]); });
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    if (!form.username.trim()) return toast('اكتب اسم المستخدم.', 'err');
    if (!form.id && form.password.length < 8) return toast('كلمة المرور 8 أحرف على الأقل.', 'err');
    try { await api.saveUser(form); toast('تم الحفظ'); setForm(null); load(); } catch (e) { toast(e.message, 'err'); }
  };
  const del = async (u) => {
    if (!(await confirm({ title: `حذف الحساب «${u.username}»؟`, danger: true, okLabel: 'حذف' }))) return;
    try { await api.deleteUser(u.id); toast('تم الحذف'); load(); } catch (e) { toast(e.message, 'err'); }
  };

  return (
    <>
      <PageHead title="الحسابات" desc="مين بيقدر يدخل على لوحة التحكم وبأي صلاحية."
        actions={<button type="button" className="btn primary" onClick={() => setForm({ ...blank })}><Icon name="plus" size={16} />حساب جديد</button>} />
      {!items ? <div className="card state"><span className="spinner" /></div> : (
        <div className="card table-wrap">
          <table className="table">
            <thead><tr><th>الحساب</th><th>الصلاحية</th><th>الحالة</th><th>آخر دخول</th><th /></tr></thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.id}>
                  <td><div className="cell-user"><span className="avatar">{(u.name || u.username).slice(0, 1)}</span><div><strong>{u.name || u.username}</strong><small dir="ltr">{u.username}{u.email ? ` · ${u.email}` : ''}</small></div></div></td>
                  <td><span className="pill">{roleName(u.role)}</span></td>
                  <td><span className={`pill ${u.active ? 'ok' : 'off'}`}>{u.active ? 'فعّال' : 'موقوف'}</span></td>
                  <td>{u.lastLogin ? ago(u.lastLogin) : '—'}</td>
                  <td className="t-actions">
                    <button type="button" className="icon-btn" title="تعديل" onClick={() => setForm({ ...u, password: '' })}><Icon name="edit" size={15} /></button>
                    {u.id !== me.id && <button type="button" className="icon-btn danger" title="حذف" onClick={() => del(u)}><Icon name="trash" size={15} /></button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {form && (
        <div className="overlay" onClick={() => setForm(null)}>
          <div className="modal sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head"><h3>{form.id ? 'تعديل حساب' : 'حساب جديد'}</h3><button type="button" className="icon-btn" onClick={() => setForm(null)}><Icon name="x" /></button></div>
            <div className="stack">
              <TextInput label="الاسم" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <div className="grid2">
                <TextInput label="اسم المستخدم" ltr value={form.username} onChange={(v) => setForm({ ...form, username: v })} />
                <TextInput label="البريد" ltr value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
              </div>
              <TextInput label={form.id ? 'كلمة مرور جديدة (اتركها فاضية بدون تغيير)' : 'كلمة المرور'} type="password" ltr value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
              <Select label="الصلاحية" value={form.role} onChange={(v) => setForm({ ...form, role: v })} options={ROLES} />
              <Toggle label="الحساب فعّال" value={form.active} onChange={(v) => setForm({ ...form, active: v })} />
            </div>
            <div className="dialog-actions"><button type="button" className="btn ghost" onClick={() => setForm(null)}>إلغاء</button><button type="button" className="btn primary" onClick={save}>حفظ</button></div>
          </div>
        </div>
      )}
    </>
  );
}

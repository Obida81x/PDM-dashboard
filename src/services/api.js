/**
 * خدمة البيانات — المكان الوحيد الذي تتكلم منه اللوحة مع البيانات.
 *
 * الآن (بدون VITE_API_URL): وضع تجريبي، كل شيء محفوظ في متصفحك (localStorage) عشان تجرّب اللوحة كاملة.
 * لاحقاً: ضع  VITE_API_URL=https://your-backend.com/api  في ملف .env  ونفس الاستدعاءات تروح للباك إند
 * بدون تغيير أي كود في الصفحات. قائمة الـ endpoints الكاملة موجودة في README.md
 */
import seed from '../data/defaults.json';
import { mockAnalytics } from './analytics';

const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
export const IS_MOCK = !BASE;

const TOKEN_KEY = 'pdm-admin:token';
const DB_KEY = 'pdm-admin:db';
export const getToken = () => { try { return localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; } };
const setToken = (t) => { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ } };

export class ApiError extends Error {
  constructor(message, status = 0) { super(message); this.status = status; }
}

/* ───────────────────────── وضع الباك إند الحقيقي ───────────────────────── */
async function http(method, path, body, form = false) {
  const headers = { Accept: 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body && !form) headers['Content-Type'] = 'application/json';
  let res;
  try {
    res = await fetch(`${BASE}${path}`, { method, headers, body: body ? (form ? body : JSON.stringify(body)) : undefined });
  } catch {
    throw new ApiError('تعذّر الاتصال بالخادم. تأكد من الإنترنت أو من رابط الـ API.');
  }
  if (res.status === 401) { setToken(''); window.dispatchEvent(new Event('pdm-auth-lost')); throw new ApiError('انتهت الجلسة، سجّل الدخول من جديد.', 401); }
  if (!res.ok) {
    let msg = `فشل الطلب (${res.status})`;
    try { const j = await res.json(); msg = j.message || j.error || msg; } catch { /* ignore */ }
    throw new ApiError(msg, res.status);
  }
  return res.status === 204 ? null : res.json();
}

/* ───────────────────────── وضع تجريبي (localStorage) ───────────────────────── */
const clone = (v) => JSON.parse(JSON.stringify(v));
const uid = (p = 'id') => `${p}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-3)}`;
const now = () => new Date().toISOString();
const ago = (h) => new Date(Date.now() - h * 3600e3).toISOString();

function freshDb() {
  return {
    site: clone(seed.site),
    projects: clone(seed.projects),
    media: [],
    users: [{ id: 'u1', username: 'admin', name: 'مدير الموقع', email: 'admin@pdm.com', role: 'owner', password: 'admin123', active: true, createdAt: now(), lastLogin: null }],
    messages: [
      { id: 'm1', name: 'سامر خليل', email: 'samer@example.com', subject: 'موقع إلكتروني جديد', message: 'مرحباً، عندنا متجر صغير ونريد موقعاً حديثاً مع لوحة تحكم. ممكن نحدد موعد للنقاش؟', createdAt: ago(3), read: false },
      { id: 'm2', name: 'Lina Haddad', email: 'lina@studio.co', subject: 'هوية العلامة التجارية', message: 'We are launching a new studio and need a full brand identity. Could you share your pricing and timeline?', createdAt: ago(26), read: false },
      { id: 'm3', name: 'محمد ياسين', email: 'm.yassin@mail.com', subject: 'تسويق رقمي', message: 'نبحث عن شريك لإدارة حملات جوجل وميتا لمتجرنا.', createdAt: ago(70), read: true },
    ],
  };
}

/** ترقية بيانات قديمة محفوظة بالمتصفح لشكل النسخة الحالية */
function migrate(db) {
  const s = db.site;
  if (s.contact) delete s.contact.recipient;
  const old = s.slider || {};
  const slides = (old.slides || []).filter((x) => !(x.id === 's1' && !x.image));
  s.slider = { ...clone(seed.site.slider), ...old, slides, customEnabled: !!old.customEnabled };
  delete s.slider.enabled;
  return db;
}

function load() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return migrate(JSON.parse(raw));
  } catch { /* ignore */ }
  const db = freshDb();
  persist(db);
  return db;
}
function persist(db) {
  try { localStorage.setItem(DB_KEY, JSON.stringify(db)); }
  catch { throw new ApiError('مساحة التخزين المحلية امتلأت (غالباً بسبب الصور). في الوضع الحقيقي الصور بتنرفع للسيرفر.'); }
}
const wait = (v) => new Promise((r) => setTimeout(() => r(clone(v)), 120));
const safeUser = ({ password, ...u }) => u;

function sessionUser(db) {
  const t = getToken();
  const id = t && atob(t).split(':')[0];
  const u = db.users.find((x) => x.id === id && x.active);
  if (!u) { setToken(''); throw new ApiError('انتهت الجلسة، سجّل الدخول من جديد.', 401); }
  return u;
}

/** تصغير الصورة قبل حفظها في الوضع التجريبي */
function fileToDataUrl(file, max = 1800) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new ApiError('تعذّر قراءة الملف.'));
    reader.onload = () => {
      if (file.type === 'image/svg+xml' || file.type === 'image/gif') return resolve(reader.result);
      const img = new Image();
      img.onerror = () => reject(new ApiError('الملف ليس صورة صالحة.'));
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

const mock = {
  async login({ username, password }) {
    const db = load();
    const u = db.users.find((x) => x.username === username.trim() && x.password === password);
    if (!u) throw new ApiError('اسم المستخدم أو كلمة المرور غير صحيحة.', 401);
    if (!u.active) throw new ApiError('هذا الحساب موقوف.', 403);
    u.lastLogin = now(); persist(db);
    const token = btoa(`${u.id}:${Date.now()}`);
    return wait({ token, user: safeUser(u) });
  },
  async me() { return wait(safeUser(sessionUser(load()))); },
  async changePassword({ current, next }) {
    const db = load(); const u = sessionUser(db);
    if (u.password !== current) throw new ApiError('كلمة المرور الحالية غير صحيحة.', 400);
    u.password = next; persist(db); return wait({ ok: true });
  },
  async getSite() { return wait(load().site); },
  async saveSite(site) { const db = load(); sessionUser(db); db.site = site; persist(db); return wait(site); },
  async resetSite() { const db = load(); db.site = clone(seed.site); db.projects = clone(seed.projects); persist(db); return wait({ ok: true }); },

  async getProjects() { return wait(load().projects.sort((a, b) => a.order - b.order)); },
  async saveProject(p) {
    const db = load(); sessionUser(db);
    if (db.projects.some((x) => x.slug === p.slug && x.id !== p.id)) throw new ApiError('هذا الرابط (slug) مستخدم لمشروع آخر، غيّره.', 409);
    const i = db.projects.findIndex((x) => x.id === p.id);
    if (i >= 0) db.projects[i] = p;
    else db.projects.push({ ...p, id: p.id || uid('p'), order: db.projects.length });
    persist(db); return wait(p);
  },
  async deleteProject(id) { const db = load(); sessionUser(db); db.projects = db.projects.filter((p) => p.id !== id).map((p, i) => ({ ...p, order: i })); persist(db); return wait({ ok: true }); },
  async orderProjects(ids) { const db = load(); sessionUser(db); db.projects.forEach((p) => { p.order = ids.indexOf(p.id); }); persist(db); return wait({ ok: true }); },

  async getMessages() { return wait(load().messages.sort((a, b) => b.createdAt.localeCompare(a.createdAt))); },
  async updateMessage(id, patch) { const db = load(); const m = db.messages.find((x) => x.id === id); if (m) Object.assign(m, patch); persist(db); return wait(m); },
  async deleteMessage(id) { const db = load(); db.messages = db.messages.filter((m) => m.id !== id); persist(db); return wait({ ok: true }); },

  async getMedia() { return wait(load().media.sort((a, b) => b.createdAt.localeCompare(a.createdAt))); },
  async uploadMedia(file) {
    const db = load(); sessionUser(db);
    const url = await fileToDataUrl(file);
    const item = { id: uid('img'), url, name: file.name, size: Math.round((url.length * 3) / 4), createdAt: now() };
    db.media.push(item); persist(db); return wait(item);
  },
  async deleteMedia(id) { const db = load(); db.media = db.media.filter((m) => m.id !== id); persist(db); return wait({ ok: true }); },

  async getUsers() { return wait(load().users.map(safeUser)); },
  async saveUser(u) {
    const db = load(); sessionUser(db);
    if (db.users.some((x) => x.username === u.username && x.id !== u.id)) throw new ApiError('اسم المستخدم مأخوذ.', 409);
    const i = db.users.findIndex((x) => x.id === u.id);
    if (i >= 0) { const { password, ...rest } = u; Object.assign(db.users[i], rest); if (password) db.users[i].password = password; }
    else db.users.push({ ...u, id: uid('u'), createdAt: now(), lastLogin: null });
    persist(db); return wait({ ok: true });
  },
  async deleteUser(id) {
    const db = load(); const me = sessionUser(db);
    if (me.id === id) throw new ApiError('ما بتقدر تحذف حسابك الحالي.', 400);
    db.users = db.users.filter((u) => u.id !== id); persist(db); return wait({ ok: true });
  },

  async getAnalytics(range) { const db = load(); return wait(mockAnalytics(range, db.projects, db.messages.length)); },
};

/* ───────────────────────── الواجهة العامة ───────────────────────── */
const real = {
  login: (b) => http('POST', '/auth/login', b),
  me: () => http('GET', '/auth/me'),
  changePassword: (b) => http('POST', '/auth/change-password', b),
  getSite: () => http('GET', '/site'),
  saveSite: (s) => http('PUT', '/site', s),
  resetSite: () => http('POST', '/site/reset'),
  getProjects: () => http('GET', '/projects'),
  saveProject: (p) => (p.id && !p.__new ? http('PUT', `/projects/${p.id}`, p) : http('POST', '/projects', p)),
  deleteProject: (id) => http('DELETE', `/projects/${id}`),
  orderProjects: (ids) => http('PUT', '/projects/order', { ids }),
  getMessages: () => http('GET', '/messages'),
  updateMessage: (id, patch) => http('PATCH', `/messages/${id}`, patch),
  deleteMessage: (id) => http('DELETE', `/messages/${id}`),
  getMedia: () => http('GET', '/media'),
  uploadMedia: (file) => { const f = new FormData(); f.append('file', file); return http('POST', '/media', f, true); },
  deleteMedia: (id) => http('DELETE', `/media/${id}`),
  getUsers: () => http('GET', '/users'),
  saveUser: (u) => (u.id ? http('PUT', `/users/${u.id}`, u) : http('POST', '/users', u)),
  deleteUser: (id) => http('DELETE', `/users/${id}`),
  getAnalytics: (range) => http('GET', `/analytics?range=${range}`),
};

const impl = IS_MOCK ? mock : real;
export const api = {
  ...impl,
  async login(creds) { const r = await impl.login(creds); setToken(r.token); return r.user; },
  logout() { setToken(''); },
};

/** نسخة احتياطية: تصدير/استيراد كل محتوى الموقع كملف JSON */
export async function exportBackup() {
  const [site, projects] = await Promise.all([api.getSite(), api.getProjects()]);
  return JSON.stringify({ version: 1, exportedAt: now(), site, projects }, null, 2);
}
export async function importBackup(text) {
  let data;
  try { data = JSON.parse(text); } catch { throw new ApiError('الملف ليس JSON صالح.'); }
  if (!data.site || !Array.isArray(data.projects)) throw new ApiError('الملف لا يحتوي على بيانات الموقع المتوقعة.');
  await api.saveSite(data.site);
  for (const p of data.projects) await api.saveProject({ ...p, __new: !IS_MOCK });
}
export { uid };

export const getIn = (obj, path) => path.reduce((o, k) => (o == null ? o : o[k]), obj);

export function setIn(obj, path, value) {
  if (!path.length) return value;
  const [k, ...rest] = path;
  const copy = Array.isArray(obj) ? [...obj] : { ...(obj || {}) };
  copy[k] = setIn(obj?.[k], rest, value);
  return copy;
}

export const clone = (v) => JSON.parse(JSON.stringify(v));
export const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export function slugify(s = '') {
  return s.toString().toLowerCase().trim().replace(/[^a-z0-9\u0600-\u06ff]+/g, '-').replace(/^-+|-+$/g, '');
}

export const num = (n) => new Intl.NumberFormat('en-US').format(n);
export const fmtSize = (b) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
export const fmtDate = (iso) => new Date(iso).toLocaleDateString('ar', { year: 'numeric', month: 'short', day: 'numeric' });
export const fmtDateTime = (iso) => new Date(iso).toLocaleString('ar', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
export const fmtDur = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export function ago(iso) {
  const m = Math.round((Date.now() - new Date(iso)) / 60000);
  if (m < 1) return 'الآن';
  if (m < 60) return `قبل ${m} د`;
  if (m < 1440) return `قبل ${Math.round(m / 60)} س`;
  return `قبل ${Math.round(m / 1440)} يوم`;
}

export const emptyL = () => ({ ar: '', en: '' });

export const isImgUrl = (s) => typeof s === 'string' && /^(https?:)?\/\/|^\/|^data:image/.test(s);

/** صور المشروع الحقيقية (الغلاف + المعرض) بدون تكرار — هي اللي بتنضاف تلقائياً للسلايدر الرئيسي */
export function sliderImages(p) {
  return [...new Set([p.cover, ...(p.gallery || [])].filter(isImgUrl))];
}

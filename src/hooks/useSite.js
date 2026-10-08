import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';
import { useUI } from '../context/UIContext';
import { clone, same } from '../utils';

/**
 * يحمّل مستند الموقع، ويحتفظ بنسخة مسودة للتعديل، ويحفظ عند الضغط على «حفظ ونشر».
 */
export function useSite() {
  const { toast } = useUI();
  const [orig, setOrig] = useState(null);
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    setError(null);
    api.getSite().then((s) => { if (alive) { setOrig(s); setDraft(clone(s)); } }).catch((e) => alive && setError(e));
    return () => { alive = false; };
  }, [tick]);

  const dirty = !!draft && !same(orig, draft);

  useEffect(() => {
    if (!dirty) return undefined;
    const h = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  const save = useCallback(async () => {
    setSaving(true);
    try { const s = await api.saveSite(draft); setOrig(s); setDraft(clone(s)); toast('تم الحفظ والنشر ✓'); return true; }
    catch (e) { toast(e.message, 'err'); return false; }
    finally { setSaving(false); }
  }, [draft, toast]);

  return { site: draft, setSite: setDraft, dirty, save, saving, error, discard: () => setDraft(clone(orig)), reload: () => setTick((n) => n + 1) };
}

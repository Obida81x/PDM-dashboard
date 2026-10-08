import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem('pdm-admin:theme') || 'light'; } catch { return 'light'; } });
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const id = useRef(0);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('pdm-admin:theme', theme); } catch { /* ignore */ }
  }, [theme]);

  const toast = useCallback((message, type = 'ok') => {
    const n = ++id.current;
    setToasts((t) => [...t, { id: n, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== n)), 4200);
  }, []);

  /** await confirm({ title, text, danger, okLabel }) → true / false */
  const confirm = useCallback((opts) => new Promise((resolve) => setConfirmState({ ...opts, resolve })), []);
  const closeConfirm = (v) => { confirmState?.resolve(v); setConfirmState(null); };

  const value = useMemo(() => ({ theme, toggleTheme: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')), toast, confirm }), [theme, toast, confirm]);

  return (
    <UIContext.Provider value={value}>
      {children}
      <div className="toasts" aria-live="polite">
        {toasts.map((t) => (<div key={t.id} className={`toast ${t.type}`}>{t.message}</div>))}
      </div>
      {confirmState && (
        <div className="overlay" onClick={() => closeConfirm(false)}>
          <div className="dialog" role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3>{confirmState.title}</h3>
            {confirmState.text && <p>{confirmState.text}</p>}
            <div className="dialog-actions">
              <button type="button" className="btn ghost" onClick={() => closeConfirm(false)}>{confirmState.cancelLabel || 'إلغاء'}</button>
              <button type="button" className={`btn ${confirmState.danger ? 'danger' : 'primary'}`} autoFocus onClick={() => closeConfirm(true)}>{confirmState.okLabel || 'تأكيد'}</button>
            </div>
          </div>
        </div>
      )}
    </UIContext.Provider>
  );
}
export const useUI = () => useContext(UIContext);

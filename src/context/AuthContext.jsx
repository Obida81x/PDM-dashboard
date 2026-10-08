import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, getToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    if (!getToken()) { setReady(true); return undefined; }
    api.me().then((u) => alive && setUser(u)).catch(() => {}).finally(() => alive && setReady(true));
    const lost = () => setUser(null);
    window.addEventListener('pdm-auth-lost', lost);
    return () => { alive = false; window.removeEventListener('pdm-auth-lost', lost); };
  }, []);

  const login = useCallback(async (creds) => { const u = await api.login(creds); setUser(u); return u; }, []);
  const logout = useCallback(() => { api.logout(); setUser(null); }, []);
  const value = useMemo(() => ({ user, ready, login, logout }), [user, ready, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);

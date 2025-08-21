import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import http from '../lib/http';

const AuthContext = createContext(null);

export function useAuth(){
  const ctx = useContext(AuthContext);
  if(!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }){
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const bootstrap = useCallback(async ()=>{
    try {
      const token = localStorage.getItem('access_token');
      if(!token){ setLoading(false); return; }
      const { data } = await http.get('/me');
      setUser(data.user);
      setIsAuthenticated(true);
    } catch(e){
      localStorage.removeItem('access_token');
      setIsAuthenticated(false);
    } finally { setLoading(false); }
  },[]);

  useEffect(()=>{ bootstrap(); },[bootstrap]);

  async function login({ email, password }){
    const { data } = await http.post('/login',{ email, password });
    localStorage.setItem('access_token', data.access_token);
    await bootstrap();
  }

  async function googleLogin(id_token){
    const { data } = await http.post('/google-login',{ id_token });
    localStorage.setItem('access_token', data.access_token);
    await bootstrap();
  }

  function logout(){
    localStorage.removeItem('access_token');
    setUser(null); setIsAuthenticated(false);
  }

  return <AuthContext.Provider value={{ user, isAuthenticated, loading, login, googleLogin, logout }}>
    {children}
  </AuthContext.Provider>;
}

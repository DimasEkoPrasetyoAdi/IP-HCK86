import { useState } from 'react';
import { useNavigate } from 'react-router';
import http from '../lib/http';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [fullname, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await http.post('/register', { fullname, email, password });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Register gagal, coba lagi!');
    } finally { setLoading(false); }
  };

  const bgImage = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80';

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-10 text-white">
      <img src={bgImage} alt="BG" className="absolute inset-0 w-full h-full object-cover brightness-[0.75] saturate-125" />
      <div className="absolute inset-0 bg-[#061a2d]/80 backdrop-blur-sm" />
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-teal-400/5 to-transparent" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-wide"><span className="text-cyan-300">TRAVELL</span>ID</h1>
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-xl shadow-cyan-900/30 p-8">
          <h2 className="text-xl font-semibold mb-6 tracking-wide">Buat Akun</h2>
          {error && <div className="mb-4 text-sm text-red-300 bg-red-900/30 border border-red-500/30 rounded px-3 py-2">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wide text-cyan-100/70 mb-2">Full Name</label>
              <input
                type="text"
                value={fullname}
                onChange={e=>setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/15 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-300/60 placeholder-cyan-200/40 text-sm"
                placeholder="Nama Lengkap"
                required
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-cyan-100/70 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e=>setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/15 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-300/60 placeholder-cyan-200/40 text-sm"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-cyan-100/70 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e=>setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/15 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-300/60 placeholder-cyan-200/40 text-sm"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full relative group overflow-hidden rounded-full py-3 font-semibold tracking-wide transition ${loading? 'bg-cyan-400/60 cursor-not-allowed':'bg-gradient-to-r from-cyan-300 via-teal-200 to-blue-200 text-[#06253d] hover:from-cyan-200 hover:to-blue-100'}`}
            >
              {loading && <span className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#06253d]/40 border-t-transparent rounded-full animate-spin" />}
              <span className="relative">{loading? 'Memproses...':'Register'}</span>
              <span className="absolute inset-0 rounded-full ring-1 ring-white/40 mix-blend-overlay" />
            </button>
          </form>
          <p className="mt-6 text-center text-xs text-cyan-100/70">Sudah punya akun? <button onClick={()=>navigate('/login')} className="underline decoration-cyan-300/50 hover:decoration-cyan-200 underline-offset-4 font-medium">Login</button></p>
        </div>
        <p className="mt-6 text-center text-[10px] text-cyan-100/40 tracking-wide">© {new Date().getFullYear()} TravellID</p>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import http from '../lib/http';
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { googleLoginThunk } from '../store/slices/authSlice';

export default function GoogleLoginButton({ onSuccess }) {
  const divRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  // Ambil dari .env (WAJIB). Hindari fallback agar tidak menimbulkan origin mismatch dari client ID lain.
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    /* global google */
    const init = () => {
      if (window.google && window.google.accounts && divRef.current) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (credentialResponse) => {
            try {
              setLoading(true);
              const { credential: id_token } = credentialResponse;
              const res = await dispatch(googleLoginThunk(id_token));
              if (res.meta.requestStatus === 'rejected') {
                throw new Error(res.payload || 'Google login gagal');
              }
              if(onSuccess) onSuccess();
              navigate('/trips');
            } catch (err) {
              console.error('Google login gagal', err.response?.data || err.message);
              alert(err.response?.data?.error || 'Google login gagal');
            } finally { setLoading(false); }
          },
        });
        window.google.accounts.id.renderButton(divRef.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: 'signin_with',
          logo_alignment: 'center'
        });
      }
    };
    if (window.google && window.google.accounts) {
      init();
    } else {
      const interval = setInterval(() => {
        if (window.google && window.google.accounts) {
          clearInterval(interval);
          init();
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, [clientId, onSuccess, navigate]);

  const warn = !clientId; // true jika belum diset

  return (
    <div className="mt-4 flex flex-col items-center">
      <div ref={divRef} />
      {warn && (
        <p className="mt-2 text-[11px] text-red-300/90 text-center leading-snug">
          VITE_GOOGLE_CLIENT_ID belum diset.<br/>Buat file <code>.env</code> di root project client & restart dev server.
        </p>
      )}
      {loading && <p className="text-[10px] text-cyan-200 mt-2">Memproses Google login...</p>}
    </div>
  );
}

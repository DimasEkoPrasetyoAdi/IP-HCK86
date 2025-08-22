import { useEffect } from 'react';
import http from '../lib/http';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFavourites } from '../store/slices/favouritesSlice';

export default function FavouriteTrips(){
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { list: items, loading } = useSelector((s)=>s.favourites);
  useEffect(()=>{
    const token = localStorage.getItem('access_token');
    if(!token) return navigate('/login');
    dispatch(fetchFavourites());
  },[dispatch, navigate]);
  const bgImage = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80';
  if(loading) return <div className="relative min-h-screen text-white flex items-center justify-center">Loading...</div>;
  return (
    <div className="relative min-h-screen text-white">
      <Navbar />
      <img src={bgImage} alt="BG" className="fixed inset-0 w-full h-full object-cover brightness-[0.7] saturate-125" />
      <div className="fixed inset-0 bg-[#061a2d]/85 backdrop-blur-sm" />
      <div className="fixed inset-0 bg-gradient-to-br from-cyan-500/10 via-teal-400/5 to-transparent" />
      <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-32">
        <div className="flex items-end justify-between flex-wrap gap-6">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight leading-tight"><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-blue-200">Favourite Trips</span></h2>
            <p className="mt-3 text-cyan-100/70 text-sm max-w-xl">Koleksi perjalanan yang kamu tandai agar mudah diakses kembali.</p>
          </div>
        </div>
        {items.length===0 && <p className="mt-12 text-cyan-100/60 text-sm">Tidak ada favourite trip.</p>}
        <div className="mt-12 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map(f=> (
            <div key={f.id} className="group relative rounded-xl overflow-hidden bg-white/10 backdrop-blur-xl border border-white/15 shadow-lg shadow-cyan-900/20 hover:shadow-cyan-800/40 transition flex flex-col">
              <div className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 bg-gradient-to-br from-cyan-300/10 via-transparent to-blue-200/10 pointer-events-none" />
              <div className="p-5 relative z-10 flex flex-col flex-1">
                <h3 className="font-semibold text-lg mb-1 tracking-wide group-hover:text-cyan-200 transition-colors">{f.Trip?.title}</h3>
                <p className="text-xs text-cyan-100/70 mb-1">{f.Trip?.city}</p>
                <p className="text-[10px] text-cyan-100/40">{f.Trip?.startDate} → {f.Trip?.endDate}</p>
                <div className="mt-4 flex gap-2 flex-wrap">
                  <button onClick={()=>navigate(`/trips/${f.Trip?.id}`)} className="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-[11px] font-medium tracking-wide">View</button>
                  <button onClick={async()=>{await http.delete(`/favourite-trips/${f.id}`,{ headers:{ Authorization:`Bearer ${localStorage.getItem('access_token')}`}}); /* could dispatch refetch or local remove if we track */ dispatch(fetchFavourites()); }} className="px-3 py-1.5 rounded-full bg-red-500/80 hover:bg-red-500 text-[11px] font-medium tracking-wide">Remove</button>
                </div>
                {f.note && <p className="text-[11px] mt-4 bg-white/10 border border-white/10 rounded-lg p-3 text-cyan-100/80 leading-relaxed flex-1">{f.note}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

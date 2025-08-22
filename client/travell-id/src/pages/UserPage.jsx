// src/pages/UserPage.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router";
import http from "../lib/http";
import Navbar from "../components/Navbar";
import { useDispatch, useSelector } from 'react-redux';
import { fetchTrips, removeById } from '../store/slices/tripsSlice';
// Removed automatic city images (not relevant). Using neutral gradient block instead.

export default function UserPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { list: trips, loading } = useSelector((s) => s.trips);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return navigate('/login');
    dispatch(fetchTrips());
  }, [dispatch, navigate]);

  const bgImage = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80';

  return (
    <div className="relative min-h-screen text-white">
      <Navbar />
      {/* Background */}
      <img src={bgImage} alt="BG" className="fixed inset-0 w-full h-full object-cover brightness-[0.7] saturate-125" />
      <div className="fixed inset-0 bg-[#061a2d]/85 backdrop-blur-sm" />
      <div className="fixed inset-0 bg-gradient-to-br from-cyan-500/10 via-teal-400/5 to-transparent" />

      {/* Header */}
      <header className="relative pt-32 pb-20 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-blue-200">Your Adventures</span>
          </h2>
          <p className="mt-4 text-cyan-100/80 max-w-2xl mx-auto text-sm md:text-base">Kelola rencana perjalananmu dan lanjutkan eksplorasi destinasi Indonesia.</p>
          <button
            onClick={()=>navigate('/trips/new')}
            className="mt-8 relative overflow-hidden px-8 py-3 rounded-full font-semibold text-[#06253d] bg-gradient-to-r from-cyan-300 via-teal-200 to-blue-200 hover:from-cyan-200 hover:to-blue-100 shadow-lg shadow-cyan-900/40 ring-1 ring-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
          >
            Add New Trip
            <span className="absolute inset-0 rounded-full ring-1 ring-white/40 mix-blend-overlay" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="relative max-w-7xl mx-auto px-6 pb-32">
  {trips.length === 0 && !loading && (
          <div className="text-center text-cyan-100/70 text-sm">Belum ada trip. Mulai buat perjalanan pertamamu.</div>
        )}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {trips.map(trip => (
            <div key={trip.id} className="relative group rounded-xl overflow-hidden bg-white/10 backdrop-blur-xl border border-white/15 shadow-lg shadow-cyan-900/20 hover:shadow-cyan-800/40 transition">
              <div className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 bg-gradient-to-br from-cyan-300/10 via-transparent to-blue-200/10 pointer-events-none" />
              <div className="h-40 w-full relative flex items-end justify-start bg-gradient-to-br from-cyan-500/30 via-teal-400/20 to-blue-500/20">
                <button onClick={()=>navigate(`/trips/${trip.id}`)} className="m-4 text-left">
                  <h4 className="text-base font-bold tracking-wide text-white drop-shadow group-hover:text-cyan-200 transition-colors">{trip.title}</h4>
                  <p className="text-[11px] text-cyan-100/70 font-medium">{trip.city}</p>
                </button>
              </div>
              <div className="p-5 pt-4">
                <p className="text-[10px] text-cyan-100/40 mb-3">Created: {new Date(trip.createdAt).toLocaleDateString()}</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-[11px] font-medium tracking-wide"
                    onClick={()=>navigate(`/trips/${trip.id}`)}
                  >View</button>
                  <button
                    className="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-[11px] font-medium tracking-wide"
                    onClick={()=>navigate(`/trips/${trip.id}/edit`)}
                  >Edit</button>
                  <button
                    className="px-3 py-1.5 rounded-full bg-red-500/80 hover:bg-red-500 text-[11px] font-medium tracking-wide"
                    onClick={async()=>{
                      try {
                        await http.delete(`/trips/${trip.id}`);
                        dispatch(removeById(trip.id));
                      } catch (e) {
                        // error alert handled globally by interceptor
                      }
                    }}
                  >Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

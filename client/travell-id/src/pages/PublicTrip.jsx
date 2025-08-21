import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import TripPDF from '../components/TripPDF';
import { PDFDownloadLink } from '@react-pdf/renderer';

export default function PublicTrip(){
  const { slug } = useParams();
  const [trip,setTrip]=useState(null);
  const [error,setError]=useState(null);
  const navigate = useNavigate();
  useEffect(()=>{
    (async()=>{
      try{
        const res = await fetch(`http://localhost:3000/api/public/trips/${slug}`);
        if(!res.ok) throw new Error('Trip not found');
        const data = await res.json();
        setTrip(data);
      }catch(e){ setError(e.message); }
    })();
  },[slug]);
  const bgImage = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80';
  if(error) return <div className="relative min-h-screen flex items-center justify-center text-red-300">{error}</div>;
  if(!trip) return <div className="relative min-h-screen flex items-center justify-center text-white">Loading...</div>;
  return (
    <div className="relative min-h-screen text-white">
      <img src={bgImage} alt="BG" className="fixed inset-0 w-full h-full object-cover brightness-[0.7] saturate-125" />
      <div className="fixed inset-0 bg-[#061a2d]/85 backdrop-blur-sm" />
      <div className="fixed inset-0 bg-gradient-to-br from-cyan-500/10 via-teal-400/5 to-transparent" />
      <div className="relative max-w-4xl mx-auto px-6 pt-32 pb-32 space-y-10">
        <header className="space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight"><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-blue-200">{trip.title}</span></h1>
          <p className="text-cyan-100/70 text-sm md:text-base">{trip.city} • {trip.startDate} → {trip.endDate}</p>
        </header>
        <div className="rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 shadow-lg shadow-cyan-900/30 overflow-hidden">
          <h3 className="text-base font-semibold mb-4 tracking-wide text-cyan-100/80">Itinerary (Raw)</h3>
          <div className="relative max-h-80 overflow-auto text-[11px] leading-relaxed text-cyan-100/90 font-mono">
            <pre>{JSON.stringify(trip.itinerary,null,2)}</pre>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <PDFDownloadLink document={<TripPDF trip={trip} />} fileName={`itinerary-${trip.shareSlug}.pdf`} className="relative px-6 py-2.5 rounded-full font-medium tracking-wide bg-gradient-to-r from-cyan-300 via-teal-200 to-blue-200 text-[#06253d] hover:from-cyan-200 hover:to-blue-100 shadow-lg ring-1 ring-white/30">
            {({loading})=> loading? 'Menyiapkan PDF...' : 'Download PDF'}
          </PDFDownloadLink>
          <button onClick={()=>navigate('/login')} className="px-6 py-2.5 rounded-full font-medium tracking-wide bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-cyan-100">Login untuk simpan</button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import http from '../lib/http';
import Navbar from '../components/Navbar';
import TripPDF from '../components/TripPDF';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { clientWeather } from '../lib/weather';

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [isFav, setIsFav] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return navigate('/login');
        const res = await http.get(`/trips/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        let tripData = res.data;
        // If backend weather missing or fallback placeholder, enrich on client
        if (!tripData.weather || tripData.weather.error || (tripData.weather.dailySummary && tripData.weather.dailySummary.every(d=>d.temp_max==null))) {
          const w = await clientWeather(tripData.lat, tripData.lon, tripData.startDate, tripData.endDate);
          if (w && w.dailySummary) {
            tripData = { ...tripData, weather: { ...(tripData.weather||{}), dailySummary: w.dailySummary, source: 'client_detail' } };
          }
        }
        setTrip(tripData);
        // check favourites
        try {
          const favs = await http.get('/favourite-trips', { headers:{ Authorization:`Bearer ${token}` }});
          const match = favs.data.find(f=>f.TripId === tripData.id);
          if(match) setIsFav(true);
        } catch(_){ }
      } catch (e) {
        setError('Failed to load trip');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const renderItinerary = () => {
    if (!trip?.itinerary) return <p className="text-gray-500">No itinerary yet.</p>;
    const data = trip.itinerary.itinerary || trip.itinerary; // accommodate both shapes
    if (!Array.isArray(data)) return <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto">{JSON.stringify(trip.itinerary, null, 2)}</pre>;
    const weatherMap = (trip.weather?.dailySummary || []).reduce((acc, d, idx)=>{acc[d.date]= {...d, idx}; return acc;}, {});
    return (
      <div className="space-y-6">
        {data.map(day => {
          const wx = trip.weather?.dailySummary?.[day.day - 1];
          return (
            <div key={day.day} className="rounded-lg border border-gray-200 bg-white/95 shadow-sm p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h4 className="text-[14px] font-bold text-black m-0">Day {day.day}</h4>
                {wx && (
                  <div className="text-[11px] font-bold text-black bg-gray-100 px-3 py-1 rounded border border-gray-300">
                    {wx.condition} | {wx.temp_min}°C - {wx.temp_max}°C • {wx.precipitation_mm} mm
                  </div>
                )}
              </div>
              <ul className="space-y-3">
                {(day.activities || []).map((act,i)=>(
                  <li key={i} className="rounded-md border border-gray-200 bg-gray-50 p-3">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-black">{act.time}</span>
                      {act.duration && <span className="text-xs font-bold text-black">{act.duration}</span>}
                    </div>
                    <p className="mt-1 text-sm font-bold text-black leading-snug">{act.activity}</p>
                    {act.description && <p className="text-xs text-gray-700 mt-1 leading-relaxed">{act.description}</p>}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    );
  };

  const bgImage = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80';
  if (loading) return <div className="relative min-h-screen text-white flex items-center justify-center">Loading...</div>;
  if (error) return <div className="relative min-h-screen text-red-300 flex items-center justify-center">{error}</div>;

  return (
    <div className="relative min-h-screen text-white">
      <Navbar />
      <img src={bgImage} alt="BG" className="fixed inset-0 w-full h-full object-cover brightness-[0.7] saturate-125" />
      <div className="fixed inset-0 bg-[#061a2d]/85 backdrop-blur-sm" />
      <div className="fixed inset-0 bg-gradient-to-br from-cyan-500/10 via-teal-400/5 to-transparent" />
      <div className="relative max-w-6xl mx-auto px-6 pt-32 pb-32 space-y-12">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div className="space-y-2">
            <h2 className="text-4xl font-extrabold tracking-tight leading-tight"><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-blue-200">{trip.title}</span></h2>
            <p className="text-cyan-100/70 text-sm md:text-base">{trip.city} • {trip.startDate} → {trip.endDate} ({Math.round((new Date(trip.endDate)-new Date(trip.startDate))/86400000)+1} hari)</p>
            {trip.lat && trip.lon && <p className="text-[11px] text-cyan-100/40">Lat {trip.lat}, Lon {trip.lon}</p>}
            {Array.isArray(trip.interest) && trip.interest.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {trip.interest.map((tag,i)=>(<span key={i} className="px-3 py-1 rounded-full bg-gradient-to-r from-cyan-300/20 to-teal-200/20 text-cyan-100 text-[11px] font-medium border border-cyan-300/30">{tag}</span>))}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <PDFDownloadLink document={<TripPDF trip={trip} />} fileName={`itinerary-${trip.id}.pdf`} className="relative px-6 py-2.5 rounded-full font-medium tracking-wide bg-gradient-to-r from-cyan-300 via-teal-200 to-blue-200 text-[#06253d] hover:from-cyan-200 hover:to-blue-100 shadow-lg ring-1 ring-white/30">
              {({ loading: pdfLoading }) => pdfLoading ? 'Generating...' : 'Download PDF'}
            </PDFDownloadLink>
            <button onClick={async()=>{
              const token = localStorage.getItem('access_token');
              if(!isFav){
                await http.post('/favourite-trips', { tripId: trip.id }, { headers:{ Authorization:`Bearer ${token}` }});
                setIsFav(true);
              } else {
                const favs = await http.get('/favourite-trips',{ headers:{ Authorization:`Bearer ${token}` }});
                const fav = favs.data.find(f=>f.TripId === trip.id);
                if(fav){ await http.delete(`/favourite-trips/${fav.id}`, { headers:{ Authorization:`Bearer ${token}` }}); }
                setIsFav(false);
              }
            }} className={`px-6 py-2.5 rounded-full font-medium tracking-wide bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 ${isFav? 'text-red-300':'text-cyan-100'}`}>{isFav? 'Unfavourite':'Favourite'}</button>
            <button onClick={()=>{ const link = `${window.location.origin}/share/${trip.shareSlug}`; navigator.clipboard.writeText(link).then(()=>{ setShareCopied(true); setTimeout(()=>setShareCopied(false),1500); }); }} className="px-6 py-2.5 rounded-full font-medium tracking-wide bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-cyan-100">{shareCopied? 'Copied!':'Copy Share Link'}</button>
            <button onClick={()=>navigate(`/trips/${trip.id}/edit`)} className="px-6 py-2.5 rounded-full font-medium tracking-wide bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-cyan-100">Edit</button>
            <button onClick={()=>navigate('/trips')} className="px-6 py-2.5 rounded-full font-medium tracking-wide bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-cyan-100">Back</button>
          </div>
        </div>

        {trip.note_markdown && (
          <div className="rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 shadow-lg shadow-cyan-900/30">
            <h3 className="text-base font-semibold mb-3 tracking-wide text-cyan-100/80">Notes</h3>
            <pre className="whitespace-pre-wrap text-xs md:text-sm leading-relaxed text-cyan-100/90 font-mono">{trip.note_markdown}</pre>
          </div>
        )}

        {trip.weather && (
          <div className="rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 shadow-lg shadow-cyan-900/30 overflow-hidden">
            <h3 className="text-base font-semibold mb-4 tracking-wide text-cyan-100/80">Weather Snapshot</h3>
            {trip.weather.dailySummary ? (
              <div className="grid md:grid-cols-3 gap-3 text-[11px]">
                {trip.weather.dailySummary.map((d,i)=>(
                  <div key={i} className="p-3 rounded border border-white/10 bg-white/5">
                    <p className="font-semibold text-cyan-100/90 mb-1">{d.date}</p>
                    <p className="text-cyan-100/70">{d.condition}</p>
                    <p className="text-cyan-100/50">{d.temp_min ?? '-'}°C - {d.temp_max ?? '-'}°C</p>
                    <p className="text-cyan-100/40">Rain: {d.precipitation_mm ?? '-'} mm</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative max-h-60 overflow-auto text-[11px] leading-relaxed">
                <pre>{JSON.stringify(trip.weather.daily || trip.weather, null, 2)}</pre>
              </div>
            )}
          </div>
        )}

        <div className="rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 shadow-lg shadow-cyan-900/30">
          <h3 className="text-xl font-semibold mb-6 tracking-wide text-cyan-100/90">Itinerary</h3>
          <div className="space-y-8">{renderItinerary()}</div>
        </div>
      </div>
    </div>
  );
}

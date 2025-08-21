import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import http from "../lib/http";
import { PDFDownloadLink } from '@react-pdf/renderer';
import TripPDF from '../components/TripPDF';
import Navbar from "../components/Navbar";

export default function TripForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [progressIdx, setProgressIdx] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [tripResult, setTripResult] = useState(null); // NEW: holds created trip with itinerary
  const [interestTemp, setInterestTemp] = useState(""); // NEW temp input value
  const [errorMsg, setErrorMsg] = useState("");
  const progressSteps = [
    "Menyiapkan data destinasi", // preparing destination
    "Mengambil data cuaca",      // fetching weather
    "Meminta AI membuat itinerary", // calling AI
    "Menyusun hasil akhir"       // finalizing
  ];

  // simulate progress while waiting response
  useEffect(() => {
    let timer;
    if (showProgress && loading) {
      timer = setInterval(() => {
        setProgressIdx((i) => (i < progressSteps.length - 1 ? i + 1 : i));
      }, 1300);
    } else {
      setProgressIdx(0);
    }
    return () => clearInterval(timer);
  }, [showProgress, loading]);

  const [form, setForm] = useState({
    title: "",
    city: "",
    cityName: "",
    startDate: "",
    endDate: "",
    interests: [],
    lat: "",
    lon: "",
    note_markdown: "",
  });

  const [citySuggestions, setCitySuggestions] = useState([]);
  const debounceRef = useRef(null);

  // Fetch trip data kalau edit
  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const token = localStorage.getItem("access_token");
          const res = await http.get(`/trips/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setForm((prev) => ({
            ...prev,
            title: res.data.title || "",
            city: res.data.city || "",
            cityName: res.data.city || "",
            startDate: res.data.startDate || "",
            endDate: res.data.endDate || "",
            interests: res.data.interest || res.data.interests || [],
            lat: res.data.lat || "",
            lon: res.data.lon || "",
            note_markdown: res.data.note_markdown || res.data.notes_markdown || "",
          }));
          setTripResult(res.data); // when editing show existing itinerary
        } catch (err) {
          console.error("Fetch trip failed:", err);
        }
      })();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Interests
  const handleAddInterest = (e) => {
    if (e.key === "Enter" && interestTemp.trim()) {
      e.preventDefault();
      setForm((prev) => ({ ...prev, interests: [...prev.interests, interestTemp.trim()] }));
      setInterestTemp("");
    }
  };

  const handleRemoveInterest = (index) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index),
    }));
  };

  const finalizeInterests = () => {
    if (interestTemp.trim()) {
      setForm((prev) => ({ ...prev, interests: [...prev.interests, interestTemp.trim()] }));
      setInterestTemp("");
    }
  };

  // City autocomplete via backend geo endpoint
  const handleCityChange = (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, cityName: value, city: value }));

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length < 2) {
      setCitySuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const token = localStorage.getItem("access_token");
        // Use internal API for a single best match
        const res = await http.get(`/geo/search?q=${encodeURIComponent(value)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Wrap single result as suggestion list for consistent UI
        setCitySuggestions(res.data ? [res.data] : []);
      } catch (err) {
        console.error("City autocomplete error:", err);
      }
    }, 400);
  };

  const selectCity = (c) => {
    setForm((prev) => ({
      ...prev,
      city: c.city,
      cityName: c.city,
      lat: c.lat,
      lon: c.lon,
    }));
    setCitySuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowProgress(true);
    setTripResult(null); // reset previous result
    setErrorMsg("");
    try {
      const token = localStorage.getItem("access_token");
      finalizeInterests();
      const effectiveInterests = interestTemp.trim() ? [...form.interests, interestTemp.trim()] : form.interests;
      if (!effectiveInterests.length) {
        setErrorMsg('Tambahkan minimal satu interest (tekan Enter).');
        setLoading(false); setShowProgress(false); return;
      }
      // basic validation date range
      if (!form.startDate || !form.endDate) {
        setErrorMsg('Isi start date dan end date');
        setLoading(false); setShowProgress(false); return;
      }
      if (new Date(form.endDate) < new Date(form.startDate)) {
        setErrorMsg('End date harus >= start date');
        setLoading(false); setShowProgress(false); return;
      }
      const payload = {
        title: form.title,
        cityName: form.cityName || form.city,
        startDate: form.startDate,
        endDate: form.endDate,
        interests: effectiveInterests,
        lat: form.lat || undefined,
        lon: form.lon || undefined,
        notes_markdown: form.note_markdown,
      };
      if (id) {
        payload.city = form.cityName || form.city; // send explicit city for change detection
      }

      let res;
      if (id) {
        res = await http.put(`/trips/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        res = await http.post(`/trips`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setTripResult(res.data); // store result including itinerary
      setProgressIdx(progressSteps.length - 1);
      setTimeout(() => {
        setShowProgress(false); // hide overlay after short pause
      }, 600);
    } catch (err) {
      console.error("Save trip failed:", err);
      setErrorMsg(err.response?.data?.error || 'Gagal membuat trip');
      setShowProgress(false);
    } finally {
      setLoading(false);
    }
  };

  const progressPercent = ((progressIdx + 1) / progressSteps.length) * 100;

  // Button disable logic (previously missing -> ReferenceError)
  const disabledSubmit = !form.title || !form.cityName || !form.startDate || !form.endDate || (!form.interests.length && !interestTemp.trim()) || loading;

  const renderItinerary = () => {
    if (!tripResult?.itinerary) return null;
    const data = tripResult.itinerary.itinerary || tripResult.itinerary; // handle both shapes
    if (!Array.isArray(data)) {
      return <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto">{JSON.stringify(tripResult.itinerary, null, 2)}</pre>;
    }
    return (
      <div className="space-y-6 mt-10">
        <h3 className="text-xl font-bold text-black">Generated Itinerary</h3>
        {data.map(day => {
          const wx = tripResult.weather?.dailySummary?.[day.day - 1];
          return (
            <div key={day.day} className="rounded-lg border border-gray-200 bg-white/95 shadow-sm p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h4 className="text-[13px] font-bold text-black m-0">Day {day.day}</h4>
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
        <div className="flex gap-2">
          <button onClick={() => navigate(`/trips/${tripResult.id}`)} className="bg-black text-white px-4 py-2 rounded font-semibold">Lihat Detail</button>
          <button onClick={() => navigate('/trips')} className="bg-gray-200 px-4 py-2 rounded font-semibold text-black">Kembali</button>
        </div>
      </div>
    );
  };

  const bgImage = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80';

  return (
    <div className="relative min-h-screen text-white">
      <Navbar />
      {/* Background layers */}
      <img src={bgImage} alt="BG" className="fixed inset-0 w-full h-full object-cover brightness-[0.7] saturate-125" />
      <div className="fixed inset-0 bg-[#061a2d]/85 backdrop-blur-sm" />
      <div className="fixed inset-0 bg-gradient-to-br from-cyan-500/10 via-teal-400/5 to-transparent" />
      <div className="relative max-w-4xl mx-auto px-6 pt-32 pb-32">
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight"><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-blue-200">{id? 'Edit Trip':'Create Trip'}</span></h2>
          <p className="mt-3 text-cyan-100/70 text-sm max-w-2xl mx-auto">Buat itinerary otomatis dengan AI + data cuaca realtime untuk perjalananmu di Indonesia.</p>
        </div>
        <div className="relative rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-xl shadow-cyan-900/30 px-6 sm:px-10 py-10 overflow-hidden">
          <div className="absolute -inset-px rounded-2xl pointer-events-none opacity-0 md:group-hover:opacity-100 transition bg-gradient-to-br from-cyan-300/10 via-transparent to-blue-200/10" />
          {showProgress && (
            <div className="absolute inset-0 bg-[#061a2d]/90 backdrop-blur-md z-20 flex flex-col items-center justify-center px-10 text-center">
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 rounded-full border-4 border-cyan-400/20" />
                <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-cyan-300 animate-spin" />
                <div className="absolute inset-4 rounded-full bg-[#0b2f4b] flex items-center justify-center text-sm font-semibold text-cyan-200 tracking-wide">AI</div>
              </div>
              <div className="w-full max-w-sm mb-4">
                <div className="h-2 w-full bg-white/10 rounded overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-300 via-teal-200 to-blue-200 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
              <p className="font-semibold text-cyan-100 mb-1 tracking-wide text-sm">{progressSteps[progressIdx]}</p>
              <p className="text-[11px] text-cyan-100/70 mb-4">Memproses itinerary otomatis...</p>
              <p className="text-[10px] text-cyan-100/40 uppercase tracking-widest">Jangan tutup halaman ini</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            {errorMsg && <div className="p-3 rounded-lg bg-red-500/15 border border-red-400/30 text-red-200 text-sm font-medium">{errorMsg}</div>}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <label className="block text-xs uppercase tracking-wide text-cyan-100/70">Trip Title</label>
                <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="Ex: Vacation to Bali" className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-300/60 placeholder-cyan-200/40 text-sm" required />
              </div>
              <div className="space-y-3">
                <label className="block text-xs uppercase tracking-wide text-cyan-100/70">City / Destination</label>
                <div className="relative">
                  <input type="text" name="cityName" value={form.cityName} onChange={handleCityChange} placeholder="Start typing city..." className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-300/60 placeholder-cyan-200/40 text-sm" required />
                  {citySuggestions.length > 0 && (
                    <ul className="absolute z-20 mt-1 left-0 right-0 rounded-lg overflow-hidden border border-white/20 backdrop-blur-xl bg-[#082b48]/90 max-h-56 overflow-auto text-sm">
                      {citySuggestions.map((c,i)=>(
                        <li key={i} className="px-4 py-2 cursor-pointer hover:bg-white/10 text-cyan-100/90" onClick={()=>selectCity(c)}>{c.city} {c.admin1 && (", "+c.admin1)}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <label className="block text-xs uppercase tracking-wide text-cyan-100/70">Start Date</label>
                <input type="date" name="startDate" value={form.startDate} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-300/60 text-sm" min={new Date().toISOString().slice(0,10)} required />
              </div>
              <div className="space-y-3">
                <label className="block text-xs uppercase tracking-wide text-cyan-100/70">End Date</label>
                <input type="date" name="endDate" value={form.endDate} onChange={handleChange} className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-300/60 text-sm" min={form.startDate || new Date().toISOString().slice(0,10)} required />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs uppercase tracking-wide text-cyan-100/70">Interests / Activities</label>
              <input
                type="text"
                placeholder="Ketik lalu Enter atau koma (snorkeling, kuliner...)"
                value={interestTemp}
                onChange={(e)=>{
                  const val = e.target.value;
                  if (val.includes(',')) {
                    const parts = val.split(',').map(p=>p.trim()).filter(Boolean);
                    const last = val.endsWith(',') ? '' : parts.pop();
                    setForm(prev=>({...prev, interests:[...prev.interests, ...parts.filter(p=>!prev.interests.includes(p))]}));
                    setInterestTemp(last||'');
                  } else { setInterestTemp(val); }
                }}
                onKeyDown={handleAddInterest}
                onBlur={finalizeInterests}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-300/60 placeholder-cyan-200/40 text-sm" />
              <p className="text-[11px] text-cyan-100/60">Tekan Enter / koma untuk menambah. Klik chip untuk hapus.</p>
              <div className="flex flex-wrap gap-2">
                {form.interests.map((interest,i)=>(
                  <span key={i} onClick={()=>handleRemoveInterest(i)} title="Hapus" className="px-3 py-1 rounded-full bg-gradient-to-r from-cyan-300/20 to-teal-200/20 text-cyan-100 text-xs font-medium border border-cyan-300/30 cursor-pointer hover:from-cyan-300/30 hover:to-teal-200/30">
                    {interest} ×
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs uppercase tracking-wide text-cyan-100/70">Trip Notes (Markdown)</label>
              <textarea name="note_markdown" value={form.note_markdown} onChange={handleChange} placeholder="## Day 1\nPantai Kuta..." className="w-full h-40 resize-y px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-300/60 placeholder-cyan-200/40 text-sm" />
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <button type="submit" disabled={disabledSubmit} className={`relative px-8 py-3 rounded-full font-semibold tracking-wide transition text-[#06253d] disabled:cursor-not-allowed disabled:opacity-50 bg-gradient-to-r from-cyan-300 via-teal-200 to-blue-200 hover:from-cyan-200 hover:to-blue-100`}>{loading? 'Processing...': (id? 'Update Trip':'Create Trip')}</button>
              {tripResult && tripResult.itinerary && (
                <PDFDownloadLink document={<TripPDF trip={tripResult} />} fileName={`itinerary-${tripResult.id}.pdf`} className="text-sm px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md font-medium tracking-wide">
                  {({ loading: pdfLoading }) => pdfLoading ? 'Menyiapkan PDF...' : 'Download PDF'}
                </PDFDownloadLink>
              )}
              {tripResult && <button type="button" onClick={()=>navigate(`/trips/${tripResult.id}`)} className="text-sm px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md font-medium tracking-wide">Lihat Detail</button>}
            </div>
          </form>
          {tripResult && tripResult.itinerary && (
            <div className="mt-10 p-5 rounded-lg bg-white/5 border border-white/10 max-h-[55vh] overflow-auto text-sm text-cyan-100/90">
              <h3 className="text-base font-semibold mb-4 tracking-wide">Generated Itinerary (Preview)</h3>
              {renderItinerary()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

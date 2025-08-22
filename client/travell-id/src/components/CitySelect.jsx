import { useState, useEffect, useRef, useCallback } from 'react';
import { staticCityCoords, clientGeocode } from '../lib/geocode';

const baseCities = Object.values(staticCityCoords).sort((a,b)=>a.city.localeCompare(b.city));

export default function CitySelect({ value, onSelect, placeholder='Pilih kota...', className='' }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || '');
  const [items, setItems] = useState(baseCities);
  const [highlight, setHighlight] = useState(0);
  const wrapperRef = useRef(null);
  const listRef = useRef(null);

  useEffect(()=>{
    const handler = (e)=>{ if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false); };
    window.addEventListener('mousedown', handler);
    return ()=>window.removeEventListener('mousedown', handler);
  },[]);

  useEffect(()=>{
    if (!query) { setItems(baseCities); setHighlight(0); return; }
    const q = query.toLowerCase();
    const filtered = baseCities.filter(c=>c.city.toLowerCase().includes(q));
    setItems(filtered.length? filtered : baseCities);
    setHighlight(0);
  },[query]);

  const choose = useCallback(async (cityName)=>{
    setQuery(cityName);
    setOpen(false);
    const found = baseCities.find(c=>c.city===cityName) || staticCityCoords[cityName?.toLowerCase()];
    if (found) onSelect(found);
    else {
      try { const cg = (await clientGeocode(cityName))[0]; if (cg) onSelect({ city: cg.city, lat: cg.lat, lon: cg.lon }); else onSelect({ city: cityName }); } catch { onSelect({ city: cityName }); }
    }
  },[onSelect]);

  const onKeyDown = (e)=>{
    if (!open && (e.key==='ArrowDown' || e.key==='Enter')) { setOpen(true); return; }
    if (e.key==='ArrowDown') { e.preventDefault(); setHighlight(h=> Math.min(h+1, items.length-1)); }
    else if (e.key==='ArrowUp') { e.preventDefault(); setHighlight(h=> Math.max(h-1, 0)); }
    else if (e.key==='Enter') { e.preventDefault(); if (open) choose(items[highlight]?.city || query); else setOpen(true); }
    else if (e.key==='Escape') { setOpen(false); }
  };

  useEffect(()=>{ if (open && listRef.current) { const el = listRef.current.querySelector('[data-active="true"]'); if (el) el.scrollIntoView({ block:'nearest' }); } },[open, highlight]);

  useEffect(()=>{ if (value && value !== query) setQuery(value); },[value]);

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="group">
        <input
          type="text"
            value={query}
            placeholder={placeholder}
            onFocus={()=> setOpen(true)}
            onChange={(e)=>{ setQuery(e.target.value); if (!open) setOpen(true); }}
            onKeyDown={onKeyDown}
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-300/60 placeholder-cyan-200/40 text-sm cursor-pointer"
        />
        <button type="button" onClick={()=> setOpen(o=>!o)} className="absolute top-0 right-0 h-full aspect-square flex items-center justify-center text-cyan-100/70 hover:text-cyan-100">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 transition ${open? 'rotate-180':''}`}><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
        </button>
      </div>
      {open && (
        <ul ref={listRef} className="absolute z-30 mt-1 max-h-64 overflow-auto left-0 right-0 rounded-lg border border-white/15 bg-[#082b48]/95 backdrop-blur-xl shadow-xl shadow-cyan-900/40 text-sm py-1">
          {items.map((c,i)=>{
            const active = i===highlight;
            return (
              <li
                key={c.city}
                data-active={active || undefined}
                onMouseEnter={()=> setHighlight(i)}
                onMouseDown={(e)=>{ e.preventDefault(); choose(c.city); }}
                className={`px-4 py-2 cursor-pointer select-none rounded-md mx-1 my-0.5 flex items-center justify-between ${active? 'bg-gradient-to-r from-cyan-400/25 to-teal-300/25 text-cyan-100':'hover:bg-white/10 text-cyan-100/80'}`}
              >
                <span>{c.city}</span>
                <span className="text-[10px] uppercase tracking-wide text-cyan-100/40">{Math.round(c.lat*100)/100}, {Math.round(c.lon*100)/100}</span>
              </li>
            );
          })}
          {items.length===0 && <li className="px-4 py-3 text-cyan-100/50">Tidak ada hasil</li>}
          <li className="px-4 py-2 mt-1 border-t border-white/10 text-[10px] uppercase tracking-wider text-cyan-100/40">Ketik untuk filter • Enter pilih</li>
        </ul>
      )}
    </div>
  );
}

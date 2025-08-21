// src/services/openMeteo.js
const axios = require('axios');

// Fungsi untuk mendapatkan data cuaca berdasarkan lat dan lon
async function getWeather(lat, lon, startDate, endDate) {
  const s = startDate || new Date().toISOString().slice(0,10);
  const e = endDate || s;
  // Validasi & clamp ke maksimal 16 hari (forecast limit umum Open-Meteo)
  const sd = new Date(s); const ed = new Date(e);
  let diffDays = Math.round((ed - sd)/86400000) + 1;
  if (diffDays > 16) {
    // batasi endDate
    const clampedEnd = new Date(sd);
    clampedEnd.setDate(clampedEnd.getDate() + 15);
    endDate = clampedEnd.toISOString().slice(0,10);
    diffDays = 16;
  }
  try {
    const response = await axios.get(`https://api.open-meteo.com/v1/forecast`, {
      params: {
        latitude: lat,
        longitude: lon,
        daily: 'weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum',
        timezone: 'Asia/Jakarta',
        start_date: startDate,
        end_date: endDate
      },
      timeout: 8000
    });
    const data = response.data;
    try {
      const codes = data?.daily?.weathercode || [];
      const maxT = data?.daily?.temperature_2m_max || [];
      const minT = data?.daily?.temperature_2m_min || [];
      const rain = data?.daily?.precipitation_sum || [];
      const dates = data?.daily?.time || [];
      const conditionMap = {
        0: 'Cerah',
        1: 'Cerah berawan', 2: 'Cerah berawan', 3: 'Berawan',
        45: 'Berkabut', 48: 'Kabut rime',
        51: 'Geras gerimis ringan', 53: 'Gerimis', 55: 'Gerimis lebat',
        56: 'Gerimis beku ringan', 57: 'Gerimis beku lebat',
        61: 'Hujan ringan', 63: 'Hujan sedang', 65: 'Hujan lebat',
        66: 'Hujan beku ringan', 67: 'Hujan beku lebat',
        71: 'Salju ringan', 73: 'Salju', 75: 'Salju lebat',
        77: 'Bintik salju',
        80: 'Hujan deras singkat', 81: 'Hujan deras', 82: 'Hujan badai',
        95: 'Badai petir ringan', 96: 'Badai petir dengan hujan es ringan', 99: 'Badai petir dengan hujan es berat'
      };
      data.dailySummary = dates.map((d,i)=>({
        date: d,
        condition: conditionMap[codes[i]] || 'Tidak diketahui',
        temp_max: maxT[i],
        temp_min: minT[i],
        precipitation_mm: rain[i]
      }));
    } catch (e) { /* ignore summary error */ }
    return data;
  } catch (err) {
    console.error("Open-Meteo API Error (fallback used):", err?.response?.data || err.message);
    // Fallback synthetic summary supaya UI & AI tetap punya struktur
    const fallback = [];
    for (let i=0;i<diffDays;i++) {
      const d = new Date(sd);
      d.setDate(d.getDate()+i);
      fallback.push({
        date: d.toISOString().slice(0,10),
        condition: 'Data cuaca tidak tersedia',
        temp_max: null,
        temp_min: null,
        precipitation_mm: null
      });
    }
    return { error: 'weather_unavailable', dailySummary: fallback, source: 'fallback' };
  }
}

module.exports = { getWeather };

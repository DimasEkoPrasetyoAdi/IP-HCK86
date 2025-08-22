import axios from 'axios';

// Client-side weather fetch (Open-Meteo)
export async function clientWeather(lat, lon, startDate, endDate) {
  if (!lat || !lon) return null;
  // Open-Meteo only supports forecast ~16 days ahead. If startDate too far, return null.
  const today = new Date(); today.setHours(0,0,0,0);
  const sd = new Date(startDate);
  const MAX_AHEAD_DAYS = 16;
  const ahead = Math.round((sd - today)/86400000);
  if (ahead > MAX_AHEAD_DAYS) {
    return { info: 'date_out_of_range' };
  }
  // Clamp range length
  const ed = new Date(endDate);
  let diff = Math.round((ed - sd)/86400000) + 1;
  if (diff > MAX_AHEAD_DAYS) {
    const clamp = new Date(sd); clamp.setDate(clamp.getDate()+ (MAX_AHEAD_DAYS-1));
    endDate = clamp.toISOString().slice(0,10);
  }
  try {
    const { data } = await axios.get('https://api.open-meteo.com/v1/forecast', {
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
    const conditionMap = {
      0: 'Cerah', 1: 'Cerah berawan', 2: 'Cerah berawan', 3: 'Berawan', 45: 'Berkabut', 48: 'Kabut rime',
      51: 'Gerimis ringan', 53: 'Gerimis', 55: 'Gerimis lebat', 56: 'Gerimis beku ringan', 57: 'Gerimis beku lebat',
      61: 'Hujan ringan', 63: 'Hujan sedang', 65: 'Hujan lebat', 66: 'Hujan beku ringan', 67: 'Hujan beku lebat',
      71: 'Salju ringan', 73: 'Salju', 75: 'Salju lebat', 77: 'Bintik salju',
      80: 'Hujan deras singkat', 81: 'Hujan deras', 82: 'Hujan badai', 95: 'Badai petir ringan', 96: 'Badai petir + es ringan', 99: 'Badai petir + es berat'
    };
    const codes = data?.daily?.weathercode || [];
    const maxT = data?.daily?.temperature_2m_max || [];
    const minT = data?.daily?.temperature_2m_min || [];
    const rain = data?.daily?.precipitation_sum || [];
    const dates = data?.daily?.time || [];
    data.dailySummary = dates.map((d,i)=>({
      date: d,
      condition: conditionMap[codes[i]] || 'Tidak diketahui',
      temp_max: maxT[i],
      temp_min: minT[i],
      precipitation_mm: rain[i]
    }));
    return data;
  } catch (e) {
    console.warn('Client weather fetch failed', e.message);
    return { error: 'client_weather_failed' };
  }
}

import axios from 'axios';

// Client-side geocoding via Open-Meteo (public, CORS enabled)
// Returns array of { city, admin1, lat, lon }
export async function clientGeocode(query) {
  if (!query || query.length < 2) return [];
  try {
    const { data } = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
      params: { name: query, count: 5, language: 'id', format: 'json' },
      timeout: 6000
    });
    if (!data.results) return [];
    return data.results.map(r => ({
      city: r.name,
      admin1: r.admin1,
      lat: r.latitude,
      lon: r.longitude,
      country: r.country
    }));
  } catch (e) {
    console.warn('Client geocode failed', e.message);
    return [];
  }
}

// Fallback static coordinates for common Indonesian destinations
export const staticCityCoords = {
  bali: { city: 'Bali', lat: -8.409518, lon: 115.188919 },
  jakarta: { city: 'Jakarta', lat: -6.208763, lon: 106.845599 },
  bandung: { city: 'Bandung', lat: -6.917464, lon: 107.619123 },
  yogyakarta: { city: 'Yogyakarta', lat: -7.79558, lon: 110.36949 },
  surabaya: { city: 'Surabaya', lat: -7.257472, lon: 112.75209 },
  medan: { city: 'Medan', lat: 3.595196, lon: 98.672226 },
  boyolali: { city: 'Boyolali', lat: -7.5333, lon: 110.6 },
  manado: { city: 'Manado', lat: 1.47483, lon: 124.842079 },
  malang: { city: 'Malang', lat: -7.96662, lon: 112.632629 },
};

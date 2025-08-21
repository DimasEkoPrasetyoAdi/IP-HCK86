const axios = require('axios');

// Geocode a city/regency name using Open-Meteo Geocoding API (prioritize Indonesia)
async function geocodeCity(name) {
  if (!name) throw new Error('City name required');
  const url = 'https://geocoding-api.open-meteo.com/v1/search';
  const params = { name, count: 5, language: 'id', format: 'json' };
  const { data } = await axios.get(url, { params });
  if (!data.results || !data.results.length) return null;
  const pick = data.results.find(r => r.country_code === 'ID') || data.results[0];
  return {
    city: pick.name,
    country: pick.country,
    admin1: pick.admin1,
    lat: pick.latitude,
    lon: pick.longitude
  };
}

module.exports = { geocodeCity };

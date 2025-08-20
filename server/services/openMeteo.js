// src/services/openMeteo.js
const axios = require('axios');

// Fungsi untuk mendapatkan data cuaca berdasarkan lat dan lon
async function getWeather(lat, lon) {
  try {
    const response = await axios.get(`https://api.open-meteo.com/v1/forecast`, {
      params: {
        latitude: lat,
        longitude: lon,
        daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum',  // Pilih data cuaca yang dibutuhkan
        timezone: 'Asia/Jakarta'
      }
    });
    return response.data;  // Mengembalikan data cuaca
  } catch (err) {
    console.error("Open-Meteo API Error:", err);
    throw new Error('Failed to fetch weather data');
  }
}

module.exports = { getWeather };

// src/services/emsifa.js
const axios = require('axios');

// Fungsi untuk mendapatkan semua provinsi
async function getProvinces() {
  try {
    const response = await axios.get('https://emsifa.app/api/v1/provinces');
    return response.data;  // Mengembalikan data provinsi
  } catch (err) {
    console.error("Emsifa API Error:", err);
    throw new Error('Failed to fetch provinces');
  }
}

// Fungsi untuk mendapatkan kabupaten/kota berdasarkan provinsi
async function getRegencies(provinceId) {
  try {
    const response = await axios.get(`https://emsifa.app/api/v1/regencies/${provinceId}`);
    return response.data;  // Mengembalikan data kabupaten/kota
  } catch (err) {
    console.error("Emsifa API Error:", err);
    throw new Error('Failed to fetch regencies');
  }
}

module.exports = { getProvinces, getRegencies };

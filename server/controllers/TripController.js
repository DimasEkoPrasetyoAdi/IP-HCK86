"use strict";
require("dotenv").config();

const { Trip } = require("../models");
const { generateItinerary } = require('../services/gemini');  // Gemini AI
const { getWeather } = require("../services/openMeteo");      // Weather
const { geocodeCity } = require('../services/geocode');        // Geocoding

// Fungsi untuk membuat trip baru
async function create(req, res, next) {
  try {
    const {
      title,
      city,
      cityName,
      provinceId,
      regencyId,
      interests,
      lat,
      lon,
      notes_markdown,
      notes_html
    } = req.body;
    const userId = req.user.id;

    if (!title) { const err = new Error('Title required'); err.name='BadRequest'; throw err; }

    // Normalize interests -> array
    let interestsArr = [];
    if (Array.isArray(interests)) interestsArr = interests;
    else if (typeof interests === 'string') interestsArr = interests.split(',').map(s=>s.trim()).filter(Boolean);
    if (!interestsArr.length) { const err = new Error('Interests required'); err.name='BadRequest'; throw err; }

    let finalCity = city || cityName;
    let latitude = lat;
    let longitude = lon;

    if ((!latitude || !longitude) && finalCity) {
      try {
        const geo = await geocodeCity(finalCity);
        if (geo) { latitude = geo.lat; longitude = geo.lon; finalCity = geo.city; }
      } catch {/* ignore geocode errors */}
    }

    if (!finalCity || latitude == null || longitude == null) {
      const err = new Error('Unable to resolve location (provide cityName or city)');
      err.name='BadRequest'; throw err;
    }

  // Date handling: require start & end and disallow past start dates
  let { startDate, endDate } = req.body;
  if (!startDate || !endDate) { const err = new Error('startDate and endDate required'); err.name='BadRequest'; throw err; }
  const sd = new Date(startDate); const ed = new Date(endDate);
  if (isNaN(sd) || isNaN(ed) || ed < sd) { const err = new Error('Invalid date range'); err.name='BadRequest'; throw err; }
  const today = new Date(); today.setHours(0,0,0,0);
  if (sd < today) { const err = new Error('startDate cannot be in the past'); err.name='BadRequest'; throw err; }
  const durationDays = Math.round((ed - sd) / 86400000) + 1; // inclusive

  // Fetch weather + itinerary (skip heavy external calls in test to avoid flakiness)
  let weather = null; let itinerary = null;
  if (process.env.NODE_ENV === 'test') {
    weather = { dummy: true, city: finalCity };
    itinerary = [];
  } else {
    try { weather = await getWeather(latitude, longitude, startDate, endDate); } catch { weather = { error: 'weather_unavailable' }; }
    try { itinerary = await generateItinerary(finalCity, durationDays, interestsArr, weather); } catch { itinerary = null; }
  }

    // generate shareSlug if not
    const shareSlug = (title || finalCity).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') + '-' + Math.random().toString(36).slice(2,8);
    const trip = await Trip.create({
      title,
      city: finalCity,
      provinceId: provinceId || null,
      regencyId: regencyId || null,
      interest: interestsArr,
      lat: latitude,
      lon: longitude,
      weather: weather || null,
      itinerary: itinerary || null,
      note_markdown: notes_markdown || null,
      note_html: notes_html || null,
  startDate: startDate,
  endDate: endDate,
      shareSlug,
      UserId: userId,
    });

    res.status(201).json(trip);
  } catch (error) {
    next(error);
  }
}

// Fungsi untuk mendapatkan semua trip milik pengguna
async function getAll(req, res, next) {
  try {
    const trips = await Trip.findAll({ where: { UserId: req.user.id } });
    res.json(trips); // Mengembalikan daftar trip milik pengguna
  } catch (error) {
    next(error);
  }
}

// Fungsi untuk mendapatkan detail trip berdasarkan ID
async function getOne(req, res, next) {
  try {
    const trip = await Trip.findByPk(req.params.id); // Mencari trip berdasarkan ID
    if (!trip || trip.UserId !== req.user.id) {
      const error = new Error("Trip not found or unauthorized");
      error.name = "NotFound";
      throw error;
    }
    res.json(trip); // Mengembalikan detail trip
  } catch (error) {
    next(error);
  }
}

// Fungsi untuk mengupdate trip berdasarkan ID
async function update(req, res, next) {
  try {
    const {
      title,
      interests,
      notes_markdown,
      notes_html,
      city,
      cityName,
      lat,
  lon,
  startDate,
  endDate
    } = req.body;

    const trip = await Trip.findByPk(req.params.id);
    if (!trip || trip.UserId !== req.user.id) {
      const error = new Error("Trip not found or unauthorized");
      error.name = "NotFound";
      throw error;
    }

  // Determine new candidate values
  let newTitle = title !== undefined ? title : trip.title;

    // Normalize interests
    let interestsArr;
    if (Array.isArray(interests)) interestsArr = interests;
    else if (typeof interests === 'string') interestsArr = interests.split(',').map(s=>s.trim()).filter(Boolean);
    else interestsArr = trip.interest; // keep existing if not provided

    // Location handling
    let newCity = (city || cityName) ? (city || cityName) : trip.city;
    let newLat = lat !== undefined && lat !== '' ? Number(lat) : trip.lat;
    let newLon = lon !== undefined && lon !== '' ? Number(lon) : trip.lon;

    // If city provided but lat/lon missing attempt geocode
    if ((city || cityName) && (lat === undefined && lon === undefined)) {
      try {
        const geo = await geocodeCity(newCity);
        if (geo) { newLat = geo.lat; newLon = geo.lon; newCity = geo.city; }
      } catch {/* ignore geocode error */}
    }

    // Detect change triggers for regeneration
  // Compute new date range if provided
    const interestsChanged = JSON.stringify(interestsArr) !== JSON.stringify(trip.interest || []);
    const locationChanged = newCity !== trip.city || newLat !== trip.lat || newLon !== trip.lon;
    // Date handling
  let newStartDate = trip.startDate;
  let newEndDate = trip.endDate;
  if (startDate !== undefined) newStartDate = startDate;
  if (endDate !== undefined) newEndDate = endDate;
  // validate if changed & disallow past start
  const sd2 = new Date(newStartDate); const ed2 = new Date(newEndDate);
  if (isNaN(sd2) || isNaN(ed2) || ed2 < sd2) { const err = new Error('Invalid date range'); err.name='BadRequest'; throw err; }
  const today2 = new Date(); today2.setHours(0,0,0,0);
  if (sd2 < today2) { const err = new Error('startDate cannot be in the past'); err.name='BadRequest'; throw err; }
  const newDurationDays = Math.round((ed2 - sd2)/86400000) + 1;

    let weather = trip.weather;
    let itinerary = trip.itinerary;

  const dateChanged = newStartDate !== trip.startDate || newEndDate !== trip.endDate;
  if (interestsChanged || locationChanged || dateChanged) {
      try {
    weather = await getWeather(newLat, newLon, newStartDate, newEndDate);
      } catch { weather = { error: 'weather_unavailable' }; }
      try {
    itinerary = await generateItinerary(newCity, newDurationDays, interestsArr, weather);
      } catch (e) {
        console.error('Itinerary regeneration failed', e);
      }
    }

    trip.title = newTitle;
    trip.interest = interestsArr;
    trip.city = newCity;
    trip.lat = newLat;
    trip.lon = newLon;
  trip.startDate = newStartDate;
  trip.endDate = newEndDate;
    if (notes_markdown !== undefined) trip.note_markdown = notes_markdown;
    if (notes_html !== undefined) trip.note_html = notes_html;
    trip.weather = weather;
    trip.itinerary = itinerary;

    await trip.save();
    res.json(trip);
  } catch (error) {
    next(error);
  }
}

// Fungsi untuk menghapus trip berdasarkan ID
async function remove(req, res, next) {
  try {
    const trip = await Trip.findByPk(req.params.id);
    if (!trip || trip.UserId !== req.user.id) {
      const error = new Error("Trip not found or unauthorized");
      error.name = "NotFound";
      throw error;
    }

    await trip.destroy(); // Hapus trip
    res.status(200).json({message :'your trip has been deleted'}); // Kembalikan status 200 dengan message
  } catch (error) {
    next(error);
  }
}

module.exports = { create, getAll, getOne, update, remove };

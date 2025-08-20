"use strict";
require("dotenv").config();

const { Trip } = require("../models");
const { generateItinerary } = require('../services/gemini');  // Memanggil Gemini AI
const { getWeather } = require("../services/openMeteo"); // Memanggil Open-Meteo untuk cuaca

// Fungsi untuk membuat trip baru
async function create(req, res) {
  const { title, city, days, interests, lat, lon, notes_markdown, notes_html } = req.body;
  const userId = req.user.id;

  try {
    // Pastikan data lengkap
    if (!city || !days || !interests || !lat || !lon) {
      return res.status(400).json({ error: "Missing required fields (city, days, interests, lat, lon)" });
    }

    // Mengambil cuaca untuk lokasi dari Open-Meteo
    const weather = await getWeather(lat, lon);

    if (!weather || !weather.daily) {
      return res.status(500).json({ error: "Failed to fetch weather data" });
    }

    // Mengambil itinerary dari Gemini AI
    const itinerary = await generateItinerary(city, days, interests, weather);

    if (!itinerary || itinerary.error) {
      return res.status(500).json({ error: "Failed to generate itinerary" });
    }

    // Membuat trip baru
    const trip = await Trip.create({
      title,
      city,
      days,
      interests,
      lat,
      lon,
      weather,
      itinerary,
      notes_markdown,
      notes_html,
      UserId: userId,
    });

    res.status(201).json(trip); // Mengembalikan hasil trip yang baru dibuat
  } catch (err) {
    console.error("Error creating trip:", err);
    res.status(500).json({ error: err.message });
  }
}

// Fungsi untuk mendapatkan semua trip milik pengguna
async function getAll(req, res) {
  try {
    const trips = await Trip.findAll({ where: { UserId: req.user.id } });
    res.json(trips); // Mengembalikan daftar trip milik pengguna
  } catch (err) {
    console.error("Error fetching trips:", err);
    res.status(500).json({ error: err.message });
  }
}

// Fungsi untuk mendapatkan detail trip berdasarkan ID
async function getOne(req, res) {
  try {
    const trip = await Trip.findByPk(req.params.id); // Mencari trip berdasarkan ID
    if (!trip || trip.UserId !== req.user.id) {
      return res.status(404).json({ error: "Trip not found or unauthorized" });
    }
    res.json(trip); // Mengembalikan detail trip
  } catch (err) {
    console.error("Error fetching trip:", err);
    res.status(500).json({ error: err.message });
  }
}

// Fungsi untuk mengupdate trip berdasarkan ID
async function update(req, res) {
  const { title, days, interests, notes_markdown, notes_html } = req.body;

  try {
    const trip = await Trip.findByPk(req.params.id);
    if (!trip || trip.UserId !== req.user.id) {
      return res.status(404).json({ error: "Trip not found or unauthorized" });
    }

    // Update trip fields
    trip.title = title || trip.title;
    trip.days = days || trip.days;
    trip.interests = interests || trip.interests;
    trip.notes_markdown = notes_markdown || trip.notes_markdown;
    trip.notes_html = notes_html || trip.notes_html;

    await trip.save(); // Simpan perubahan
    res.json(trip); // Kembalikan trip yang sudah diupdate
  } catch (err) {
    console.error("Error updating trip:", err);
    res.status(500).json({ error: err.message });
  }
}

// Fungsi untuk menghapus trip berdasarkan ID
async function remove(req, res) {
  try {
    const trip = await Trip.findByPk(req.params.id);
    if (!trip || trip.UserId !== req.user.id) {
      return res.status(404).json({ error: "Trip not found or unauthorized" });
    }

    await trip.destroy(); // Hapus trip
    res.status(204).end(); // Kembalikan status 204 (No Content)
  } catch (err) {
    console.error("Error deleting trip:", err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { create, getAll, getOne, update, remove };

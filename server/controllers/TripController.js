"use strict";
require("dotenv").config();

const { Trip } = require("../models");
const { generateItinerary } = require('../services/gemini');  // Memanggil Gemini AI
const { getWeather } = require("../services/openMeteo"); // Memanggil Open-Meteo untuk cuaca

// Fungsi untuk membuat trip baru
async function create(req, res, next) {
  try {
    const { title, city, days, interests, lat, lon, notes_markdown, notes_html } = req.body;
    const userId = req.user.id;

    // Pastikan data lengkap
    if (!city || !days || !interests || !lat || !lon) {
      const error = new Error("Missing required fields (city, days, interests, lat, lon)");
      error.name = "BadRequest";
      throw error;
    }

    // Mengambil cuaca untuk lokasi dari Open-Meteo
    const weather = await getWeather(lat, lon);

    if (!weather || !weather.daily) {
      const error = new Error("Failed to fetch weather data");
      error.name = "BadRequest";
      throw error;
    }

    // Mengambil itinerary dari Gemini AI
    const itinerary = await generateItinerary(city, days, interests, weather);

    if (!itinerary || itinerary.error) {
      const error = new Error("Failed to generate itinerary");
      error.name = "BadRequest";
      throw error;
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
    const { title, days, interests, notes_markdown, notes_html } = req.body;

    const trip = await Trip.findByPk(req.params.id);
    if (!trip || trip.UserId !== req.user.id) {
      const error = new Error("Trip not found or unauthorized");
      error.name = "NotFound";
      throw error;
    }

    // Update trip fields
    trip.title = title || trip.title;
    trip.days = days || trip.days;
    trip.interests = interests || trip.interests;
    trip.notes_markdown = notes_markdown || trip.notes_markdown;
    trip.notes_html = notes_html || trip.notes_html;

    await trip.save(); // Simpan perubahan
    res.json(trip); // Kembalikan trip yang sudah diupdate
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

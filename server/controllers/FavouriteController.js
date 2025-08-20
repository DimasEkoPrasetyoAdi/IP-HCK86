const { FavouritePlace } = require("../models");

async function create(req, res, next) {
  try {
    const { name, address, lat, lon, source, externalId, note } = req.body;
    const userId = req.user.id;

    const favouritePlace = await FavouritePlace.create({
      name,
      address,
      lat,
      lon,
      source,
      externalId,
      note,
      UserId: userId,
    });

    res.status(201).json(favouritePlace);
  } catch (error) {
    next(error);
  }
}

async function getAll(req, res, next) {
  try {
    const favouritePlaces = await FavouritePlace.findAll({
      where: { UserId: req.user.id },
    });
    res.json(favouritePlaces);
  } catch (error) {
    next(error);
  }
}

async function getOne(req, res, next) {
  try {
    const favouritePlace = await FavouritePlace.findByPk(req.params.id);
    if (!favouritePlace || favouritePlace.UserId !== req.user.id) {
      const error = new Error("Favourite Place not found or unauthorized");
      error.name = "NotFound";
      throw error;
    }
    res.json(favouritePlace);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const { note } = req.body;
    const favouritePlace = await FavouritePlace.findByPk(req.params.id);

    if (!favouritePlace || favouritePlace.UserId !== req.user.id) {
      const error = new Error("Favourite Place not found or unauthorized");
      error.name = "NotFound";
      throw error;
    }

    favouritePlace.note = note || favouritePlace.note;

    await favouritePlace.save();
    res.json(favouritePlace);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const favouritePlace = await FavouritePlace.findByPk(req.params.id);
    if (!favouritePlace || favouritePlace.UserId !== req.user.id) {
      const error = new Error("Favourite Place not found or unauthorized");
      error.name = "NotFound";
      throw error;
    }
    await favouritePlace.destroy();
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

module.exports = { create, getAll, getOne, update, remove };

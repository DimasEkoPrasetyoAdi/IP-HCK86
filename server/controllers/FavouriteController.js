const { FavoritePlace } = require("../models");

async function create(req, res) {
  const { name, address, lat, lon, source, externalId, note } = req.body;
  const userId = req.user.id;

  const favoritePlace = await FavoritePlace.create({
    name,
    address,
    lat,
    lon,
    source,
    externalId,
    note,
    UserId: userId,
  });

  res.status(201).json(favoritePlace);
}

async function getAll(req, res) {
  const favoritePlaces = await FavoritePlace.findAll({
    where: { UserId: req.user.id },
  });
  res.json(favoritePlaces);
}

async function getOne(req, res) {
  const favoritePlace = await FavoritePlace.findByPk(req.params.id);
  if (!favoritePlace || favoritePlace.UserId !== req.user.id) {
    return res
      .status(404)
      .json({ error: "Favorite Place not found or unauthorized" });
  }
  res.json(favoritePlace);
}

async function update(req, res) {
  const { note } = req.body;
  const favoritePlace = await FavoritePlace.findByPk(req.params.id);

  if (!favoritePlace || favoritePlace.UserId !== req.user.id) {
    return res
      .status(404)
      .json({ error: "Favorite Place not found or unauthorized" });
  }

  favoritePlace.note = note || favoritePlace.note;

  await favoritePlace.save();
  res.json(favoritePlace);
}

async function remove(req, res) {
  const favoritePlace = await FavoritePlace.findByPk(req.params.id);
  if (!favoritePlace || favoritePlace.UserId !== req.user.id) {
    return res
      .status(404)
      .json({ error: "Favorite Place not found or unauthorized" });
  }
  await favoritePlace.destroy();
  res.status(204).end();
}

module.exports = { create, getAll, getOne, update, remove };

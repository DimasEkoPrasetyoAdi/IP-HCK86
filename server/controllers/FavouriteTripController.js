const { FavouriteTrip, Trip } = require("../models");

class FavouriteTripController {
  static async add(req, res, next) {
    try {
      const { tripId, note } = req.body;
      if (!tripId) {
        const e = new Error("tripId required");
        e.name = "BadRequest";
        throw e;
      }
      const trip = await Trip.findByPk(tripId);
      if (!trip) {
        const e = new Error("Trip not found");
        e.name = "NotFound";
        throw e;
      }
      const [fav, created] = await FavouriteTrip.findOrCreate({
        where: { UserId: req.user.id, TripId: tripId },
        defaults: { note: note || null },
      });
      if (!created && note !== undefined) {
        fav.note = note;
        await fav.save();
      }
      res.status(created ? 201 : 200).json(fav);
    } catch (err) {
      next(err);
    }
  }

  static async list(req, res, next) {
    try {
      const favs = await FavouriteTrip.findAll({
        where: { UserId: req.user.id },
        include: [
          {
            model: Trip,
            attributes: [
              "id",
              "title",
              "city",
              "startDate",
              "endDate",
              "shareSlug",
            ],
          },
        ],
      });
      res.json(favs);
    } catch (err) {
      next(err);
    }
  }

  static async remove(req, res, next) {
    try {
      const fav = await FavouriteTrip.findByPk(req.params.id);
      if (!fav || fav.UserId !== req.user.id) {
        const e = new Error("Favourite Trip not found or unauthorized");
        e.name = "NotFound";
        throw e;
      }
      await fav.destroy();
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = FavouriteTripController;

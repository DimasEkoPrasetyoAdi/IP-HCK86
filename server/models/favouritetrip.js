'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FavouriteTrip extends Model {
    static associate(models) {
      FavouriteTrip.belongsTo(models.User, { foreignKey: 'UserId' });
      FavouriteTrip.belongsTo(models.Trip, { foreignKey: 'TripId' });
    }
  }
  FavouriteTrip.init({
    UserId: DataTypes.INTEGER,
    TripId: DataTypes.INTEGER,
    note: DataTypes.TEXT
  }, { sequelize, modelName: 'FavouriteTrip' });
  return FavouriteTrip;
};

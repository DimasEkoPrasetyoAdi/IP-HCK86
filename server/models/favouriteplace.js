'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FavouritePlace extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      FavouritePlace.belongsTo(models.User, {foreignKey: 'UserId'})
    }
  }
  FavouritePlace.init({
    UserId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    address: DataTypes.STRING,
    lat: DataTypes.FLOAT,
    lon: DataTypes.FLOAT,
    source: DataTypes.STRING,
    externalId: DataTypes.STRING,
    note: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'FavouritePlace',
  });
  return FavouritePlace;
};
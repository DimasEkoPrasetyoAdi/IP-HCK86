'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Trip extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Trip.belongsTo(models.User, {foreignKey:'UserId'})
    }
  }
  Trip.init({
    UserId: DataTypes.INTEGER,
    title: DataTypes.STRING,
    city: DataTypes.STRING,
    provinceId: DataTypes.INTEGER,
    regencyId: DataTypes.INTEGER,
    lat: DataTypes.FLOAT,
    lon: DataTypes.FLOAT,
    days: DataTypes.INTEGER,
    interest: DataTypes.JSONB,
    weather: DataTypes.JSONB,
    itinerary: DataTypes.JSONB,
    note_markdown: DataTypes.TEXT,
    note_html: DataTypes.TEXT,
    isPublic: DataTypes.BOOLEAN,
    shareSlug: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Trip',
  });
  return Trip;
};
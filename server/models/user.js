'use strict';
const {hashPassword} = require ('../helpers/bcrypt')
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Trip, {foreignKey: 'UserId'})
    }
  }
  User.init({
    fullname: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: {
        args: true,
        msg: 'Email must be unique'
      },
      allowNull :false,
      validate:{
        notEmpty:{
          msg : 'Email is required'
        },
        notNull:{
          msg : 'Email is required'
        }
      }

    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Password is required'
        },
        notNull: {
          msg: 'Password is required'
        }
      }
    },
  }, {
    sequelize,
    modelName: 'User',
  });

  User.beforeCreate((user)=>{
    user.password = hashPassword(user.password)
  })
  return User;
};
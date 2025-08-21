'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('FavouriteTrips', {
      id: { allowNull:false, autoIncrement:true, primaryKey:true, type: Sequelize.INTEGER },
      UserId: { type: Sequelize.INTEGER, allowNull:false, references:{ model:'Users', key:'id', onDelete:'CASCADE'} },
      TripId: { type: Sequelize.INTEGER, allowNull:false, references:{ model:'Trips', key:'id', onDelete:'CASCADE'} },
      note: { type: Sequelize.TEXT },
      createdAt: { allowNull:false, type: Sequelize.DATE },
      updatedAt: { allowNull:false, type: Sequelize.DATE }
    });
    await queryInterface.addConstraint('FavouriteTrips', {
      fields:['UserId','TripId'],
      type:'unique',
      name:'uniq_user_trip_favourite'
    });
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('FavouriteTrips');
  }
};

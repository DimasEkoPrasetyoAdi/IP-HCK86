'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Trips','startDate',{ type: Sequelize.DATEONLY });
    await queryInterface.addColumn('Trips','endDate',{ type: Sequelize.DATEONLY });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Trips','startDate');
    await queryInterface.removeColumn('Trips','endDate');
  }
};

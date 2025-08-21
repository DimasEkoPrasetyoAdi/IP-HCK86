'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    try { await queryInterface.removeColumn('Trips','days'); } catch(e) { /* ignore */ }
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('Trips','days',{ type: Sequelize.INTEGER });
  }
};

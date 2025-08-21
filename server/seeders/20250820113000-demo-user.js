'use strict';

/** @type {import('sequelize-cli').Migration} */
const bcrypt = require('bcryptjs');

module.exports = {
  async up (queryInterface, Sequelize) {
    const now = new Date();
    await queryInterface.bulkInsert('Users', [{
      fullname: 'Demo User',
      email: 'demo@example.com',
      password: bcrypt.hashSync('password123', 10),
      createdAt: now,
      updatedAt: now
    }]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', { email: 'demo@example.com' });
  }
};

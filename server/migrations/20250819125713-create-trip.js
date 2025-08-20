'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Trips', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      UserId: {
        type: Sequelize.INTEGER,
        references:{
          model: 'Users',
          key: 'id',
          onDelete : 'CASCADE'
        },
        allowNull :false
      },
      title: {
        type: Sequelize.STRING
      },
      city: {
        type: Sequelize.STRING
      },
      provinceId: {
        type: Sequelize.INTEGER
      },
      regencyId: {
        type: Sequelize.INTEGER
      },
      lat: {
        type: Sequelize.FLOAT
      },
      lon: {
        type: Sequelize.FLOAT
      },
      days: {
        type: Sequelize.INTEGER
      },
      interest: {
        type: Sequelize.JSONB
      },
      weather: {
        type: Sequelize.JSONB
      },
      itinerary: {
        type: Sequelize.JSONB
      },
      note_markdown: {
        type: Sequelize.TEXT
      },
      note_html: {
        type: Sequelize.TEXT
      },
      isPublic: {
        type: Sequelize.BOOLEAN
      },
      shareSlug: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Trips');
  }
};
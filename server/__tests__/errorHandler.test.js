const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../models');

describe('Error handler generic paths', () => {
  test('GET unknown route -> 404', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
  });
});

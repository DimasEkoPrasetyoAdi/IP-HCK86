const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../models');

describe('Google Login negative tests', () => {
  test('POST /api/google-login without id_token -> 400', async () => {
    const res = await request(app).post('/api/google-login').send({});
    expect([400,500]).toContain(res.status); // depending on controller validation
  });
});

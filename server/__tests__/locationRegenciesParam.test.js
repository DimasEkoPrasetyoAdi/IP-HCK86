const request = require('supertest');
const app = require('../app');
const { User, Trip } = require('../models');
const { signToken } = require('../helpers/jwt');

describe('LocationController regencies param validation', () => {
  let token;
  beforeAll(async () => {
  const u = await User.create({ fullname: 'Param Test', email: 'param_unique@test.com', password: 'secret' });
    token = signToken({ id: u.id });
  });

  test('missing provinceId param returns 404 route or handled 400', async () => {
    // Intentionally call wrong path to simulate missing param
    const res = await request(app).get('/api/geo/regencies/').set('Authorization', `Bearer ${token}`);
    expect([400,404]).toContain(res.status);
  });
});

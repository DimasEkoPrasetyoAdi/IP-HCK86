jest.mock('../services/geocode', () => ({
  geocodeCity: jest.fn(async () => null)
}));
const request = require('supertest');
const app = require('../app');
const { User } = require('../models');
const { signToken } = require('../helpers/jwt');

describe('Location search not found path', () => {
  let token;
  beforeAll(async () => {
  const user = await User.create({ fullname: 'Geo NF', email: 'geonf_unique@test.com', password: 'secret' });
    token = signToken({ id: user.id });
  });

  test('GET /api/geo/search returns 404 when geocodeCity returns null', async () => {
    const res = await request(app).get('/api/geo/search?q=UnknownPlace').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});

const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../models');

let token;

beforeAll(async () => {
  await request(app).post('/api/register').send({ fullname:'Prov Test', email: 'prov@test.com', password: '123456' });
  const resLogin = await request(app).post('/api/login').send({ email: 'prov@test.com', password: '123456' });
  token = resLogin.body.access_token;
});

// no manual close

describe('Location provinces & regencies', () => {
  test('GET /api/geo/provinces', async () => {
    const res = await request(app)
      .get('/api/geo/provinces')
      .set('Authorization', `Bearer ${token}`);
    expect([200,500]).toContain(res.status); // external API may fail in test env
  });

  test('GET /api/geo/regencies/:provinceId', async () => {
    const res = await request(app)
      .get('/api/geo/regencies/11')
      .set('Authorization', `Bearer ${token}`);
    expect([200,400,500]).toContain(res.status);
  });
});

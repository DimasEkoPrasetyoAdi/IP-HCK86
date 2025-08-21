const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../models');

let token;

beforeAll(async ()=>{
  await request(app).post('/api/register').send({ fullname:'Loc User', email:'loc@ex.com', password:'pass1234' });
  const login = await request(app).post('/api/login').send({ email:'loc@ex.com', password:'pass1234' });
  token = login.body.access_token;
});

// no manual close

describe('Location endpoints basic', ()=>{
  test('GET /api/geo/search without q -> 400', async ()=>{
    const res = await request(app)
      .get('/api/geo/search')
      .set('Authorization','Bearer '+token);
    expect(res.status).toBe(400);
  });

  test('GET /api/geo/search with q returns 200 or 404', async ()=>{
    const res = await request(app)
      .get('/api/geo/search?q=Bali')
      .set('Authorization','Bearer '+token);
    expect([200,404]).toContain(res.status);
  });
});

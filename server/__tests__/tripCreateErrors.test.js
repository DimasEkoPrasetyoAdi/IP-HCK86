const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../models');

let token;

beforeAll(async ()=>{
  await request(app).post('/api/register').send({ fullname:'Trip User', email:'trip@err.com', password:'secret123' });
  const login = await request(app).post('/api/login').send({ email:'trip@err.com', password:'secret123' });
  token = login.body.access_token;
});

// no manual close

describe('Trip create validation errors', ()=>{
  const base = { city:'Bali', interests:'pantai', startDate:'2099-01-02', endDate:'2099-01-03' };
  test('missing title -> 400', async ()=>{
    const { city, interests, startDate, endDate } = base;
    const res = await request(app).post('/api/trips').set('Authorization','Bearer '+token).send({ city, interests, startDate, endDate });
    expect(res.status).toBe(400);
  });
  test('missing interests -> 400', async ()=>{
    const res = await request(app).post('/api/trips').set('Authorization','Bearer '+token).send({ title:'No Interest', city:'Bali', startDate:'2099-01-02', endDate:'2099-01-03' });
    expect(res.status).toBe(400);
  });
  test('invalid date range -> 400', async ()=>{
    const res = await request(app).post('/api/trips').set('Authorization','Bearer '+token).send({ title:'Bad Date', city:'Bali', interests:'pantai', startDate:'2099-01-05', endDate:'2099-01-01' });
    expect(res.status).toBe(400);
  });
  test('missing city & coords -> 400', async ()=>{
    const res = await request(app).post('/api/trips').set('Authorization','Bearer '+token).send({ title:'No city', interests:'pantai', startDate:'2099-01-05', endDate:'2099-01-06' });
    expect(res.status).toBe(400);
  });
});

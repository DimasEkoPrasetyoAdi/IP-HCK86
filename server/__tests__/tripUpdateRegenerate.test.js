jest.mock('../services/openMeteo', () => ({ getWeather: jest.fn().mockResolvedValue({ dailySummary: [] }) }));
jest.mock('../services/gemini', () => ({ generateItinerary: jest.fn().mockResolvedValue({ itinerary: [{ day:1, activities:[] }] }) }));

const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../models');

let token, tripId;

beforeAll(async ()=>{
  process.env.NODE_ENV = 'test';
  await request(app).post('/api/register').send({ fullname:'Updater', email:'up@ex.com', password:'secret123' });
  const login = await request(app).post('/api/login').send({ email:'up@ex.com', password:'secret123' });
  token = login.body.access_token;
  const create = await request(app).post('/api/trips').set('Authorization','Bearer '+token).send({ title:'Reg Trip', city:'Bali', interests:'kuliner', startDate:'2099-02-01', endDate:'2099-02-02' });
  tripId = create.body.id;
});

// no manual close

describe('Trip update regeneration paths', ()=>{
  test('update interests triggers regeneration', async ()=>{
    const res = await request(app)
      .put(`/api/trips/${tripId}`)
      .set('Authorization','Bearer '+token)
      .send({ interests:'kuliner, pantai' });
    expect(res.status).toBe(200);
    expect(res.body.itinerary).toBeTruthy();
  });
  test('update date triggers regeneration', async ()=>{
    const res = await request(app)
      .put(`/api/trips/${tripId}`)
      .set('Authorization','Bearer '+token)
      .send({ startDate:'2099-02-03', endDate:'2099-02-05' });
    expect(res.status).toBe(200);
    expect(res.body.itinerary).toBeTruthy();
  });
  test('update with invalid date range -> 400', async ()=>{
    const res = await request(app)
      .put(`/api/trips/${tripId}`)
      .set('Authorization','Bearer '+token)
      .send({ startDate:'2099-02-10', endDate:'2099-02-01' });
    expect(res.status).toBe(400);
  });
});

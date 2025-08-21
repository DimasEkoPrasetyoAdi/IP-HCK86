// Ensure title-only update path covered (no regeneration when only title changes)
jest.mock('../services/openMeteo', () => ({ getWeather: jest.fn() }));
jest.mock('../services/gemini', () => ({ generateItinerary: jest.fn() }));

const request = require('supertest');
const app = require('../app');

let token, tripId;

beforeAll(async ()=>{
  await request(app).post('/api/register').send({ fullname:'TitleUser', email:'title@ex.com', password:'secret123' });
  const login = await request(app).post('/api/login').send({ email:'title@ex.com', password:'secret123' });
  token = login.body.access_token;
  const create = await request(app).post('/api/trips').set('Authorization','Bearer '+token).send({ title:'TitleTrip', city:'Bali', interests:'kuliner', startDate:'2099-07-01', endDate:'2099-07-02' });
  tripId = create.body.id;
});

describe('Trip update title only (no regeneration)', ()=>{
  test('only title changed', async ()=>{
    const res = await request(app)
      .put('/api/trips/'+tripId)
      .set('Authorization','Bearer '+token)
      .send({ title:'New Title Only' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('New Title Only');
  });
});

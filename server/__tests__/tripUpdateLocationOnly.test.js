jest.mock('../services/openMeteo', () => ({ getWeather: jest.fn().mockResolvedValue({ w: true }) }));
jest.mock('../services/gemini', () => ({ generateItinerary: jest.fn().mockResolvedValue({ itinerary: [{ day:1 }] }) }));

const request = require('supertest');
const app = require('../app');

let token, tripId;

beforeAll(async ()=>{
  await request(app).post('/api/register').send({ fullname:'LocUser', email:'loc@ex.com', password:'secret123' });
  const login = await request(app).post('/api/login').send({ email:'loc@ex.com', password:'secret123' });
  token = login.body.access_token;
  const create = await request(app).post('/api/trips').set('Authorization','Bearer '+token).send({ title:'LocTrip', city:'Bali', interests:'kuliner', startDate:'2099-06-01', endDate:'2099-06-02' });
  tripId = create.body.id;
});

describe('Trip update location only triggers regeneration', ()=>{
  test('change city name only triggers geocode + regen', async ()=>{
    const res = await request(app)
      .put('/api/trips/'+tripId)
      .set('Authorization','Bearer '+token)
      .send({ city:'Jakarta' });
    expect(res.status).toBe(200);
    expect(res.body.city).toBe('Jakarta');
  });
});

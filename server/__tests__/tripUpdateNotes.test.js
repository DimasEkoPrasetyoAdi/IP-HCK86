jest.mock('../services/openMeteo', () => ({ getWeather: jest.fn().mockResolvedValue({}) }));
jest.mock('../services/gemini', () => ({ generateItinerary: jest.fn().mockResolvedValue({ itinerary: [] }) }));

const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../models');

let token, tripId;

beforeAll(async ()=>{
  await request(app).post('/api/register').send({ fullname:'NoteUser', email:'note@ex.com', password:'secret123' });
  const login = await request(app).post('/api/login').send({ email:'note@ex.com', password:'secret123' });
  token = login.body.access_token;
  const trip = await request(app).post('/api/trips').set('Authorization','Bearer '+token).send({ title:'Base Trip', city:'Bali', interests:'pantai', startDate:'2099-04-01', endDate:'2099-04-02' });
  tripId = trip.body.id;
});

// no manual close

describe('Trip update notes only (no regen)', () => {
  test('update markdown & html only', async ()=>{
    const res = await request(app)
      .put(`/api/trips/${tripId}`)
      .set('Authorization','Bearer '+token)
      .send({ notes_markdown:'# Title', notes_html:'<h1>Title</h1>' });
    expect(res.status).toBe(200);
    expect(res.body.note_markdown).toBe('# Title');
    expect(res.body.note_html).toBe('<h1>Title</h1>');
  });
});

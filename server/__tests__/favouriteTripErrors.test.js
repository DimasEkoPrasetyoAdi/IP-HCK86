const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../models');

let token, tripId;

beforeAll(async ()=>{
  await request(app).post('/api/register').send({ fullname:'FavErr', email:'faverr@test.com', password:'secret123' });
  const login = await request(app).post('/api/login').send({ email:'faverr@test.com', password:'secret123' });
  token = login.body.access_token;
  const trip = await request(app).post('/api/trips').set('Authorization','Bearer '+token).send({ title:'Trip For Fav', city:'Bali', interests:'pantai', startDate:'2099-03-01', endDate:'2099-03-02' });
  tripId = trip.body.id;
});

// no manual close

describe('FavouriteTrip error paths', () => {
  test('POST /api/favourite-trips without tripId -> 400', async ()=>{
    const res = await request(app).post('/api/favourite-trips').set('Authorization','Bearer '+token).send({});
    expect(res.status).toBe(400);
  });
  test('POST /api/favourite-trips duplicate updates note (200)', async ()=>{
    await request(app).post('/api/favourite-trips').set('Authorization','Bearer '+token).send({ tripId, note:'First' });
    const res = await request(app).post('/api/favourite-trips').set('Authorization','Bearer '+token).send({ tripId, note:'Updated' });
    expect([200,201]).toContain(res.status);
    expect(res.body.note).toBe('Updated');
  });
  test('DELETE /api/favourite-trips/:id not found -> 404', async ()=>{
    const res = await request(app).delete('/api/favourite-trips/9999').set('Authorization','Bearer '+token);
    expect(res.status).toBe(404);
  });
});

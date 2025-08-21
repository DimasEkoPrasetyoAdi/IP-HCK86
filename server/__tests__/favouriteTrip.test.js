const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../models');

let token, tripId;

beforeAll(async ()=>{
  await request(app).post('/api/register').send({ fullname:'Fav User', email:'fav@ex.com', password:'pass1234' });
  const login = await request(app).post('/api/login').send({ email:'fav@ex.com', password:'pass1234' });
  token = login.body.access_token;
  // create a trip (skip heavy logic by setting NODE_ENV=test already)
  const resTrip = await request(app)
    .post('/api/trips')
    .set('Authorization','Bearer '+token)
    .send({ title:'Trip A', city:'Bali', interests:'pantai', startDate: new Date(Date.now()+2*86400000).toISOString().slice(0,10), endDate: new Date(Date.now()+3*86400000).toISOString().slice(0,10) });
  tripId = resTrip.body.id;
});

// no manual close; handled globally

describe('FavouriteTrip flow', ()=>{
  let favId;
  test('POST /api/favourite-trips add', async ()=>{
    const res = await request(app)
      .post('/api/favourite-trips')
      .set('Authorization','Bearer '+token)
      .send({ tripId, note:'Mantap' });
    expect([200,201]).toContain(res.status);
    favId = res.body.id;
  });

  test('GET /api/favourite-trips list', async ()=>{
    const res = await request(app)
      .get('/api/favourite-trips')
      .set('Authorization','Bearer '+token);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('TripId', tripId);
  });

  test('DELETE /api/favourite-trips/:id remove', async ()=>{
    const res = await request(app)
      .delete('/api/favourite-trips/'+favId)
      .set('Authorization','Bearer '+token);
    expect(res.status).toBe(204);
  });
});

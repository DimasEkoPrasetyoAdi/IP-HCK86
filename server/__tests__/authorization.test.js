const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../models');

let user1Token, user2Token, tripId;

beforeAll(async () => {
  await request(app).post('/api/register').send({ fullname:'User One', email: 'user1@auth.com', password: '123456' });
  await request(app).post('/api/register').send({ fullname:'User Two', email: 'user2@auth.com', password: '123456' });
  const resLogin1 = await request(app).post('/api/login').send({ email: 'user1@auth.com', password: '123456' });
  const resLogin2 = await request(app).post('/api/login').send({ email: 'user2@auth.com', password: '123456' });
  user1Token = resLogin1.body.access_token;
  user2Token = resLogin2.body.access_token;
  const resTrip = await request(app)
    .post('/api/trips')
    .set('Authorization', `Bearer ${user1Token}`)
    .send({ title:'Owned Trip', city:'Bandung', interests:'kuliner', startDate: new Date(Date.now()+3*86400000).toISOString().slice(0,10), endDate: new Date(Date.now()+4*86400000).toISOString().slice(0,10) });
  tripId = resTrip.body.id;
});

// no manual close

describe('Authorization (owner only actions)', () => {
  test('PUT update by non-owner -> 403/404', async () => {
    const res = await request(app)
      .put(`/api/trips/${tripId}`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ title:'Hacked Title' });
    expect([403,404]).toContain(res.status);
  });
  test('DELETE by non-owner -> 403/404', async () => {
    const res = await request(app)
      .delete(`/api/trips/${tripId}`)
      .set('Authorization', `Bearer ${user2Token}`);
    expect([403,404]).toContain(res.status);
  });
});

const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../models');

let token;

const { Trip, User } = require('../models');


beforeAll(async () => {
  await request(app).post('/api/register').send({ fullname:'TripUser', email:'tripcrud@test.com', password:'secret123' });
  const login = await request(app).post('/api/login').send({ email:'tripcrud@test.com', password:'secret123' });
  token = login.body.access_token;
});

describe('Trips CRUD basic', ()=>{
  let createdId;
  test('POST /api/trips create trip', async ()=>{
    const res = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Liburan Bali',
        city: 'Bali',
  interests: 'pantai',
        startDate: new Date(Date.now()+2*86400000).toISOString().slice(0,10),
        endDate: new Date(Date.now()+3*86400000).toISOString().slice(0,10)
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    createdId = res.body.id;
  });

  test('GET /api/trips returns list', async ()=>{
    const res = await request(app)
      .get('/api/trips')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/trips/:id returns one', async ()=>{
    const res = await request(app)
      .get(`/api/trips/${createdId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', createdId);
  });

  test('PUT /api/trips/:id update title', async ()=>{
    const res = await request(app)
      .put(`/api/trips/${createdId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Liburan Bali Update' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('title','Liburan Bali Update');
  });

  test('PUT /api/trips/:id update title', async ()=>{
    const res = await request(app)
      .put(`/api/trips/${createdId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Liburan Bali Update' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('title','Liburan Bali Update');
  });

  test('DELETE /api/trips/:id remove', async ()=>{
    const res = await request(app)
      .delete(`/api/trips/${createdId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  test('GET /api/trips/:id after delete -> 404', async ()=>{
    const res = await request(app)
      .get(`/api/trips/${createdId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  test('Public share endpoint returns 200 or 404', async ()=>{
    // create a new trip to get shareSlug
    const resCreate = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${token}`)
      .send({ title:'Trip Public', city:'Bali', interests:'pantai', startDate: new Date(Date.now()+4*86400000).toISOString().slice(0,10), endDate: new Date(Date.now()+5*86400000).toISOString().slice(0,10) });
    const slug = resCreate.body.shareSlug;
    const resPublic = await request(app).get(`/api/public/trips/${slug}`);
    expect([200,404]).toContain(resPublic.status);
  });

  test('POST /api/trips past start date -> 400', async ()=>{
    const past = new Date(Date.now()-86400000).toISOString().slice(0,10);
    const future = new Date(Date.now()+3*86400000).toISOString().slice(0,10);
    const res = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${token}`)
      .send({ title:'Past Trip', city:'Jakarta', interests:'kuliner', startDate: past, endDate: future });
    expect(res.status).toBe(400);
  });

  test('GET /api/trips unauthorized without token -> 401', async ()=>{
    const res = await request(app).get('/api/trips');
    expect(res.status).toBe(401);
  });
});

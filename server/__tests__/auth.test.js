const request = require('supertest');
const app = require('../app');
const { User } = require('../models');

describe('Auth Register & Login', ()=>{
  test('POST /api/register should create user', async ()=>{
    const res = await request(app)
      .post('/api/register')
      .send({ fullname: 'Tester', email: 'test@example.com', password: 'secret123' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('email','test@example.com');
  });

  test('POST /api/login should return access_token', async ()=>{
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'test@example.com', password: 'secret123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('access_token');
  });

  test('POST /api/login wrong password returns 401', async ()=>{
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'test@example.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  test('GET /api/me returns current user', async ()=>{
    const login = await request(app).post('/api/login').send({ email:'test@example.com', password:'secret123' });
    const token = login.body.access_token;
    const res = await request(app).get('/api/me').set('Authorization', 'Bearer '+token);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('email','test@example.com');
  });
});

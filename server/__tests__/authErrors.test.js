const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../models');

describe('Auth & validation error cases', () => {
  test('POST /api/register missing body -> 400 (SequelizeValidationError)', async ()=>{
    const res = await request(app).post('/api/register').send({});
    expect(res.status).toBe(400);
  });
  test('POST /api/register valid then duplicate -> 400 (UniqueConstraint)', async ()=>{
    await request(app).post('/api/register').send({ fullname:'User', email:'dup@test.com', password:'secret123' });
    const res = await request(app).post('/api/register').send({ fullname:'User2', email:'dup@test.com', password:'secret123' });
    expect(res.status).toBe(400);
  });
  test('POST /api/login missing email -> 400', async ()=>{
    const res = await request(app).post('/api/login').send({ password:'abc' });
    expect(res.status).toBe(400);
  });
  test('POST /api/login missing password -> 400', async ()=>{
    const res = await request(app).post('/api/login').send({ email:'dup@test.com' });
    expect(res.status).toBe(400);
  });
  test('GET /api/trips with invalid token -> 401 (JsonWebTokenError)', async ()=>{
    const res = await request(app).get('/api/trips').set('Authorization','Bearer invalid.token.value');
    expect(res.status).toBe(401);
  });
});

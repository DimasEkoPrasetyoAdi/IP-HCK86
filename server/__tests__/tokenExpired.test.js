const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../models');

describe('Token expired path', () => {
  test('Expired token -> 401', async ()=>{
    const token = jwt.sign({ id:1 }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '1ms' });
    await new Promise(r=>setTimeout(r,10));
    const res = await request(app).get('/api/trips').set('Authorization','Bearer '+token);
    expect(res.status).toBe(401);
  });
});

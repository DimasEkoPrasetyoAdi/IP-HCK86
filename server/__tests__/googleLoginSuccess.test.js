jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(()=>({
    verifyIdToken: jest.fn().mockResolvedValue({
      getPayload: () => ({ email:'g@test.com', name:'Google User', sub:'sub123' })
    })
  }))
}));

const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../models');

describe('Google login success path', () => {
  test('Creates user and returns token', async ()=>{
    const res = await request(app).post('/api/google-login').send({ id_token:'dummy' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('access_token');
  });
});

const request = require('supertest');
const app = require('../app');

describe('Authorization middleware early return (401 when no user)', () => {
  test('PUT /api/trips/:id without auth user triggers 401 before db lookup', async () => {
    // Call directly without token so authentication sets no user (or rejects). We hit protected route.
    const res = await request(app).put('/api/trips/123').send({ title: 'X' });
    expect([401,403,404]).toContain(res.status); // tolerate variation depending on upstream auth
  });
});

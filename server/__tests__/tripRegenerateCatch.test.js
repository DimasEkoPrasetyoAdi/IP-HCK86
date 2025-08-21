// Force generateItinerary to throw inside update regeneration branch to cover catch logging line
jest.mock('../services/gemini', () => ({
  generateItinerary: jest.fn(() => { throw new Error('regen fail'); })
}));

jest.mock('../services/openMeteo', () => ({
  getWeather: jest.fn(() => ({ ok: true }))
}));

const request = require('supertest');
const app = require('../app');
const { User, Trip } = require('../models');
const { signToken } = require('../helpers/jwt');

describe('Trip update itinerary regeneration catch branch', () => {
  let token, trip;
  beforeAll(async () => {
    const user = await User.create({ fullname: 'R Catch', email: 'regenCatch_unique@test.com', password: 'secret' });
    token = signToken({ id: user.id });
    trip = await Trip.create({
      title: 'Initial',
      city: 'City',
      interest: ['a'],
      lat: 1,
      lon: 1,
      weather: {},
      itinerary: [],
      note_markdown: null,
      note_html: null,
      startDate: new Date(Date.now()+86400000),
      endDate: new Date(Date.now()+2*86400000),
  shareSlug: 'slug-'+Math.random().toString(36).slice(2,8),
      UserId: user.id,
    });
  });

  test('update interests triggers regen with itinerary failure caught', async () => {
    const res = await request(app)
      .put('/api/trips/'+trip.id)
      .set('Authorization', `Bearer ${token}`)
      .send({ interests: ['b','c'] });
    expect(res.status).toBe(200);
  expect([null, [], {}]).toContainEqual(res.body.itinerary); // accept null or unchanged array depending on controller behavior
  });
});

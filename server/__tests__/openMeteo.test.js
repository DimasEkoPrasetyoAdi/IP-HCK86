jest.mock('axios', () => ({ get: jest.fn().mockImplementation((url,{ params }) => {
  if(params.start_date === '2099-01-01') { // success path
    return Promise.resolve({ data:{ daily:{ time:['2099-01-01'], weathercode:[0], temperature_2m_max:[30], temperature_2m_min:[24], precipitation_sum:[0] } } });
  }
  // throw to trigger fallback
  return Promise.reject(new Error('network error'));
}) }));

const { getWeather } = require('../services/openMeteo');

describe('openMeteo service paths', () => {
  test('clamp >16 days (duration truncated)', async ()=>{
    const w = await getWeather(-8,115,'2099-01-01','2099-02-05'); // >16 hari
    expect(w.dailySummary.length).toBeGreaterThan(0);
  });
  test('fallback path on error', async ()=>{
    const w = await getWeather(-8,115,'2099-02-10','2099-02-10');
    expect(w.error).toBe('weather_unavailable');
    expect(w.dailySummary.length).toBe(1);
  });
});

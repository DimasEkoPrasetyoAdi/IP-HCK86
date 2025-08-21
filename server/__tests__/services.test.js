jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(()=>({
    getGenerativeModel: () => ({
      generateContent: async () => ({ response: { text: () => '{"itinerary":[{"day":1,"activities":[{"time":"09:00","activity":"A","description":"D","duration":"2 jam"}]}]}' } })
    })
  }))
}));

jest.mock('axios', () => ({ get: jest.fn().mockResolvedValue({ data: { daily:{ time:['2025-01-01'], weathercode:[0], temperature_2m_max:[30], temperature_2m_min:[24], precipitation_sum:[0] } } }) }));

const { generateItinerary } = require('../services/gemini');
const { getWeather } = require('../services/openMeteo');

describe('Service unit tests', () => {
  test('generateItinerary parses JSON', async ()=>{
    const r = await generateItinerary('Bali',2,['pantai'],{ dailySummary:[] });
    expect(r.itinerary).toBeTruthy();
  });
  test('getWeather success summarises', async ()=>{
    const w = await getWeather(-8.65,115.22,'2025-01-01','2025-01-01');
    expect(w.dailySummary).toBeTruthy();
  });
});

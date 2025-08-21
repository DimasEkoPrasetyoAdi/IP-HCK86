jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(()=>({
    getGenerativeModel: () => ({
      generateContent: async () => { throw new Error('AI fail'); }
    })
  }))
}));

const { generateItinerary } = require('../services/gemini');

describe('Gemini fallback path', ()=>{
  test('returns synthetic itinerary on error', async ()=>{
    const r = await generateItinerary('Bali',2,['pantai'],{ dailySummary:[] });
    expect(r.itinerary.length).toBe(2);
  });
});

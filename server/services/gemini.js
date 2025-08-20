require("dotenv").config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateItinerary(city, days, interests, weather, places = []) {
  try {
    const prompt = `
Generate a detailed travel itinerary for ${city} for ${days} days.
The traveler is interested in: ${interests.join(', ')}.
Current weather conditions: ${JSON.stringify(weather)}.
${places.length > 0 ? `Consider these places: ${places.join(', ')}` : ''}

Please provide a day-by-day itinerary in JSON format with the following structure:
{
  "itinerary": [
    {
      "day": 1,
      "activities": [
        {
          "time": "09:00",
          "activity": "Visit place",
          "description": "Detailed description",
          "duration": "2 hours"
        }
      ]
    }
  ]
}
`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse JSON from response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.warn('Could not parse JSON from Gemini response, returning text');
    }

    // If JSON parsing fails, return formatted text response
    return {
      itinerary: [{
        day: 1,
        activities: [{
          time: "09:00",
          activity: "AI Generated Itinerary",
          description: text,
          duration: `${days} days`
        }]
      }]
    };

  } catch (error) {
    console.error("Gemini AI Error:", error);
    
    // Fallback: return a simple itinerary
    return {
      itinerary: Array.from({ length: days }, (_, i) => ({
        day: i + 1,
        activities: [{
          time: "09:00",
          activity: `Explore ${city}`,
          description: `Day ${i + 1} activities in ${city}. Interests: ${interests.join(', ')}`,
          duration: "8 hours"
        }]
      }))
    };
  }
}

module.exports = { generateItinerary };
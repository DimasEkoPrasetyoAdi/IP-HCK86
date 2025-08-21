require("dotenv").config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateItinerary(city, days, interests, weather, places = []) { // 'days' now derived from (endDate-startDate+1)
  try {
    const prompt = `
Anda adalah asisten travel berbahasa Indonesia.
Buatkan itinerary perjalanan yang detail untuk kota/destinasi: ${city} selama ${days} hari.
Minat / ketertarikan traveler: ${interests.join(', ')}.
Ringkasan cuaca harian (jika ada): ${(weather && weather.dailySummary) ? weather.dailySummary.map(d=>`${d.date}: ${d.condition}, max ${d.temp_max}°C / min ${d.temp_min}°C, hujan ${d.precipitation_mm}mm`).join(' | ') : 'Tidak tersedia'}.
${places.length > 0 ? `Pertimbangkan juga tempat-tempat berikut: ${places.join(', ')}.` : ''}

Ketentuan bahasa & gaya:
- Gunakan Bahasa Indonesia yang natural, ringkas, tidak kaku.
- Hindari kalimat terlalu panjang; fokus pada aksi dan pengalaman.
- Sertakan variasi aktivitas (kuliner, budaya, alam, santai) sejauh relevan dengan minat.
- Jika cuaca buruk pada hari tertentu, berikan alternatif indoor.

Format keluaran HARUS berupa JSON valid dengan struktur persis:
{
  "itinerary": [
    {
      "day": 1,
      "activities": [
        {
          "time": "09:00",
          "activity": "Judul singkat aktivitas (Bahasa Indonesia)",
          "description": "Deskripsi singkat (Bahasa Indonesia)",
          "duration": "2 jam"
        }
      ]
    }
  ]
}

Jangan tambahkan penjelasan di luar JSON. Pastikan semua teks activity & description dalam Bahasa Indonesia.`;

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
            activity: "Rangkuman Itinerary AI",
            description: text,
            duration: `${days} hari`
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
            activity: `Eksplorasi ${city}`,
            description: `Hari ${i + 1} menjelajahi ${city}. Fokus minat: ${interests.join(', ')}`,
            duration: "8 jam"
          }]
        }))
    };
  }
}

module.exports = { generateItinerary };
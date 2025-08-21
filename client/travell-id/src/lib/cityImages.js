// cityImages.js
// Pemetaan ikon destinasi Indonesia -> URL gambar ikonik (Unsplash public domain style). Tidak mengubah logic trip,
// hanya util front-end untuk menampilkan gambar konsisten.

const CITY_IMAGE_MAP = [
  { keys: ['raja ampat','raja-ampat'], url: 'https://images.unsplash.com/photo-1552733407-bb6c0a7b35a0?auto=format&fit=crop&w=800&q=60' },
  { keys: ['labuan bajo','labuan-bajo','bajo'], url: 'https://images.unsplash.com/photo-1513211888428-30e1b5618b9b?auto=format&fit=crop&w=800&q=60' },
  { keys: ['komodo'], url: 'https://images.unsplash.com/photo-1513211888428-30e1b5618b9b?auto=format&fit=crop&w=800&q=60' },
  { keys: ['bromo','mount bromo','gunung bromo'], url: 'https://images.unsplash.com/photo-1643951168290-721b0f853a02?auto=format&fit=crop&w=800&q=60' },
  { keys: ['bali','denpasar','kuta','seminyak','nusa dua','canggu'], url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=60' },
  { keys: ['ubud','tegalalang','rice terrace'], url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=60' },
  { keys: ['yogyakarta','jogja','borobudur','prambanan'], url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=60' },
  { keys: ['jakarta'], url: 'https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=800&q=60' },
  { keys: ['bandung'], url: 'https://images.unsplash.com/photo-1609743522653-52354461eb54?auto=format&fit=crop&w=800&q=60' },
  { keys: ['surabaya'], url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=60' },
  { keys: ['malang','batu'], url: 'https://images.unsplash.com/photo-1643951168290-721b0f853a02?auto=format&fit=crop&w=800&q=60' },
  { keys: ['lombok','gili'], url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=60' },
  { keys: ['belitung'], url: 'https://images.unsplash.com/photo-1562932831-a768a4997110?auto=format&fit=crop&w=800&q=60' },
  { keys: ['dieng'], url: 'https://images.unsplash.com/photo-1622889426510-4ef5a97ef920?auto=format&fit=crop&w=800&q=60' },
  { keys: ['semarang'], url: 'https://images.unsplash.com/photo-1585301853719-621943dc0309?auto=format&fit=crop&w=800&q=60' },
  { keys: ['makassar'], url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=60' },
  { keys: ['manado','bunaken'], url: 'https://images.unsplash.com/photo-1552733407-bb6c0a7b35a0?auto=format&fit=crop&w=800&q=60' },
  { keys: ['padang'], url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=60' },
  { keys: ['medan','toba','lake toba'], url: 'https://images.unsplash.com/photo-1510133744874-096621a0e0d9?auto=format&fit=crop&w=800&q=60' },
];

const FALLBACK_URL = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=60';

export function getCityImage(city='') {
  const c = city.toLowerCase();
  for (const entry of CITY_IMAGE_MAP) {
    if (entry.keys.some(k=> c.includes(k))) return entry.url;
  }
  return FALLBACK_URL;
}

export default getCityImage;

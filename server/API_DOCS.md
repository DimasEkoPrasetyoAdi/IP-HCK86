# Travell-ID REST API Documentation

Base URL (development): `http://localhost:3000`
All responses are JSON.

## Auth
### POST /api/register
Create a user.
Request JSON:
```
# TravellID API Documentation

REST API untuk membuat dan mengelola Trip (itinerary + cuaca), termasuk login/register, favorit, dan utilitas geolokasi. Semua path diawali prefix `/api`.

## Base URL
- Development: http://localhost:3000/api
- Production: https://<your-domain>/api

## Authentication
JSON Web Token (JWT) via header:
```
Authorization: Bearer <access_token>
```

---

## Endpoints

### Auth (Public)

#### Register
POST /api/register

Request Body:
{
	"fullname": "Dimas",
	"email": "user@mail.com",
	"password": "secret123"
}

Response 201:
{
	"name": "Dimas",
	"email": "user@mail.com"
}

Errors: 400 (validation)

#### Login
POST /api/login

Request Body:
{
	"email": "user@mail.com",
	"password": "secret123"
}

Response 200:
{ "access_token": "<jwt>" }

Errors: 400 (Email/Password required), 401 (Invalid email/password)

#### Google Login
POST /api/google-login

Request Body:
{ "id_token": "<google_id_token>" }

Response 200:
{ "access_token": "<jwt>" }

Errors: 400 (id_token required)

#### Me (Protected)
GET /api/me

Response 200:
{ "user": { "id": 1, "fullname": "Dimas", "email": "user@mail.com", ... } }

Errors: 401 (Invalid token)

---

### Trips (Protected)

Trip shape (simplified):
{
	"id": 1,
	"title": "Vacation",
	"city": "Yogyakarta",
	"lat": -7.79,
	"lon": 110.37,
	"interest": ["kuliner","budaya"],
	"startDate": "2025-09-01",
	"endDate": "2025-09-03",
	"weather": { "dailySummary": [ {"date":"2025-09-01","temp_min":24,"temp_max":32,"precipitation_mm":2,"condition":"Cerah"}, ... ] },
	"itinerary": [ {"day":1, "activities":[{"time":"09:00","activity":"Keraton"}] } ],
	"shareSlug": "vacation-yogyakarta-abc123"
}

#### Create Trip
POST /api/trips

Headers: Authorization: Bearer <token>

Request Body:
{
	"title": "Vacation",
	"cityName": "Yogyakarta",  // atau "city"
	"startDate": "2025-09-01",
	"endDate": "2025-09-03",
	"interests": ["kuliner","budaya"], // bisa array atau string dipisah koma
	"lat": -7.79,                        // opsional, server akan geocode bila kosong
	"lon": 110.37,
	"notes_markdown": "## Day 1..."
}

Response 201: Trip (lihat shape di atas)

Errors: 400 (Title/Interests/Date range/Location invalid), 401 (Invalid token)

#### List My Trips
GET /api/trips

Response 200: [ Trip, ... ]

#### Get Trip By ID
GET /api/trips/:id

Response 200: Trip

Errors: 404 (Trip not found or unauthorized)

#### Update Trip
PUT /api/trips/:id

Body (partial allowed; bila city/lat/lon atau interests/dates berubah, server regenerate weather+itinerary):
{
	"title": "New Title",
	"cityName": "Bandung",
	"interests": ["alam"],
	"startDate": "2025-09-02",
	"endDate": "2025-09-04",
	"notes_markdown": "..."
}

Response 200: Trip (updated)

Errors: 400 (Invalid date range), 401, 403 (authorization), 404

#### Delete Trip
DELETE /api/trips/:id

Response 200:
{ "message": "your trip has been deleted" }

Errors: 401, 403, 404

---

### Public Share (No Auth)

GET /api/public/trips/:slug

Response 200:
{
	"id": 1,
	"title": "Vacation",
	"city": "Yogyakarta",
	"startDate": "2025-09-01",
	"endDate": "2025-09-03",
	"itinerary": [ ... ],
	"weather": { ... },
	"interest": [ ... ],
	"shareSlug": "..."
}

Errors: 404

---

### Favourite Trips (Protected)

#### Add / Upsert Favourite
POST /api/favourite-trips

Body:
{ "tripId": 1, "note": "Wishlist" }

Response 201 (created) atau 200 (updated): FavouriteTrip

#### List Favourites
GET /api/favourite-trips

Response 200: [ { id, note, Trip: { id,title,city,startDate,endDate,shareSlug } }, ... ]

#### Remove Favourite
DELETE /api/favourite-trips/:id

Response 204 (no content)

---

### Geo Utilities (Protected)

#### Search City (geocode)
GET /api/geo/search?q=<city>

Response 200:
{ "city": "Yogyakarta", "admin1": "DI Yogyakarta", "lat": -7.79, "lon": 110.37 }

Errors: 400 (q required), 404 (not found)

#### Provinces
GET /api/geo/provinces

Response 200: [ { "id": 11, "name": "ACEH" }, ... ]

#### Regencies by Province
GET /api/geo/regencies/:provinceId

Response 200: [ { "id": 1101, "name": "KAB. ACEH SELATAN" }, ... ]

Errors: 400 (provinceId required)

---

## Error Format

Semua error dibungkus oleh middleware errorHandler:
{ "error": "<message>" }

Kode umum: 400, 401, 403, 404, 500.

---

## Notes
- Weather menggunakan Open‑Meteo; bila gagal, server mengirim fallback `weather: { error: 'weather_unavailable', dailySummary: [...] }`.
- `interests` dapat berupa array atau string dipisah koma; server menormalkan ke array.
- Share slug memungkinkan akses publik via `/api/public/trips/:slug` tanpa auth.

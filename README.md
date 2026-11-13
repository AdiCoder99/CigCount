# PuffIndex

PuffIndex is an air-quality awareness website that translates local pollution into an easy-to-understand cigarette equivalent. It automatically detects the user's location, displays the location name, retrieves current air-quality data, and lets users search for other places.

## Features

- Automatic browser geolocation with permission handling
- Reverse geocoding to show the user's city and country
- Search for air quality in other cities and places
- Live AQI and PM2.5 readings
- Cigarette-equivalent calculation based on the AQI
- Visual AQI status indicators
- Responsive animated interface
- Next.js API routes for external data requests
- Fallback location and clear error states when location access is unavailable

## Tech Stack

- Next.js 15
- React 19
- JavaScript
- CSS
- Lucide React
- Open-Meteo Air Quality API
- Open-Meteo Geocoding API
- OpenStreetMap Nominatim reverse geocoding

## Getting Started

### Requirements

- Node.js 18.18 or newer
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production

```bash
npm run build
npm start
```

## Location Services

PuffIndex asks the browser for location permission when the page loads. If permission is denied or unavailable, the app uses Delhi as a fallback and allows users to search for another place.

For browser geolocation to work, the app should be opened on:

- `localhost` during development
- HTTPS in production

## API Routes

| Route | Description |
|---|---|
| `GET /api/air-quality?latitude={lat}&longitude={lon}` | Retrieves AQI and PM2.5 data |
| `GET /api/search?q={place}` | Searches for cities and places |
| `GET /api/reverse-geocode?latitude={lat}&longitude={lon}` | Converts coordinates into a readable place name |

## Cigarette Equivalent

PuffIndex uses the following awareness estimate:

```text
estimated cigarettes = round(AQI / 22)
```

This is an educational comparison, not a medical measurement or health diagnosis.

## Project Structure

```text
app/
  api/
    air-quality/       Air quality route handler
    reverse-geocode/   Location naming route handler
    search/            Place search route handler
  layout.jsx          Root layout and metadata
  page.jsx            Main dashboard
lib/
  air.js              AQI and cigarette-equivalent helpers
src/
  styles.css          Global visual styles
```

## Data Sources

- [Open-Meteo](https://open-meteo.com/) for air quality and geocoding data
- [OpenStreetMap Nominatim](https://nominatim.org/) for reverse geocoding

Data availability depends on the external services. PuffIndex is intended for awareness and educational use only.

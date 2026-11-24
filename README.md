# CINEBOOK 2.0 — Cinematic Movie Discovery & Ticket Booking Platform

CineBook 2.0 is a dark-luxury movie discovery and ticket booking web application built with React, JavaScript, Bootstrap 5, React Router DOM, Lucide React, `qrcode.react`, TMDB API integration, and browser `localStorage`.

## TMDB API Setup

1. Create a free TMDB API key at https://www.themoviedb.org/settings/api
2. Copy `.env.example` to `.env` in the project root.
3. Set your key:

```env
REACT_APP_TMDB_API_KEY="your_tmdb_api_key_here"
```

When no TMDB key is configured, CineBook automatically displays a helpful setup banner and falls back to its built-in local movie catalogue with posters and backdrops.

## Demo Credentials

- **Demo User**: `alex@cinebook.com` / `user123`
- **Demo Admin**: `admin@cinebook.com` / `admin123`

## Running Locally

```bash
npm install
npm run dev
```

## Notes & Limitations

- Theatre inventory, showtimes, seat availability, coupons, watchlist, and bookings are stored locally in browser `localStorage` and do not sync across devices.
- Payments (UPI and Card) are simulated locally; no real charges occur.
- Movie metadata and imagery come from TMDB when configured (This product uses the TMDB API but is not endorsed or certified by TMDB).

import React from 'react';
import { Link } from 'react-router-dom';
import { Film } from 'lucide-react';
import { CITIES } from '../utils/constants';
import { useBooking } from '../context/BookingContext';

export default function Footer() {
  const { setSelectedCity, settings } = useBooking();

  return (
    <footer className="cb-footer mt-auto py-5 no-print">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4">
            <Link to="/" className="cb-brand mb-3">
              <span className="cb-brand-mark" aria-hidden="true">
                <Film size={17} />
              </span>
              <span>{settings.siteName || 'CINEBOOK'}</span>
            </Link>
            <p className="text-secondary small mb-2" style={{ maxWidth: '330px' }}>
              {settings.tagline ||
                'Luxury cinema ticketing and real-time film discovery.'}
            </p>
            <p className="text-secondary small mb-0">
              Concierge: {settings.contactEmail} · {settings.supportInfo}
            </p>
          </div>

          <div className="col-6 col-lg-2">
            <h6 className="fw-semibold mb-3 cb-text-gold">Explore</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li>
                <Link to="/" className="text-secondary text-decoration-none">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/movies"
                  className="text-secondary text-decoration-none"
                >
                  Browse Movies
                </Link>
              </li>
              <li>
                <Link
                  to="/watchlist"
                  className="text-secondary text-decoration-none"
                >
                  Watchlist
                </Link>
              </li>
              <li>
                <Link
                  to="/my-bookings"
                  className="text-secondary text-decoration-none"
                >
                  My Bookings
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-6 col-lg-3">
            <h6 className="fw-semibold mb-3 cb-text-gold">Cities</h6>
            <div className="row row-cols-2 g-2 small">
              {CITIES.map((city) => (
                <div className="col" key={city}>
                  <button
                    type="button"
                    onClick={() => setSelectedCity(city)}
                    className="btn btn-link p-0 text-secondary text-decoration-none small"
                  >
                    {city}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="col-lg-3">
            <h6 className="fw-semibold mb-3 cb-text-gold">Account &amp; Admin</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li>
                <Link
                  to="/login"
                  className="text-secondary text-decoration-none"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-secondary text-decoration-none"
                >
                  Create Demo Account
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="text-secondary text-decoration-none"
                >
                  User Profile
                </Link>
              </li>
              <li>
                <Link
                  to="/admin"
                  className="text-secondary text-decoration-none"
                >
                  Admin Console
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-secondary border-opacity-25 my-4" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 small text-secondary">
          <span>
            &copy; {new Date().getFullYear()} {settings.siteName || 'CINEBOOK'}.
            LocalStorage demo ticketing.
          </span>
          <span>
            Movie metadata &amp; imagery powered by TMDB API (not endorsed or
            certified by TMDB).
          </span>
        </div>
      </div>
    </footer>
  );
}

import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Bookmark,
  Film,
  LogOut,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { CITIES } from '../utils/constants';

export default function Navbar() {
  const { currentUser, isAdmin, logout } = useAuth();
  const {
    selectedCity,
    setSelectedCity,
    searchQuery,
    setSearchQuery,
    watchlist,
    settings,
  } = useBooking();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  function handleSearchSubmit(event) {
    event.preventDefault();
    setMobileOpen(false);
    navigate('/movies');
  }

  function handleLogout() {
    logout();
    setMobileOpen(false);
    navigate('/');
  }

  return (
    <header className="cb-navbar sticky-top no-print">
      <div className="container py-2">
        <div className="d-flex align-items-center justify-content-between gap-3">
          {/* Brand Logo */}
          <Link
            to="/"
            className="cb-brand"
            onClick={() => setMobileOpen(false)}
          >
            <span className="cb-brand-mark" aria-hidden="true">
              <Film size={17} />
            </span>
            <span>{settings.siteName || 'CINEBOOK'}</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="d-none d-xl-flex align-items-center gap-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `cb-nav-link ${isActive ? 'active' : ''}`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/movies"
              className={({ isActive }) =>
                `cb-nav-link ${isActive ? 'active' : ''}`
              }
            >
              Movies
            </NavLink>
            <NavLink
              to="/my-bookings"
              className={({ isActive }) =>
                `cb-nav-link ${isActive ? 'active' : ''}`
              }
            >
              My Bookings
            </NavLink>
            <NavLink
              to="/watchlist"
              className={({ isActive }) =>
                `cb-nav-link d-inline-flex align-items-center gap-1 ${
                  isActive ? 'active' : ''
                }`
              }
            >
              <Bookmark size={14} />
              <span>Watchlist</span>
              {watchlist.length > 0 && (
                <span className="cb-mono small cb-text-gold">
                  ({watchlist.length})
                </span>
              )}
            </NavLink>
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `cb-nav-link d-inline-flex align-items-center gap-1 ${
                    isActive ? 'active' : ''
                  }`
                }
              >
                <ShieldCheck size={15} className="cb-text-orange" />
                <span>Admin Dashboard</span>
              </NavLink>
            )}
          </nav>

          {/* Desktop Search, City & Account Controls */}
          <div className="d-none d-xl-flex align-items-center gap-2">
            <form
              onSubmit={handleSearchSubmit}
              className="position-relative"
              style={{ width: '205px' }}
            >
              <Search
                size={15}
                className="position-absolute top-50 translate-middle-y text-secondary"
                style={{ left: '10px' }}
              />
              <input
                type="search"
                className="form-control form-control-sm cb-input ps-4"
                placeholder="Search movies..."
                aria-label="Search movies"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            <div className="d-flex align-items-center position-relative">
              <MapPin
                size={14}
                className="position-absolute cb-text-gold"
                style={{ left: '9px', pointerEvents: 'none' }}
              />
              <select
                className="form-select form-select-sm cb-select ps-4"
                aria-label="Select city"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                style={{ width: '130px' }}
              >
                {CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {currentUser ? (
              <div className="d-flex align-items-center gap-2 ms-1">
                <Link
                  to="/profile"
                  className="btn btn-sm cb-btn-outline d-inline-flex align-items-center gap-1"
                >
                  <User size={14} />
                  <span>{currentUser.name.split(' ')[0]}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-sm cb-btn-outline px-2"
                  title="Log out"
                  aria-label="Log out"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2 ms-1">
                <Link to="/login" className="btn btn-sm cb-btn-outline">
                  Login
                </Link>
                <Link to="/register" className="btn btn-sm cb-btn-primary">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            type="button"
            className="btn btn-sm cb-btn-outline d-xl-none px-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="d-xl-none pt-3 pb-2 border-top border-secondary border-opacity-25 mt-2">
            <form onSubmit={handleSearchSubmit} className="mb-3">
              <div className="input-group input-group-sm">
                <input
                  type="search"
                  className="form-control cb-input"
                  placeholder="Search movies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="btn cb-btn-primary">
                  Search
                </button>
              </div>
            </form>

            <div className="mb-3">
              <label className="form-label small text-secondary mb-1">
                City
              </label>
              <select
                className="form-select form-select-sm cb-select"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                {CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div className="d-flex flex-column gap-1 mb-3">
              <NavLink
                to="/"
                end
                className="cb-nav-link"
                onClick={() => setMobileOpen(false)}
              >
                Home
              </NavLink>
              <NavLink
                to="/movies"
                className="cb-nav-link"
                onClick={() => setMobileOpen(false)}
              >
                Movies
              </NavLink>
              <NavLink
                to="/my-bookings"
                className="cb-nav-link"
                onClick={() => setMobileOpen(false)}
              >
                My Bookings
              </NavLink>
              <NavLink
                to="/watchlist"
                className="cb-nav-link"
                onClick={() => setMobileOpen(false)}
              >
                Watchlist ({watchlist.length})
              </NavLink>
              {isAdmin && (
                <NavLink
                  to="/admin"
                  className="cb-nav-link cb-text-orange"
                  onClick={() => setMobileOpen(false)}
                >
                  Admin Dashboard
                </NavLink>
              )}
            </div>

            {currentUser ? (
              <div className="d-flex gap-2">
                <Link
                  to="/profile"
                  className="btn btn-sm cb-btn-outline flex-grow-1"
                  onClick={() => setMobileOpen(false)}
                >
                  Profile ({currentUser.name.split(' ')[0]})
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-sm cb-btn-primary"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link
                  to="/login"
                  className="btn btn-sm cb-btn-outline flex-grow-1"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-sm cb-btn-primary flex-grow-1"
                  onClick={() => setMobileOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

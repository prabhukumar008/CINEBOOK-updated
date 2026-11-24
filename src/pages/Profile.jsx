import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bookmark,
  CheckCircle2,
  LogOut,
  ShieldCheck,
  Ticket,
  User,
} from 'lucide-react';
import MovieCard from '../components/MovieCard';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { CITIES } from '../utils/constants';

export default function Profile() {
  const { currentUser, isAdmin, updateProfile, logout } = useAuth();
  const { bookings, watchlist, recentMovies } = useBooking();
  const navigate = useNavigate();

  const [name, setName] = useState(currentUser ? currentUser.name : '');
  const [city, setCity] = useState(
    currentUser ? currentUser.city || 'Mumbai' : 'Mumbai'
  );
  const [savedNotice, setSavedNotice] = useState(false);

  if (!currentUser) {
    return null;
  }

  const userBookings = bookings.filter(
    (item) => item.userId === currentUser.id
  );

  function handleSave(event) {
    event.preventDefault();
    if (!name.trim()) {
      return;
    }
    updateProfile({ name, city });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="container py-4 py-md-5">
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="cb-card p-4 p-md-5 mb-4">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 pb-4 mb-4 border-bottom border-secondary border-opacity-25">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center cb-text-gold"
                  style={{
                    width: '56px',
                    height: '56px',
                    backgroundColor: 'rgba(229, 185, 92, 0.15)',
                  }}
                >
                  <User size={26} />
                </div>
                <div>
                  <h1 className="h4 fw-bold mb-0">{currentUser.name}</h1>
                  <div className="small text-secondary">
                    {currentUser.email}
                  </div>
                  <div className="small cb-text-gold fw-medium mt-1">
                    {isAdmin ? 'Administrator Account' : 'CineBook Member'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="btn cb-btn-outline d-inline-flex align-items-center gap-2"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>

            {savedNotice && (
              <div className="alert alert-success d-flex align-items-center gap-2 small py-2">
                <CheckCircle2 size={16} />
                <span>Profile updated in LocalStorage.</span>
              </div>
            )}

            <form onSubmit={handleSave}>
              <h5 className="fw-bold mb-3">Edit Profile</h5>
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label small text-secondary">
                    Display Name
                  </label>
                  <input
                    type="text"
                    className="form-control cb-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small text-secondary">
                    Preferred City
                  </label>
                  <select
                    className="form-select cb-select"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  >
                    {CITIES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button type="submit" className="btn cb-btn-primary px-4">
                Save Changes
              </button>
            </form>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="cb-card p-4 mb-4">
            <h5 className="fw-bold mb-3">Activity Summary</h5>
            <div className="d-flex justify-content-between py-2 border-bottom border-secondary border-opacity-25">
              <span className="text-secondary">Total Bookings</span>
              <span className="fw-bold cb-tabular">{userBookings.length}</span>
            </div>
            <div className="d-flex justify-content-between py-2 border-bottom border-secondary border-opacity-25">
              <span className="text-secondary">Saved Watchlist</span>
              <span className="fw-bold cb-tabular">{watchlist.length}</span>
            </div>
            <div className="d-flex justify-content-between py-2 mb-3">
              <span className="text-secondary">Recently Viewed</span>
              <span className="fw-bold cb-tabular">{recentMovies.length}</span>
            </div>

            <div className="d-flex flex-column gap-2">
              <Link
                to="/my-bookings"
                className="btn btn-sm cb-btn-outline d-inline-flex align-items-center justify-content-center gap-2"
              >
                <Ticket size={15} />
                <span>View Booking History</span>
              </Link>
              <Link
                to="/watchlist"
                className="btn btn-sm cb-btn-outline d-inline-flex align-items-center justify-content-center gap-2"
              >
                <Bookmark size={15} />
                <span>Open Watchlist</span>
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="btn btn-sm cb-btn-primary d-inline-flex align-items-center justify-content-center gap-2"
                >
                  <ShieldCheck size={15} />
                  <span>Open Admin Dashboard</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recently Viewed Movies */}
      {recentMovies.length > 0 && (
        <section className="mt-4">
          <h4 className="fw-bold mb-3">Recently Viewed Movies</h4>
          <div className="cb-carousel-row">
            {recentMovies.map((item) => (
              <MovieCard key={item.id} movie={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

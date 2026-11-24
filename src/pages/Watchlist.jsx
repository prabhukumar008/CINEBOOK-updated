import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Heart } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import { useBooking } from '../context/BookingContext';

export default function Watchlist() {
  const { watchlist, favourites } = useBooking();
  const [activeTab, setActiveTab] = useState('watchlist');

  const activeMovies = activeTab === 'watchlist' ? watchlist : favourites;

  return (
    <div className="container py-4 py-md-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
        <div>
          <div className="small cb-text-gold mb-1">Personal Collection</div>
          <h1 className="fw-bold mb-0">My Watchlist &amp; Favourites</h1>
        </div>

        <div className="d-flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('watchlist')}
            className={`cb-filter-tab d-inline-flex align-items-center gap-2 ${
              activeTab === 'watchlist' ? 'active' : ''
            }`}
          >
            <Bookmark size={15} />
            <span>Watchlist ({watchlist.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('favourites')}
            className={`cb-filter-tab d-inline-flex align-items-center gap-2 ${
              activeTab === 'favourites' ? 'active' : ''
            }`}
          >
            <Heart size={15} />
            <span>Favourites ({favourites.length})</span>
          </button>
        </div>
      </div>

      {activeMovies.length === 0 ? (
        <div className="cb-card p-5 text-center">
          <Bookmark size={40} className="cb-text-gold mb-3" />
          <h4 className="fw-bold mb-2">
            Your {activeTab === 'watchlist' ? 'Watchlist' : 'Favourites'} is
            empty
          </h4>
          <p className="text-secondary mb-4">
            Save films from Home, Explore Movies, or Movie Details to access
            them quickly here.
          </p>
          <Link to="/movies" className="btn cb-btn-primary">
            Discover Movies
          </Link>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4">
          {activeMovies.map((movie) => (
            <div className="col" key={movie.id}>
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

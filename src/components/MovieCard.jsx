import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Film, Star } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

export default function MovieCard({ movie, variant = 'grid' }) {
  const { isInWatchlist, toggleWatchlist } = useBooking();
  const [imgError, setImgError] = useState(false);
  const saved = isInWatchlist(movie.id);

  if (variant === 'list') {
    return (
      <article className="cb-card p-3">
        <div className="row g-3 align-items-center">
          <div className="col-4 col-sm-3 col-md-2">
            <Link to={`/movies/${movie.id}`} state={{ movie }}>
              <div className="cb-poster-wrap rounded">
                {!imgError && movie.poster ? (
                  <img
                    src={movie.poster}
                    alt={`${movie.title} poster`}
                    className="cb-poster-img"
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="cb-poster-fallback p-2">
                    <Film size={24} className="cb-text-gold" />
                  </div>
                )}
              </div>
            </Link>
          </div>

          <div className="col-8 col-sm-9 col-md-10">
            <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-1">
              <div>
                <div className="small text-secondary mb-1">
                  {movie.genre} · {movie.language} ·{' '}
                  <span className="cb-tabular">{movie.releaseDate}</span>
                </div>
                <h5 className="fw-bold mb-1">{movie.title}</h5>
              </div>

              <div className="d-inline-flex align-items-center gap-1 cb-text-gold fw-semibold cb-tabular">
                <Star size={14} fill="currentColor" />
                <span>{Number(movie.rating).toFixed(1)}</span>
              </div>
            </div>

            <p className="small text-secondary mb-3 d-none d-sm-block">
              {movie.description && movie.description.length > 150
                ? `${movie.description.slice(0, 150)}...`
                : movie.description}
            </p>

            <div className="d-flex flex-wrap gap-2">
              <Link
                to={`/movies/${movie.id}`}
                state={{ movie }}
                className="btn btn-sm cb-btn-outline"
              >
                View Details
              </Link>
              {movie.status !== 'Upcoming' && (
                <Link
                  to={`/book/${movie.id}`}
                  state={{ movie }}
                  className="btn btn-sm cb-btn-primary"
                >
                  Book Tickets
                </Link>
              )}
              <button
                type="button"
                onClick={() => toggleWatchlist(movie)}
                className="btn btn-sm cb-btn-outline d-inline-flex align-items-center gap-1"
              >
                <Bookmark
                  size={14}
                  fill={saved ? 'currentColor' : 'none'}
                  className={saved ? 'cb-text-gold' : ''}
                />
                <span>{saved ? 'Saved' : 'Watchlist'}</span>
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="cb-movie-card">
      <div className="cb-poster-wrap">
        <Link
          to={`/movies/${movie.id}`}
          state={{ movie }}
          className="text-decoration-none d-block h-100"
        >
          {!imgError && movie.poster ? (
            <img
              src={movie.poster}
              alt={`${movie.title} poster`}
              className="cb-poster-img"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="cb-poster-fallback">
              <Film size={34} className="mb-2 cb-text-gold" />
              <span className="fw-semibold text-light">{movie.title}</span>
              <span className="small text-secondary mt-1">{movie.genre}</span>
            </div>
          )}
        </Link>

        <button
          type="button"
          onClick={() => toggleWatchlist(movie)}
          className="btn btn-sm position-absolute top-0 end-0 m-2 p-1 rounded"
          style={{
            backgroundColor: 'rgba(7, 9, 15, 0.82)',
            border: '1px solid rgba(255,255,255,0.16)',
            color: saved ? '#e5b95c' : '#f8fafc',
          }}
          aria-label={saved ? 'Remove from watchlist' : 'Add to watchlist'}
          title={saved ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          <Bookmark size={15} fill={saved ? 'currentColor' : 'none'} />
        </button>

        <div className="cb-rating-tag">
          <Star size={12} fill="currentColor" />
          <span>{Number(movie.rating).toFixed(1)}</span>
        </div>
      </div>

      <div className="p-3 d-flex flex-column flex-grow-1">
        <div className="small text-secondary mb-1 text-truncate">
          <span>{movie.genre}</span>
          <span className="mx-1" aria-hidden="true">
            ·
          </span>
          <span>{movie.language}</span>
          <span className="mx-1" aria-hidden="true">
            ·
          </span>
          <span className="cb-tabular">
            {(movie.releaseDate || '').slice(0, 4) || movie.duration}
          </span>
        </div>

        <h5 className="fw-semibold fs-6 mb-3 text-truncate">{movie.title}</h5>

        <div className="mt-auto d-flex gap-2">
          <Link
            to={`/movies/${movie.id}`}
            state={{ movie }}
            className="btn btn-sm cb-btn-outline flex-grow-1"
          >
            Details
          </Link>
          {movie.status !== 'Upcoming' && (
            <Link
              to={`/book/${movie.id}`}
              state={{ movie }}
              className="btn btn-sm cb-btn-primary"
            >
              Book
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

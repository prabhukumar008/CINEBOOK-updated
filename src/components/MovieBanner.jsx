import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Film, Play, Star, Ticket } from 'lucide-react';
import { FALLBACK_BACKDROP } from '../utils/imageHelper';

export default function MovieBanner({ movies = [], onWatchTrailer }) {
  const slides = movies.slice(0, 5);
  const [activeIndex, setActiveIndex] = useState(0);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) {
      return undefined;
    }
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
      setImgError(false);
    }, 6500);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) {
    return null;
  }

  const movie = slides[activeIndex] || slides[0];

  function handlePrev() {
    setImgError(false);
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }

  function handleNext() {
    setImgError(false);
    setActiveIndex((prev) => (prev + 1) % slides.length);
  }

  return (
    <section className="cb-hero d-flex align-items-end">
      {!imgError && (movie.banner || movie.poster) ? (
        <img
          src={movie.banner || movie.poster || FALLBACK_BACKDROP}
          alt={movie.title}
          className="cb-hero-img"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className="cb-hero-img d-flex align-items-center justify-content-center"
          style={{
            background:
              'radial-gradient(circle at 70% 30%, rgba(229, 185, 92, 0.2), #07090f 75%)',
          }}
        >
          <Film size={64} className="text-secondary opacity-25" />
        </div>
      )}

      <div className="cb-hero-scrim" />

      <div className="cb-hero-content w-100 p-4 p-md-5">
        <div className="row align-items-end g-4">
          <div className="col-lg-8">
            <div className="d-flex flex-wrap align-items-center gap-2 small text-secondary mb-2">
              <span className="cb-text-gold fw-semibold">
                {movie.status || 'Featured Premiere'}
              </span>
              <span aria-hidden="true">·</span>
              <span>{movie.genre}</span>
              <span aria-hidden="true">·</span>
              <span>{movie.language}</span>
              <span aria-hidden="true">·</span>
              <span className="cb-tabular">{movie.duration}</span>
              <span aria-hidden="true">·</span>
              <span className="d-inline-flex align-items-center gap-1 cb-text-gold fw-semibold cb-tabular">
                <Star size={14} fill="currentColor" />
                {Number(movie.rating).toFixed(1)}
              </span>
            </div>

            <h1 className="display-4 fw-bold cb-headline-balance mb-3">
              {movie.title}
            </h1>

            <p
              className="text-light text-opacity-75 mb-4"
              style={{ maxWidth: '58ch' }}
            >
              {movie.description}
            </p>

            <div className="d-flex flex-wrap align-items-center gap-3">
              <Link
                to={`/book/${movie.id}`}
                state={{ movie }}
                className="btn cb-btn-primary d-inline-flex align-items-center gap-2 px-4 py-2"
              >
                <Ticket size={18} />
                <span>Book Tickets</span>
              </Link>

              <Link
                to={`/movies/${movie.id}`}
                state={{ movie }}
                className="btn cb-btn-outline px-4 py-2"
              >
                Movie Details
              </Link>

              {onWatchTrailer && (
                <button
                  type="button"
                  onClick={() => onWatchTrailer(movie)}
                  className="btn cb-btn-outline d-inline-flex align-items-center gap-2 px-3 py-2"
                >
                  <Play size={16} />
                  <span>Watch Trailer</span>
                </button>
              )}
            </div>
          </div>

          {slides.length > 1 && (
            <div className="col-lg-4 d-flex justify-content-lg-end align-items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                className="btn btn-sm cb-btn-outline px-2"
                aria-label="Previous featured movie"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="small cb-mono text-secondary px-2">
                {activeIndex + 1} / {slides.length}
              </span>
              <button
                type="button"
                onClick={handleNext}
                className="btn btn-sm cb-btn-outline px-2"
                aria-label="Next featured movie"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

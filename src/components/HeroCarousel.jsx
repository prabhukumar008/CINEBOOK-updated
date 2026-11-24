import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Film,
  Pause,
  Play,
  Star,
  Ticket,
} from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { normalizeTmdbMovie } from '../services/movieService';
import { fetchFromTmdb, hasValidTmdbKey } from '../services/tmdbApi';
import { FALLBACK_BACKDROP, getBackdropUrl } from '../utils/imageHelper';

export default function HeroCarousel({ onWatchTrailer }) {
  const { movies: localMovies } = useBooking();

  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [failedImages, setFailedImages] = useState({});

  useEffect(() => {
    let isCancelled = false;

    async function loadTrendingSlides() {
      setLoading(true);
      const fallbackSlides = (localMovies || [])
        .filter((movie) => movie.isTrending || movie.isFeatured)
        .slice(0, 6);

      if (!hasValidTmdbKey()) {
        if (!isCancelled) {
          setSlides(
            fallbackSlides.length > 0
              ? fallbackSlides
              : (localMovies || []).slice(0, 6)
          );
          setActiveIndex(0);
          setLoading(false);
        }
        return;
      }

      try {
        const data = await fetchFromTmdb('/trending/movie/week', { page: 1 });
        const tmdbSlides = (data.results || [])
          .filter((item) => item.backdrop_path || item.poster_path)
          .slice(0, 6)
          .map((item) => {
            const normalized = normalizeTmdbMovie(item, 'Now Showing');
            return {
              ...normalized,
              banner: getBackdropUrl(
                item.backdrop_path || item.poster_path,
                'w1280'
              ),
            };
          });

        if (!isCancelled) {
          setSlides(
            tmdbSlides.length > 0
              ? tmdbSlides
              : fallbackSlides.length > 0
                ? fallbackSlides
                : (localMovies || []).slice(0, 6)
          );
          setActiveIndex(0);
        }
      } catch (err) {
        if (!isCancelled) {
          setSlides(
            fallbackSlides.length > 0
              ? fallbackSlides
              : (localMovies || []).slice(0, 6)
          );
          setActiveIndex(0);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadTrendingSlides();
    return () => {
      isCancelled = true;
    };
  }, [localMovies]);

  useEffect(() => {
    if (!isAutoPlaying || isHovered || slides.length <= 1) {
      return undefined;
    }

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [isAutoPlaying, isHovered, slides.length]);

  function handlePrev() {
    if (slides.length === 0) {
      return;
    }
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }

  function handleNext() {
    if (slides.length === 0) {
      return;
    }
    setActiveIndex((prev) => (prev + 1) % slides.length);
  }

  function handleImageError(movieId) {
    setFailedImages((prev) => ({ ...prev, [movieId]: true }));
  }

  if (loading) {
    return (
      <section className="cb-hero d-flex align-items-end p-4 p-md-5">
        <div className="w-100">
          <div
            className="cb-skeleton mb-3"
            style={{ height: '16px', width: '240px' }}
          />
          <div
            className="cb-skeleton mb-3"
            style={{ height: '48px', width: '58%' }}
          />
          <div
            className="cb-skeleton mb-4"
            style={{ height: '64px', width: '48%' }}
          />
          <div className="d-flex gap-3">
            <div
              className="cb-skeleton"
              style={{ height: '42px', width: '148px' }}
            />
            <div
              className="cb-skeleton"
              style={{ height: '42px', width: '148px' }}
            />
          </div>
        </div>
      </section>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  const currentMovie = slides[activeIndex] || slides[0];
  const backdropSrc =
    currentMovie.banner || currentMovie.poster || FALLBACK_BACKDROP;
  const hasFailed = Boolean(failedImages[currentMovie.id]);

  return (
    <section
      className="cb-hero d-flex align-items-end"
      aria-label="Trending movies showcase"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Backdrop Image */}
      {!hasFailed && backdropSrc ? (
        <img
          key={currentMovie.id}
          src={backdropSrc}
          alt={currentMovie.title}
          className="cb-hero-img"
          referrerPolicy="no-referrer"
          onError={() => handleImageError(currentMovie.id)}
        />
      ) : (
        <div
          className="cb-hero-img d-flex align-items-center justify-content-center"
          style={{
            background:
              'radial-gradient(circle at 70% 30%, rgba(229, 185, 92, 0.22), #07090f 75%)',
          }}
        >
          <Film size={64} className="text-secondary opacity-25" />
        </div>
      )}

      {/* Contrast Scrim */}
      <div className="cb-hero-scrim" />

      {/* Slide Content & Controls */}
      <div className="cb-hero-content w-100 p-4 p-md-5">
        <div className="row align-items-end g-4">
          <div className="col-lg-8">
            <div className="d-flex flex-wrap align-items-center gap-2 small text-secondary mb-2">
              <span className="cb-text-gold fw-semibold cb-tabular">
                Trending #{activeIndex + 1}
              </span>
              <span aria-hidden="true">·</span>
              <span>{currentMovie.genre}</span>
              <span aria-hidden="true">·</span>
              <span>{currentMovie.language}</span>
              <span aria-hidden="true">·</span>
              <span className="cb-tabular">
                {(currentMovie.releaseDate || '').slice(0, 4) ||
                  currentMovie.duration}
              </span>
              <span aria-hidden="true">·</span>
              <span className="d-inline-flex align-items-center gap-1 cb-text-gold fw-semibold cb-tabular">
                <Star size={14} fill="currentColor" />
                {Number(currentMovie.rating).toFixed(1)}
              </span>
            </div>

            <h1 className="display-4 fw-bold cb-headline-balance mb-3">
              {currentMovie.title}
            </h1>

            <p
              className="text-light text-opacity-75 mb-4"
              style={{ maxWidth: '58ch' }}
            >
              {currentMovie.description && currentMovie.description.length > 210
                ? `${currentMovie.description.slice(0, 210)}...`
                : currentMovie.description}
            </p>

            <div className="d-flex flex-wrap align-items-center gap-3">
              <Link
                to={`/book/${currentMovie.id}`}
                state={{ movie: currentMovie }}
                className="btn cb-btn-primary d-inline-flex align-items-center gap-2 px-4 py-2"
              >
                <Ticket size={18} />
                <span>Book Tickets</span>
              </Link>

              <Link
                to={`/movies/${currentMovie.id}`}
                state={{ movie: currentMovie }}
                className="btn cb-btn-outline px-4 py-2"
              >
                Movie Details
              </Link>

              {onWatchTrailer && (
                <button
                  type="button"
                  onClick={() => onWatchTrailer(currentMovie)}
                  className="btn cb-btn-outline d-inline-flex align-items-center gap-2 px-3 py-2"
                >
                  <Play size={16} />
                  <span>Watch Trailer</span>
                </button>
              )}
            </div>
          </div>

          {/* Slider Navigation & Indicators */}
          {slides.length > 1 && (
            <div className="col-lg-4 d-flex flex-column align-items-lg-end gap-3">
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAutoPlaying((prev) => !prev)}
                  className="btn btn-sm cb-btn-outline px-2"
                  aria-label={
                    isAutoPlaying ? 'Pause slideshow' : 'Play slideshow'
                  }
                  title={isAutoPlaying ? 'Pause slideshow' : 'Play slideshow'}
                >
                  {isAutoPlaying ? <Pause size={15} /> : <Play size={15} />}
                </button>

                <button
                  type="button"
                  onClick={handlePrev}
                  className="btn btn-sm cb-btn-outline px-2"
                  aria-label="Previous trending movie"
                >
                  <ChevronLeft size={18} />
                </button>

                <span className="small cb-mono text-light px-2 cb-tabular">
                  {activeIndex + 1} / {slides.length}
                </span>

                <button
                  type="button"
                  onClick={handleNext}
                  className="btn btn-sm cb-btn-outline px-2"
                  aria-label="Next trending movie"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="d-flex align-items-center gap-2">
                {slides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
                    style={{
                      width: idx === activeIndex ? '28px' : '10px',
                      height: '6px',
                      borderRadius: '999px',
                      border: 'none',
                      padding: 0,
                      transition: 'width 0.2s ease, background-color 0.2s ease',
                      backgroundColor:
                        idx === activeIndex
                          ? '#e5b95c'
                          : 'rgba(255, 255, 255, 0.35)',
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

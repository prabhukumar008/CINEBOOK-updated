import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Info,
  Sparkles,
  Tag,
  Ticket,
} from 'lucide-react';
import HeroCarousel from '../components/HeroCarousel';
import MovieCard from '../components/MovieCard';
import SkeletonCard from '../components/SkeletonCard';
import TrailerModal from '../components/TrailerModal';
import { useBooking } from '../context/BookingContext';
import {
  getHomeCollections,
  getMovieFullDetails,
} from '../services/movieService';
import { hasValidTmdbKey } from '../services/tmdbApi';
import { GENRES } from '../utils/constants';
import { formatCurrency } from '../utils/bookingHelpers';

function MovieCarouselSection({ title, subtitle, movies, loading, viewAllLink }) {
  if (!loading && (!movies || movies.length === 0)) {
    return null;
  }

  return (
    <section className="mt-5">
      <div className="d-flex justify-content-between align-items-end mb-3">
        <div>
          {subtitle && <div className="small cb-text-gold mb-1">{subtitle}</div>}
          <h2 className="fw-bold h3 mb-0">{title}</h2>
        </div>
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="cb-text-orange text-decoration-none fw-semibold small d-inline-flex align-items-center gap-1"
          >
            <span>Explore all</span>
            <ArrowRight size={15} />
          </Link>
        )}
      </div>

      <div className="cb-carousel-row">
        {loading
          ? Array.from({ length: 6 }).map((_, idx) => (
              <SkeletonCard key={`sk-${idx}`} />
            ))
          : movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
      </div>
    </section>
  );
}

export default function Home() {
  const { movies: localMovies, coupons, selectedCity } = useBooking();

  const [collections, setCollections] = useState({
    source: 'demo',
    trending: [],
    nowPlaying: [],
    upcoming: [],
    topRated: [],
    tamilMovies: [],
    hollywoodMovies: [],
    recommended: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [trailerData, setTrailerData] = useState({ movie: null, key: null });
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const navigate = useNavigate();

  const tmdbConfigured = hasValidTmdbKey();

  useEffect(() => {
    let isCancelled = false;

    async function loadCollections() {
      setLoading(true);
      setError('');
      try {
        const result = await getHomeCollections(localMovies);
        if (!isCancelled) {
          setCollections(result);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(
            'Unable to reach TMDB right now. Showing local CineBook catalogue.'
          );
          const fallback = await getHomeCollections(localMovies).catch(() => ({
            source: 'demo',
            trending: localMovies,
            nowPlaying: localMovies.filter((m) => m.status === 'Now Showing'),
            upcoming: localMovies.filter((m) => m.status === 'Upcoming'),
            topRated: localMovies,
            tamilMovies: localMovies.filter((m) => m.language === 'Tamil'),
            hollywoodMovies: localMovies.filter(
              (m) => m.language === 'English'
            ),
            recommended: localMovies,
          }));
          setCollections(fallback);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadCollections();
    return () => {
      isCancelled = true;
    };
  }, [localMovies]);

  async function handleWatchHeroTrailer(movie) {
    setTrailerData({ movie, key: movie.trailerKey || null });
    if (tmdbConfigured && String(movie.id).startsWith('tmdb-')) {
      try {
        const detail = await getMovieFullDetails(movie.id, localMovies);
        if (detail && detail.trailerKey) {
          setTrailerData({ movie, key: detail.trailerKey });
        }
      } catch (err) {
        // Keep storyboard fallback cleanly
      }
    }
  }

  function handleNewsletterSubmit(event) {
    event.preventDefault();
    if (!newsletterEmail.trim()) {
      return;
    }
    setSubscribed(true);
    setNewsletterEmail('');
  }

  const activeCoupons = coupons.filter((c) => c.isActive).slice(0, 3);

  return (
    <div className="container py-4 py-md-5">
      {!tmdbConfigured && (
        <div className="cb-card p-3 mb-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 border-warning border-opacity-25">
          <div className="d-flex align-items-start gap-2 small">
            <Info size={17} className="cb-text-gold mt-1 flex-shrink-0" />
            <div>
              <span className="fw-semibold cb-text-gold">
               Browse your movies
              </span>
            </div>
          </div>
          <Link
            to="/movies"
            className="btn btn-sm cb-btn-outline flex-shrink-0"
          >
            Browse Catalogue
          </Link>
        </div>
      )}

      {error && (
        <div className="alert alert-warning small mb-4" role="alert">
          {error}
        </div>
      )}

      {/* Cinematic Auto-Playing TMDB Hero Slider */}
      <HeroCarousel onWatchTrailer={handleWatchHeroTrailer} />

      {/* Genre Quick Links */}
      <section className="mt-4">
        <div className="d-flex flex-wrap align-items-center gap-2">
          {GENRES.filter((g) => g !== 'All')
            .slice(0, 8)
            .map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() =>
                  navigate(`/movies?genre=${encodeURIComponent(genre)}`)
                }
                className="cb-filter-tab"
              >
                {genre}
              </button>
            ))}
        </div>
      </section>

      <MovieCarouselSection
        title="Trending Now"
        subtitle={`Popular in ${selectedCity}`}
        movies={collections.trending}
        loading={loading}
        viewAllLink="/movies"
      />

      <MovieCarouselSection
        title="Now Playing"
        subtitle="In Theatres This Week"
        movies={collections.nowPlaying}
        loading={loading}
        viewAllLink="/movies"
      />

      <MovieCarouselSection
        title="Upcoming Releases"
        subtitle="Mark Your Calendar"
        movies={collections.upcoming}
        loading={loading}
        viewAllLink="/movies"
      />

      <MovieCarouselSection
        title="Top Rated Cinema"
        subtitle="Critically Acclaimed"
        movies={collections.topRated}
        loading={loading}
        viewAllLink="/movies"
      />

      <MovieCarouselSection
        title="Tamil Cinema"
        subtitle="Kollywood Picks"
        movies={collections.tamilMovies}
        loading={loading}
        viewAllLink="/movies"
      />

      <MovieCarouselSection
        title="Hollywood Spotlight"
        subtitle="English Blockbusters"
        movies={collections.hollywoodMovies}
        loading={loading}
        viewAllLink="/movies"
      />

      <MovieCarouselSection
        title="Recommended For You"
        subtitle="Curated Lineup"
        movies={collections.recommended}
        loading={loading}
        viewAllLink="/movies"
      />

      {/* Special Offers / Active Coupons */}
      {activeCoupons.length > 0 && (
        <section className="mt-5">
          <div className="mb-3">
            <div className="small cb-text-gold mb-1">Box Office Offers</div>
            <h2 className="fw-bold h3 mb-0">Exclusive Promo Codes</h2>
          </div>

          <div className="row g-3">
            {activeCoupons.map((coupon) => (
              <div className="col-md-4" key={coupon.id}>
                <div className="cb-card p-4 h-100 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Tag size={18} className="cb-text-orange" />
                    <span className="cb-mono fw-bold cb-text-gold">
                      {coupon.code}
                    </span>
                  </div>
                  <h5 className="fw-bold mb-1">
                    {coupon.discountType === 'percentage'
                      ? `${coupon.discountValue}% Off Tickets`
                      : `${formatCurrency(coupon.discountValue)} Instant Off`}
                  </h5>
                  <p className="small text-secondary mb-0">
                    Min subtotal {formatCurrency(coupon.minBookingAmount)} · Up
                    to {formatCurrency(coupon.maxDiscount)} savings at checkout.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <section className="mt-5">
        <div className="cb-card p-4 p-md-5">
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <div className="d-inline-flex align-items-center gap-2 small cb-text-gold fw-semibold mb-2">
                <Sparkles size={15} />
                <span>Premiere Dispatch</span>
              </div>
              <h3 className="fw-bold mb-2">
                Get Friday box-office alerts and advance IMAX showtimes.
              </h3>
              <p className="text-secondary mb-0">
                Curated weekly screenings for {selectedCity}. Local preview
                only — no external emails are transmitted.
              </p>
            </div>

            <div className="col-lg-5">
              {subscribed ? (
                <div className="p-3 rounded border border-success border-opacity-50 d-flex align-items-center gap-2 text-success">
                  <CheckCircle2 size={20} />
                  <span className="small fw-medium">
                    Subscribed! You are on the premiere alert preview list.
                  </span>
                </div>
              ) : (
                <form
                  onSubmit={handleNewsletterSubmit}
                  className="d-flex flex-column flex-sm-row gap-2"
                >
                  <input
                    type="email"
                    required
                    className="form-control cb-input"
                    placeholder="you@example.com"
                    aria-label="Email address for premiere alerts"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="btn cb-btn-primary d-inline-flex align-items-center justify-content-center gap-2"
                  >
                    <Ticket size={16} />
                    <span>Subscribe</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <TrailerModal
        movie={trailerData.movie}
        trailerKey={trailerData.key}
        onClose={() => setTrailerData({ movie: null, key: null })}
      />
    </div>
  );
}

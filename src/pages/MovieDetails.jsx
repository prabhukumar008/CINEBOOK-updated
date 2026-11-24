import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bookmark,
  Calendar,
  Check,
  Clock,
  Film,
  Globe,
  Heart,
  Play,
  Share2,
  Star,
  Ticket,
  User,
  UserCheck,
} from 'lucide-react';
import MovieCard from '../components/MovieCard';
import TrailerModal from '../components/TrailerModal';
import { useBooking } from '../context/BookingContext';
import { getMovieFullDetails } from '../services/movieService';

export default function MovieDetails() {
  const { movieId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    movies: localMovies,
    isInWatchlist,
    toggleWatchlist,
    isInFavourites,
    toggleFavourite,
    recordRecentlyViewed,
  } = useBooking();

  const initialMovie = (location.state && location.state.movie) || null;
  const [movie, setMovie] = useState(initialMovie);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [trailerKey, setTrailerKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadDetails() {
      setLoading(true);
      setImgError(false);
      try {
        const result = await getMovieFullDetails(movieId, localMovies);
        if (!cancelled && result && result.movie) {
          setMovie(result.movie);
          setSimilarMovies(result.similarMovies || []);
          setRecommendedMovies(result.recommendedMovies || []);
          setTrailerKey(result.trailerKey || null);
          recordRecentlyViewed(result.movie);
        }
      } catch (err) {
        if (!cancelled && initialMovie) {
          setMovie(initialMovie);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDetails();
    return () => {
      cancelled = true;
    };
  }, [movieId, localMovies]);

  function handleShare() {
    if (navigator.clipboard && window.location.href) {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2200);
  }

  if (loading && !movie) {
    return (
      <div className="container py-5">
        <div className="cb-card p-5">
          <div className="cb-skeleton mb-3" style={{ height: '32px', width: '45%' }} />
          <div className="cb-skeleton mb-2" style={{ height: '18px', width: '70%' }} />
          <div className="cb-skeleton" style={{ height: '240px', width: '100%' }} />
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container py-5 text-center">
        <h2 className="fw-bold mb-3">Movie Not Found</h2>
        <p className="text-secondary mb-4">
          The requested movie could not be loaded.
        </p>
        <Link to="/movies" className="btn cb-btn-primary">
          Back to Movies
        </Link>
      </div>
    );
  }

  const inWatchlist = isInWatchlist(movie.id);
  const inFavourites = isInFavourites(movie.id);
  const castList = Array.isArray(movie.castMembers)
    ? movie.castMembers
    : Array.isArray(movie.cast)
      ? movie.cast.map((name) => ({ name, character: 'Cast', profileImage: null }))
      : [];

  return (
    <div>
      {/* Full-Width Backdrop Header */}
      <div
        className="position-relative border-bottom border-secondary border-opacity-25"
        style={{ backgroundColor: '#07090f' }}
      >
        {(movie.banner || movie.poster) && (
          <img
            src={movie.banner || movie.poster}
            alt={movie.title}
            className="position-absolute top-0 start-0 w-100 h-100"
            style={{ objectFit: 'cover', opacity: 0.28 }}
            referrerPolicy="no-referrer"
          />
        )}
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            background:
              'linear-gradient(180deg, rgba(7,9,15,0.45) 0%, #07090f 100%)',
          }}
        />

        <div className="container position-relative z-2 py-4 py-md-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-sm cb-btn-outline d-inline-flex align-items-center gap-2 mb-4"
          >
            <ArrowLeft size={15} />
            <span>Back</span>
          </button>

          <div className="row g-4 g-lg-5 align-items-start">
            <div className="col-md-5 col-lg-3">
              <div className="cb-poster-wrap rounded-3 shadow-lg border border-secondary border-opacity-25">
                {!imgError && movie.poster ? (
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="cb-poster-img"
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="cb-poster-fallback">
                    <Film size={44} className="cb-text-gold mb-2" />
                    <span className="fw-semibold">{movie.title}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="col-md-7 col-lg-9">
              <div className="d-flex flex-wrap align-items-center gap-2 small text-secondary mb-2">
                <span className="cb-text-gold fw-semibold">{movie.status}</span>
                <span>·</span>
                <span>{movie.certificate || 'UA 13+'}</span>
                <span>·</span>
                <span>
                  {Array.isArray(movie.genres) && movie.genres.length > 0
                    ? movie.genres.join(' / ')
                    : movie.genre}
                </span>
              </div>

              <h1 className="display-5 fw-bold mb-3">{movie.title}</h1>

              <div className="d-flex flex-wrap align-items-center gap-4 mb-4 small">
                <div className="d-inline-flex align-items-center gap-1 cb-text-gold fw-semibold fs-6 cb-tabular">
                  <Star size={18} fill="currentColor" />
                  <span>{Number(movie.rating).toFixed(1)} / 10</span>
                </div>

                <div className="d-inline-flex align-items-center gap-2 text-secondary">
                  <Clock size={16} />
                  <span className="cb-tabular">{movie.duration}</span>
                </div>

                <div className="d-inline-flex align-items-center gap-2 text-secondary">
                  <Globe size={16} />
                  <span>{movie.language}</span>
                </div>

                <div className="d-inline-flex align-items-center gap-2 text-secondary">
                  <Calendar size={16} />
                  <span className="cb-tabular">{movie.releaseDate}</span>
                </div>
              </div>

              <p
                className="text-light text-opacity-75 mb-4"
                style={{ maxWidth: '72ch' }}
              >
                {movie.description}
              </p>

              <div className="mb-4 small">
                <span className="text-secondary me-2">Director:</span>
                <span className="fw-semibold d-inline-flex align-items-center gap-1">
                  <UserCheck size={15} className="cb-text-gold" />
                  {movie.director}
                </span>
              </div>

              <div className="d-flex flex-wrap gap-2">
                {movie.status === 'Upcoming' ? (
                  <button
                    type="button"
                    disabled
                    className="btn cb-btn-primary px-4 py-2"
                  >
                    Bookings Open Soon
                  </button>
                ) : (
                  <Link
                    to={`/book/${movie.id}`}
                    state={{ movie }}
                    className="btn cb-btn-primary d-inline-flex align-items-center gap-2 px-4 py-2"
                  >
                    <Ticket size={18} />
                    <span>Book Tickets</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => setShowTrailer(true)}
                  className="btn cb-btn-outline d-inline-flex align-items-center gap-2"
                >
                  <Play size={16} />
                  <span>Watch Trailer</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleWatchlist(movie)}
                  className="btn cb-btn-outline d-inline-flex align-items-center gap-2"
                >
                  <Bookmark
                    size={16}
                    fill={inWatchlist ? 'currentColor' : 'none'}
                    className={inWatchlist ? 'cb-text-gold' : ''}
                  />
                  <span>{inWatchlist ? 'In Watchlist' : 'Watchlist'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleFavourite(movie)}
                  className="btn cb-btn-outline d-inline-flex align-items-center gap-2"
                >
                  <Heart
                    size={16}
                    fill={inFavourites ? 'currentColor' : 'none'}
                    className={inFavourites ? 'text-danger' : ''}
                  />
                  <span>{inFavourites ? 'Favourited' : 'Favourite'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="btn cb-btn-outline d-inline-flex align-items-center gap-2"
                >
                  {copiedShare ? <Check size={16} /> : <Share2 size={16} />}
                  <span>{copiedShare ? 'Link Copied' : 'Share'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cast Section */}
      <div className="container py-4 py-md-5">
        {castList.length > 0 && (
          <section className="mb-5">
            <h3 className="fw-bold mb-4">Cast &amp; Crew</h3>
            <div className="row row-cols-2 row-cols-sm-3 row-cols-md-5 g-3">
              {castList.map((member, index) => (
                <div className="col" key={`${member.name}-${index}`}>
                  <div className="cb-card p-3 text-center h-100">
                    {member.profileImage ? (
                      <img
                        src={member.profileImage}
                        alt={member.name}
                        className="cb-actor-avatar mb-2"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="cb-actor-avatar mx-auto mb-2 d-flex align-items-center justify-content-center text-secondary">
                        <User size={24} />
                      </div>
                    )}
                    <div className="fw-semibold small text-truncate">
                      {member.name}
                    </div>
                    <div className="small text-secondary text-truncate">
                      {member.character}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Similar Movies */}
        {similarMovies.length > 0 && (
          <section className="mb-5">
            <h3 className="fw-bold mb-3">Similar Movies</h3>
            <div className="cb-carousel-row">
              {similarMovies.map((item) => (
                <MovieCard key={item.id} movie={item} />
              ))}
            </div>
          </section>
        )}

        {/* Recommended Movies */}
        {recommendedMovies.length > 0 && (
          <section>
            <h3 className="fw-bold mb-3">Recommended For You</h3>
            <div className="cb-carousel-row">
              {recommendedMovies.map((item) => (
                <MovieCard key={item.id} movie={item} />
              ))}
            </div>
          </section>
        )}
      </div>

      <TrailerModal
        movie={showTrailer ? movie : null}
        trailerKey={trailerKey}
        onClose={() => setShowTrailer(false)}
      />
    </div>
  );
}

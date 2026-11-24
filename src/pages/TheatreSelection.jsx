import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, ShieldAlert } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { SHOW_TIME_SLOTS } from '../data/shows';
import { getMovieFullDetails } from '../services/movieService';
import { CITIES, SEAT_PRICES } from '../utils/constants';
import { getShowPeriod, getUpcomingDates } from '../utils/bookingHelpers';

export default function TheatreSelection() {
  const { movieId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    movies,
    theatres,
    shows,
    selectedCity,
    setSelectedCity,
    selectShowForBooking,
  } = useBooking();

  const passedMovie = (location.state && location.state.movie) || null;
  const [movie, setMovie] = useState(
    passedMovie || movies.find((item) => item.id === movieId) || null
  );
  const [loadingMovie, setLoadingMovie] = useState(!movie);

  const dates = getUpcomingDates(5);
  const [selectedDate, setSelectedDate] = useState(dates[0].iso);
  const [periodFilter, setPeriodFilter] = useState('All');

  useEffect(() => {
    if (movie && movie.id === movieId) {
      setLoadingMovie(false);
      return;
    }
    let cancelled = false;
    async function load() {
      setLoadingMovie(true);
      try {
        const res = await getMovieFullDetails(movieId, movies);
        if (!cancelled && res && res.movie) {
          setMovie(res.movie);
        }
      } finally {
        if (!cancelled) {
          setLoadingMovie(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [movieId, movies, movie]);

  if (loadingMovie) {
    return (
      <div className="container py-5">
        <div className="cb-card p-5 text-center text-secondary">
          Loading theatre schedule...
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container py-5 text-center">
        <h2 className="fw-bold mb-3">Movie Not Found</h2>
        <Link to="/movies" className="btn cb-btn-primary">
          Browse Movies
        </Link>
      </div>
    );
  }

  const cityTheatres = theatres.filter(
    (theatre) => theatre.city === selectedCity
  );

  // Check if movie has explicit scheduled shows anywhere in the system
  const movieHasCustomShows = shows.some((show) => show.movieId === movie.id);

  const availableTheatres = cityTheatres
    .map((theatre) => {
      const theatreShows = shows.filter(
        (show) =>
          show.movieId === movie.id &&
          show.theatreId === theatre.id &&
          (show.date === selectedDate || show.date === 'Daily')
      );

      let showSlots = theatreShows.map((show) => ({
        id: show.id,
        time: show.startTime,
        screenNumber: show.screenNumber || 'Screen 1',
        seatPrices: {
          Silver: show.silverPrice || SEAT_PRICES.Silver,
          Gold: show.goldPrice || SEAT_PRICES.Gold,
          Platinum: show.platinumPrice || SEAT_PRICES.Platinum,
        },
      }));

      // For newly discovered TMDB films with no manual admin shows yet, offer standard screening times
      if (!movieHasCustomShows && showSlots.length === 0) {
        showSlots = SHOW_TIME_SLOTS.map((slot, index) => ({
          id: `std-${theatre.id}-${index}`,
          time: slot.startTime,
          screenNumber: (theatre.screens && theatre.screens[0]) || 'Screen 1',
          seatPrices: SEAT_PRICES,
        }));
      }

      const filteredSlots =
        periodFilter === 'All'
          ? showSlots
          : showSlots.filter(
              (slot) => getShowPeriod(slot.time) === periodFilter
            );

      return {
        ...theatre,
        showSlots: filteredSlots,
      };
    })
    .filter((theatre) => theatre.showSlots.length > 0);

  function handleSelectShow(theatreId, slot) {
    selectShowForBooking({
      movie,
      movieId: movie.id,
      theatreId,
      date: selectedDate,
      showtime: slot.time,
      screenNumber: slot.screenNumber,
      seatPrices: slot.seatPrices,
    });
    navigate('/seats');
  }

  return (
    <div className="container py-4 py-md-5">
      <button
        type="button"
        onClick={() => navigate(`/movies/${movie.id}`, { state: { movie } })}
        className="btn btn-sm cb-btn-outline d-inline-flex align-items-center gap-2 mb-4"
      >
        <ArrowLeft size={15} />
        <span>Back to Movie Details</span>
      </button>

      {/* Movie Summary Header */}
      <div className="cb-card p-4 mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <div className="small text-secondary mb-1">
              <span>{movie.genre}</span>
              <span className="mx-2">·</span>
              <span>{movie.language}</span>
              <span className="mx-2">·</span>
              <span className="cb-tabular">{movie.duration}</span>
            </div>
            <h1 className="h2 fw-bold mb-0">{movie.title}</h1>
          </div>

          <div className="d-flex align-items-center gap-2">
            <MapPin size={16} className="cb-text-gold" />
            <select
              className="form-select cb-select"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              aria-label="Select city for theatres"
            >
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Date & Show Period Filters */}
      <div className="cb-card p-3 p-md-4 mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-lg-7">
            <div className="small text-secondary mb-2 d-flex align-items-center gap-1">
              <Calendar size={14} />
              <span>Select Date</span>
            </div>
            <div className="d-flex flex-wrap gap-2">
              {dates.map((dateObj) => (
                <button
                  key={dateObj.iso}
                  type="button"
                  onClick={() => setSelectedDate(dateObj.iso)}
                  className={`cb-filter-tab cb-tabular ${
                    selectedDate === dateObj.iso ? 'active' : ''
                  }`}
                >
                  <span className="d-block fw-semibold">{dateObj.dayName}</span>
                  <small className="opacity-75">{dateObj.shortDate}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="col-lg-5">
            <div className="small text-secondary mb-2 d-flex align-items-center gap-1">
              <Clock size={14} />
              <span>Showtime Preference</span>
            </div>
            <div className="d-flex flex-wrap gap-2">
              {['All', 'Morning', 'Afternoon', 'Evening'].map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => setPeriodFilter(period)}
                  className={`cb-filter-tab ${
                    periodFilter === period ? 'active' : ''
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Theatre List */}
      {availableTheatres.length === 0 ? (
        <div className="cb-card p-5 text-center">
          <ShieldAlert size={36} className="cb-text-gold mb-3" />
          <h4 className="fw-bold mb-2">
            No shows scheduled in {selectedCity} for this date/filter
          </h4>
          <p className="text-secondary mb-3">
            Try switching to another city, choosing another date, or setting
            showtime preference to &ldquo;All&rdquo;.
          </p>
          <div className="d-flex justify-content-center gap-2">
            <button
              type="button"
              onClick={() => setPeriodFilter('All')}
              className="btn cb-btn-outline"
            >
              Show All Timings
            </button>
            <Link to="/movies" className="btn cb-btn-primary">
              Browse Other Movies
            </Link>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {availableTheatres.map((theatre) => (
            <div className="cb-card p-4" key={theatre.id}>
              <div className="row g-3 align-items-center">
                <div className="col-lg-5">
                  <h5 className="fw-bold mb-1">{theatre.name}</h5>
                  <p className="small text-secondary mb-2">{theatre.address}</p>
                  <div className="small cb-text-gold">
                    {(theatre.facilities || theatre.screens || []).join(' · ')}
                  </div>
                </div>

                <div className="col-lg-7">
                  <div className="d-flex flex-wrap gap-2">
                    {theatre.showSlots.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => handleSelectShow(theatre.id, slot)}
                        className="cb-showtime-btn"
                      >
                        <div className="cb-mono fw-semibold">{slot.time}</div>
                        <div className="small text-secondary">
                          {slot.screenNumber}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

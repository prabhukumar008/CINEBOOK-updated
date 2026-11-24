import React, { createContext, useContext, useState } from 'react';
import {
  DEFAULT_SETTINGS,
  SEAT_PRICES,
  STORAGE_KEYS,
} from '../utils/constants';
import {
  calculateBookingTotals,
  generateBookingId,
} from '../utils/bookingHelpers';
import {
  getStorageItem,
  initializeDemoData,
  removeStorageItem,
  setStorageItem,
} from '../utils/storage';

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  initializeDemoData();

  const [movies, setMovies] = useState(() =>
    getStorageItem(STORAGE_KEYS.MOVIES, [])
  );
  const [theatres, setTheatres] = useState(() =>
    getStorageItem(STORAGE_KEYS.THEATRES, [])
  );
  const [shows, setShows] = useState(() =>
    getStorageItem(STORAGE_KEYS.SHOWS, [])
  );
  const [bookings, setBookings] = useState(() =>
    getStorageItem(STORAGE_KEYS.BOOKINGS, [])
  );
  const [coupons, setCoupons] = useState(() =>
    getStorageItem(STORAGE_KEYS.COUPONS, [])
  );
  const [watchlist, setWatchlist] = useState(() =>
    getStorageItem(STORAGE_KEYS.WATCHLIST, [])
  );
  const [favourites, setFavourites] = useState(() =>
    getStorageItem(STORAGE_KEYS.FAVOURITES, [])
  );
  const [recentMovies, setRecentMovies] = useState(() =>
    getStorageItem(STORAGE_KEYS.RECENT_MOVIES, [])
  );
  const [settings, setSettings] = useState(() =>
    getStorageItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)
  );
  const [selectedCity, setSelectedCityState] = useState(() =>
    getStorageItem(STORAGE_KEYS.SELECTED_CITY, 'Mumbai')
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [draftBooking, setDraftBookingState] = useState(() =>
    getStorageItem(STORAGE_KEYS.DRAFT_BOOKING, null)
  );

  function setSelectedCity(city) {
    setSelectedCityState(city);
    setStorageItem(STORAGE_KEYS.SELECTED_CITY, city);
  }

  function saveDraftBooking(nextDraft) {
    setDraftBookingState(nextDraft);
    if (nextDraft) {
      setStorageItem(STORAGE_KEYS.DRAFT_BOOKING, nextDraft);
    } else {
      removeStorageItem(STORAGE_KEYS.DRAFT_BOOKING);
    }
  }

  function selectShowForBooking({
    movie,
    movieId,
    theatreId,
    date,
    showtime,
    seatPrices,
    screenNumber,
  }) {
    const nextDraft = {
      movieId: movieId || (movie ? movie.id : ''),
      movieSnapshot: movie
        ? {
            id: movie.id,
            title: movie.title,
            poster: movie.poster,
            language: movie.language,
            duration: movie.duration,
          }
        : null,
      theatreId,
      date,
      showtime,
      screenNumber: screenNumber || 'Screen 1',
      seatPrices: seatPrices || SEAT_PRICES,
      selectedSeats: [],
    };
    saveDraftBooking(nextDraft);
  }

  function setDraftSeats(selectedSeats) {
    if (!draftBooking) {
      return;
    }
    saveDraftBooking({
      ...draftBooking,
      selectedSeats,
    });
  }

  function clearDraftBooking() {
    saveDraftBooking(null);
  }

  function confirmBooking({ user, paymentMethod, appliedCoupon = null }) {
    if (!draftBooking || !user || !draftBooking.selectedSeats.length) {
      return null;
    }

    const movieFromCatalog = movies.find(
      (item) => item.id === draftBooking.movieId
    );
    const movie = movieFromCatalog || draftBooking.movieSnapshot;
    const theatre = theatres.find((item) => item.id === draftBooking.theatreId);
    const feePerTicket = Number(settings.convenienceFee ?? 35);
    const totals = calculateBookingTotals(
      draftBooking.selectedSeats,
      feePerTicket,
      appliedCoupon
    );

    const newBooking = {
      bookingId: generateBookingId(),
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      movieId: draftBooking.movieId,
      movieTitle: movie ? movie.title : 'Movie',
      moviePoster: movie ? movie.poster : '',
      movieLanguage: movie ? movie.language : '',
      theatreId: draftBooking.theatreId,
      theatreName: theatre ? theatre.name : 'Theatre',
      theatreCity: theatre ? theatre.city : selectedCity,
      theatreAddress: theatre ? theatre.address : '',
      screenNumber: draftBooking.screenNumber || 'Screen 1',
      date: draftBooking.date,
      showtime: draftBooking.showtime,
      seats: draftBooking.selectedSeats,
      ticketSubtotal: totals.ticketSubtotal,
      convenienceFee: totals.convenienceFee,
      discountAmount: totals.discountAmount,
      couponCode: appliedCoupon ? appliedCoupon.code : '',
      totalAmount: totals.totalAmount,
      paymentMethod,
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
    };

    const updatedBookings = [newBooking, ...bookings];
    setBookings(updatedBookings);
    setStorageItem(STORAGE_KEYS.BOOKINGS, updatedBookings);
    clearDraftBooking();

    return newBooking;
  }

  function cancelBooking(bookingId) {
    const updatedBookings = bookings.map((item) => {
      if (item.bookingId === bookingId) {
        return { ...item, status: 'Cancelled' };
      }
      return item;
    });
    setBookings(updatedBookings);
    setStorageItem(STORAGE_KEYS.BOOKINGS, updatedBookings);
  }

  // Watchlist, Favourites & Recently Viewed
  function toggleWatchlist(movie) {
    if (!movie) {
      return;
    }
    const exists = watchlist.some((item) => item.id === movie.id);
    const updated = exists
      ? watchlist.filter((item) => item.id !== movie.id)
      : [movie, ...watchlist];
    setWatchlist(updated);
    setStorageItem(STORAGE_KEYS.WATCHLIST, updated);
  }

  function isInWatchlist(movieId) {
    return watchlist.some((item) => item.id === movieId);
  }

  function toggleFavourite(movie) {
    if (!movie) {
      return;
    }
    const exists = favourites.some((item) => item.id === movie.id);
    const updated = exists
      ? favourites.filter((item) => item.id !== movie.id)
      : [movie, ...favourites];
    setFavourites(updated);
    setStorageItem(STORAGE_KEYS.FAVOURITES, updated);
  }

  function isInFavourites(movieId) {
    return favourites.some((item) => item.id === movieId);
  }

  function recordRecentlyViewed(movie) {
    if (!movie || !movie.id) {
      return;
    }
    const filtered = recentMovies.filter((item) => item.id !== movie.id);
    const updated = [movie, ...filtered].slice(0, 8);
    setRecentMovies(updated);
    setStorageItem(STORAGE_KEYS.RECENT_MOVIES, updated);
  }

  // Admin Movie CRUD
  function addMovie(movieData) {
    const exists = movieData.id && movies.some((m) => m.id === movieData.id);
    if (exists) {
      return null;
    }

    const newMovie = {
      ...movieData,
      id: movieData.id || `mov-${Date.now()}`,
      rating: Number(movieData.rating) || 8.0,
      popularity: Number(movieData.popularity) || 85,
      cast: Array.isArray(movieData.cast)
        ? movieData.cast
        : String(movieData.cast || '')
            .split(',')
            .map((name) => name.trim())
            .filter(Boolean),
    };
    const updated = [newMovie, ...movies];
    setMovies(updated);
    setStorageItem(STORAGE_KEYS.MOVIES, updated);
    return newMovie;
  }

  function updateMovie(movieId, updates) {
    const updated = movies.map((movie) => {
      if (movie.id === movieId) {
        return {
          ...movie,
          ...updates,
          rating: Number(updates.rating) || movie.rating,
          cast: Array.isArray(updates.cast)
            ? updates.cast
            : String(updates.cast || '')
                .split(',')
                .map((name) => name.trim())
                .filter(Boolean),
        };
      }
      return movie;
    });
    setMovies(updated);
    setStorageItem(STORAGE_KEYS.MOVIES, updated);
  }

  function deleteMovie(movieId) {
    const updatedMovies = movies.filter((movie) => movie.id !== movieId);
    const updatedShows = shows.filter((show) => show.movieId !== movieId);
    setMovies(updatedMovies);
    setShows(updatedShows);
    setStorageItem(STORAGE_KEYS.MOVIES, updatedMovies);
    setStorageItem(STORAGE_KEYS.SHOWS, updatedShows);
  }

  // Admin Theatre CRUD
  function addTheatre(theatreData) {
    const newTheatre = {
      ...theatreData,
      id: `tht-${Date.now()}`,
      screensCount: Number(theatreData.screensCount) || 4,
      screens: Array.isArray(theatreData.screens)
        ? theatreData.screens
        : String(theatreData.screens || '2D Laser')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
      facilities: Array.isArray(theatreData.facilities)
        ? theatreData.facilities
        : String(theatreData.facilities || 'M-Ticket, Food Court')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
    };
    const updated = [newTheatre, ...theatres];
    setTheatres(updated);
    setStorageItem(STORAGE_KEYS.THEATRES, updated);
    return newTheatre;
  }

  function updateTheatre(theatreId, updates) {
    const updated = theatres.map((theatre) => {
      if (theatre.id === theatreId) {
        return {
          ...theatre,
          ...updates,
          screensCount: Number(updates.screensCount) || theatre.screensCount,
          screens: Array.isArray(updates.screens)
            ? updates.screens
            : String(updates.screens || '')
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean),
          facilities: Array.isArray(updates.facilities)
            ? updates.facilities
            : String(updates.facilities || '')
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean),
        };
      }
      return theatre;
    });
    setTheatres(updated);
    setStorageItem(STORAGE_KEYS.THEATRES, updated);
  }

  function deleteTheatre(theatreId) {
    const updatedTheatres = theatres.filter(
      (theatre) => theatre.id !== theatreId
    );
    const updatedShows = shows.filter((show) => show.theatreId !== theatreId);
    setTheatres(updatedTheatres);
    setShows(updatedShows);
    setStorageItem(STORAGE_KEYS.THEATRES, updatedTheatres);
    setStorageItem(STORAGE_KEYS.SHOWS, updatedShows);
  }

  // Admin Show CRUD with screen conflict check
  function hasShowConflict(showInput, excludeShowId = null) {
    return shows.some((show) => {
      if (excludeShowId && show.id === excludeShowId) {
        return false;
      }
      const sameTheatreAndScreen =
        show.theatreId === showInput.theatreId &&
        show.screenNumber === showInput.screenNumber;
      const sameDate =
        show.date === showInput.date ||
        show.date === 'Daily' ||
        showInput.date === 'Daily';
      const sameTime = show.startTime === showInput.startTime;
      return sameTheatreAndScreen && sameDate && sameTime;
    });
  }

  function addShow(showInput) {
    if (hasShowConflict(showInput)) {
      return {
        success: false,
        message: `Conflict: ${showInput.screenNumber} already has a show at ${showInput.startTime} on ${showInput.date}.`,
      };
    }

    const newShow = {
      id: `shw-${Date.now()}`,
      movieId: showInput.movieId,
      theatreId: showInput.theatreId,
      screenNumber: showInput.screenNumber,
      date: showInput.date,
      startTime: showInput.startTime,
      endTime: showInput.endTime,
      silverPrice: Number(showInput.silverPrice),
      goldPrice: Number(showInput.goldPrice),
      platinumPrice: Number(showInput.platinumPrice),
    };

    const updated = [newShow, ...shows];
    setShows(updated);
    setStorageItem(STORAGE_KEYS.SHOWS, updated);
    return { success: true, show: newShow };
  }

  function updateShow(showId, updates) {
    if (hasShowConflict(updates, showId)) {
      return {
        success: false,
        message: `Conflict: ${updates.screenNumber} already has a show at ${updates.startTime} on ${updates.date}.`,
      };
    }

    const updated = shows.map((show) => {
      if (show.id === showId) {
        return {
          ...show,
          ...updates,
          silverPrice: Number(updates.silverPrice),
          goldPrice: Number(updates.goldPrice),
          platinumPrice: Number(updates.platinumPrice),
        };
      }
      return show;
    });

    setShows(updated);
    setStorageItem(STORAGE_KEYS.SHOWS, updated);
    return { success: true };
  }

  function deleteShow(showId) {
    const updated = shows.filter((show) => show.id !== showId);
    setShows(updated);
    setStorageItem(STORAGE_KEYS.SHOWS, updated);
  }

  // Admin Coupon CRUD
  function addCoupon(couponData) {
    const codeUpper = couponData.code.trim().toUpperCase();
    if (coupons.some((c) => c.code === codeUpper)) {
      return { success: false, message: 'Coupon code already exists.' };
    }

    const newCoupon = {
      id: `cpn-${Date.now()}`,
      code: codeUpper,
      discountType: couponData.discountType,
      discountValue: Number(couponData.discountValue),
      maxDiscount: Number(couponData.maxDiscount),
      minBookingAmount: Number(couponData.minBookingAmount),
      expiryDate: couponData.expiryDate,
      isActive: Boolean(couponData.isActive),
    };

    const updated = [newCoupon, ...coupons];
    setCoupons(updated);
    setStorageItem(STORAGE_KEYS.COUPONS, updated);
    return { success: true };
  }

  function updateCoupon(couponId, updates) {
    const updated = coupons.map((c) => {
      if (c.id === couponId) {
        return {
          ...c,
          ...updates,
          code: updates.code.trim().toUpperCase(),
          discountValue: Number(updates.discountValue),
          maxDiscount: Number(updates.maxDiscount),
          minBookingAmount: Number(updates.minBookingAmount),
        };
      }
      return c;
    });
    setCoupons(updated);
    setStorageItem(STORAGE_KEYS.COUPONS, updated);
    return { success: true };
  }

  function deleteCoupon(couponId) {
    const updated = coupons.filter((c) => c.id !== couponId);
    setCoupons(updated);
    setStorageItem(STORAGE_KEYS.COUPONS, updated);
  }

  // Admin Site Settings
  function updateSettings(nextSettings) {
    const merged = {
      ...settings,
      ...nextSettings,
      convenienceFee: Number(nextSettings.convenienceFee ?? settings.convenienceFee),
    };
    setSettings(merged);
    setStorageItem(STORAGE_KEYS.SETTINGS, merged);
    if (merged.defaultCity) {
      setSelectedCity(merged.defaultCity);
    }
  }

  return (
    <BookingContext.Provider
      value={{
        movies,
        theatres,
        shows,
        bookings,
        coupons,
        watchlist,
        favourites,
        recentMovies,
        settings,
        selectedCity,
        setSelectedCity,
        searchQuery,
        setSearchQuery,
        draftBooking,
        selectShowForBooking,
        setDraftSeats,
        clearDraftBooking,
        confirmBooking,
        cancelBooking,
        toggleWatchlist,
        isInWatchlist,
        toggleFavourite,
        isInFavourites,
        recordRecentlyViewed,
        addMovie,
        updateMovie,
        deleteMovie,
        addTheatre,
        updateTheatre,
        deleteTheatre,
        addShow,
        updateShow,
        deleteShow,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        updateSettings,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  return useContext(BookingContext);
}

import { INITIAL_MOVIES } from '../data/movies';
import { INITIAL_THEATRES } from '../data/theatres';
import { INITIAL_SHOWS } from '../data/shows';
import {
  DEFAULT_SETTINGS,
  DEMO_ADMIN,
  DEMO_USER,
  INITIAL_COUPONS,
  STORAGE_KEYS,
} from './constants';

export function getStorageItem(key, fallbackValue) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallbackValue;
    }
    const parsed = JSON.parse(raw);
    return parsed ?? fallbackValue;
  } catch (error) {
    return fallbackValue;
  }
}

export function setStorageItem(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Ignore storage quota errors safely
  }
}

export function removeStorageItem(key) {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    // Ignore storage errors safely
  }
}

// Seeds demo data only once when LocalStorage keys are missing
export function initializeDemoData() {
  const existingUsers = getStorageItem(STORAGE_KEYS.USERS, null);
  if (!Array.isArray(existingUsers) || existingUsers.length === 0) {
    setStorageItem(STORAGE_KEYS.USERS, [DEMO_USER, DEMO_ADMIN]);
  }

  const existingBlocked = getStorageItem(STORAGE_KEYS.BLOCKED_USERS, null);
  if (!Array.isArray(existingBlocked)) {
    setStorageItem(STORAGE_KEYS.BLOCKED_USERS, []);
  }

  const existingMovies = getStorageItem(STORAGE_KEYS.MOVIES, null);
  if (!Array.isArray(existingMovies) || existingMovies.length === 0) {
    setStorageItem(STORAGE_KEYS.MOVIES, INITIAL_MOVIES);
  }

  const existingTheatres = getStorageItem(STORAGE_KEYS.THEATRES, null);
  if (!Array.isArray(existingTheatres) || existingTheatres.length === 0) {
    setStorageItem(STORAGE_KEYS.THEATRES, INITIAL_THEATRES);
  }

  const existingShows = getStorageItem(STORAGE_KEYS.SHOWS, null);
  if (!Array.isArray(existingShows) || existingShows.length === 0) {
    setStorageItem(STORAGE_KEYS.SHOWS, INITIAL_SHOWS);
  }

  const existingBookings = getStorageItem(STORAGE_KEYS.BOOKINGS, null);
  if (!Array.isArray(existingBookings)) {
    setStorageItem(STORAGE_KEYS.BOOKINGS, []);
  }

  const existingCoupons = getStorageItem(STORAGE_KEYS.COUPONS, null);
  if (!Array.isArray(existingCoupons) || existingCoupons.length === 0) {
    setStorageItem(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
  }

  const existingWatchlist = getStorageItem(STORAGE_KEYS.WATCHLIST, null);
  if (!Array.isArray(existingWatchlist)) {
    setStorageItem(STORAGE_KEYS.WATCHLIST, []);
  }

  const existingFavourites = getStorageItem(STORAGE_KEYS.FAVOURITES, null);
  if (!Array.isArray(existingFavourites)) {
    setStorageItem(STORAGE_KEYS.FAVOURITES, []);
  }

  const existingRecent = getStorageItem(STORAGE_KEYS.RECENT_MOVIES, null);
  if (!Array.isArray(existingRecent)) {
    setStorageItem(STORAGE_KEYS.RECENT_MOVIES, []);
  }

  const existingSettings = getStorageItem(STORAGE_KEYS.SETTINGS, null);
  if (!existingSettings || typeof existingSettings !== 'object') {
    setStorageItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  const existingCity = getStorageItem(STORAGE_KEYS.SELECTED_CITY, null);
  if (!existingCity) {
    const settings = getStorageItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    setStorageItem(
      STORAGE_KEYS.SELECTED_CITY,
      settings.defaultCity || 'Mumbai'
    );
  }
}

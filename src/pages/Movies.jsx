import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LayoutGrid, List, SlidersHorizontal } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import SearchBar from '../components/SearchBar';
import SkeletonCard from '../components/SkeletonCard';
import { useBooking } from '../context/BookingContext';
import { discoverMovies } from '../services/movieService';
import { GENRES, LANGUAGES } from '../utils/constants';

const YEARS = ['All', '2026', '2025', '2024', '2023', '2022'];

export default function Movies() {
  const { movies: localMovies, searchQuery, setSearchQuery } = useBooking();
  const [searchParams] = useSearchParams();

  const initialGenre = searchParams.get('genre') || 'All';
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [minRating, setMinRating] = useState('0');
  const [selectedYear, setSelectedYear] = useState('All');
  const [sortBy, setSortBy] = useState('popularity');
  const [viewMode, setViewMode] = useState('grid');

  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const paramGenre = searchParams.get('genre');
    if (paramGenre) {
      setSelectedGenre(paramGenre);
    }
  }, [searchParams]);

  // Debounce search input to prevent excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedGenre, selectedLanguage, minRating, selectedYear, sortBy]);

  useEffect(() => {
    let cancelled = false;

    async function fetchMovies() {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError('');

      try {
        const res = await discoverMovies({
          query: debouncedQuery,
          genre: selectedGenre,
          language: selectedLanguage,
          minRating,
          year: selectedYear,
          sortBy,
          page,
          localMovies,
        });

        if (!cancelled) {
          setTotalPages(res.totalPages);
          setResults((prev) => {
            if (page === 1) {
              return res.movies;
            }
            const existingIds = new Set(prev.map((item) => item.id));
            const uniqueNext = res.movies.filter(
              (item) => !existingIds.has(item.id)
            );
            return [...prev, ...uniqueNext];
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError('Could not load TMDB results. Showing local movies.');
          setResults(localMovies);
          setTotalPages(1);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    }

    fetchMovies();
    return () => {
      cancelled = true;
    };
  }, [
    debouncedQuery,
    selectedGenre,
    selectedLanguage,
    minRating,
    selectedYear,
    sortBy,
    page,
    localMovies,
  ]);

  function handleClearFilters() {
    setSearchQuery('');
    setSelectedGenre('All');
    setSelectedLanguage('All');
    setMinRating('0');
    setSelectedYear('All');
    setSortBy('popularity');
    setPage(1);
  }

  return (
    <div className="container py-4 py-md-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
        <div>
          <div className="small cb-text-gold mb-1">Cinema Directory</div>
          <h1 className="fw-bold mb-0">Explore Movies</h1>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="small text-secondary cb-tabular me-2">
            {results.length} movie(s) loaded
          </span>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`btn btn-sm ${
              viewMode === 'grid' ? 'cb-btn-primary' : 'cb-btn-outline'
            }`}
            aria-label="Grid view"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`btn btn-sm ${
              viewMode === 'list' ? 'cb-btn-primary' : 'cb-btn-outline'
            }`}
            aria-label="List view"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="cb-card p-3 p-md-4 mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-lg-3">
            <label className="form-label small text-secondary mb-1">
              Search Title
            </label>
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>

          <div className="col-6 col-md-4 col-lg-2">
            <label className="form-label small text-secondary mb-1">
              Genre
            </label>
            <select
              className="form-select cb-select"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
            >
              {GENRES.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          <div className="col-6 col-md-4 col-lg-2">
            <label className="form-label small text-secondary mb-1">
              Language
            </label>
            <select
              className="form-select cb-select"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          <div className="col-6 col-md-4 col-lg-1">
            <label className="form-label small text-secondary mb-1">
              Rating
            </label>
            <select
              className="form-select cb-select"
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
            >
              <option value="0">All</option>
              <option value="7">7.0+</option>
              <option value="8">8.0+</option>
              <option value="8.5">8.5+</option>
            </select>
          </div>

          <div className="col-6 col-md-4 col-lg-1">
            <label className="form-label small text-secondary mb-1">Year</label>
            <select
              className="form-select cb-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {YEARS.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          <div className="col-6 col-md-4 col-lg-2">
            <label className="form-label small text-secondary mb-1">
              Sort By
            </label>
            <select
              className="form-select cb-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="popularity">Popularity</option>
              <option value="rating">Highest Rated</option>
              <option value="release_date">Release Date</option>
            </select>
          </div>

          <div className="col-6 col-md-4 col-lg-1">
            <button
              type="button"
              onClick={handleClearFilters}
              className="btn cb-btn-outline w-100"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-warning small mb-4" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div className="col" key={`skeleton-${idx}`}>
              <SkeletonCard />
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="cb-card p-5 text-center">
          <SlidersHorizontal size={36} className="text-secondary mb-3" />
          <h4 className="fw-bold mb-2">No matching movies found</h4>
          <p className="text-secondary mb-3">
            Try clearing your active filters or searching for another title.
          </p>
          <button
            type="button"
            onClick={handleClearFilters}
            className="btn cb-btn-primary"
          >
            Clear All Filters
          </button>
        </div>
      ) : viewMode === 'list' ? (
        <div className="d-flex flex-column gap-3">
          {results.map((movie) => (
            <MovieCard key={movie.id} movie={movie} variant="list" />
          ))}
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4">
          {results.map((movie) => (
            <div className="col" key={movie.id}>
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      )}

      {/* Pagination / Load More */}
      {!loading && page < totalPages && (
        <div className="text-center mt-5">
          <button
            type="button"
            disabled={loadingMore}
            onClick={() => setPage((prev) => prev + 1)}
            className="btn cb-btn-outline px-4 py-2"
          >
            {loadingMore
              ? 'Loading more movies...'
              : `Load More (Page ${page} of ${totalPages})`}
          </button>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import {
  CheckCircle2,
  DownloadCloud,
  Eye,
  Film,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import SearchBar from '../components/SearchBar';
import { useBooking } from '../context/BookingContext';
import { searchTmdbForAdmin } from '../services/movieService';
import { hasValidTmdbKey } from '../services/tmdbApi';
import { GENRES, LANGUAGES } from '../utils/constants';

const POSTER_PRESETS = [
  {
    label: 'Crimson Horizon Poster',
    path: '/src/assets/images/poster_crimson_horizon_1795435470742.jpg',
  },
  {
    label: 'Midnight Nocturne Poster',
    path: '/src/assets/images/poster_midnight_nocturne_1795435470095.jpg',
  },
  {
    label: 'Velvet Symphony Poster',
    path: '/src/assets/images/poster_velvet_symphony_1795435469861.jpg',
  },
  {
    label: 'Iron Bastion Poster',
    path: '/src/assets/images/poster_iron_bastion_1795435469550.jpg',
  },
  {
    label: 'Glass Labyrinth Poster',
    path: '/src/assets/images/poster_glass_labyrinth_1795435469851.jpg',
  },
  {
    label: 'Solar Drifters Poster',
    path: '/src/assets/images/poster_solar_drifters_1795435469610.jpg',
  },
];

const EMPTY_FORM = {
  title: '',
  poster: POSTER_PRESETS[0].path,
  banner: '/src/assets/images/hero_crimson_horizon_1795435466299.jpg',
  genre: 'Sci-Fi',
  language: 'English',
  duration: '2h 10m',
  rating: '8.2',
  releaseDate: '2026-11-28',
  director: '',
  cast: '',
  description: '',
  status: 'Now Showing',
  trailerUrl: '',
};

export default function ManageMovies() {
  const { movies, addMovie, updateMovie, deleteMovie } = useBooking();

  const [searchText, setSearchText] = useState('');
  const [genreFilter, setGenreFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  const [viewingMovie, setViewingMovie] = useState(null);
  const [confirmDeleteMovie, setConfirmDeleteMovie] = useState(null);
  const [feedback, setFeedback] = useState('');

  // Import from TMDB modal state
  const [showTmdbModal, setShowTmdbModal] = useState(false);
  const [tmdbQuery, setTmdbQuery] = useState('');
  const [tmdbResults, setTmdbResults] = useState([]);
  const [tmdbPreview, setTmdbPreview] = useState(null);
  const [tmdbLoading, setTmdbLoading] = useState(false);
  const [tmdbError, setTmdbError] = useState('');

  function showNotice(text) {
    setFeedback(text);
    setTimeout(() => setFeedback(''), 3000);
  }

  function handleOpenAdd() {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setFormError('');
    setShowFormModal(true);
  }

  function handleOpenEdit(movie) {
    setEditingId(movie.id);
    setFormData({
      title: movie.title || '',
      poster: movie.poster || POSTER_PRESETS[0].path,
      banner: movie.banner || movie.poster || POSTER_PRESETS[0].path,
      genre: movie.genre || 'Drama',
      language: movie.language || 'English',
      duration: movie.duration || '2h 10m',
      rating: String(movie.rating || '8.0'),
      releaseDate: movie.releaseDate || '2026-11-20',
      director: movie.director || '',
      cast: Array.isArray(movie.cast) ? movie.cast.join(', ') : movie.cast || '',
      description: movie.description || '',
      status: movie.status || 'Now Showing',
      trailerUrl: movie.trailerUrl || '',
    });
    setFormError('');
    setShowFormModal(true);
  }

  function handleSaveMovie(event) {
    event.preventDefault();
    setFormError('');

    if (!formData.title.trim() || !formData.director.trim() || !formData.description.trim()) {
      setFormError('Please fill in Title, Director, and Description.');
      return;
    }

    const ratingVal = Number(formData.rating);
    if (Number.isNaN(ratingVal) || ratingVal < 1 || ratingVal > 10) {
      setFormError('Rating must be between 1.0 and 10.0.');
      return;
    }

    if (editingId) {
      updateMovie(editingId, formData);
      showNotice(`Updated "${formData.title}".`);
    } else {
      addMovie({
        ...formData,
        certificate: 'UA 13+',
        format: '2D / Dolby Atmos',
        popularity: 88,
      });
      showNotice(`Added "${formData.title}" to catalogue.`);
    }

    setShowFormModal(false);
    setEditingId(null);
  }

  function handleConfirmDelete() {
    if (!confirmDeleteMovie) {
      return;
    }
    deleteMovie(confirmDeleteMovie.id);
    showNotice(`Deleted "${confirmDeleteMovie.title}" and its associated shows.`);
    setConfirmDeleteMovie(null);
  }

  async function handleTmdbSearch(event) {
    event.preventDefault();
    setTmdbError('');
    setTmdbPreview(null);
    if (!hasValidTmdbKey()) {
      setTmdbError(
        'TMDB API key is not configured. Set REACT_APP_TMDB_API_KEY in .env to search live TMDB movies.'
      );
      return;
    }
    if (!tmdbQuery.trim()) {
      return;
    }
    setTmdbLoading(true);
    try {
      const items = await searchTmdbForAdmin(tmdbQuery);
      setTmdbResults(items);
      if (items.length === 0) {
        setTmdbError('No TMDB movies matched that title.');
      }
    } catch (err) {
      setTmdbError('Failed to fetch TMDB search results.');
    } finally {
      setTmdbLoading(false);
    }
  }

  function handleImportTmdbMovie(movie) {
    const added = addMovie({
      ...movie,
      id: `mov-tmdb-${movie.tmdbId}`,
      status: 'Now Showing',
      isTrending: true,
    });
    if (!added) {
      showNotice(`"${movie.title}" is already in the local catalogue.`);
    } else {
      showNotice(`Imported "${movie.title}" from TMDB into local catalogue.`);
    }
    setShowTmdbModal(false);
  }

  const filteredMovies = movies.filter((movie) => {
    const query = searchText.trim().toLowerCase();
    const matchesQuery =
      !query ||
      movie.title.toLowerCase().includes(query) ||
      (movie.director || '').toLowerCase().includes(query);
    const matchesGenre = genreFilter === 'All' || movie.genre === genreFilter;
    const matchesStatus =
      statusFilter === 'All' || movie.status === statusFilter;
    return matchesQuery && matchesGenre && matchesStatus;
  });

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h2 fw-bold mb-1">Manage Movies</h1>
          <p className="text-secondary small mb-0">
            Create, edit, import from TMDB, or delete movies in LocalStorage.
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setShowTmdbModal(true);
              setTmdbResults([]);
              setTmdbPreview(null);
              setTmdbError('');
            }}
            className="btn cb-btn-outline d-inline-flex align-items-center gap-2"
          >
            <DownloadCloud size={16} />
            <span>Import from TMDB</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="btn cb-btn-primary d-inline-flex align-items-center gap-2"
          >
            <Plus size={16} />
            <span>Add Movie</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="alert alert-success d-flex align-items-center gap-2 small py-2 mb-3">
          <CheckCircle2 size={16} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Search & Filters */}
      <div className="cb-card p-3 mb-4">
        <div className="row g-3">
          <div className="col-md-5">
            <SearchBar
              value={searchText}
              onChange={setSearchText}
              placeholder="Search movie title or director..."
            />
          </div>
          <div className="col-6 col-md-4">
            <select
              className="form-select cb-select"
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
            >
              {GENRES.map((genre) => (
                <option key={genre} value={genre}>
                  Genre: {genre}
                </option>
              ))}
            </select>
          </div>
          <div className="col-6 col-md-3">
            <select
              className="form-select cb-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">Status: All</option>
              <option value="Now Showing">Now Showing</option>
              <option value="Upcoming">Upcoming</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="cb-card p-3 p-md-4">
        {filteredMovies.length === 0 ? (
          <div className="text-center py-5">
            <Film size={36} className="text-secondary mb-2" />
            <p className="text-secondary mb-3">No movies match your filters.</p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="btn btn-sm cb-btn-primary"
            >
              Add First Movie
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0">
              <thead>
                <tr className="small text-secondary">
                  <th>Poster</th>
                  <th>Title</th>
                  <th>Genre</th>
                  <th>Language</th>
                  <th>Rating</th>
                  <th>Release</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovies.map((movie) => (
                  <tr key={movie.id}>
                    <td>
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        style={{
                          width: '38px',
                          height: '54px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                        }}
                        referrerPolicy="no-referrer"
                      />
                    </td>
                    <td className="fw-semibold">{movie.title}</td>
                    <td>{movie.genre}</td>
                    <td>{movie.language}</td>
                    <td className="cb-tabular cb-text-gold">
                      {Number(movie.rating).toFixed(1)}
                    </td>
                    <td className="cb-tabular small">{movie.releaseDate}</td>
                    <td>
                      <span
                        className={
                          movie.status === 'Now Showing'
                            ? 'text-success small fw-semibold'
                            : 'text-warning small fw-semibold'
                        }
                      >
                        {movie.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-1">
                        <button
                          type="button"
                          onClick={() => setViewingMovie(movie)}
                          className="btn btn-sm cb-btn-outline px-2"
                          aria-label={`View ${movie.title}`}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(movie)}
                          className="btn btn-sm cb-btn-outline px-2"
                          aria-label={`Edit ${movie.title}`}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteMovie(movie)}
                          className="btn btn-sm cb-btn-outline text-danger px-2"
                          aria-label={`Delete ${movie.title}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Movie Modal */}
      {showFormModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.82)' }}
          onClick={() => setShowFormModal(false)}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content cb-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">
                  {editingId ? 'Edit Movie' : 'Add New Movie'}
                </h5>
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="btn btn-sm cb-btn-outline px-2"
                >
                  <X size={16} />
                </button>
              </div>

              {formError && (
                <div className="alert alert-danger small py-2">{formError}</div>
              )}

              <form onSubmit={handleSaveMovie}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small text-secondary">
                      Movie Title *
                    </label>
                    <input
                      type="text"
                      className="form-control cb-input"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label small text-secondary">
                      Genre
                    </label>
                    <select
                      className="form-select cb-select"
                      value={formData.genre}
                      onChange={(e) =>
                        setFormData({ ...formData, genre: e.target.value })
                      }
                    >
                      {GENRES.filter((g) => g !== 'All').map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label small text-secondary">
                      Language
                    </label>
                    <select
                      className="form-select cb-select"
                      value={formData.language}
                      onChange={(e) =>
                        setFormData({ ...formData, language: e.target.value })
                      }
                    >
                      {LANGUAGES.filter((l) => l !== 'All').map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label small text-secondary">
                      Duration
                    </label>
                    <input
                      type="text"
                      className="form-control cb-input"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label small text-secondary">
                      Rating (1-10)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="10"
                      className="form-control cb-input"
                      value={formData.rating}
                      onChange={(e) =>
                        setFormData({ ...formData, rating: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label small text-secondary">
                      Release Date
                    </label>
                    <input
                      type="date"
                      className="form-control cb-input"
                      value={formData.releaseDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          releaseDate: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label small text-secondary">
                      Status
                    </label>
                    <select
                      className="form-select cb-select"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                    >
                      <option value="Now Showing">Now Showing</option>
                      <option value="Upcoming">Upcoming</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small text-secondary">
                      Director *
                    </label>
                    <input
                      type="text"
                      className="form-control cb-input"
                      value={formData.director}
                      onChange={(e) =>
                        setFormData({ ...formData, director: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small text-secondary">
                      Cast (comma separated)
                    </label>
                    <input
                      type="text"
                      className="form-control cb-input"
                      value={formData.cast}
                      onChange={(e) =>
                        setFormData({ ...formData, cast: e.target.value })
                      }
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small text-secondary">
                      Poster Image URL / Preset
                    </label>
                    <input
                      type="text"
                      className="form-control cb-input"
                      value={formData.poster}
                      onChange={(e) =>
                        setFormData({ ...formData, poster: e.target.value })
                      }
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small text-secondary">
                      Backdrop Image URL
                    </label>
                    <input
                      type="text"
                      className="form-control cb-input"
                      value={formData.banner}
                      onChange={(e) =>
                        setFormData({ ...formData, banner: e.target.value })
                      }
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small text-secondary">
                      YouTube Trailer URL (Optional)
                    </label>
                    <input
                      type="text"
                      className="form-control cb-input"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={formData.trailerUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, trailerUrl: e.target.value })
                      }
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small text-secondary">
                      Description *
                    </label>
                    <textarea
                      rows="3"
                      className="form-control cb-input"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowFormModal(false)}
                    className="btn cb-btn-outline"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn cb-btn-primary">
                    {editingId ? 'Save Changes' : 'Create Movie'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Movie Modal */}
      {viewingMovie && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.82)' }}
          onClick={() => setViewingMovie(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content cb-card p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <div className="small cb-text-gold">{viewingMovie.status}</div>
                  <h5 className="fw-bold mb-0">{viewingMovie.title}</h5>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingMovie(null)}
                  className="btn btn-sm cb-btn-outline px-2"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="small text-secondary mb-3">
                {viewingMovie.genre} · {viewingMovie.language} ·{' '}
                {viewingMovie.duration} · Rating {viewingMovie.rating}
              </p>
              <p className="small mb-2">
                <strong>Director:</strong> {viewingMovie.director}
              </p>
              <p className="small mb-3">
                <strong>Cast:</strong>{' '}
                {Array.isArray(viewingMovie.cast)
                  ? viewingMovie.cast.join(', ')
                  : viewingMovie.cast}
              </p>
              <p className="small text-secondary mb-0">
                {viewingMovie.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDeleteMovie && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.82)' }}
          onClick={() => setConfirmDeleteMovie(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content cb-card p-4">
              <h5 className="fw-bold mb-2">Delete Movie?</h5>
              <p className="small text-secondary mb-4">
                Are you sure you want to delete{' '}
                <strong>{confirmDeleteMovie.title}</strong>? Any scheduled shows
                linked to this movie will also be removed safely.
              </p>
              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteMovie(null)}
                  className="btn btn-sm cb-btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="btn btn-sm btn-danger"
                >
                  Delete Movie
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import from TMDB Modal */}
      {showTmdbModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.82)' }}
          onClick={() => setShowTmdbModal(false)}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content cb-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Import Movie from TMDB</h5>
                <button
                  type="button"
                  onClick={() => setShowTmdbModal(false)}
                  className="btn btn-sm cb-btn-outline px-2"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleTmdbSearch} className="d-flex gap-2 mb-3">
                <input
                  type="text"
                  className="form-control cb-input"
                  placeholder="Search TMDB movie title..."
                  value={tmdbQuery}
                  onChange={(e) => setTmdbQuery(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={tmdbLoading}
                  className="btn cb-btn-primary"
                >
                  {tmdbLoading ? 'Searching...' : 'Search'}
                </button>
              </form>

              {tmdbError && (
                <div className="alert alert-warning small py-2">{tmdbError}</div>
              )}

              {tmdbPreview && (
                <div className="p-3 mb-3 rounded border border-warning border-opacity-25">
                  <div className="d-flex gap-3">
                    <img
                      src={tmdbPreview.poster}
                      alt={tmdbPreview.title}
                      style={{
                        width: '72px',
                        height: '108px',
                        objectFit: 'cover',
                        borderRadius: '6px',
                      }}
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-grow-1">
                      <h6 className="fw-bold mb-1">{tmdbPreview.title}</h6>
                      <div className="small text-secondary mb-2">
                        {tmdbPreview.genre} · {tmdbPreview.language} ·{' '}
                        {tmdbPreview.releaseDate} · Rating{' '}
                        {tmdbPreview.rating.toFixed(1)}
                      </div>
                      <p className="small text-secondary mb-2">
                        {tmdbPreview.description}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleImportTmdbMovie(tmdbPreview)}
                        className="btn btn-sm cb-btn-gold"
                      >
                        Import into Local Catalogue
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="row row-cols-2 row-cols-md-4 g-3">
                {tmdbResults.map((item) => (
                  <div className="col" key={item.id}>
                    <div className="cb-card p-2 h-100 d-flex flex-column">
                      <img
                        src={item.poster}
                        alt={item.title}
                        className="w-100 rounded mb-2"
                        style={{ aspectRatio: '2/3', objectFit: 'cover' }}
                        referrerPolicy="no-referrer"
                      />
                      <div className="small fw-semibold text-truncate mb-2">
                        {item.title}
                      </div>
                      <button
                        type="button"
                        onClick={() => setTmdbPreview(item)}
                        className="btn btn-sm cb-btn-outline mt-auto"
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

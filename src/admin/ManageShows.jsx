import React, { useState } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import SearchBar from '../components/SearchBar';
import { useBooking } from '../context/BookingContext';
import { formatCurrency } from '../utils/bookingHelpers';

export default function ManageShows() {
  const {
    movies,
    theatres,
    shows,
    addShow,
    updateShow,
    deleteShow,
  } = useBooking();

  const [searchText, setSearchText] = useState('');
  const [theatreFilter, setTheatreFilter] = useState('All');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [confirmDeleteShow, setConfirmDeleteShow] = useState(null);

  const [formData, setFormData] = useState({
    movieId: movies[0] ? movies[0].id : '',
    theatreId: theatres[0] ? theatres[0].id : '',
    screenNumber: 'Screen 1',
    date: 'Daily',
    startTime: '05:10 PM',
    endTime: '07:40 PM',
    silverPrice: 180,
    goldPrice: 280,
    platinumPrice: 420,
  });

  function showNotice(text) {
    setFeedback(text);
    setTimeout(() => setFeedback(''), 3000);
  }

  function handleOpenAdd() {
    setEditingId(null);
    setFormData({
      movieId: movies[0] ? movies[0].id : '',
      theatreId: theatres[0] ? theatres[0].id : '',
      screenNumber: 'Screen 1',
      date: new Date().toISOString().split('T')[0],
      startTime: '05:10 PM',
      endTime: '07:40 PM',
      silverPrice: 180,
      goldPrice: 280,
      platinumPrice: 420,
    });
    setFormError('');
    setShowModal(true);
  }

  function handleOpenEdit(show) {
    setEditingId(show.id);
    setFormData({
      movieId: show.movieId,
      theatreId: show.theatreId,
      screenNumber: show.screenNumber || 'Screen 1',
      date: show.date || 'Daily',
      startTime: show.startTime || '05:10 PM',
      endTime: show.endTime || '07:40 PM',
      silverPrice: show.silverPrice || 180,
      goldPrice: show.goldPrice || 280,
      platinumPrice: show.platinumPrice || 420,
    });
    setFormError('');
    setShowModal(true);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setFormError('');

    if (
      !formData.movieId ||
      !formData.theatreId ||
      !formData.screenNumber.trim() ||
      !formData.date.trim() ||
      !formData.startTime.trim() ||
      !formData.endTime.trim()
    ) {
      setFormError('All show schedule fields are required.');
      return;
    }

    if (
      Number(formData.silverPrice) <= 0 ||
      Number(formData.goldPrice) <= 0 ||
      Number(formData.platinumPrice) <= 0
    ) {
      setFormError('Ticket prices must be positive numbers.');
      return;
    }

    const result = editingId
      ? updateShow(editingId, formData)
      : addShow(formData);

    if (!result.success) {
      setFormError(result.message);
      return;
    }

    showNotice(editingId ? 'Show schedule updated.' : 'New show scheduled.');
    setShowModal(false);
    setEditingId(null);
  }

  function handleConfirmDelete() {
    if (!confirmDeleteShow) {
      return;
    }
    deleteShow(confirmDeleteShow.id);
    showNotice('Show removed from schedule.');
    setConfirmDeleteShow(null);
  }

  const filteredShows = shows.filter((show) => {
    const movie = movies.find((m) => m.id === show.movieId);
    const theatre = theatres.find((t) => t.id === show.theatreId);
    const query = searchText.trim().toLowerCase();

    const matchesSearch =
      !query ||
      (movie && movie.title.toLowerCase().includes(query)) ||
      (theatre && theatre.name.toLowerCase().includes(query)) ||
      (show.screenNumber || '').toLowerCase().includes(query);

    const matchesTheatre =
      theatreFilter === 'All' || show.theatreId === theatreFilter;

    return matchesSearch && matchesTheatre;
  });

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h2 fw-bold mb-1">Manage Shows</h1>
          <p className="text-secondary small mb-0">
            Schedule screenings, assign screens, set tier pricing, and avoid
            screen time conflicts.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="btn cb-btn-primary d-inline-flex align-items-center gap-2"
        >
          <Plus size={16} />
          <span>Add Show</span>
        </button>
      </div>

      {feedback && (
        <div className="alert alert-success d-flex align-items-center gap-2 small py-2 mb-3">
          <CheckCircle2 size={16} />
          <span>{feedback}</span>
        </div>
      )}

      <div className="cb-card p-3 mb-4">
        <div className="row g-3">
          <div className="col-md-7">
            <SearchBar
              value={searchText}
              onChange={setSearchText}
              placeholder="Search movie, theatre, or screen..."
            />
          </div>
          <div className="col-md-5">
            <select
              className="form-select cb-select"
              value={theatreFilter}
              onChange={(e) => setTheatreFilter(e.target.value)}
            >
              <option value="All">Theatre: All</option>
              {theatres.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.city})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="cb-card p-3 p-md-4">
        {filteredShows.length === 0 ? (
          <div className="text-center py-5">
            <CalendarClock size={36} className="text-secondary mb-2" />
            <p className="text-secondary mb-3">No shows match your search.</p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="btn btn-sm cb-btn-primary"
            >
              Schedule Show
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0">
              <thead>
                <tr className="small text-secondary">
                  <th>Movie</th>
                  <th>Theatre &amp; Screen</th>
                  <th>Date</th>
                  <th>Showtime</th>
                  <th>Pricing (S / G / P)</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredShows.map((show) => {
                  const movie = movies.find((m) => m.id === show.movieId);
                  const theatre = theatres.find((t) => t.id === show.theatreId);
                  return (
                    <tr key={show.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {movie && movie.poster && (
                            <img
                              src={movie.poster}
                              alt={movie.title}
                              style={{
                                width: '32px',
                                height: '46px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                              }}
                              referrerPolicy="no-referrer"
                            />
                          )}
                          <span className="fw-semibold">
                            {movie ? movie.title : show.movieId}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div>
                          {theatre
                            ? `${theatre.name} (${theatre.city})`
                            : show.theatreId}
                        </div>
                        <small className="cb-text-gold">
                          {show.screenNumber}
                        </small>
                      </td>
                      <td className="cb-tabular small">{show.date}</td>
                      <td className="cb-mono small">
                        {show.startTime} – {show.endTime}
                      </td>
                      <td className="cb-tabular small">
                        {formatCurrency(show.silverPrice)} /{' '}
                        {formatCurrency(show.goldPrice)} /{' '}
                        {formatCurrency(show.platinumPrice)}
                      </td>
                      <td className="text-end">
                        <div className="d-inline-flex gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(show)}
                            className="btn btn-sm cb-btn-outline px-2"
                            aria-label="Edit show"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteShow(show)}
                            className="btn btn-sm cb-btn-outline text-danger px-2"
                            aria-label="Delete show"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.82)' }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content cb-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">
                  {editingId ? 'Edit Show' : 'Schedule New Show'}
                </h5>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-sm cb-btn-outline px-2"
                >
                  <X size={16} />
                </button>
              </div>

              {formError && (
                <div className="alert alert-danger small py-2">{formError}</div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small text-secondary">
                      Movie
                    </label>
                    <select
                      className="form-select cb-select"
                      value={formData.movieId}
                      onChange={(e) =>
                        setFormData({ ...formData, movieId: e.target.value })
                      }
                    >
                      {movies.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small text-secondary">
                      Theatre
                    </label>
                    <select
                      className="form-select cb-select"
                      value={formData.theatreId}
                      onChange={(e) =>
                        setFormData({ ...formData, theatreId: e.target.value })
                      }
                    >
                      {theatres.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.city})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small text-secondary">
                      Screen Number
                    </label>
                    <input
                      type="text"
                      className="form-control cb-input"
                      value={formData.screenNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          screenNumber: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small text-secondary">
                      Show Date (YYYY-MM-DD or Daily)
                    </label>
                    <input
                      type="text"
                      className="form-control cb-input"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="col-6 col-md-2">
                    <label className="form-label small text-secondary">
                      Start Time
                    </label>
                    <input
                      type="text"
                      className="form-control cb-input"
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData({ ...formData, startTime: e.target.value })
                      }
                      placeholder="05:10 PM"
                      required
                    />
                  </div>

                  <div className="col-6 col-md-2">
                    <label className="form-label small text-secondary">
                      End Time
                    </label>
                    <input
                      type="text"
                      className="form-control cb-input"
                      value={formData.endTime}
                      onChange={(e) =>
                        setFormData({ ...formData, endTime: e.target.value })
                      }
                      placeholder="07:40 PM"
                      required
                    />
                  </div>

                  <div className="col-4">
                    <label className="form-label small text-secondary">
                      Silver Price (₹)
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="form-control cb-input"
                      value={formData.silverPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          silverPrice: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="col-4">
                    <label className="form-label small text-secondary">
                      Gold Price (₹)
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="form-control cb-input"
                      value={formData.goldPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, goldPrice: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="col-4">
                    <label className="form-label small text-secondary">
                      Platinum Price (₹)
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="form-control cb-input"
                      value={formData.platinumPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          platinumPrice: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn cb-btn-outline"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn cb-btn-primary">
                    {editingId ? 'Save Changes' : 'Create Show'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {confirmDeleteShow && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.82)' }}
          onClick={() => setConfirmDeleteShow(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content cb-card p-4">
              <h5 className="fw-bold mb-2">Delete Show?</h5>
              <p className="small text-secondary mb-4">
                Remove {confirmDeleteShow.screenNumber} show at{' '}
                {confirmDeleteShow.startTime}?
              </p>
              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteShow(null)}
                  className="btn btn-sm cb-btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="btn btn-sm btn-danger"
                >
                  Delete Show
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Eye,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import SearchBar from '../components/SearchBar';
import { useBooking } from '../context/BookingContext';
import { CITIES } from '../utils/constants';

const EMPTY_THEATRE = {
  name: '',
  city: 'Mumbai',
  address: '',
  screensCount: 4,
  screens: 'IMAX Laser, Dolby Atmos',
  facilities: 'Recliner Seating, Food Court, M-Ticket',
  contact: '+91 22-4000-1000',
  image: '/src/assets/images/hero_crimson_horizon_1795435466299.jpg',
};

export default function ManageTheatres() {
  const { theatres, addTheatre, updateTheatre, deleteTheatre } = useBooking();

  const [searchText, setSearchText] = useState('');
  const [cityFilter, setCityFilter] = useState('All');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_THEATRE);
  const [formError, setFormError] = useState('');

  const [viewingTheatre, setViewingTheatre] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [feedback, setFeedback] = useState('');

  function showNotice(text) {
    setFeedback(text);
    setTimeout(() => setFeedback(''), 3000);
  }

  function handleOpenAdd() {
    setEditingId(null);
    setFormData(EMPTY_THEATRE);
    setFormError('');
    setShowModal(true);
  }

  function handleOpenEdit(theatre) {
    setEditingId(theatre.id);
    setFormData({
      name: theatre.name || '',
      city: theatre.city || 'Mumbai',
      address: theatre.address || '',
      screensCount: theatre.screensCount || 4,
      screens: Array.isArray(theatre.screens)
        ? theatre.screens.join(', ')
        : theatre.screens || '',
      facilities: Array.isArray(theatre.facilities)
        ? theatre.facilities.join(', ')
        : theatre.facilities || '',
      contact: theatre.contact || '',
      image: theatre.image || EMPTY_THEATRE.image,
    });
    setFormError('');
    setShowModal(true);
  }

  function handleSave(event) {
    event.preventDefault();
    setFormError('');

    if (!formData.name.trim() || !formData.address.trim()) {
      setFormError('Theatre name and full address are required.');
      return;
    }

    if (Number(formData.screensCount) < 1) {
      setFormError('Number of screens must be at least 1.');
      return;
    }

    if (editingId) {
      updateTheatre(editingId, formData);
      showNotice(`Updated "${formData.name}".`);
    } else {
      addTheatre(formData);
      showNotice(`Added "${formData.name}".`);
    }

    setShowModal(false);
    setEditingId(null);
  }

  function handleConfirmDelete() {
    if (!confirmDelete) {
      return;
    }
    deleteTheatre(confirmDelete.id);
    showNotice(`Deleted "${confirmDelete.name}" and its scheduled shows.`);
    setConfirmDelete(null);
  }

  const filteredTheatres = theatres.filter((theatre) => {
    const query = searchText.trim().toLowerCase();
    const matchesSearch =
      !query ||
      theatre.name.toLowerCase().includes(query) ||
      theatre.address.toLowerCase().includes(query);
    const matchesCity = cityFilter === 'All' || theatre.city === cityFilter;
    return matchesSearch && matchesCity;
  });

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h2 fw-bold mb-1">Manage Theatres</h1>
          <p className="text-secondary small mb-0">
            Configure cinema venues, screen counts, facilities, and cities.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="btn cb-btn-primary d-inline-flex align-items-center gap-2"
        >
          <Plus size={16} />
          <span>Add Theatre</span>
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
          <div className="col-md-8">
            <SearchBar
              value={searchText}
              onChange={setSearchText}
              placeholder="Search theatre name or address..."
            />
          </div>
          <div className="col-md-4">
            <select
              className="form-select cb-select"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
            >
              <option value="All">City: All</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="cb-card p-3 p-md-4">
        {filteredTheatres.length === 0 ? (
          <div className="text-center py-5">
            <Building2 size={36} className="text-secondary mb-2" />
            <p className="text-secondary mb-3">No theatres match your search.</p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="btn btn-sm cb-btn-primary"
            >
              Add New Theatre
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0">
              <thead>
                <tr className="small text-secondary">
                  <th>Theatre</th>
                  <th>City</th>
                  <th>Screens</th>
                  <th>Facilities</th>
                  <th>Contact</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTheatres.map((theatre) => (
                  <tr key={theatre.id}>
                    <td>
                      <div className="fw-semibold">{theatre.name}</div>
                      <small className="text-secondary">{theatre.address}</small>
                    </td>
                    <td>{theatre.city}</td>
                    <td className="cb-tabular">
                      {theatre.screensCount || 4} screen(s)
                    </td>
                    <td className="small text-secondary">
                      {(theatre.facilities || theatre.screens || []).join(', ')}
                    </td>
                    <td className="cb-mono small">{theatre.contact || '—'}</td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-1">
                        <button
                          type="button"
                          onClick={() => setViewingTheatre(theatre)}
                          className="btn btn-sm cb-btn-outline px-2"
                          aria-label={`View ${theatre.name}`}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(theatre)}
                          className="btn btn-sm cb-btn-outline px-2"
                          aria-label={`Edit ${theatre.name}`}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(theatre)}
                          className="btn btn-sm cb-btn-outline text-danger px-2"
                          aria-label={`Delete ${theatre.name}`}
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
                  {editingId ? 'Edit Theatre' : 'Add New Theatre'}
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

              <form onSubmit={handleSave}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small text-secondary">
                      Theatre Name *
                    </label>
                    <input
                      type="text"
                      className="form-control cb-input"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small text-secondary">
                      City
                    </label>
                    <select
                      className="form-select cb-select"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                    >
                      {CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small text-secondary">
                      Screens Count
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="25"
                      className="form-control cb-input"
                      value={formData.screensCount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          screensCount: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small text-secondary">
                      Full Address *
                    </label>
                    <input
                      type="text"
                      className="form-control cb-input"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-secondary">
                      Facilities (comma separated)
                    </label>
                    <input
                      type="text"
                      className="form-control cb-input"
                      value={formData.facilities}
                      onChange={(e) =>
                        setFormData({ ...formData, facilities: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-secondary">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      className="form-control cb-input"
                      value={formData.contact}
                      onChange={(e) =>
                        setFormData({ ...formData, contact: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small text-secondary">
                      Theatre Image URL
                    </label>
                    <input
                      type="text"
                      className="form-control cb-input"
                      value={formData.image}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
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
                    {editingId ? 'Save Changes' : 'Create Theatre'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Theatre Modal */}
      {viewingTheatre && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.82)' }}
          onClick={() => setViewingTheatre(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content cb-card overflow-hidden">
              {viewingTheatre.image && (
                <img
                  src={viewingTheatre.image}
                  alt={viewingTheatre.name}
                  style={{ height: '180px', width: '100%', objectFit: 'cover' }}
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="p-4">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <div className="small cb-text-gold">
                      {viewingTheatre.city}
                    </div>
                    <h5 className="fw-bold mb-0">{viewingTheatre.name}</h5>
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewingTheatre(null)}
                    className="btn btn-sm cb-btn-outline px-2"
                  >
                    <X size={16} />
                  </button>
                </div>
                <p className="small text-secondary mb-2">
                  {viewingTheatre.address}
                </p>
                <p className="small mb-1">
                  <strong>Screens:</strong> {viewingTheatre.screensCount || 4}
                </p>
                <p className="small mb-1">
                  <strong>Facilities:</strong>{' '}
                  {(viewingTheatre.facilities || []).join(', ')}
                </p>
                <p className="small mb-0">
                  <strong>Contact:</strong> {viewingTheatre.contact || '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.82)' }}
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content cb-card p-4">
              <h5 className="fw-bold mb-2">Delete Theatre?</h5>
              <p className="small text-secondary mb-4">
                Deleting <strong>{confirmDelete.name}</strong> will also remove
                scheduled shows at this venue.
              </p>
              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(null)}
                  className="btn btn-sm cb-btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="btn btn-sm btn-danger"
                >
                  Delete Theatre
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import {
  Ban,
  CheckCircle2,
  Eye,
  Pencil,
  Trash2,
  Unlock,
  Users,
  X,
} from 'lucide-react';
import SearchBar from '../components/SearchBar';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { formatCurrency } from '../utils/bookingHelpers';

export default function ManageUsers() {
  const {
    users,
    blockedUserIds,
    adminUpdateUser,
    toggleBlockUser,
    deleteUser,
  } = useAuth();
  const { bookings } = useBooking();

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [viewingUser, setViewingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  function notify(type, text) {
    setFeedback({ type, text });
    setTimeout(() => setFeedback({ type: '', text: '' }), 3000);
  }

  function handleOpenEdit(user) {
    setEditingUser(user);
    setEditForm({ name: user.name, email: user.email });
  }

  function handleSaveEdit(event) {
    event.preventDefault();
    if (!editForm.name.trim() || !editForm.email.includes('@')) {
      return;
    }
    adminUpdateUser(editingUser.id, editForm);
    setEditingUser(null);
    notify('success', 'User profile updated.');
  }

  function handleToggleBlock(user) {
    const res = toggleBlockUser(user.id);
    if (!res.success) {
      notify('error', res.message);
      return;
    }
    const nowBlocked = !blockedUserIds.includes(user.id);
    notify(
      'success',
      `${user.name} has been ${nowBlocked ? 'blocked' : 'unblocked'}.`
    );
  }

  function handleConfirmDelete() {
    if (!confirmDeleteUser) {
      return;
    }
    const res = deleteUser(confirmDeleteUser.id);
    if (!res.success) {
      notify('error', res.message);
    } else {
      notify('success', `Deleted demo user ${confirmDeleteUser.name}.`);
    }
    setConfirmDeleteUser(null);
  }

  const filteredUsers = users.filter((user) => {
    const query = searchText.trim().toLowerCase();
    const isBlocked = blockedUserIds.includes(user.id);

    const matchesSearch =
      !query ||
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Blocked' && isBlocked) ||
      (statusFilter === 'Active' && !isBlocked);

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="mb-4">
        <h1 className="h2 fw-bold mb-1">Manage Users</h1>
        <p className="text-secondary small mb-0">
          Inspect user booking history, update demo profiles, or block/remove
          accounts. Passwords are never exposed.
        </p>
      </div>

      {feedback.text && (
        <div
          className={`alert ${
            feedback.type === 'error' ? 'alert-danger' : 'alert-success'
          } d-flex align-items-center gap-2 small py-2 mb-3`}
        >
          <CheckCircle2 size={16} />
          <span>{feedback.text}</span>
        </div>
      )}

      <div className="cb-card p-3 mb-4">
        <div className="row g-3">
          <div className="col-md-8">
            <SearchBar
              value={searchText}
              onChange={setSearchText}
              placeholder="Search user name or email..."
            />
          </div>
          <div className="col-md-4">
            <select
              className="form-select cb-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">Status: All</option>
              <option value="Active">Active</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>
        </div>
      </div>

      <div className="cb-card p-3 p-md-4">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-5">
            <Users size={36} className="text-secondary mb-2" />
            <p className="text-secondary mb-0">No users found.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0 small">
              <thead>
                <tr className="text-secondary">
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>City</th>
                  <th>Bookings</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const isMainAdmin = user.email === 'admin@cinebook.com';
                  const isBlocked = blockedUserIds.includes(user.id);
                  const userBookingsCount = bookings.filter(
                    (b) => b.userId === user.id
                  ).length;

                  return (
                    <tr key={user.id}>
                      <td className="fw-semibold">{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span
                          className={
                            user.role === 'admin'
                              ? 'cb-text-gold fw-semibold'
                              : 'text-secondary'
                          }
                        >
                          {user.role}
                        </span>
                      </td>
                      <td>{user.city || 'Mumbai'}</td>
                      <td className="cb-tabular">{userBookingsCount}</td>
                      <td>
                        <span
                          className={
                            isBlocked
                              ? 'text-danger fw-semibold'
                              : 'text-success fw-semibold'
                          }
                        >
                          {isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="d-inline-flex gap-1">
                          <button
                            type="button"
                            onClick={() => setViewingUser(user)}
                            className="btn btn-sm cb-btn-outline px-2"
                            aria-label={`View ${user.name}`}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(user)}
                            className="btn btn-sm cb-btn-outline px-2"
                            aria-label={`Edit ${user.name}`}
                          >
                            <Pencil size={14} />
                          </button>
                          {!isMainAdmin && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleToggleBlock(user)}
                                className="btn btn-sm cb-btn-outline px-2"
                                title={
                                  isBlocked ? 'Unblock user' : 'Block user'
                                }
                                aria-label={
                                  isBlocked ? 'Unblock user' : 'Block user'
                                }
                              >
                                {isBlocked ? (
                                  <Unlock size={14} className="text-success" />
                                ) : (
                                  <Ban size={14} className="text-warning" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteUser(user)}
                                className="btn btn-sm cb-btn-outline text-danger px-2"
                                aria-label={`Delete ${user.name}`}
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
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

      {/* View User Profile & History Modal */}
      {viewingUser && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.82)' }}
          onClick={() => setViewingUser(null)}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content cb-card p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <div className="small cb-text-gold">{viewingUser.role}</div>
                  <h5 className="fw-bold mb-0">{viewingUser.name}</h5>
                  <div className="small text-secondary">
                    {viewingUser.email} · {viewingUser.city || 'Mumbai'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingUser(null)}
                  className="btn btn-sm cb-btn-outline px-2"
                >
                  <X size={16} />
                </button>
              </div>

              <h6 className="fw-bold mb-2">Booking History</h6>
              {bookings.filter((b) => b.userId === viewingUser.id).length ===
              0 ? (
                <p className="small text-secondary mb-0">
                  No bookings recorded for this user yet.
                </p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dark table-sm mb-0 small">
                    <thead>
                      <tr className="text-secondary">
                        <th>ID</th>
                        <th>Movie</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings
                        .filter((b) => b.userId === viewingUser.id)
                        .map((b) => (
                          <tr key={b.bookingId}>
                            <td className="cb-mono">{b.bookingId}</td>
                            <td>{b.movieTitle}</td>
                            <td className="cb-tabular">{b.date}</td>
                            <td className="cb-tabular">
                              {formatCurrency(b.totalAmount)}
                            </td>
                            <td>{b.status}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.82)' }}
          onClick={() => setEditingUser(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content cb-card p-4">
              <h5 className="fw-bold mb-3">Edit User</h5>
              <form onSubmit={handleSaveEdit}>
                <div className="mb-3">
                  <label className="form-label small text-secondary">Name</label>
                  <input
                    type="text"
                    className="form-control cb-input"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label small text-secondary">
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control cb-input"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="btn btn-sm cb-btn-outline"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-sm cb-btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {confirmDeleteUser && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.82)' }}
          onClick={() => setConfirmDeleteUser(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content cb-card p-4">
              <h5 className="fw-bold mb-2">Delete Demo User?</h5>
              <p className="small text-secondary mb-4">
                Remove <strong>{confirmDeleteUser.name}</strong> (
                {confirmDeleteUser.email}) from LocalStorage?
              </p>
              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteUser(null)}
                  className="btn btn-sm cb-btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="btn btn-sm btn-danger"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

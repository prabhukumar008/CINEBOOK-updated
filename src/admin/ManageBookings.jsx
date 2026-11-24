import React, { useState } from 'react';
import {
  CheckCircle2,
  Eye,
  Printer,
  Ticket,
  X,
  XCircle,
} from 'lucide-react';
import SearchBar from '../components/SearchBar';
import TicketView from '../components/Ticket';
import { useBooking } from '../context/BookingContext';
import { formatCurrency } from '../utils/bookingHelpers';

export default function ManageBookings() {
  const { bookings, cancelBooking } = useBooking();

  const [searchText, setSearchText] = useState('');
  const [movieFilter, setMovieFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');

  const [viewingBooking, setViewingBooking] = useState(null);
  const [confirmCancelBooking, setConfirmCancelBooking] = useState(null);
  const [feedback, setFeedback] = useState('');

  const uniqueMovies = Array.from(
    new Set(bookings.map((b) => b.movieTitle).filter(Boolean))
  );

  const filteredBookings = bookings.filter((booking) => {
    const query = searchText.trim().toLowerCase();
    const matchesQuery =
      !query ||
      booking.bookingId.toLowerCase().includes(query) ||
      booking.userName.toLowerCase().includes(query) ||
      booking.userEmail.toLowerCase().includes(query) ||
      booking.movieTitle.toLowerCase().includes(query);

    const matchesMovie =
      movieFilter === 'All' || booking.movieTitle === movieFilter;

    const matchesStatus =
      statusFilter === 'All' || booking.status === statusFilter;

    const matchesDate = !dateFilter || booking.date === dateFilter;

    return matchesQuery && matchesMovie && matchesStatus && matchesDate;
  });

  function handleConfirmCancel() {
    if (!confirmCancelBooking) {
      return;
    }
    cancelBooking(confirmCancelBooking.bookingId);
    setFeedback(
      `Booking ${confirmCancelBooking.bookingId} cancelled and seats restored.`
    );
    setConfirmCancelBooking(null);
    setTimeout(() => setFeedback(''), 3000);
  }

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h2 fw-bold mb-1">Manage Bookings</h1>
          <p className="text-secondary small mb-0">
            Inspect reservations, print e-tickets, or cancel bookings to restore
            seats.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="btn btn-sm cb-btn-outline d-inline-flex align-items-center gap-2 no-print"
        >
          <Printer size={15} />
          <span>Print Bookings Table</span>
        </button>
      </div>

      {feedback && (
        <div className="alert alert-success d-flex align-items-center gap-2 small py-2 mb-3">
          <CheckCircle2 size={16} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Search & Filters */}
      <div className="cb-card p-3 mb-4 no-print">
        <div className="row g-3">
          <div className="col-lg-4">
            <SearchBar
              value={searchText}
              onChange={setSearchText}
              placeholder="Search booking ID or customer..."
            />
          </div>
          <div className="col-md-4 col-lg-3">
            <select
              className="form-select cb-select"
              value={movieFilter}
              onChange={(e) => setMovieFilter(e.target.value)}
            >
              <option value="All">Movie: All</option>
              {uniqueMovies.map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </select>
          </div>
          <div className="col-6 col-md-4 col-lg-2">
            <select
              className="form-select cb-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">Status: All</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="col-6 col-md-4 col-lg-3">
            <input
              type="date"
              className="form-control cb-input"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              aria-label="Filter by show date"
            />
          </div>
        </div>
      </div>

      <div className="cb-card p-3 p-md-4">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-5">
            <Ticket size={36} className="text-secondary mb-2" />
            <p className="text-secondary mb-0">
              No bookings match your search or filters.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0 small">
              <thead>
                <tr className="text-secondary">
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Movie</th>
                  <th>Theatre &amp; Show</th>
                  <th>Seats</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th className="text-end no-print">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.bookingId}>
                    <td className="cb-mono fw-semibold">{booking.bookingId}</td>
                    <td>
                      <div>{booking.userName}</div>
                      <small className="text-secondary">
                        {booking.userEmail}
                      </small>
                    </td>
                    <td className="fw-semibold">{booking.movieTitle}</td>
                    <td>
                      <div>{booking.theatreName}</div>
                      <div className="text-secondary cb-tabular">
                        {booking.date} · {booking.showtime}
                      </div>
                    </td>
                    <td className="cb-mono">
                      {booking.seats
                        .map((s) => (typeof s === 'string' ? s : s.id))
                        .join(', ')}
                    </td>
                    <td className="cb-tabular fw-semibold">
                      {formatCurrency(booking.totalAmount)}
                    </td>
                    <td>{booking.paymentMethod}</td>
                    <td>
                      <span
                        className={
                          booking.status === 'Cancelled'
                            ? 'text-danger fw-semibold'
                            : 'text-success fw-semibold'
                        }
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="text-end no-print">
                      <div className="d-inline-flex gap-1">
                        <button
                          type="button"
                          onClick={() => setViewingBooking(booking)}
                          className="btn btn-sm cb-btn-outline px-2"
                          aria-label={`View booking ${booking.bookingId}`}
                        >
                          <Eye size={14} />
                        </button>
                        {booking.status !== 'Cancelled' && (
                          <button
                            type="button"
                            onClick={() => setConfirmCancelBooking(booking)}
                            className="btn btn-sm cb-btn-outline text-danger px-2"
                            aria-label={`Cancel booking ${booking.bookingId}`}
                          >
                            <XCircle size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Booking Modal */}
      {viewingBooking && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
          onClick={() => setViewingBooking(null)}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content bg-transparent border-0">
              <div className="d-flex justify-content-end mb-2 no-print">
                <button
                  type="button"
                  onClick={() => setViewingBooking(null)}
                  className="btn btn-sm cb-btn-outline px-2"
                >
                  <X size={18} />
                </button>
              </div>
              <TicketView booking={viewingBooking} />
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Confirmation Modal */}
      {confirmCancelBooking && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.82)' }}
          onClick={() => setConfirmCancelBooking(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content cb-card p-4">
              <h5 className="fw-bold mb-2">Cancel Booking?</h5>
              <p className="small text-secondary mb-4">
                Cancelling{' '}
                <strong className="cb-mono">
                  {confirmCancelBooking.bookingId}
                </strong>{' '}
                will restore its seats back to available inventory.
              </p>
              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmCancelBooking(null)}
                  className="btn btn-sm cb-btn-outline"
                >
                  Keep Booking
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  className="btn btn-sm btn-danger"
                >
                  Cancel &amp; Restore Seats
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Calendar, Clock, Film, MapPin, QrCode, XCircle } from 'lucide-react';
import { formatCurrency } from '../utils/bookingHelpers';

export default function BookingCard({ booking, onViewTicket, onCancel }) {
  const [imgError, setImgError] = useState(false);

  const seatLabels = booking.seats
    .map((seat) => (typeof seat === 'string' ? seat : seat.id))
    .join(', ');

  const isCancelled = booking.status === 'Cancelled';

  return (
    <div className="cb-card p-3 p-md-4">
      <div className="row g-3 align-items-center">
        <div className="col-4 col-sm-3 col-md-2">
          <div className="cb-poster-wrap rounded">
            {!imgError && booking.moviePoster ? (
              <img
                src={booking.moviePoster}
                alt={booking.movieTitle}
                className="cb-poster-img"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="cb-poster-fallback p-2">
                <Film size={24} className="text-danger" />
              </div>
            )}
          </div>
        </div>

        <div className="col-8 col-sm-9 col-md-6">
          <div className="d-flex flex-wrap align-items-center gap-2 small mb-1">
            <span className="cb-mono text-secondary">{booking.bookingId}</span>
            <span aria-hidden="true">·</span>
            <span
              className={
                isCancelled
                  ? 'text-danger fw-semibold'
                  : 'text-success fw-semibold'
              }
            >
              {booking.status}
            </span>
          </div>

          <h5 className="fw-bold mb-2">{booking.movieTitle}</h5>

          <div className="d-flex flex-column gap-1 small text-secondary">
            <div className="d-flex align-items-center gap-2">
              <MapPin size={14} className="text-danger flex-shrink-0" />
              <span>
                {booking.theatreName} ({booking.theatreCity})
              </span>
            </div>
            <div className="d-flex flex-wrap align-items-center gap-3">
              <span className="d-inline-flex align-items-center gap-1 cb-tabular">
                <Calendar size={14} className="text-secondary" />
                {booking.date}
              </span>
              <span className="d-inline-flex align-items-center gap-1 cb-tabular">
                <Clock size={14} className="text-secondary" />
                {booking.showtime}
              </span>
            </div>
            <div>
              Seats:{' '}
              <span className="text-light cb-mono fw-semibold">
                {seatLabels}
              </span>
            </div>
          </div>
        </div>

        <div className="col-md-4 d-flex flex-md-column justify-content-between align-items-md-end gap-2 border-top border-md-0 pt-3 pt-md-0 border-secondary border-opacity-25">
          <div className="text-md-end">
            <div className="small text-secondary">Total Paid</div>
            <div className="fs-5 fw-bold cb-tabular">
              {formatCurrency(booking.totalAmount)}
            </div>
          </div>

          <div className="d-flex flex-wrap gap-2">
            {!isCancelled && (
              <button
                type="button"
                onClick={() => onViewTicket(booking)}
                className="btn btn-sm cb-btn-primary d-inline-flex align-items-center gap-1"
              >
                <QrCode size={15} />
                <span>View Ticket</span>
              </button>
            )}
            {!isCancelled && onCancel && (
              <button
                type="button"
                onClick={() => onCancel(booking.bookingId)}
                className="btn btn-sm cb-btn-outline d-inline-flex align-items-center gap-1"
              >
                <XCircle size={15} />
                <span>Cancel</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

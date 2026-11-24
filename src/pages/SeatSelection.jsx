import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, ArrowRight, Ticket } from 'lucide-react';
import Seat from '../components/Seat';
import { useBooking } from '../context/BookingContext';
import { buildAuditoriumLayout } from '../data/seats';
import {
  calculateBookingTotals,
  formatCurrency,
  getOccupiedSeatsForShow,
} from '../utils/bookingHelpers';
import { MAX_SEATS_PER_BOOKING, SEAT_PRICES } from '../utils/constants';

export default function SeatSelection() {
  const { movies, theatres, bookings, settings, draftBooking, setDraftSeats } =
    useBooking();
  const navigate = useNavigate();

  const [selectedSeats, setSelectedSeats] = useState(
    draftBooking && Array.isArray(draftBooking.selectedSeats)
      ? draftBooking.selectedSeats
      : []
  );
  const [limitWarning, setLimitWarning] = useState('');

  if (!draftBooking) {
    return (
      <div className="container py-5 text-center">
        <h2 className="fw-bold mb-3">No Show Selected</h2>
        <p className="text-secondary mb-4">
          Please choose a movie, theatre, and showtime before picking seats.
        </p>
        <Link to="/movies" className="btn cb-btn-primary">
          Browse Movies
        </Link>
      </div>
    );
  }

  const movie =
    movies.find((item) => item.id === draftBooking.movieId) ||
    draftBooking.movieSnapshot;
  const theatre = theatres.find((item) => item.id === draftBooking.theatreId);
  const activePrices = draftBooking.seatPrices || SEAT_PRICES;
  const layout = buildAuditoriumLayout(activePrices);
  const occupiedSeats = getOccupiedSeatsForShow(
    bookings,
    draftBooking.movieId,
    draftBooking.theatreId,
    draftBooking.date,
    draftBooking.showtime
  );

  function handleToggleSeat(seat) {
    if (occupiedSeats.includes(seat.id)) {
      return;
    }

    const alreadySelected = selectedSeats.some((item) => item.id === seat.id);
    let nextSeats = [];

    if (alreadySelected) {
      nextSeats = selectedSeats.filter((item) => item.id !== seat.id);
      setLimitWarning('');
    } else {
      if (selectedSeats.length >= MAX_SEATS_PER_BOOKING) {
        setLimitWarning(
          `You can book a maximum of ${MAX_SEATS_PER_BOOKING} seats per transaction.`
        );
        return;
      }
      nextSeats = [...selectedSeats, seat];
      setLimitWarning('');
    }

    setSelectedSeats(nextSeats);
    setDraftSeats(nextSeats);
  }

  function handleProceedToCheckout() {
    if (selectedSeats.length === 0) {
      return;
    }
    setDraftSeats(selectedSeats);
    navigate('/checkout');
  }

  const feePerTicket = Number(settings.convenienceFee ?? 35);
  const totals = calculateBookingTotals(selectedSeats, feePerTicket);
  const selectedSeatNames = selectedSeats.map((s) => s.id).join(', ');

  return (
    <div className="container py-4 py-md-5">
      <button
        type="button"
        onClick={() => navigate(`/book/${draftBooking.movieId}`)}
        className="btn btn-sm cb-btn-outline d-inline-flex align-items-center gap-2 mb-4"
      >
        <ArrowLeft size={15} />
        <span>Change Theatre or Showtime</span>
      </button>

      {/* Show Info Header */}
      <div className="cb-card p-3 p-md-4 mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
          <div>
            <h1 className="h4 fw-bold mb-1">
              {movie ? movie.title : 'Selected Movie'}
            </h1>
            <div className="small text-secondary">
              {theatre ? `${theatre.name} (${theatre.city})` : 'Theatre'} ·{' '}
              <span>{draftBooking.screenNumber || 'Screen 1'}</span> ·{' '}
              <span className="cb-tabular">{draftBooking.date}</span> ·{' '}
              <span className="cb-mono cb-text-gold">
                {draftBooking.showtime}
              </span>
            </div>
          </div>

          <div className="small text-secondary cb-tabular">
            Max {MAX_SEATS_PER_BOOKING} seats per booking
          </div>
        </div>
      </div>

      {limitWarning && (
        <div
          className="alert alert-warning d-flex align-items-center gap-2 mb-4"
          role="alert"
        >
          <AlertCircle size={18} />
          <span>{limitWarning}</span>
        </div>
      )}

      <div className="row g-4">
        {/* Auditorium Seat Map */}
        <div className="col-lg-8">
          <div className="cb-card p-3 p-md-4">
            <div className="text-center mb-4">
              <div className="cb-screen-curve" />
              <div className="small text-secondary">
                All eyes this way — Cinema Screen
              </div>
            </div>

            <div className="cb-seat-scroll">
              <div className="cb-seat-grid-inner d-flex flex-column gap-2">
                {layout.map((rowGroup, rowIndex) => {
                  const showTierHeader =
                    rowIndex === 0 ||
                    layout[rowIndex - 1].tier !== rowGroup.tier;

                  return (
                    <React.Fragment key={rowGroup.row}>
                      {showTierHeader && (
                        <div className="d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-25 pb-1 mt-2 mb-1 small text-secondary">
                          <span className="fw-semibold cb-text-gold">
                            {rowGroup.tier} Class
                          </span>
                          <span className="cb-tabular">
                            {formatCurrency(rowGroup.price)}
                          </span>
                        </div>
                      )}

                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <span
                          className="cb-mono small text-secondary text-end"
                          style={{ width: '22px' }}
                        >
                          {rowGroup.row}
                        </span>

                        <div className="d-flex align-items-center gap-1">
                          {rowGroup.seats.slice(0, 5).map((seat) => (
                            <Seat
                              key={seat.id}
                              seat={seat}
                              isOccupied={occupiedSeats.includes(seat.id)}
                              isSelected={selectedSeats.some(
                                (item) => item.id === seat.id
                              )}
                              onToggle={handleToggleSeat}
                            />
                          ))}
                        </div>

                        <div style={{ width: '22px' }} aria-hidden="true" />

                        <div className="d-flex align-items-center gap-1">
                          {rowGroup.seats.slice(5).map((seat) => (
                            <Seat
                              key={seat.id}
                              seat={seat}
                              isOccupied={occupiedSeats.includes(seat.id)}
                              isSelected={selectedSeats.some(
                                (item) => item.id === seat.id
                              )}
                              onToggle={handleToggleSeat}
                            />
                          ))}
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            <div className="d-flex flex-wrap justify-content-center gap-3 gap-md-4 pt-4 mt-4 border-top border-secondary border-opacity-25 small text-secondary">
              <div className="d-flex align-items-center gap-2">
                <span className="cb-seat-btn tier-silver" aria-hidden="true">
                  1
                </span>
                <span>Silver ({formatCurrency(activePrices.Silver)})</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="cb-seat-btn tier-gold" aria-hidden="true">
                  1
                </span>
                <span>Gold ({formatCurrency(activePrices.Gold)})</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="cb-seat-btn tier-platinum" aria-hidden="true">
                  1
                </span>
                <span>Platinum ({formatCurrency(activePrices.Platinum)})</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="cb-seat-btn is-selected" aria-hidden="true">
                  1
                </span>
                <span>Selected</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="cb-seat-btn is-occupied" aria-hidden="true">
                  1
                </span>
                <span>Occupied</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Selection Summary */}
        <div className="col-lg-4">
          <div className="cb-card p-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <Ticket size={18} className="cb-text-gold" />
              <h5 className="fw-bold mb-0">Booking Summary</h5>
            </div>

            {selectedSeats.length === 0 ? (
              <p className="text-secondary small mb-4">
                Select up to {MAX_SEATS_PER_BOOKING} available seats from the
                seating map to calculate your total.
              </p>
            ) : (
              <>
                <div className="mb-3">
                  <div className="small text-secondary mb-1">
                    Selected Seats ({selectedSeats.length})
                  </div>
                  <div className="cb-mono fw-semibold text-light">
                    {selectedSeatNames}
                  </div>
                </div>

                <div className="border-top border-secondary border-opacity-25 pt-3 mb-3 d-flex flex-column gap-2 small">
                  <div className="d-flex justify-content-between">
                    <span className="text-secondary">Tickets Subtotal</span>
                    <span className="cb-tabular">
                      {formatCurrency(totals.ticketSubtotal)}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-secondary">
                      Convenience Fee ({selectedSeats.length}x)
                    </span>
                    <span className="cb-tabular">
                      {formatCurrency(totals.convenienceFee)}
                    </span>
                  </div>
                </div>

                <div className="border-top border-secondary border-opacity-25 pt-3 mb-4 d-flex justify-content-between align-items-center">
                  <span className="fw-semibold">Total Amount</span>
                  <span className="fs-4 fw-bold cb-text-gold cb-tabular">
                    {formatCurrency(totals.totalAmount)}
                  </span>
                </div>
              </>
            )}

            <button
              type="button"
              disabled={selectedSeats.length === 0}
              onClick={handleProceedToCheckout}
              className="btn cb-btn-primary w-100 d-inline-flex align-items-center justify-content-center gap-2 py-2"
            >
              <span>Continue to Checkout</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

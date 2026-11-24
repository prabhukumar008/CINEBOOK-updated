import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import Ticket from '../components/Ticket';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';

export default function BookingSuccess() {
  const location = useLocation();
  const { currentUser } = useAuth();
  const { bookings } = useBooking();

  const stateBooking = location.state && location.state.booking;
  const fallbackBooking = bookings.find(
    (item) => currentUser && item.userId === currentUser.id
  );
  const booking = stateBooking || fallbackBooking;

  if (!booking) {
    return (
      <div className="container py-5 text-center">
        <h2 className="fw-bold mb-3">No Recent Booking Found</h2>
        <Link to="/movies" className="btn cb-btn-primary">
          Browse Movies
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-4 py-md-5">
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <div className="text-center mb-4 no-print">
            <CheckCircle2 size={46} className="text-success mb-2" />
            <h1 className="fw-bold mb-1">Booking Confirmed</h1>
            <p className="text-secondary mb-0">
              Your seats are locked and your digital QR ticket is ready.
            </p>
          </div>

          <Ticket booking={booking} />

          <div className="d-flex justify-content-center gap-3 mt-4 no-print">
            <Link to="/my-bookings" className="btn cb-btn-outline">
              View All My Bookings
            </Link>
            <Link to="/movies" className="btn cb-btn-primary">
              Book Another Movie
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

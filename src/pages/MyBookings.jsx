import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket } from 'lucide-react';
import BookingCard from '../components/BookingCard';
import TicketModal from '../components/TicketModal';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';

export default function MyBookings() {
  const { currentUser } = useAuth();
  const { bookings, cancelBooking } = useBooking();
  const [selectedBooking, setSelectedBooking] = useState(null);

  const userBookings = bookings.filter(
    (item) => currentUser && item.userId === currentUser.id
  );

  return (
    <div className="container py-4 py-md-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
        <div>
          <h1 className="fw-bold mb-1">My Bookings</h1>
          <p className="text-secondary mb-0">
            View your reserved seats, inspect QR passes, or print tickets.
          </p>
        </div>
        <div className="small text-secondary cb-tabular">
          {userBookings.length} reservation(s)
        </div>
      </div>

      {userBookings.length === 0 ? (
        <div className="cb-card p-5 text-center">
          <Ticket size={40} className="text-danger mb-3" />
          <h4 className="fw-bold mb-2">No Bookings Yet</h4>
          <p className="text-secondary mb-4">
            You have not booked any movie tickets under this demo account yet.
          </p>
          <Link to="/movies" className="btn cb-btn-primary">
            Explore Movies
          </Link>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {userBookings.map((booking) => (
            <BookingCard
              key={booking.bookingId}
              booking={booking}
              onViewTicket={(item) => setSelectedBooking(item)}
              onCancel={cancelBooking}
            />
          ))}
        </div>
      )}

      <TicketModal
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />
    </div>
  );
}

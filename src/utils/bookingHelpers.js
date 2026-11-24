import { getBaselineOccupiedSeats } from '../data/seats';
import { CONVENIENCE_FEE_PER_TICKET } from './constants';

export function formatCurrency(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
}

export function generateBookingId() {
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  return `CB-${randomPart}`;
}

export function getUpcomingDates(daysCount = 5) {
  const dates = [];
  const today = new Date();

  for (let i = 0; i < daysCount; i += 1) {
    const dateObj = new Date(today);
    dateObj.setDate(today.getDate() + i);

    const iso = dateObj.toISOString().split('T')[0];
    const dayName =
      i === 0
        ? 'Today'
        : i === 1
          ? 'Tomorrow'
          : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const shortDate = dateObj.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
    });

    dates.push({
      iso,
      dayName,
      shortDate,
      fullLabel: `${dayName}, ${shortDate}`,
    });
  }

  return dates;
}

export function getShowPeriod(timeLabel) {
  if (!timeLabel) {
    return 'Evening';
  }
  if (timeLabel.includes('AM')) {
    return 'Morning';
  }
  const hour = parseInt(timeLabel.split(':')[0], 10);
  if (hour === 12 || hour < 5) {
    return 'Afternoon';
  }
  return 'Evening';
}

export function calculateBookingTotals(
  selectedSeats,
  feePerTicket = CONVENIENCE_FEE_PER_TICKET,
  coupon = null
) {
  const ticketSubtotal = selectedSeats.reduce(
    (sum, seat) => sum + Number(seat.price || 0),
    0
  );
  const convenienceFee = selectedSeats.length * Number(feePerTicket || 0);
  const grossTotal = ticketSubtotal + convenienceFee;

  let discountAmount = 0;
  if (coupon && coupon.isActive && ticketSubtotal >= Number(coupon.minBookingAmount || 0)) {
    if (coupon.discountType === 'percentage') {
      const rawDiscount = Math.round(
        (ticketSubtotal * Number(coupon.discountValue || 0)) / 100
      );
      discountAmount = Math.min(
        rawDiscount,
        Number(coupon.maxDiscount || rawDiscount)
      );
    } else {
      discountAmount = Math.min(
        Number(coupon.discountValue || 0),
        Number(coupon.maxDiscount || coupon.discountValue || 0)
      );
    }
  }

  const totalAmount = Math.max(0, grossTotal - discountAmount);

  return {
    ticketSubtotal,
    convenienceFee,
    discountAmount,
    totalAmount,
  };
}

export function validateCouponForSubtotal(coupon, subtotal) {
  if (!coupon) {
    return { valid: false, message: 'Coupon code not found.' };
  }
  if (!coupon.isActive) {
    return { valid: false, message: 'This coupon is currently inactive.' };
  }
  if (coupon.expiryDate) {
    const todayIso = new Date().toISOString().split('T')[0];
    if (coupon.expiryDate < todayIso) {
      return { valid: false, message: 'This coupon has expired.' };
    }
  }
  if (subtotal < Number(coupon.minBookingAmount || 0)) {
    return {
      valid: false,
      message: `Minimum ticket subtotal of ${formatCurrency(
        coupon.minBookingAmount
      )} required.`,
    };
  }
  return { valid: true, message: `Coupon ${coupon.code} applied.` };
}

// Combines baseline occupied seats with confirmed user bookings for the exact movie/theatre/date/time
export function getOccupiedSeatsForShow(
  bookings,
  movieId,
  theatreId,
  date,
  showtime
) {
  const baseline = getBaselineOccupiedSeats(movieId, theatreId, date, showtime);
  const bookedSeats = [];

  for (let i = 0; i < bookings.length; i += 1) {
    const booking = bookings[i];
    if (
      booking.status !== 'Cancelled' &&
      booking.movieId === movieId &&
      booking.theatreId === theatreId &&
      booking.date === date &&
      booking.showtime === showtime
    ) {
      for (let j = 0; j < booking.seats.length; j += 1) {
        const seatId = booking.seats[j].id || booking.seats[j];
        if (!bookedSeats.includes(seatId)) {
          bookedSeats.push(seatId);
        }
      }
    }
  }

  return Array.from(new Set([...baseline, ...bookedSeats]));
}

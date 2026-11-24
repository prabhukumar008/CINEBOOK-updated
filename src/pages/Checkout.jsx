import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Lock,
  Smartphone,
  Tag,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import {
  calculateBookingTotals,
  formatCurrency,
  validateCouponForSubtotal,
} from '../utils/bookingHelpers';

export default function Checkout() {
  const { currentUser } = useAuth();
  const { movies, theatres, coupons, settings, draftBooking, confirmBooking } =
    useBooking();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('alex@demo-upi');
  const [cardName, setCardName] = useState(
    currentUser ? currentUser.name : 'Alex Rivera'
  );
  const [cardNumber, setCardNumber] = useState('4111 1111 1111 1111');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('123');
  const [simulateFailure, setSimulateFailure] = useState(false);

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponFeedback, setCouponFeedback] = useState({ type: '', text: '' });

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  if (
    !draftBooking ||
    !Array.isArray(draftBooking.selectedSeats) ||
    draftBooking.selectedSeats.length === 0
  ) {
    return (
      <div className="container py-5 text-center">
        <h2 className="fw-bold mb-3">Your Checkout Cart Is Empty</h2>
        <p className="text-secondary mb-4">
          Please select seats for a movie showtime first.
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
  const feePerTicket = Number(settings.convenienceFee ?? 35);

  const baseTotals = calculateBookingTotals(
    draftBooking.selectedSeats,
    feePerTicket,
    null
  );
  const totals = calculateBookingTotals(
    draftBooking.selectedSeats,
    feePerTicket,
    appliedCoupon
  );
  const seatLabels = draftBooking.selectedSeats
    .map((seat) => seat.id)
    .join(', ');

  function handleApplyCoupon(codeOverride = null) {
    const code = (codeOverride || couponInput).trim().toUpperCase();
    if (!code) {
      return;
    }

    const found = coupons.find((item) => item.code === code);
    const check = validateCouponForSubtotal(found, baseTotals.ticketSubtotal);

    if (!check.valid) {
      setAppliedCoupon(null);
      setCouponFeedback({ type: 'error', text: check.message });
      return;
    }

    setCouponInput(code);
    setAppliedCoupon(found);
    setCouponFeedback({ type: 'success', text: check.message });
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponFeedback({ type: '', text: '' });
  }

  function handlePayNow(event) {
    event.preventDefault();
    setPaymentError('');

    if (paymentMethod === 'UPI' && !upiId.includes('@')) {
      setPaymentError('Please enter a valid demo UPI ID (e.g. name@upi).');
      return;
    }

    if (
      paymentMethod === 'Card' &&
      (!cardName.trim() || cardNumber.trim().length < 12)
    ) {
      setPaymentError('Please complete the simulated card fields.');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);

      if (simulateFailure) {
        setPaymentError(
          'Simulated payment declined. Uncheck failure mode and click Retry Payment to complete your booking.'
        );
        return;
      }

      const booking = confirmBooking({
        user: currentUser,
        paymentMethod: paymentMethod === 'UPI' ? 'UPI (Demo)' : 'Card (Demo)',
        appliedCoupon,
      });

      if (booking) {
        navigate('/booking-success', { state: { booking } });
      }
    }, 1200);
  }

  const activeCoupons = coupons.filter((c) => c.isActive);

  return (
    <div className="container py-4 py-md-5">
      <button
        type="button"
        onClick={() => navigate('/seats')}
        className="btn btn-sm cb-btn-outline d-inline-flex align-items-center gap-2 mb-4"
      >
        <ArrowLeft size={15} />
        <span>Back to Seat Selection</span>
      </button>

      <h1 className="fw-bold mb-4">Checkout &amp; Demo Payment</h1>

      <div className="row g-4">
        {/* Payment Options */}
        <div className="col-lg-7">
          <div className="cb-card p-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold mb-0">Select Payment Method</h5>
              <span className="small text-secondary d-inline-flex align-items-center gap-1">
                <Lock size={14} />
                Demo Simulation Only
              </span>
            </div>

            <div className="d-flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('UPI');
                  setPaymentError('');
                }}
                className={`cb-filter-tab flex-grow-1 d-inline-flex align-items-center justify-content-center gap-2 ${
                  paymentMethod === 'UPI' ? 'active' : ''
                }`}
              >
                <Smartphone size={16} />
                <span>UPI (Simulation)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('Card');
                  setPaymentError('');
                }}
                className={`cb-filter-tab flex-grow-1 d-inline-flex align-items-center justify-content-center gap-2 ${
                  paymentMethod === 'Card' ? 'active' : ''
                }`}
              >
                <CreditCard size={16} />
                <span>Credit / Debit Card</span>
              </button>
            </div>

            {paymentError && (
              <div
                className="alert alert-danger d-flex align-items-start gap-2"
                role="alert"
              >
                <AlertTriangle size={18} className="mt-1 flex-shrink-0" />
                <div>{paymentError}</div>
              </div>
            )}

            <form onSubmit={handlePayNow}>
              {paymentMethod === 'UPI' ? (
                <div className="mb-4">
                  <label className="form-label small text-secondary">
                    Demo UPI ID (Not stored or charged)
                  </label>
                  <input
                    type="text"
                    className="form-control cb-input"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="username@demo-upi"
                    required
                  />
                  <div className="form-text text-secondary">
                    Frontend simulation only — no real UPI payment occurs.
                  </div>
                </div>
              ) : (
                <div className="row g-3 mb-4">
                  <div className="col-12">
                    <label className="form-label small text-secondary">
                      Name on Card (Demo)
                    </label>
                    <input
                      type="text"
                      className="form-control cb-input"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small text-secondary">
                      Demo Card Number
                    </label>
                    <input
                      type="text"
                      className="form-control cb-input cb-mono"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      maxLength={19}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small text-secondary">
                      Expiry
                    </label>
                    <input
                      type="text"
                      className="form-control cb-input cb-mono"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      maxLength={5}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small text-secondary">
                      CVV (Demo)
                    </label>
                    <input
                      type="password"
                      className="form-control cb-input cb-mono"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      maxLength={4}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <div className="form-text text-secondary">
                      Simulated checkout only — card fields are never persisted.
                    </div>
                  </div>
                </div>
              )}

              <div className="form-check mb-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="simulateFailureCheck"
                  checked={simulateFailure}
                  onChange={(e) => setSimulateFailure(e.target.checked)}
                />
                <label
                  className="form-check-label small text-secondary"
                  htmlFor="simulateFailureCheck"
                >
                  Test payment failure &amp; retry flow
                </label>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="btn cb-btn-primary w-100 py-2 fs-6"
              >
                {isProcessing ? (
                  <span className="d-inline-flex align-items-center gap-2">
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    />
                    <span>Processing Demo Payment...</span>
                  </span>
                ) : paymentError ? (
                  `Retry Payment · ${formatCurrency(totals.totalAmount)}`
                ) : (
                  `Pay Now · ${formatCurrency(totals.totalAmount)}`
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Order Summary + Coupons */}
        <div className="col-lg-5">
          <div className="cb-card p-4 mb-3">
            <h5 className="fw-bold mb-3">Order Summary</h5>

            <div className="mb-3 pb-3 border-bottom border-secondary border-opacity-25">
              <div className="fw-bold fs-5 mb-1">
                {movie ? movie.title : 'Movie'}
              </div>
              <div className="small text-secondary mb-2">
                {movie ? `${movie.language} · ${movie.duration}` : ''}
              </div>
              <div className="small text-light">
                {theatre ? `${theatre.name}, ${theatre.city}` : 'Theatre'} ·{' '}
                {draftBooking.screenNumber || 'Screen 1'}
              </div>
              <div className="small text-secondary cb-tabular mt-1">
                {draftBooking.date} · {draftBooking.showtime}
              </div>
            </div>

            <div className="d-flex justify-content-between small mb-2">
              <span className="text-secondary">
                Seats ({draftBooking.selectedSeats.length})
              </span>
              <span className="cb-mono fw-semibold text-light">
                {seatLabels}
              </span>
            </div>

            <div className="d-flex justify-content-between small mb-2">
              <span className="text-secondary">Ticket Price</span>
              <span className="cb-tabular">
                {formatCurrency(totals.ticketSubtotal)}
              </span>
            </div>

            <div className="d-flex justify-content-between small mb-2">
              <span className="text-secondary">Convenience Fee</span>
              <span className="cb-tabular">
                {formatCurrency(totals.convenienceFee)}
              </span>
            </div>

            {totals.discountAmount > 0 && (
              <div className="d-flex justify-content-between small text-success mb-2">
                <span>Coupon Discount ({appliedCoupon.code})</span>
                <span className="cb-tabular">
                  -{formatCurrency(totals.discountAmount)}
                </span>
              </div>
            )}

            <div className="d-flex justify-content-between align-items-center pt-3 mt-2 border-top border-secondary border-opacity-25">
              <span className="fw-semibold">Total Payable</span>
              <span className="fs-4 fw-bold cb-text-gold cb-tabular">
                {formatCurrency(totals.totalAmount)}
              </span>
            </div>
          </div>

          {/* Coupon Box */}
          <div className="cb-card p-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <Tag size={16} className="cb-text-gold" />
              <h6 className="fw-bold mb-0">Apply Promo Coupon</h6>
            </div>

            <div className="input-group input-group-sm mb-2">
              <input
                type="text"
                className="form-control cb-input cb-mono text-uppercase"
                placeholder="Enter code (e.g. IMAX20)"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                disabled={Boolean(appliedCoupon)}
              />
              {appliedCoupon ? (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="btn cb-btn-outline"
                >
                  Remove
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleApplyCoupon()}
                  className="btn cb-btn-gold"
                >
                  Apply
                </button>
              )}
            </div>

            {couponFeedback.text && (
              <div
                className={`small mb-2 d-flex align-items-center gap-1 ${
                  couponFeedback.type === 'success'
                    ? 'text-success'
                    : 'text-danger'
                }`}
              >
                {couponFeedback.type === 'success' && (
                  <CheckCircle2 size={14} />
                )}
                <span>{couponFeedback.text}</span>
              </div>
            )}

            {activeCoupons.length > 0 && !appliedCoupon && (
              <div className="mt-2">
                <div className="small text-secondary mb-1">
                  Available Coupons:
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {activeCoupons.map((cpn) => (
                    <button
                      key={cpn.id}
                      type="button"
                      onClick={() => handleApplyCoupon(cpn.code)}
                      className="btn btn-sm cb-btn-outline cb-mono"
                    >
                      {cpn.code}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

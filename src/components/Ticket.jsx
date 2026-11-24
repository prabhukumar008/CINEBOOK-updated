import React, { useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Calendar,
  Clock,
  Download,
  Film,
  MapPin,
  Printer,
} from 'lucide-react';
import { formatCurrency } from '../utils/bookingHelpers';

export default function Ticket({ booking }) {
  const qrRef = useRef(null);
  const [imgError, setImgError] = useState(false);

  if (!booking) {
    return null;
  }

  const seatLabels = booking.seats
    .map((seat) => (typeof seat === 'string' ? seat : seat.id))
    .join(', ');

  const qrPayload = JSON.stringify({
    bookingId: booking.bookingId,
    movie: booking.movieTitle,
    theatre: booking.theatreName,
    screen: booking.screenNumber || 'Screen 1',
    date: booking.date,
    showtime: booking.showtime,
    seats: seatLabels,
  });

  function handlePrint() {
    window.print();
  }

  function handleDownloadPng() {
    const qrCanvas = qrRef.current
      ? qrRef.current.querySelector('canvas')
      : null;

    const canvas = document.createElement('canvas');
    canvas.width = 780;
    canvas.height = 440;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0d111a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#e5b95c';
    ctx.lineWidth = 4;
    ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

    ctx.fillStyle = '#e5b95c';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('CINEBOOK OFFICIAL E-TICKET', 44, 62);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText(booking.movieTitle, 44, 112);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '18px sans-serif';
    ctx.fillText(`Booking ID: ${booking.bookingId}`, 44, 152);
    ctx.fillText(
      `Theatre: ${booking.theatreName} (${booking.theatreCity})`,
      44,
      192
    );
    ctx.fillText(
      `Screen: ${booking.screenNumber || 'Screen 1'} · ${booking.date} · ${booking.showtime}`,
      44,
      232
    );

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`Seats: ${seatLabels}`, 44, 282);
    ctx.fillText(
      `Total Paid: ${formatCurrency(booking.totalAmount)}`,
      44,
      322
    );

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`Status: ${booking.status}`, 44, 368);

    if (qrCanvas) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(540, 110, 184, 184);
      ctx.drawImage(qrCanvas, 550, 120, 164, 164);
    }

    const link = document.createElement('a');
    link.download = `CineBook-Ticket-${booking.bookingId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  return (
    <div className="cb-ticket-card p-4 p-md-5">
      <div className="row g-4 align-items-center">
        <div className="col-sm-4 col-md-3">
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
                <Film size={28} className="cb-text-gold" />
              </div>
            )}
          </div>
        </div>

        <div className="col-sm-8 col-md-6">
          <div className="small cb-text-gold fw-semibold mb-1">
            Booking ID: <span className="cb-mono">{booking.bookingId}</span>
          </div>
          <h2 className="h4 fw-bold mb-2">{booking.movieTitle}</h2>
          <div className="d-flex flex-column gap-1 small text-secondary">
            <div className="d-flex align-items-center gap-2">
              <MapPin size={14} className="cb-text-orange flex-shrink-0" />
              <span>
                {booking.theatreName} ({booking.theatreCity}) ·{' '}
                {booking.screenNumber || 'Screen 1'}
              </span>
            </div>
            <div className="d-flex align-items-center gap-3">
              <span className="d-inline-flex align-items-center gap-1 cb-tabular">
                <Calendar size={14} />
                {booking.date}
              </span>
              <span className="d-inline-flex align-items-center gap-1 cb-tabular">
                <Clock size={14} />
                {booking.showtime}
              </span>
            </div>
            <div className="mt-2">
              Seats:{' '}
              <span className="cb-mono fw-bold text-light">{seatLabels}</span>
            </div>
            <div>
              Total Paid:{' '}
              <span className="fw-bold text-light cb-tabular">
                {formatCurrency(booking.totalAmount)}
              </span>
            </div>
            {Number(booking.discountAmount || 0) > 0 && (
              <div className="text-success">
                Coupon Applied ({booking.couponCode}): -
                {formatCurrency(booking.discountAmount)}
              </div>
            )}
          </div>
        </div>

        <div className="col-md-3 text-center">
          <div
            ref={qrRef}
            className="d-inline-block p-2 bg-white rounded-3 mb-2"
          >
            <QRCodeCanvas value={qrPayload} size={130} />
          </div>
          <div className="small text-secondary">Entry QR Pass</div>
        </div>
      </div>

      <div className="cb-ticket-divider mt-4 pt-4 d-flex flex-wrap gap-2 no-print">
        <button
          type="button"
          onClick={handleDownloadPng}
          className="btn cb-btn-primary d-inline-flex align-items-center gap-2"
        >
          <Download size={16} />
          <span>Download Ticket</span>
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="btn cb-btn-outline d-inline-flex align-items-center gap-2"
        >
          <Printer size={16} />
          <span>Print / Save as PDF</span>
        </button>
      </div>
    </div>
  );
}

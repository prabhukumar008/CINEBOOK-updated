import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { formatCurrency } from '../utils/bookingHelpers';

export default function Analytics() {
  const { users } = useAuth();
  const { bookings } = useBooking();

  const confirmedBookings = bookings.filter((b) => b.status === 'Confirmed');
  const cancelledBookings = bookings.filter((b) => b.status === 'Cancelled');

  // Monthly Bookings & Revenue
  const monthlyMap = {};
  for (let i = 0; i < bookings.length; i += 1) {
    const b = bookings[i];
    const dateObj = new Date(b.createdAt || b.date);
    const key = Number.isNaN(dateObj.getTime())
      ? 'Current'
      : dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (!monthlyMap[key]) {
      monthlyMap[key] = { month: key, totalBookings: 0, revenue: 0 };
    }
    monthlyMap[key].totalBookings += 1;
    if (b.status === 'Confirmed') {
      monthlyMap[key].revenue += Number(b.totalAmount || 0);
    }
  }
  const monthlyRows = Object.values(monthlyMap);
  const maxRevenue = Math.max(1, ...monthlyRows.map((m) => m.revenue));

  // Popular Movies
  const movieMap = {};
  for (let i = 0; i < confirmedBookings.length; i += 1) {
    const b = confirmedBookings[i];
    if (!movieMap[b.movieTitle]) {
      movieMap[b.movieTitle] = { title: b.movieTitle, tickets: 0, revenue: 0 };
    }
    movieMap[b.movieTitle].tickets += b.seats.length;
    movieMap[b.movieTitle].revenue += Number(b.totalAmount || 0);
  }
  const popularMovies = Object.values(movieMap).sort(
    (a, b) => b.tickets - a.tickets
  );

  // Theatre Performance
  const theatreMap = {};
  for (let i = 0; i < confirmedBookings.length; i += 1) {
    const b = confirmedBookings[i];
    if (!theatreMap[b.theatreName]) {
      theatreMap[b.theatreName] = {
        name: b.theatreName,
        city: b.theatreCity,
        bookings: 0,
        revenue: 0,
      };
    }
    theatreMap[b.theatreName].bookings += 1;
    theatreMap[b.theatreName].revenue += Number(b.totalAmount || 0);
  }
  const theatreStats = Object.values(theatreMap).sort(
    (a, b) => b.revenue - a.revenue
  );

  return (
    <div>
      <div className="mb-4">
        <h1 className="h2 fw-bold mb-1">Analytics &amp; Performance</h1>
        <p className="text-secondary small mb-0">
          Real-time breakdowns calculated strictly from LocalStorage bookings
          and registered users.
        </p>
      </div>

      <div className="row g-4 mb-4">
        {/* Monthly Revenue */}
        <div className="col-lg-6">
          <div className="cb-card p-4 h-100">
            <h5 className="fw-bold mb-3">Monthly Demo Revenue</h5>
            {monthlyRows.length === 0 ? (
              <p className="small text-secondary mb-0">
                No bookings recorded yet. Complete a booking to see monthly
                trends.
              </p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {monthlyRows.map((row) => (
                  <div key={row.month}>
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="fw-semibold">{row.month}</span>
                      <span className="cb-tabular">
                        {row.totalBookings} booking(s) ·{' '}
                        <strong className="cb-text-gold">
                          {formatCurrency(row.revenue)}
                        </strong>
                      </span>
                    </div>
                    <div
                      className="rounded overflow-hidden"
                      style={{ height: '10px', backgroundColor: '#07090f' }}
                    >
                      <div
                        style={{
                          width: `${Math.max(
                            6,
                            Math.round((row.revenue / maxRevenue) * 100)
                          )}%`,
                          height: '100%',
                          backgroundColor: '#f97316',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Status & User Registrations */}
        <div className="col-lg-6">
          <div className="cb-card p-4 h-100">
            <h5 className="fw-bold mb-3">
              Booking Status &amp; User Registrations
            </h5>
            <div className="row g-3">
              <div className="col-sm-4">
                <div className="p-3 rounded border border-secondary border-opacity-25">
                  <div className="small text-secondary">Confirmed</div>
                  <div className="fs-3 fw-bold text-success cb-tabular">
                    {confirmedBookings.length}
                  </div>
                </div>
              </div>
              <div className="col-sm-4">
                <div className="p-3 rounded border border-secondary border-opacity-25">
                  <div className="small text-secondary">Cancelled</div>
                  <div className="fs-3 fw-bold text-danger cb-tabular">
                    {cancelledBookings.length}
                  </div>
                </div>
              </div>
              <div className="col-sm-4">
                <div className="p-3 rounded border border-secondary border-opacity-25">
                  <div className="small text-secondary">Demo Users</div>
                  <div className="fs-3 fw-bold cb-text-gold cb-tabular">
                    {users.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Movies & Theatre Performance */}
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="cb-card p-4 h-100">
            <h5 className="fw-bold mb-3">Popular Movies (Tickets Sold)</h5>
            {popularMovies.length === 0 ? (
              <p className="small text-secondary mb-0">
                No confirmed ticket sales yet.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark table-sm align-middle mb-0 small">
                  <thead>
                    <tr className="text-secondary">
                      <th>Movie</th>
                      <th>Tickets</th>
                      <th className="text-end">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {popularMovies.map((item) => (
                      <tr key={item.title}>
                        <td className="fw-semibold">{item.title}</td>
                        <td className="cb-tabular">{item.tickets}</td>
                        <td className="text-end cb-tabular cb-text-gold fw-semibold">
                          {formatCurrency(item.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-6">
          <div className="cb-card p-4 h-100">
            <h5 className="fw-bold mb-3">Theatre Performance</h5>
            {theatreStats.length === 0 ? (
              <p className="small text-secondary mb-0">
                No theatre revenue recorded yet.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark table-sm align-middle mb-0 small">
                  <thead>
                    <tr className="text-secondary">
                      <th>Theatre</th>
                      <th>City</th>
                      <th>Bookings</th>
                      <th className="text-end">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {theatreStats.map((t) => (
                      <tr key={t.name}>
                        <td className="fw-semibold">{t.name}</td>
                        <td>{t.city}</td>
                        <td className="cb-tabular">{t.bookings}</td>
                        <td className="text-end cb-tabular cb-text-gold fw-semibold">
                          {formatCurrency(t.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

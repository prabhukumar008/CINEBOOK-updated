import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  CalendarClock,
  CheckCircle2,
  Film,
  IndianRupee,
  Plus,
  Ticket,
  Users,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { formatCurrency } from '../utils/bookingHelpers';

export default function AdminDashboard() {
  const { users } = useAuth();
  const { movies, theatres, shows, bookings } = useBooking();

  const nowShowingCount = movies.filter(
    (m) => m.status === 'Now Showing'
  ).length;
  const upcomingCount = movies.filter((m) => m.status === 'Upcoming').length;
  const confirmedBookings = bookings.filter((b) => b.status === 'Confirmed');
  const cancelledBookings = bookings.filter((b) => b.status === 'Cancelled');
  const totalRevenue = confirmedBookings.reduce(
    (sum, item) => sum + Number(item.totalAmount || 0),
    0
  );

  // Most booked movies computed strictly from LocalStorage bookings
  const movieCountsMap = {};
  for (let i = 0; i < confirmedBookings.length; i += 1) {
    const b = confirmedBookings[i];
    if (!movieCountsMap[b.movieTitle]) {
      movieCountsMap[b.movieTitle] = { title: b.movieTitle, count: 0, revenue: 0 };
    }
    movieCountsMap[b.movieTitle].count += b.seats.length;
    movieCountsMap[b.movieTitle].revenue += Number(b.totalAmount || 0);
  }
  const mostBookedMovies = Object.values(movieCountsMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Monthly bookings & revenue breakdown from actual LocalStorage booking timestamps
  const monthlyStatsMap = {};
  for (let i = 0; i < confirmedBookings.length; i += 1) {
    const b = confirmedBookings[i];
    const dateObj = new Date(b.createdAt || b.date);
    const label = Number.isNaN(dateObj.getTime())
      ? 'Current'
      : dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    if (!monthlyStatsMap[label]) {
      monthlyStatsMap[label] = { label, bookings: 0, revenue: 0 };
    }
    monthlyStatsMap[label].bookings += 1;
    monthlyStatsMap[label].revenue += Number(b.totalAmount || 0);
  }
  const monthlyStats = Object.values(monthlyStatsMap);
  const maxMonthlyRevenue = Math.max(
    1,
    ...monthlyStats.map((m) => m.revenue)
  );

  const statCards = [
    { label: 'Total Movies', value: movies.length, icon: Film },
    { label: 'Now Showing', value: nowShowingCount, icon: Film },
    { label: 'Upcoming Movies', value: upcomingCount, icon: CalendarClock },
    { label: 'Total Theatres', value: theatres.length, icon: Building2 },
    { label: 'Total Shows', value: shows.length, icon: CalendarClock },
    { label: 'Total Users', value: users.length, icon: Users },
    { label: 'Total Bookings', value: bookings.length, icon: Ticket },
    {
      label: 'Confirmed Bookings',
      value: confirmedBookings.length,
      icon: CheckCircle2,
    },
    {
      label: 'Cancelled Bookings',
      value: cancelledBookings.length,
      icon: XCircle,
    },
    {
      label: 'Total Demo Revenue',
      value: formatCurrency(totalRevenue),
      icon: IndianRupee,
      highlight: true,
    },
  ];

  const confirmedPct =
    bookings.length > 0
      ? Math.round((confirmedBookings.length / bookings.length) * 100)
      : 0;
  const cancelledPct = bookings.length > 0 ? 100 - confirmedPct : 0;

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h2 fw-bold mb-1">Admin Overview</h1>
          <p className="text-secondary small mb-0">
            Live metrics calculated directly from LocalStorage records.
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <Link
            to="/admin/movies"
            className="btn btn-sm cb-btn-primary d-inline-flex align-items-center gap-1"
          >
            <Plus size={15} />
            <span>Add Movie</span>
          </Link>
          <Link
            to="/admin/shows"
            className="btn btn-sm cb-btn-outline d-inline-flex align-items-center gap-1"
          >
            <Plus size={15} />
            <span>Schedule Show</span>
          </Link>
          <Link to="/admin/coupons" className="btn btn-sm cb-btn-outline">
            Manage Coupons
          </Link>
        </div>
      </div>

      {/* 10 KPI Stat Cards */}
      <div className="row row-cols-2 row-cols-md-3 row-cols-xl-5 g-3 mb-4">
        {statCards.map((stat) => {
          const IconComp = stat.icon;
          return (
            <div className="col" key={stat.label}>
              <div className="cb-card p-3 h-100">
                <div className="d-flex justify-content-between align-items-center text-secondary small mb-2">
                  <span>{stat.label}</span>
                  <IconComp
                    size={16}
                    className={stat.highlight ? 'cb-text-gold' : 'cb-text-orange'}
                  />
                </div>
                <div
                  className={`fs-4 fw-bold cb-tabular ${
                    stat.highlight ? 'cb-text-gold' : ''
                  }`}
                >
                  {stat.value}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="row g-4 mb-4">
        <div className="col-lg-7">
          <div className="cb-card p-4 h-100">
            <h5 className="fw-bold mb-3">Monthly Demo Revenue &amp; Bookings</h5>
            {monthlyStats.length === 0 ? (
              <div className="text-secondary small py-4">
                No confirmed bookings recorded yet. Create a customer booking to
                populate monthly revenue bars.
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {monthlyStats.map((item) => (
                  <div key={item.label}>
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="fw-semibold">{item.label}</span>
                      <span className="cb-tabular text-secondary">
                        {item.bookings} booking(s) ·{' '}
                        <span className="cb-text-gold fw-semibold">
                          {formatCurrency(item.revenue)}
                        </span>
                      </span>
                    </div>
                    <div
                      className="rounded overflow-hidden"
                      style={{ height: '10px', backgroundColor: '#07090f' }}
                    >
                      <div
                        style={{
                          width: `${Math.max(
                            8,
                            Math.round((item.revenue / maxMonthlyRevenue) * 100)
                          )}%`,
                          height: '100%',
                          background:
                            'linear-gradient(90deg, #e5b95c 0%, #f97316 100%)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-5">
          <div className="cb-card p-4 h-100">
            <h5 className="fw-bold mb-3">Booking Status Distribution</h5>
            {bookings.length === 0 ? (
              <div className="text-secondary small py-4">
                No booking transactions stored in LocalStorage yet.
              </div>
            ) : (
              <div>
                <div className="d-flex justify-content-between small mb-2">
                  <span className="text-success fw-semibold">
                    Confirmed ({confirmedBookings.length})
                  </span>
                  <span className="cb-tabular">{confirmedPct}%</span>
                </div>
                <div
                  className="rounded overflow-hidden mb-3"
                  style={{ height: '12px', backgroundColor: '#07090f' }}
                >
                  <div
                    className="bg-success h-100"
                    style={{ width: `${confirmedPct}%` }}
                  />
                </div>

                <div className="d-flex justify-content-between small mb-2">
                  <span className="text-danger fw-semibold">
                    Cancelled ({cancelledBookings.length})
                  </span>
                  <span className="cb-tabular">{cancelledPct}%</span>
                </div>
                <div
                  className="rounded overflow-hidden"
                  style={{ height: '12px', backgroundColor: '#07090f' }}
                >
                  <div
                    className="bg-danger h-100"
                    style={{ width: `${cancelledPct}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Bookings & Most Booked Movies */}
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="cb-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Recent Bookings</h5>
              <Link
                to="/admin/bookings"
                className="small cb-text-gold text-decoration-none"
              >
                View all
              </Link>
            </div>

            {bookings.length === 0 ? (
              <div className="text-secondary small py-4">
                No customer reservations have been placed yet.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle mb-0 small">
                  <thead>
                    <tr className="text-secondary">
                      <th>ID</th>
                      <th>Customer</th>
                      <th>Movie</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0, 6).map((b) => (
                      <tr key={b.bookingId}>
                        <td className="cb-mono">{b.bookingId}</td>
                        <td>{b.userName}</td>
                        <td className="fw-semibold">{b.movieTitle}</td>
                        <td className="cb-tabular">
                          {formatCurrency(b.totalAmount)}
                        </td>
                        <td>
                          <span
                            className={
                              b.status === 'Cancelled'
                                ? 'text-danger fw-semibold'
                                : 'text-success fw-semibold'
                            }
                          >
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-4">
          <div className="cb-card p-4 h-100">
            <h5 className="fw-bold mb-3">Most Booked Movies</h5>
            {mostBookedMovies.length === 0 ? (
              <div className="text-secondary small py-4">
                Seat sales per movie will appear here after confirmed bookings.
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {mostBookedMovies.map((item) => (
                  <div
                    key={item.title}
                    className="d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-25 pb-2"
                  >
                    <div>
                      <div className="fw-semibold small">{item.title}</div>
                      <div className="small text-secondary cb-tabular">
                        {item.count} seat(s) booked
                      </div>
                    </div>
                    <div className="cb-tabular fw-bold cb-text-gold">
                      {formatCurrency(item.revenue)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Building2,
  CalendarClock,
  ExternalLink,
  Film,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Tag,
  Ticket,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';

const SIDEBAR_LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/movies', label: 'Manage Movies', icon: Film },
  { to: '/admin/theatres', label: 'Manage Theatres', icon: Building2 },
  { to: '/admin/shows', label: 'Manage Shows', icon: CalendarClock },
  { to: '/admin/bookings', label: 'Manage Bookings', icon: Ticket },
  { to: '/admin/users', label: 'Manage Users', icon: Users },
  { to: '/admin/coupons', label: 'Manage Coupons', icon: Tag },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const { currentUser, logout } = useAuth();
  const { settings } = useBooking();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const currentLink =
    SIDEBAR_LINKS.find((item) =>
      item.end
        ? location.pathname === item.to
        : location.pathname.startsWith(item.to)
    ) || SIDEBAR_LINKS[0];

  return (
    <div className="cb-admin-shell d-flex flex-column flex-lg-row">
      {/* Desktop Sidebar */}
      <aside className="cb-admin-sidebar d-none d-lg-flex flex-column p-3 no-print">
        <Link to="/" className="cb-brand px-2 py-2 mb-3">
          <span className="cb-brand-mark" aria-hidden="true">
            <Film size={17} />
          </span>
          <span>{settings.siteName || 'CINEBOOK'}</span>
        </Link>

        <div className="small text-secondary px-2 mb-2">Admin Console</div>

        <nav className="d-flex flex-column gap-1 flex-grow-1">
          {SIDEBAR_LINKS.map((item) => {
            const IconComp = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `cb-admin-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <IconComp size={17} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-top border-secondary border-opacity-25 pt-3 mt-3 d-flex flex-column gap-2">
          <Link
            to="/"
            className="btn btn-sm cb-btn-outline d-inline-flex align-items-center justify-content-center gap-2"
          >
            <ExternalLink size={14} />
            <span>View Storefront</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-sm cb-btn-primary d-inline-flex align-items-center justify-content-center gap-2"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow-1 d-flex flex-column min-w-0">
        {/* Top Admin Header */}
        <header className="cb-navbar px-3 px-md-4 py-3 d-flex justify-content-between align-items-center gap-3 no-print">
          <div className="d-flex align-items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="btn btn-sm cb-btn-outline d-lg-none px-2"
              aria-label="Toggle admin navigation"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div className="small text-secondary">
              <span>Admin</span>
              <span className="mx-2">/</span>
              <span className="text-light fw-semibold">
                {currentLink.label}
              </span>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <span className="small text-secondary d-none sm-inline d-sm-inline">
              {currentUser ? currentUser.email : ''}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-sm cb-btn-outline d-inline-flex align-items-center gap-1 d-lg-none"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Mobile Sidebar Drawer */}
        {sidebarOpen && (
          <div className="d-lg-none p-3 border-bottom border-secondary border-opacity-25 bg-dark no-print">
            <nav className="d-flex flex-column gap-1 mb-3">
              {SIDEBAR_LINKS.map((item) => {
                const IconComp = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `cb-admin-nav-item ${isActive ? 'active' : ''}`
                    }
                  >
                    <IconComp size={17} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
            <Link
              to="/"
              onClick={() => setSidebarOpen(false)}
              className="btn btn-sm cb-btn-outline w-100"
            >
              Back to Storefront
            </Link>
          </div>
        )}

        <main className="flex-grow-1 p-3 p-md-4 p-lg-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

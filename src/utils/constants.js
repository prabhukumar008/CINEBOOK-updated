export const STORAGE_KEYS = {
  USERS: 'cinebook_users',
  CURRENT_USER: 'cinebook_current_user',
  MOVIES: 'cinebook_movies',
  THEATRES: 'cinebook_theatres',
  SHOWS: 'cinebook_shows',
  BOOKINGS: 'cinebook_bookings',
  COUPONS: 'cinebook_coupons',
  WATCHLIST: 'cinebook_watchlist',
  FAVOURITES: 'cinebook_favourites',
  RECENT_MOVIES: 'cinebook_recent_movies',
  SETTINGS: 'cinebook_settings',
  BLOCKED_USERS: 'cinebook_blocked_users',
  SELECTED_CITY: 'cinebook_selected_city',
  DRAFT_BOOKING: 'cinebook_draft_booking',
};

export const CITIES = [
  'Mumbai',
  'Bengaluru',
  'Delhi NCR',
  'Hyderabad',
  'Chennai',
  'Pune',
];

export const GENRES = [
  'All',
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Drama',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Thriller',
];

export const LANGUAGES = [
  'All',
  'English',
  'Hindi',
  'Tamil',
  'Telugu',
  'Japanese',
  'Korean',
];

export const SEAT_PRICES = {
  Platinum: 420,
  Gold: 280,
  Silver: 180,
};

export const CONVENIENCE_FEE_PER_TICKET = 35;
export const MAX_SEATS_PER_BOOKING = 6;

export const DEMO_ADMIN = {
  id: 'admin-1',
  name: 'CineBook Admin',
  email: 'admin@cinebook.com',
  password: 'admin123',
  role: 'admin',
  city: 'Mumbai',
  createdAt: '2026-09-01T10:00:00.000Z',
};

export const DEMO_USER = {
  id: 'user-1',
  name: 'Alex Rivera',
  email: 'alex@cinebook.com',
  password: 'user123',
  role: 'user',
  city: 'Mumbai',
  createdAt: '2026-10-12T14:30:00.000Z',
};

export const INITIAL_COUPONS = [
  {
    id: 'cpn-1',
    code: 'IMAX20',
    discountType: 'percentage',
    discountValue: 20,
    maxDiscount: 160,
    minBookingAmount: 450,
    expiryDate: '2027-12-31',
    isActive: true,
  },
  {
    id: 'cpn-2',
    code: 'CINE100',
    discountType: 'fixed',
    discountValue: 100,
    maxDiscount: 100,
    minBookingAmount: 350,
    expiryDate: '2027-12-31',
    isActive: true,
  },
  {
    id: 'cpn-3',
    code: 'FIRST50',
    discountType: 'fixed',
    discountValue: 50,
    maxDiscount: 50,
    minBookingAmount: 180,
    expiryDate: '2027-12-31',
    isActive: true,
  },
];

export const DEFAULT_SETTINGS = {
  siteName: 'CINEBOOK',
  tagline: 'Luxury Cinema & Box Office Discovery',
  contactEmail: 'concierge@cinebook.demo',
  supportInfo: 'Available daily from 9:00 AM to 11:00 PM IST',
  defaultCity: 'Mumbai',
  convenienceFee: 35,
  themeAccent: 'gold-orange',
};

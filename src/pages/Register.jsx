import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CITIES } from '../utils/constants';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (name.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const result = register({ name, email, password, city });
    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate('/', { replace: true });
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-5">
          <div className="cb-card p-4 p-md-5">
            <h1 className="h3 fw-bold mb-1">Create Demo Account</h1>
            <p className="text-secondary small mb-4">
              Register locally to book movie tickets and manage your passes. Do
              not use real banking or sensitive passwords.
            </p>

            {error && (
              <div
                className="alert alert-danger d-flex align-items-center gap-2 small py-2"
                role="alert"
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small text-secondary">
                  Full Name
                </label>
                <input
                  type="text"
                  className="form-control cb-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Priya Sharma"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small text-secondary">
                  Email Address
                </label>
                <input
                  type="email"
                  className="form-control cb-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="priya@example.com"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small text-secondary">
                  Preferred City
                </label>
                <select
                  className="form-select cb-select"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                >
                  {CITIES.map((cityOption) => (
                    <option key={cityOption} value={cityOption}>
                      {cityOption}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label small text-secondary">
                  Demo Password (min 6 characters)
                </label>
                <input
                  type="password"
                  className="form-control cb-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label small text-secondary">
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="form-control cb-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn cb-btn-primary w-100 d-inline-flex align-items-center justify-content-center gap-2 py-2"
              >
                <UserPlus size={17} />
                <span>Create Account</span>
              </button>
            </form>

            <div className="text-center small text-secondary mt-4">
              Already have a demo account?{' '}
              <Link
                to="/login"
                className="text-danger fw-semibold text-decoration-none"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

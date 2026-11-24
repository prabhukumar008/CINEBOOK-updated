import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DEMO_ADMIN, DEMO_USER } from '../utils/constants';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const redirectTo = (location.state && location.state.from) || '/';
  const infoMessage = location.state && location.state.message;

  function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    const result = login(email, password);
    if (!result.success) {
      setError(result.message);
      return;
    }

    if (result.user.role === 'admin' && redirectTo === '/') {
      navigate('/admin', { replace: true });
    } else {
      navigate(redirectTo, { replace: true });
    }
  }

  function handleDemoLogin(demoAccount) {
    setEmail(demoAccount.email);
    setPassword(demoAccount.password);
    const result = login(demoAccount.email, demoAccount.password);
    if (result.success) {
      if (result.user.role === 'admin' && redirectTo === '/') {
        navigate('/admin', { replace: true });
      } else {
        navigate(redirectTo, { replace: true });
      }
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-5">
          <div className="cb-card p-4 p-md-5">
            <h1 className="h3 fw-bold mb-1">Welcome Back</h1>
            <p className="text-secondary small mb-4">
              Sign in to book seats, view QR tickets, or access the admin
              panel. (Demo LocalStorage Auth)
            </p>

            {infoMessage && (
              <div className="alert alert-info small py-2" role="alert">
                {infoMessage}
              </div>
            )}

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
                  Email Address
                </label>
                <input
                  type="email"
                  className="form-control cb-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label small text-secondary">
                  Password
                </label>
                <input
                  type="password"
                  className="form-control cb-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn cb-btn-primary w-100 d-inline-flex align-items-center justify-content-center gap-2 py-2"
              >
                <LogIn size={17} />
                <span>Sign In</span>
              </button>
            </form>
{ 
            <div className="border-top border-secondary border-opacity-25 mt-4 pt-4">
              <div className="small text-secondary mb-2">
                Quick Demo Access:
              </div>
              <div className="d-flex flex-column flex-sm-row gap-2">
                {/* <button
                  type="button"
                  onClick={() => handleDemoLogin(DEMO_USER)}
                  className="btn btn-sm cb-btn-outline flex-grow-1"
                >
                  Demo User ({DEMO_USER.email})
                </button>  */}
                <button
                  type="button"
                  onClick={() => handleDemoLogin(DEMO_ADMIN)}
                  className="btn btn-sm cb-btn-outline flex-grow-1"
                >
                  Demo Admin ({DEMO_ADMIN.email})
                </button>
              </div>
            </div> }

            <div className="text-center small text-secondary mt-4">
              New to CineBook?{' '}
              <Link
                to="/register"
                className="text-danger fw-semibold text-decoration-none"
              >
                Create a account ?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

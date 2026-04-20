import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import cateringLogo from '../assets/catering-logo.png';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;

      login(token, userData);

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      if (userData.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/user-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    }
  };

  return (
    <div className="login-container">
      <div className="login-shell">
        <div className="showcase-pane">
          <div className="showcase-brand">
            <img src={cateringLogo} alt="Client system logo" className="showcase-logo" />
            <div>
              <p className="brand-kicker">food</p>
              <h1 className="brand-title">Client Feedback System</h1>
            </div>
          </div>

          <div className="showcase-copy">
            <span className="copy-chip">Fresh feedback. Faster decisions.</span>
            <h2>Smart client insights for your food service team.</h2>
            <p>
              Track customer experience, gather comments, and keep your service quality sharp
              from one dashboard.
            </p>
          </div>

          <div className="food-stage" aria-hidden="true">
            <div className="plate plate-pizza"></div>
            <div className="plate plate-burger"></div>
            <div className="plate plate-fries"></div>
            <div className="drink-cup"></div>
          </div>
        </div>

        <div className="form-pane">
          <div className="login-panel">
            <h2 className="form-title">Login</h2>
            <p className="sub-text">
              Sign in to continue managing client feedback.
            </p>

          {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <label className="field-label" htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="text"
                name="email"
                autoComplete="username"
                className="form-control"
                placeholder="username@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <label className="field-label" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                name="password"
                autoComplete="current-password"
                className="form-control"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="form-options">
                <label className="remember-me">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <span className="muted-link">Forgot Password?</span>
              </div>

              <button type="submit" className="btn-submit">
                Sign in
              </button>
            </form>

            <div className="divider">or continue with</div>

            <div className="social-row" aria-hidden="true">
              <span className="social-chip">G</span>
              <span className="social-chip">A</span>
              <span className="social-chip">f</span>
            </div>

            <p className="register-text">
              Don&apos;t have an account yet? <Link to="/register">Register for free</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

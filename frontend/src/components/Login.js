import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginType, setLoginType] = useState('user');
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const { login } = useAuth();
  const imagePaneRef = useRef(null);

  const images = [
    'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (imagePaneRef.current) {
      imagePaneRef.current.style.backgroundImage = `linear-gradient(to bottom, rgba(82, 65, 138, 0.2) 0%, rgba(30, 25, 45, 0.8) 100%), url('${images[currentSlide]}')`;
    }
  }, [currentSlide, images]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;

      // Validate selected login type matches actual role
      if (loginType !== userData.role) {
        setError(`Invalid credentials for ${loginType} login.`);
        return;
      }

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
      <div className="split-card">
        <div className="image-pane" ref={imagePaneRef}>
          <div className="brand-name">CFMS</div>
          <div className="image-content">
            <h3 className="image-title">Client Feedback Management System</h3>
            <p className="image-subtitle">Capturing Moments, Creating Memories</p>
            <div className="slide-indicators">
              {images.map((_, index) => (
                <span
                  key={index}
                  className={`slide-indicator ${currentSlide === index ? 'active' : ''}`}
                ></span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="form-pane">
          <h2 className="form-title">Log in</h2>
          <p className="sub-text">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
          
          {error && <div className="auth-error">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="email"
              autoComplete="username"
              className="form-control"
              placeholder="Email or Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="form-options mb-3">
              <label className="remember-me">
                <input 
                  type="checkbox" 
                  checked={rememberMe} 
                  onChange={(e) => setRememberMe(e.target.checked)} 
                />
                <span className="ms-2">Remember me</span>
              </label>
            </div>
            
            <div className="form-actions">
              <button
                type="button"
                className={`btn ${loginType === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setLoginType('admin')}
              >
                Admin Login
              </button>
              <button
                type="button"
                className={`btn ${loginType === 'user' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setLoginType('user')}
              >
                User Login
              </button>
            </div>
            
            <button type="submit" className="btn btn-primary btn-submit">
              Log in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

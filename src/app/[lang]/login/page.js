'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login attempt:', formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <div className="auth-container">
        <div className="auth-box">
          <div className="auth-header">
            <div className="auth-icon">🛡️</div>
            <h1>Welcome Back</h1>
            <p>Login to your PayShield account</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-link">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="btn btn-primary btn-full">
              Login Securely
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <div className="social-login">
            <button className="btn btn-social">
              <span>🔐</span>
              Continue with Biometric
            </button>
          </div>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link href="/register" className="text-link-bold">
                Sign up for free
              </Link>
            </p>
          </div>

          <div className="security-badge">
            <span className="badge-icon">🔒</span>
            <div className="badge-text">
              <strong>Protected by 7-Layer Security</strong>
              <p>Your login is protected with advanced encryption</p>
            </div>
          </div>
        </div>

        <div className="auth-features">
          <h3>Why Login with PayShield?</h3>
          <div className="feature-list-compact">
            <div className="feature-item-compact">
              <span className="check-icon">✓</span>
              <span>Salt & Pepper encryption</span>
            </div>
            <div className="feature-item-compact">
              <span className="check-icon">✓</span>
              <span>Device DNA verification</span>
            </div>
            <div className="feature-item-compact">
              <span className="check-icon">✓</span>
              <span>Real-time threat detection</span>
            </div>
            <div className="feature-item-compact">
              <span className="check-icon">✓</span>
              <span>Behavioral analytics</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

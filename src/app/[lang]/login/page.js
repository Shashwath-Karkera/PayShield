'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AppIcon from '@/components/AppIcon';

export default function Login() {
  const params = useParams();
  const currentLang = params?.lang || 'en';
  const [dict, setDict] = useState({});
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const loginDict = dict.auth?.login || {};
  const commonDict = dict.common || {};

  useEffect(() => {
    import(`@/i18n/dictionaries/${currentLang}.json`)
      .then((module) => setDict(module.default || {}))
      .catch(() => import('@/i18n/dictionaries/en.json').then((m) => setDict(m.default || {})));
  }, [currentLang]);

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
            <div className="auth-icon"><AppIcon name="shieldCheck" size={24} /></div>
            <h1>{loginDict.title || 'Welcome Back'}</h1>
            <p>{loginDict.subtitle || 'Sign in to access your secure payment workspace.'}</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">{loginDict.emailLabel || 'Email Address'}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={loginDict.emailPlaceholder || 'Enter your email'}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">{loginDict.passwordLabel || 'Password'}</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={loginDict.passwordPlaceholder || 'Enter your password'}
                required
              />
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>{loginDict.rememberMe || 'Remember me'}</span>
              </label>
              <Link href={`/${currentLang}/forgot-password`} className="text-link">
                {loginDict.forgotPassword || 'Forgot password?'}
              </Link>
            </div>

            <button type="submit" className="btn btn-primary btn-full">
              {loginDict.loginButton || 'Login Securely'}
            </button>
          </form>

          <div className="auth-divider">
            <span>{commonDict.or || 'or'}</span>
          </div>

          <div className="social-login">
            <button className="btn btn-social">
              <span><AppIcon name="scan" size={16} /></span>
              {loginDict.continueWithBiometric || 'Continue with biometric verification'}
            </button>
          </div>

          <div className="auth-footer">
            <p>
              {loginDict.noAccount || "Don't have an account?"}{' '}
              <Link href={`/${currentLang}/register`} className="text-link-bold">
                {loginDict.signUpFree || 'Sign up for free'}
              </Link>
            </p>
          </div>

          <div className="security-badge">
            <span className="badge-icon"><AppIcon name="lock" size={16} /></span>
            <div className="badge-text">
              <strong>{loginDict.securityBadgeTitle || 'Protected by 7-Layer Security'}</strong>
              <p>{loginDict.securityBadgeText || 'Session and credential validation run in real time.'}</p>
            </div>
          </div>
        </div>

        <div className="auth-features">
          <h3>{loginDict.whyLoginTitle || 'Why Login with PayShield?'}</h3>
          <div className="feature-list-compact">
            <div className="feature-item-compact">
              <span className="check-icon">✓</span>
              <span>{loginDict.saltPepper || 'Salt & Pepper encryption'}</span>
            </div>
            <div className="feature-item-compact">
              <span className="check-icon">✓</span>
              <span>{loginDict.deviceDNA || 'Device DNA verification'}</span>
            </div>
            <div className="feature-item-compact">
              <span className="check-icon">✓</span>
              <span>{loginDict.threatDetection || 'Real-time threat detection'}</span>
            </div>
            <div className="feature-item-compact">
              <span className="check-icon">✓</span>
              <span>{loginDict.behaviorAnalytics || 'Behavioral analytics'}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

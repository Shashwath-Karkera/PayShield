'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import AppIcon from '@/components/AppIcon';

export default function Navbar({ layoutState = 'default' }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [dict, setDict] = useState({});
  const params = useParams();
  const currentLang = params?.lang || 'en';
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Dynamic import to avoid SSR errors with relative files depending on the caller
    import(`@/i18n/dictionaries/${currentLang}.json`)
      .then((module) => setDict(module.default.navigation || {}))
      .catch(() => import('@/i18n/dictionaries/en.json').then((m) => setDict(m.default.navigation || {})));
  }, [currentLang]);

  useEffect(() => {
    setIsAuthed(Boolean(localStorage.getItem('ps_session_token') || localStorage.getItem('token')));
  }, [pathname]);

  const switchLanguage = (e) => {
    const newLang = e.target.value;
    // Replace the first occurrence of /currentLang with /newLang
    let newPath = pathname.replace(`/${currentLang}`, `/${newLang}`);
    if (newPath === pathname) {
      newPath = `/${newLang}${pathname}`;
    }
    router.push(newPath);
  };

  const handleLogout = () => {
    localStorage.removeItem('ps_session_token');
    localStorage.removeItem('ps_verification_id');
    localStorage.removeItem('ps_user_id');
    localStorage.removeItem('ps_user_email');
    localStorage.removeItem('ps_user_name');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    router.push(`/${currentLang}/login`);
  };

  const showMarketingLinks = layoutState === 'default';
  const showAppLinks = layoutState === 'app';

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link href={`/${currentLang}`} className="logo">
          <span className="logo-icon"><AppIcon name="shieldCheck" size={18} /></span>
          <span className="logo-text">PayShield</span>
        </Link>

        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="hamburger"></span>
          <span className="hamburger"></span>
          <span className="hamburger"></span>
        </button>

        <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {showMarketingLinks ? (
            <>
              <Link href={`/${currentLang}`} onClick={() => setMobileMenuOpen(false)}>{dict.home || 'Home'}</Link>
              <Link href={`/${currentLang}/features`} onClick={() => setMobileMenuOpen(false)}>{dict.features || 'Features'}</Link>
              <Link href={`/${currentLang}/about`} onClick={() => setMobileMenuOpen(false)}>{dict.about || 'About'}</Link>
              <Link href={`/${currentLang}/contact`} onClick={() => setMobileMenuOpen(false)}>{dict.contact || 'Contact'}</Link>
            </>
          ) : null}

          {showAppLinks ? (
            <>
              <Link href={`/${currentLang}/dashboard`} onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
              <Link href={`/${currentLang}/payment`} onClick={() => setMobileMenuOpen(false)}>Payments</Link>
              <Link href={`/${currentLang}/bank-credentials`} onClick={() => setMobileMenuOpen(false)}>Bank Setup</Link>
            </>
          ) : null}
          
          <select value={currentLang} onChange={switchLanguage} style={{ backgroundColor: 'transparent', color: 'inherit', border: '1px solid #ccc', padding: '4px', borderRadius: '4px', cursor: 'pointer', margin: '0 8px' }}>
            <option value="en">Eng</option>
            <option value="hi">हिंदी</option>
            <option value="kn">ಕನ್ನಡ</option>
          </select>

          {isAuthed ? (
            <button
              type="button"
              className="nav-btn login-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <>
              <Link href={`/${currentLang}/login`} className="nav-btn login-btn" onClick={() => setMobileMenuOpen(false)}>
                {dict.login || 'Login'}
              </Link>
              {layoutState !== 'auth' ? (
                <Link href={`/${currentLang}/register`} className="nav-btn register-btn" onClick={() => setMobileMenuOpen(false)}>
                  {dict.register || 'Get Started'}
                </Link>
              ) : null}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

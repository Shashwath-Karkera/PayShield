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
  const pathname = usePathname() || '';
  const router = useRouter();

  useEffect(() => {
    import(`@/i18n/dictionaries/${currentLang}.json`)
      .then((module) => setDict(module.default.navigation || {}))
      .catch(() => import('@/i18n/dictionaries/en.json').then((m) => setDict(m.default.navigation || {})));

    // Set initial auth state
    setIsAuthed(Boolean(localStorage.getItem('ps_session_token') || localStorage.getItem('token')));
    
    // Listen for auth storage changes
    const handleStorageChange = () => {
      setIsAuthed(Boolean(localStorage.getItem('ps_session_token') || localStorage.getItem('token')));
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentLang]);

  // Re-check auth state on pathname change for client-side navigation updates
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
          {showMarketingLinks && !isAuthed ? (
            <>
              <Link href={`/${currentLang}`} onClick={() => setMobileMenuOpen(false)}>{dict.home || 'Home'}</Link>
              <Link href={`/${currentLang}/features`} onClick={() => setMobileMenuOpen(false)}>{dict.features || 'Capabilities'}</Link>
              <Link href={`/${currentLang}/about`} onClick={() => setMobileMenuOpen(false)}>{dict.about || 'Infrastructure'}</Link>
              <Link href={`/${currentLang}/contact`} onClick={() => setMobileMenuOpen(false)}>{dict.contact || 'Support'}</Link>
            </>
          ) : null}

          {isAuthed ? (
            <>
              <Link href={`/${currentLang}/dashboard`} onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
              <Link href={`/${currentLang}/payment`} onClick={() => setMobileMenuOpen(false)}>Transfers</Link>
              <Link href={`/${currentLang}/bank-credentials`} onClick={() => setMobileMenuOpen(false)}>Accounts</Link>
              <Link href={`/${currentLang}/threat`} onClick={() => setMobileMenuOpen(false)}>Threat Monitors</Link>
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
              Log Out Securely
            </button>
          ) : (
            <>
              <Link href={`/${currentLang}/login`} className="nav-btn login-btn" onClick={() => setMobileMenuOpen(false)}>
                {dict.login || 'Sign In'}
              </Link>
              {layoutState !== 'auth' ? (
                <Link href={`/${currentLang}/register`} className="nav-btn register-btn" onClick={() => setMobileMenuOpen(false)}>
                  {dict.register || 'Open Account'}
                </Link>
              ) : null}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

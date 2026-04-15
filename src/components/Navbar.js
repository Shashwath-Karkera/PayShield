'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import AppIcon from '@/components/AppIcon';

import { Search, MapPin } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const switchLanguage = (e) => {
    const newLang = e.target.value;
    // Replace the first occurrence of /currentLang with /newLang
    let newPath = pathname.replace(`/${currentLang}`, `/${newLang}`);
    if (newPath === pathname) {
      newPath = `/${newLang}${pathname}`;
    }
    router.push(newPath);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link href={`/${currentLang}`} className="logo">
          <span className="logo-icon"><AppIcon name="shieldCheck" size={32} /></span>
          <span className="logo-text">PayShield</span>
        </Link>

        {/* E-commerce style Search Bar */}
        <div className="nav-search hidden lg:flex">
          <MapPin size={20} className="text-gray-400" />
          <input type="text" placeholder="Search for threats, metrics, logs..." />
          <Search size={22} className="text-gray-400 ml-2" />
        </div>

        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="hamburger"></span>
          <span className="hamburger"></span>
          <span className="hamburger"></span>
        </button>

        <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link href={`/${currentLang}/threat`} onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
          <Link href={`/${currentLang}/features`} onClick={() => setMobileMenuOpen(false)}>{dict.features || 'Services'}</Link>
          
          <select value={currentLang} onChange={switchLanguage} style={{ backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', margin: '0 8px', fontWeight: '600' }}>
            <option value="en">Eng</option>
            <option value="hi">हिंदी</option>
            <option value="kn">ಕನ್ನಡ</option>
          </select>

          <Link href={`/${currentLang}/login`} className="nav-btn login-btn" onClick={() => setMobileMenuOpen(false)}>
            {dict.login || 'Log in'}
          </Link>
          <Link href={`/${currentLang}/register`} className="nav-btn register-btn" onClick={() => setMobileMenuOpen(false)}>
            {dict.register || 'Sign up'}
          </Link>
        </div>
      </div>
    </nav>
  );
}

'use client';

import Link from 'next/link';
import { useState } from 'react';
import AppIcon from '@/components/AppIcon';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link href="/" className="logo">
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
          <Link href="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link href="/features" onClick={() => setMobileMenuOpen(false)}>Features</Link>
          <Link href="/about" onClick={() => setMobileMenuOpen(false)}>About</Link>
          <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
          <Link href="/login" className="nav-btn login-btn" onClick={() => setMobileMenuOpen(false)}>
            Login
          </Link>
          <Link href="/register" className="nav-btn register-btn" onClick={() => setMobileMenuOpen(false)}>
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

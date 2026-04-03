import Link from 'next/link';
import AppIcon from '@/components/AppIcon';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-section">
            <h3 className="footer-title">
              <span className="logo-icon"><AppIcon name="shieldCheck" size={18} /></span>
              PayShield
            </h3>
            <p className="footer-description">
              Next-generation payment security with multi-layer protection, 
              behavioral analytics, and real-time threat detection.
            </p>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Product</h4>
            <ul className="footer-links">
              <li><Link href="/features">Features</Link></li>
              <li><Link href="/security">Security</Link></li>
              <li><Link href="/register">Sign Up</Link></li>
              <li><Link href="/login">Login</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Company</h4>
            <ul className="footer-links">
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="#">Careers</Link></li>
              <li><Link href="#">Blog</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Legal</h4>
            <ul className="footer-links">
              <li><Link href="#">Privacy Policy</Link></li>
              <li><Link href="#">Terms of Service</Link></li>
              <li><Link href="#">Cookie Policy</Link></li>
              <li><Link href="#">Compliance</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} PayShield. All rights reserved.</p>
          <p>Built with advanced cryptography and AI-powered security</p>
        </div>
      </div>
    </footer>
  );
}

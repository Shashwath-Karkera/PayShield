import Link from 'next/link';
import AppIcon from '@/components/AppIcon';

export default function Footer({ lang = 'en', dict = {}, layoutState = 'default' }) {
  const currentYear = new Date().getFullYear();
  const footer = dict.footer || {};
  const isAuth = layoutState === 'auth';
  const isApp = layoutState === 'app';

  if (isAuth) {
    return (
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-bottom" style={{ borderTop: 'none', paddingTop: 0 }}>
            <p>{footer.copyright || `© ${currentYear} PayShield. All rights reserved.`}</p>
            <p>{footer.builtWith || 'Secure onboarding with multi-factor verification.'}</p>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-section">
            <h3 className="footer-title">
              <span className="logo-icon"><AppIcon name="shieldCheck" size={18} /></span>
              {footer.brand || 'PayShield'}
            </h3>
            <p className="footer-description">
              {footer.brandDesc || 'Next-generation payment security with multi-layer protection, behavioral analytics, and real-time threat detection.'}
            </p>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">{footer.productTitle || 'Product'}</h4>
            <ul className="footer-links">
              {isApp ? (
                <>
                  <li><Link href={`/${lang}/dashboard`}>Dashboard</Link></li>
                  <li><Link href={`/${lang}/payment`}>Payments</Link></li>
                  <li><Link href={`/${lang}/bank-credentials`}>Bank Setup</Link></li>
                  <li><Link href={`/${lang}/security`}>{footer.productSecurity || 'Security'}</Link></li>
                </>
              ) : (
                <>
                  <li><Link href={`/${lang}/features`}>{footer.productFeatures || 'Features'}</Link></li>
                  <li><Link href={`/${lang}/security`}>{footer.productSecurity || 'Security'}</Link></li>
                  <li><Link href={`/${lang}/register`}>{footer.productSignUp || 'Sign Up'}</Link></li>
                  <li><Link href={`/${lang}/login`}>{footer.productLogin || 'Login'}</Link></li>
                </>
              )}
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">{footer.companyTitle || 'Company'}</h4>
            <ul className="footer-links">
              <li><Link href={`/${lang}/about`}>{footer.companyAbout || 'About Us'}</Link></li>
              <li><Link href={`/${lang}/contact`}>{footer.companyContact || 'Contact'}</Link></li>
              <li><Link href="#">{footer.companyCareers || 'Careers'}</Link></li>
              <li><Link href="#">{footer.companyBlog || 'Blog'}</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">{footer.legalTitle || 'Legal'}</h4>
            <ul className="footer-links">
              <li><Link href="#">{footer.legalPrivacy || 'Privacy Policy'}</Link></li>
              <li><Link href="#">{footer.legalTerms || 'Terms of Service'}</Link></li>
              <li><Link href="#">{footer.legalCookie || 'Cookie Policy'}</Link></li>
              <li><Link href="#">{footer.legalCompliance || 'Compliance'}</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>{footer.copyright || `© ${currentYear} PayShield. All rights reserved.`}</p>
          <p>{footer.builtWith || 'Built for secure, modern payment experiences.'}</p>
        </div>
      </div>
    </footer>
  );
}

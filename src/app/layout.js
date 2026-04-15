import './globals.css';

export const metadata = {
  title: 'PayShield | Professional Payment Security',
  description: 'Secure, reliable and professional payments dashboard for modern businesses.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="loader-wrapper">
          <div className="loader-orbital">
            <span className="loader-ring loader-ring-1"></span>
            <span className="loader-ring loader-ring-2"></span>
            <span className="loader-ring loader-ring-3"></span>
            <span className="loader-core">PS</span>
          </div>
        </div>
        <div className="page-transition-enter">
          {/* Your existing context providers or UI wrappers can go here */}
          {children}
        </div>
      </body>
    </html>
  );
}

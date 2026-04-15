export const metadata = {
  title: 'PayShield',
  description: 'Secure Payments Dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Your existing context providers or UI wrappers can go here */}
        {children}
      </body>
    </html>
  );
}

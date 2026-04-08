import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PayShield - Military-Grade Payment Security",
  description: "Next-generation payment security with multi-layer protection, AI-powered behavioral analytics, and real-time threat detection.",
};

export default async function RootLayout(props) {
  // Await the params promise in Next.js 15+ properly before rendering
  const params = await props.params;
  const lang = params?.lang || "en";

  return (
    <html lang={lang}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        <main>
          {props.children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

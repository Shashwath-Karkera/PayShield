import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getDictionary } from "@/i18n/getDictionary";
import ClientLayoutWrapper from "./ClientLayoutWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PayShield | Secure Payments",
  description: "Professional payment operations with a modern blue-first security experience.",
};

export default async function RootLayout(props) {
  const params = await props.params;
  const lang = params?.lang || "en";
  const dict = await getDictionary(lang);

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <ClientLayoutWrapper
        navbar={<Navbar />}
        footer={<Footer lang={lang} dict={dict} />}
      >
        {props.children}
      </ClientLayoutWrapper>
    </div>
  );
}

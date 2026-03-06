import "./globals.css";
import Link from "next/link";
import React from "react";

export const metadata = {
  title: "FinCalc Pro",
  description: "Profesjonalne narzędzia i wiedza finansowa",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body className="bg-gray-900 text-white font-sans">
        {/* 🔝 Nagłówek */}
        <header className="flex justify-between items-center px-8 py-4 bg-[#2b1e17] border-b border-yellow-500 sticky top-0 z-50">
          <div className="flex items-center space-x-4">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 100 100"
                  className="h-16 w-16 rounded-xl border border-orange-500/80 bg-[#2b1e17] p-1"
                >
                  <rect
                    x="2"
                    y="2"
                    width="96"
                    height="96"
                    rx="12"
                    ry="12"
                    stroke="#d98947"
                    strokeWidth="2"
                    fill="#2b1e17"
                  />
                  <path
                    d="M20 55 L50 25 L80 55 Z"
                    fill="#e8cf6b"
                    stroke="#bfa73a"
                    strokeWidth="2"
                  />
                  <path
                    d="M35 60 L50 45 L65 55 L80 35"
                    fill="none"
                    stroke="#ff8c42"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </Link>

            {/* Tekst obok logo */}
            <Link
              href="/"
              className="text-2xl font-bold text-yellow-400 hover:text-yellow-300 transition"
            >
              FinCalc <span className="text-orange-400/90">Pro</span>
            </Link>
          </div>

          {/* Menu */}
          <nav className="space-x-6 text-sm hidden md:flex">
            <Link href="/kalkulatory" className="hover:text-green-400 transition">
              Kalkulatory
            </Link>
            <Link href="/kursy" className="hover:text-green-400 transition">
              Kursy
            </Link>
            <Link href="/centrum-wiedzy" className="hover:text-green-400 transition">
              Centrum Wiedzy
            </Link>
            <Link href="/analizy" className="hover:text-green-400 transition">
              Analizy
            </Link>
            <Link href="#kontakt" className="hover:text-green-400 transition">
              Kontakt
            </Link>
            <Link
              href="#login"
              className="text-orange-400 font-semibold hover:text-orange-300 transition"
            >
              Zaloguj się
            </Link>
          </nav>
        </header>

        {/* 🧭 Główna zawartość */}
        <main>{children}</main>
      </body>
    </html>
  );
}

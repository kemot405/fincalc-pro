import "./globals.css";
import Link from "next/link";
import React from "react";
import MobileMenu from "./MobileMenu";

export const metadata = {
  title: "FinCalc Pro",
  description: "Profesjonalne narzędzia i wiedza finansowa",
};

const menuItems = [
  { label: "Aktualności", href: "/aktualnosci" },
  { label: "Kalkulatory", href: "/kalkulatory" },
  { label: "Kursy", href: "/kursy" },
  { label: "Centrum Wiedzy", href: "/centrum-wiedzy" },
  { label: "Analizy", href: "/analizy" },
  { label: "Dane do modeli", href: "/dane-rynkowe" },
  { label: "FAQ", href: "/faq" },
  { label: "Kontakt", href: "/kontakt" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body className="bg-gray-900 text-white font-sans">
        <header className="flex justify-between items-center px-4 md:px-8 py-4 bg-[#2b1e17] border-b border-yellow-500 sticky top-0 z-50">
          <div className="flex items-center space-x-3 md:space-x-4">
            <Link href="/">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 100 100"
                  className="h-14 w-14 md:h-16 md:w-16 rounded-xl border border-orange-500/80 bg-[#2b1e17] p-1"
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

            <Link
              href="/"
              className="text-2xl md:text-3xl font-bold text-yellow-400 hover:text-yellow-300 transition"
            >
              FinCalc <span style={{ color: "#d98947" }}>Pro</span>
            </Link>
          </div>

          <nav className="space-x-6 text-sm hidden md:flex">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-green-400 transition"
              >
                {item.label}
              </Link>
            ))}

            <Link
              href="#login"
              className="text-orange-400 font-semibold hover:text-orange-300 transition"
            >
              Zaloguj się
            </Link>
          </nav>

          <MobileMenu menuItems={menuItems} />
        </header>

        <main>{children}</main>
      </body>
    </html>
  );
}

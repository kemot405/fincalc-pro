import React from "react";
import Link from "next/link";

export default function KalkulatoryPage() {
  const kalkulatory = [
    {
      title: "Zwrot z inwestycji w nieruchomości",
      desc: "Oblicz rentowność inwestycji i poznaj NPV, ROI, Payback.",
      href: "/kalkulatory/zwrot-inwestycji",
    },
    {
      title: "Kalkulator ROI",
      desc: "Oblicz zwrot z inwestycji w procentach dla dowolnego projektu.",
      href: "#", // Placeholder
    },
    {
      title: "Kalkulator kredytu hipotecznego",
      desc: "Policz ratę miesięczną i całkowity koszt kredytu.",
      href: "#", // Placeholder
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white py-16 px-6 md:px-12">
      <h1 className="text-4xl font-bold text-yellow-400 mb-10 text-center">
        Kalkulatory Finansowe
      </h1>
      <p className="text-gray-300 text-center max-w-2xl mx-auto mb-12">
        Wybierz interesujący Cię kalkulator, aby rozpocząć analizę. Dodajemy nowe narzędzia regularnie!
      </p>

      <div className="grid md:grid-cols-3 gap-8">
        {kalkulatory.map((item, idx) => (
          <div
            key={idx}
            className="bg-[#2b1e17] border border-yellow-500/40 rounded-2xl p-6 hover:scale-[1.02] hover:border-yellow-400 transition-transform duration-300"
          >
            <h3 className="text-2xl font-semibold text-yellow-300 mb-3">
              {item.title}
            </h3>
            <p className="text-gray-300 mb-6">{item.desc}</p>
            <Link
              href={item.href}
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg transition"
            >
              Uruchom
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

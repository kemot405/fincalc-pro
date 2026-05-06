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
      href: "#",
    },
    {
      title: "Kalkulator kredytu hipotecznego",
      desc: "Policz ratę miesięczną i całkowity koszt kredytu.",
      href: "#",
    },
    {
      title: "Kalkulator wartości przyszłej (FV)",
      desc: "Sprawdź ile będzie wart Twój kapitał w przyszłości przy danej stopie zwrotu.",
      href: "#",
    },
    {
      title: "Kalkulator realnej wartości kapitału",
      desc: "Zobacz jak inflacja wpływa na siłę nabywczą Twoich pieniędzy.",
      href: "#",
    },
    {
      title: "Kalkulator progu rentowności",
      desc: "Oblicz kiedy inwestycja zacznie generować zysk netto.",
      href: "#",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white py-16 px-6 md:px-12">
      <h1 className="text-4xl font-bold text-green-200 mb-10 text-center">
        Kalkulatory Finansowe
      </h1>

      <p className="text-gray-300 text-center max-w-2xl mx-auto mb-12">
        Wybierz interesujący Cię kalkulator, aby rozpocząć analizę. Dodajemy nowe narzędzia regularnie!
      </p>

      <div className="grid md:grid-cols-3 gap-8">
        {kalkulatory.map((item, idx) => (
          <div
            key={idx}
            className="rounded-2xl p-6 shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            style={{
              background: "rgba(168,203,176,0.14)",
              border: "1px solid #3f7a59",
            }}
          >
            <h3
              className="text-2xl font-semibold mb-3"
              style={{ color: "#a8cbb0" }}
            >
              {item.title}
            </h3>

            <p className="text-gray-200 mb-6">{item.desc}</p>

            <Link
              href={item.href}
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg transition"
            >
              Uruchom
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-14 flex justify-center">
        <Link
          href="/"
          className="inline-block border border-green-400 text-green-200 hover:bg-green-400/10 font-semibold px-8 py-3 rounded-xl transition"
        >
          Wróć na stronę główną
        </Link>
      </div>
    </div>
  );
}
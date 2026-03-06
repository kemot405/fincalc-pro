import React from "react";
import Link from "next/link";

export default function KursyPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 md:px-12 py-16">
      <h1 className="text-4xl font-bold text-green-200 mb-6">Kursy i szkolenia</h1>
      <p className="text-gray-300 mb-8 max-w-2xl">
        Ucz się od ekspertów — poznaj metody analizy inwestycji, planowania finansowego i oceny ryzyka.
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {["Analiza nieruchomości", "Podstawy inwestowania", "Zrozum IRR i NPV"].map((title, idx) => (
          <div key={idx} className="bg-green-900/20 border border-green-400 rounded-2xl p-6 hover:bg-green-800/30">
            <h3 className="text-xl font-semibold mb-3 text-green-100">{title}</h3>
            <p className="text-gray-300 mb-4">
              Praktyczny materiał, który przeprowadzi Cię krok po kroku przez temat.
            </p>
            <button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 py-2 rounded w-full">
              Zobacz szczegóły
            </button>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <Link href="/" className="text-yellow-400 hover:underline">← Powrót na stronę główną</Link>
      </div>
    </div>
  );
}

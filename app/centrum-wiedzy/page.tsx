import React from "react";
import Link from "next/link";

export default function CentrumWiedzyPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 md:px-12 py-16">
      <h1 className="text-4xl font-bold text-green-200 mb-6">Centrum Wiedzy</h1>
      <p className="text-gray-300 mb-8 max-w-2xl">
        Praktyczne artykuły, analizy i przykłady zastosowań naszych kalkulatorów oraz narzędzi finansowych.
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          "Jak obliczyć zwrot z inwestycji",
          "Co to jest IRR i NPV",
          "5 błędów przy analizie wynajmu"
        ].map((title, idx) => (
          <div key={idx} className="bg-green-900/20 border border-green-400 rounded-2xl p-6 hover:bg-green-800/30">
            <h3 className="text-xl font-semibold mb-3 text-green-100">{title}</h3>
            <p className="text-gray-300 mb-4">Dowiedz się, jak wykorzystać kalkulatory FinCalc Pro w praktyce.</p>
            <button className="border border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white px-4 py-2 rounded w-full">
              Czytaj artykuł
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

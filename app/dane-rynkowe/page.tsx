import React from "react";

export default function DaneRynkowePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-16">
      <h1 className="text-3xl font-bold text-green-200 mb-6">
        Dane rynkowe
      </h1>

      <p className="text-gray-300 max-w-3xl">
        W tej sekcji będą prezentowane dane rynkowe wykorzystywane przez
        kalkulatory FinCalc Pro, takie jak inflacja, stopy procentowe,
        stopa wolna od ryzyka oraz prognozy zmian wartości nieruchomości.
      </p>
    </div>
  );
}
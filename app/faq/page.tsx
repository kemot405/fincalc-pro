"use client";

import React, { useState } from "react";
import Link from "next/link";

type FaqItem = {
  question: string;
  answer: string;
};

type FaqCategory = {
  title: string;
  items: FaqItem[];
};

const faqCategories: FaqCategory[] = [
  {
    title: "Kalkulatory",
    items: [
      {
        question: "Do czego służą kalkulatory FinCalc Pro?",
        answer:
          "Kalkulatory pomagają szybko ocenić opłacalność inwestycji, porównać różne warianty i sprawdzić, jak na wynik wpływają koszty, podatki, inflacja oraz założenia dotyczące przychodów.",
      },
      {
        question: "Czy wyniki z kalkulatorów są prognozą inwestycyjną?",
        answer:
          "Nie. Wyniki są modelem obliczeniowym opartym na danych wprowadzonych przez użytkownika oraz założeniach zapisanych w bazie strony. Nie są gwarancją przyszłych wyników ani rekomendacją inwestycyjną.",
      },
      {
        question: "Dlaczego wynik może się zmieniać po zmianie jednego pola?",
        answer:
          "Kalkulatory są ze sobą logicznie powiązane. Zmiana przychodów, kosztów, podatku, okresu inwestycji albo stopy wzrostu wartości aktywa wpływa na przepływy, okres zwrotu i końcowy wynik inwestycji.",
      },
    ],
  },
  {
    title: "Dane do modeli",
    items: [
      {
        question: "Skąd pochodzą dane używane w modelach?",
        answer:
          "Dane domyślne mogą pochodzić z publicznych źródeł, takich jak NBP, GUS, dane o obligacjach skarbowych oraz ręcznie przygotowane prognozy zapisane w bazie strony. Każdy kalkulator może korzystać z tych danych jako wartości startowych.",
      },
      {
        question: "Czy użytkownik może zmienić wartości domyślne?",
        answer:
          "Tak. Pola z wartościami domyślnymi są tylko punktem startowym. Użytkownik może je zmienić, jeśli chce zastosować własne założenia do analizy.",
      },
      {
        question: "Dlaczego prognozy na wiele lat są tylko szacunkiem?",
        answer:
          "Długoterminowe prognozy inflacji, stóp procentowych czy cen nieruchomości są niepewne. Dlatego modele powinny być traktowane jako narzędzie do analizy scenariuszy, a nie jako pewna prognoza przyszłości.",
      },
    ],
  },
  {
    title: "Wyniki i wskaźniki",
    items: [
      {
        question: "Czym jest okres zwrotu?",
        answer:
          "Okres zwrotu pokazuje, po ilu latach suma zysków z inwestycji przewyższy początkowe nakłady. W zależności od kalkulatora może uwzględniać przepływy z najmu, zmianę wartości aktywa oraz reinwestowanie zysków.",
      },
      {
        question: "Czym jest stopa zwrotu / inflacja?",
        answer:
          "To porównanie średniej rocznej stopy zwrotu inwestycji ze średnią inflacją przyjętą w modelu. Pomaga sprawdzić, czy inwestycja potencjalnie chroni kapitał przed utratą siły nabywczej.",
      },
      {
        question: "Dlaczego zysk netto i stopa zwrotu mogą pokazywać różne rzeczy?",
        answer:
          "Zysk netto pokazuje kwotę w złotówkach, a stopa zwrotu pokazuje relację tego zysku do zainwestowanego kapitału. Dwie inwestycje mogą mieć podobny zysk, ale zupełnie inną efektywność kapitału.",
      },
    ],
  },
  {
    title: "Podatki",
    items: [
      {
        question: "Czy kalkulatory uwzględniają podatki?",
        answer:
          "Tak, wybrane kalkulatory uwzględniają podatki według uproszczonych zasad zapisanych w modelu. Mogą to być m.in. ryczałt, zasady ogólne, podatek liniowy lub podatek Belki.",
      },
      {
        question: "Czy obliczenia podatkowe są poradą podatkową?",
        answer:
          "Nie. Obliczenia podatkowe mają charakter pomocniczy i uproszczony. Przed podjęciem decyzji warto skonsultować szczegóły z księgowym lub doradcą podatkowym.",
      },
    ],
  },
  {
    title: "Rozwój strony",
    items: [
      {
        question: "Czy będą dodawane kolejne kalkulatory?",
        answer:
          "Tak. FinCalc Pro jest rozwijany etapami. Planowane są kolejne narzędzia do analizy inwestycji, porównywania scenariuszy, danych rynkowych i decyzji finansowych.",
      },
      {
        question: "Czy mogę zaproponować nowy kalkulator?",
        answer:
          "Tak. Jeśli masz pomysł na kalkulator lub funkcję, możesz wysłać wiadomość przez kontakt. Najciekawsze propozycje będą brane pod uwagę przy dalszym rozwoju strony.",
      },
    ],
  },
];

export default function FaqPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-16">
      <section className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="mb-3 inline-flex items-center rounded-full border border-yellow-600/40 bg-yellow-400/10 px-4 py-1 text-sm font-semibold text-yellow-300">
            Pomoc i odpowiedzi
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-green-200 mb-6">
            FAQ FinCalc <span style={{ color: "#d98947" }}>Pro</span>
          </h1>

          <p className="text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Znajdziesz tutaj odpowiedzi na najczęstsze pytania dotyczące
            kalkulatorów, danych do modeli, sposobu liczenia wyników oraz
            rozwoju strony.
          </p>
        </div>

        <div className="space-y-8">
          {faqCategories.map((category, categoryIndex) => (
            <div
              key={category.title}
              className="rounded-2xl border border-yellow-600/30 bg-[#34241b] p-6 shadow-lg"
            >
              <h2 className="text-2xl font-semibold text-yellow-300 mb-5">
                {category.title}
              </h2>

              <div className="space-y-3">
                {category.items.map((item, itemIndex) => {
                  const key = `${categoryIndex}-${itemIndex}`;
                  const isOpen = openItems[key];

                  return (
                    <div
                      key={item.question}
                      className="rounded-xl border border-green-400/40 bg-green-900/20 overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => toggleItem(key)}
                        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-green-800/20 transition"
                      >
                        <span className="font-semibold text-green-100">
                          {item.question}
                        </span>
                        <span className="text-orange-400 font-bold text-xl">
                          {isOpen ? "−" : "+"}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-5 text-gray-300 leading-relaxed">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-green-400/40 bg-green-900/20 p-6 text-center">
          <h2 className="text-2xl font-semibold text-green-200 mb-3">
            Nie znalazłeś odpowiedzi?
          </h2>
          <p className="text-gray-300 mb-6">
            Napisz wiadomość z pytaniem lub zaproponuj nowy kalkulator.
          </p>

          <Link
  href="/kontakt"
  className="inline-block rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 transition"
>
  Napisz wiadomość
</Link>
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/"
            className="inline-block rounded-xl border border-green-400 px-8 py-3 font-semibold text-green-200 transition hover:bg-green-400/10"
          >
            Powrót do strony głównej
          </Link>
        </div>
      </section>
    </div>
  );
}
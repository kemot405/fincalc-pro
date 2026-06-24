import React from "react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-800 text-white font-sans">
      {/* HERO SECTION */}
      <section className="flex flex-col items-center justify-center text-center py-24 bg-gradient-to-b from-gray-900 to-gray-800">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-green-200">
          Zyskaj przewagę finansową dzięki FinCalc{" "}
          <span style={{ color: "#d98947" }}>Pro</span>
        </h2>
        <p className="text-gray-300 mb-8 max-w-xl">
          Profesjonalne kalkulatory inwestycyjne, praktyczne kursy i centrum
          wiedzy dla każdego, kto chce inwestować mądrze
        </p>
      </section>

      {/* 🔹 SEKCJA: NAWIGACYJNA */}
      <section className="px-6 md:px-12 -mt-10 bg-gray-900 py-12">
        <div className="rounded-2xl border border-green-400/60 p-6 md:p-8">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Aktualności",
                link: "/aktualnosci",
                desc: "Sprawdź, nad czym pracujemy, jakie kalkulatory są w budowie i jak rozwija się FinCalc Pro.",
              },
              {
                title: "Kalkulatory inwestycyjne",
                link: "/kalkulatory",
                desc: "Uruchom nasze najpopularniejsze kalkulatory w kilku kliknięciach.",
              },
              {
                title: "Centrum wiedzy",
                link: "/centrum-wiedzy",
                desc: "Artykuły, case study i przykłady wykorzystania kalkulatorów w realnych analizach.",
              },
            ].map((item, idx) => (
              <Link
                key={idx}
                href={item.link}
                className="block rounded-2xl p-6 shadow-md transition duration-300 bg-green-900/20 border border-[#3f7a59] hover:bg-green-800/30 hover:border-green-300"
              >
                <h3
                  className="text-xl font-semibold mb-2"
                  style={{ color: "#a8cbb0" }}
                >
                  {item.title}
                </h3>
                <p className="text-gray-200">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 🔹 SEKCJA: Kalkulatory */}
      <section id="kalkulatory" className="py-16 px-6 md:px-12 bg-gray-850">
        <h3 className="text-3xl font-semibold text-green-200 mb-8 text-center">
          Kalkulatory
        </h3>

        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {[
            {
              title: "Analiza stopy zwrotu z inwestycji w najem",
              link: "/kalkulatory/zwrot-inwestycji",
              desc: "Policz NPV, IRR, MIRR, ROI, okres zwrotu i porównaj wynik inwestycji z inflacją",
              cta: "Uruchom",
              special: false,
            },
            {
              title: "Zaawansowany kalkulator do porównywania kilku inwestycji",
              link: "/kalkulatory/porownanie-inwestycji",
              desc: "Porównaj za pomocą naszego modelu kilka inwestycji zanim podejmiesz decyzję",
              cta: "Uruchom",
              special: false,
            },
            {
              title: "Zobacz wszystkie kalkulatory",
              link: "/kalkulatory",
              desc: "Przejdź do pełnej listy narzędzi inwestycyjnych i wybierz kalkulator dopasowany do swojej analizy",
              cta: ">> Przeglądaj wszystkie kalkulatory",
              special: true,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className={
                item.special
                  ? "bg-green-900/20 border border-yellow-600 rounded-2xl p-6 hover:bg-green-800/30 hover:border-yellow-500 transition flex flex-col h-full"
                  : "bg-green-900/20 border border-green-400 rounded-2xl p-6 hover:bg-green-800/30 transition flex flex-col h-full"
              }
            >
              <h4
                className="text-lg font-semibold mb-2"
                style={{
                  color: item.special ? "#8eac96" : "#a8cbb0",
                }}
              >
                {item.title}
              </h4>

              <p className="text-gray-300 mb-4 text-sm line-clamp-2">
                {item.desc}
              </p>

              <div className="mt-auto">
                <Link href={item.link}>
                  <span
                    className={
                      item.special
                        ? "font-semibold cursor-pointer transition text-red-400 hover:text-red-300"
                        : "text-orange-400 hover:text-orange-300 font-semibold cursor-pointer transition"
                    }
                  >
                    {item.cta} →
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 🔹 SEKCJA: Kursy */}
      <section id="kursy" className="py-16 px-6 md:px-12 bg-gray-900">
        <h3 className="text-3xl font-semibold text-green-200 mb-8 text-center">
          Kursy
        </h3>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Kurs - Excel praktyczny",
              link: "/kursy/excel-praktyczny",
              desc: "Opanuj arkusze kalkulacyjne, aby efektywnie analizować inwestycje.",
            },
            {
              title: "Podstawy inwestowania",
              link: "/kursy/podstawy-inwestowania",
              desc: "Zrozum kluczowe pojęcia i strategie, które pomogą Ci bezpiecznie inwestować.",
            },
            {
              title: "Zrozum IRR i NPV",
              link: "/kursy/irr-npv",
              desc: "Dowiedz się, jak interpretować wskaźniki rentowności inwestycji krok po kroku.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-green-900/20 border border-green-400 rounded-2xl p-6 hover:bg-green-800/30 transition flex flex-col h-full"
            >
              <h4 className="text-xl font-semibold mb-3 text-green-100">
                {item.title}
              </h4>
              <p className="text-gray-300 mb-4">{item.desc}</p>
              <div className="mt-auto">
                <Link href={item.link}>
                  <span className="text-orange-400 hover:text-orange-300 font-semibold cursor-pointer transition">
                    Przejdź do kursu →
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 🔹 SEKCJA: Centrum wiedzy */}
      <section id="wiedza" className="py-16 px-6 md:px-12 bg-gray-850">
        <h3 className="text-3xl font-semibold text-green-200 mb-8 text-center">
          Centrum Wiedzy
        </h3>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Jak obliczyć zwrot z inwestycji",
              link: "/centrum-wiedzy/zwrot-inwestycji",
              desc: "Poznaj przykłady obliczeń i interpretacji wyników ROI w praktyce.",
            },
            {
              title: "Co to jest IRR i NPV",
              link: "/centrum-wiedzy/irr-npv",
              desc: "Dowiedz się, jak mierzyć opłacalność projektów inwestycyjnych.",
            },
            {
              title: "5 błędów przy analizie wynajmu",
              link: "/centrum-wiedzy/bledy-wynajem",
              desc: "Uniknij najczęstszych pułapek początkujących inwestorów.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-green-900/20 border border-green-400 rounded-2xl p-6 hover:bg-green-800/30 transition flex flex-col h-full"
            >
              <h4 className="text-xl font-semibold mb-3 text-green-100">
                {item.title}
              </h4>
              <p className="text-gray-300 mb-4">{item.desc}</p>
              <div className="mt-auto">
                <Link href={item.link}>
                  <span className="text-orange-400 hover:text-orange-300 font-medium cursor-pointer transition">
                    Czytaj więcej →
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center bg-gradient-to-t from-brown-800 to-gray-900 border-t border-yellow-500">
        <h3 className="text-3xl font-semibold text-green-200 mb-6">
          Otrzymaj pełny dostęp do wszystkich kalkulatorów, kursów i materiałów
          FinCalc Pro
        </h3>

        <div className="flex justify-center">
          <Link
            href="/system-transakcyjny"
            className="block rounded-2xl px-5 py-3 shadow-md transition duration-300 bg-green-900/20 border border-[#3f7a59] hover:bg-green-800/30 hover:border-green-300 w-full max-w-sm"
          >
            <span className="block text-white text-lg md:text-xl font-semibold text-center">
              Kup pełny dostęp
            </span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brown-800 text-gray-200 text-sm py-8 px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p>
            © {new Date().getFullYear()} FinCalc Pro. Wszelkie prawa
            zastrzeżone.
          </p>

          <div className="space-x-4">
            <a href="#" className="hover:text-yellow-400">
              Polityka prywatności
            </a>
            <a href="#" className="hover:text-yellow-400">
              Regulamin
            </a>
            <a href="#" className="hover:text-yellow-400">
              Kontakt
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
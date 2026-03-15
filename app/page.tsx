import React from "react";
import Link from "next/link";

// Uniwersalny przycisk
function Button({
  children,
  className,
  variant,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: string;
}) {
  if (variant === "outline") {
    return (
      <button className={`px-4 py-2 rounded border transition ${className}`}>
        {children}
      </button>
    );
  }
  return (
    <button className={`px-4 py-2 rounded transition ${className}`}>
      {children}
    </button>
  );
}

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

        {/* 🔥 USUNIĘTE PRZYCISKI */}
      </section>

      {/* 🔹 SEKCJA: Szybkie narzędzia / Nauka / Centrum wiedzy */}
      <section className="px-6 md:px-12 -mt-10 bg-gray-900 py-12">
        <div className="rounded-2xl border border-green-400/60 p-6 md:p-8">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Szybkie narzędzia",
                link: "/kalkulatory",
                desc: "Uruchom nasze najpopularniejsze kalkulatory w kilku kliknięciach.",
              },
              {
                title: "Nauka i kursy",
                link: "/kursy",
                desc: "Praktyczne kursy i materiały przygotowane przez praktyków rynku finansowego.",
              },
              {
                title: "Centrum wiedzy",
                link: "/centrum-wiedzy",
                desc: "Artykuły, case study i przykłady wykorzystania kalkulatorów w realnych analizach.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl p-6 shadow-md"
                style={{
                  background: "rgba(168,203,176,0.14)",
                  border: "1px solid #3f7a59",
                }}
              >
                <Link href={item.link}>
                  <h3
                    className="text-xl font-semibold mb-2 hover:text-orange-400 transition cursor-pointer"
                    style={{ color: "#a8cbb0" }}
                  >
                    {item.title}
                  </h3>
                </Link>
                <p className="text-gray-200">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🔹 SEKCJA: Kalkulatory */}
      <section id="kalkulatory" className="py-16 px-6 md:px-12 bg-gray-850">
        <h3 className="text-3xl font-semibold text-green-200 mb-8 text-center">
          Kalkulatory
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Prognozowanie stopy zwrotu z inwestycji w wynajem",
              link: "/kalkulatory/zwrot-inwestycji",
              desc: "Oblicz realny zwrot z wynajmu, uwzględniając koszty zakupu, remontu i przychody miesięczne.",
            },
            {
              title: "Zaawansowany kalkulator do porównywania kilku inwestycji",
              link: "/kalkulatory/porownanie-inwestycji",
              desc: "Porównuj i analizuj kilka inwestycji zanim wydasz pieniądze.",
            },
            {
              title:
                "Model optymalizacji stopy zwrotu przy różnym udziale finansowania kapitałem obcym",
              link: "/kalkulatory/optymalizacja-kapital-obcy",
              desc: "Sprawdź, przy jakim udziale kapitału obcego inwestycja daje największy zysk.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-green-900/20 border border-green-400 rounded-2xl p-4 hover:bg-green-800/30 transition"
            >
              <h4 className="text-lg font-semibold mb-2 text-white">
                {item.title}
              </h4>
              <p className="text-gray-300 mb-3 text-sm">{item.desc}</p>
              <Link href={item.link}>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white w-full text-sm py-2">
                  Uruchom
                </Button>
              </Link>
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
              className="bg-green-900/20 border border-green-400 rounded-2xl p-6 hover:bg-green-800/30 transition"
            >
              <h4 className="text-xl font-semibold mb-3 text-green-100">
                {item.title}
              </h4>
              <p className="text-gray-300 mb-4">{item.desc}</p>
              <Link href={item.link}>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white w-full">
                  Przejdź do kursu
                </Button>
              </Link>
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
              className="bg-green-900/20 border border-green-400 rounded-2xl p-6 hover:bg-green-800/30 transition"
            >
              <h4 className="text-xl font-semibold mb-3 text-green-100">
                {item.title}
              </h4>
              <p className="text-gray-300 mb-4">{item.desc}</p>
              <Link href={item.link}>
                <span className="text-orange-400 hover:text-orange-300 font-medium cursor-pointer transition">
                  Czytaj więcej →
                </span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA – ZMIENIONE WG TWOJEJ PROŚBY */}
      <section className="py-16 text-center bg-gradient-to-t from-brown-800 to-gray-900 border-t border-yellow-500">

        {/* 🔥 NOWY TEKST — DUŻA CZCIONKA I TEN SAM KOLOR CO „ZYSKAJ DOŻYWOTNI DOSTĘP” */}
        <h3 className="text-3xl font-semibold text-green-200 mb-6">
          Otrzymaj pełny dostęp do wszystkich kalkulatorów, kursów i materiałów FinCalc Pro
        </h3>

        {/* 🔥 NOWY PRZYCISK */}
        <Button className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-4 rounded-xl">
          Kup pełny dostęp
        </Button>
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

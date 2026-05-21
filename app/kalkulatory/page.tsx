import React from "react";
import Link from "next/link";

export default function KalkulatoryPage() {
  const kalkulatory = [
    {
      title: "Zysk z inwestycji",
      desc: "Oblicz zysk z Twojej inwestycji, rentowność, okres zwrotu nakładów oraz porównaj wyniki z inflacją - kalkulator najlepiej sprawdza się dla wynajmu, ale można analizować też inne projekty",
      href: "/kalkulatory/zwrot-inwestycji",
      free: true,
    },
    {
      title: "Kalkulator wartości przyszłej - lokaty, depozyty",
      desc: "Sprawdź ile otrzymasz z lokaty bankowej, obligacji lub innych papierów depozytowych",
      href: "/kalkulatory/kalkulator-wartosci-przyszlej",
      free: true,
    },
    {
      title: "Zaawansowany kalkulator do porównywania kilku inwestycji",
      desc: "Zaawansowany model porównujący do 6 inwestycji jednocześnie z analizą wartości końcowej, stopy zwrotu i okresu zwrotu",
      href: "/kalkulatory/porownanie-inwestycji",
      free: false,
},
    {
      title: "Maskymalizuj wartość końcową inwestycji wspomagjąc się kapitałem obcym",
      desc: "Zbadaj jaki udział kapitału obcego zapewni Ci największą wartość końcową inwestycji ",
      href: "#",
    },
    {
      title: "Oblicz zysk z wynajmu krótkoterminowego",
      desc: "Analizuj jaki możesz osiągnąć zysk z wynajmu krótkoterminowego zmieniając różne parametry",
      href: "#",
    },
    {
      title: "Kalkulator decyzyjny kredyt czy leasing",
      desc: "Potrzebujesz sfinansować zakup auta, maszyny lub urządzenia i nie wiesz, co Ci się bardziej opłaca kredyt czy leasing - znajdź odpowiedzi",
      href: "#",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white py-16 px-6 md:px-12">
      <h1 className="text-4xl font-bold text-green-200 mb-10 text-center">
        Kalkulatory Finansowe
      </h1>

      <p className="text-gray-300 text-center max-w-2xl mx-auto mb-12">
        Wybierz interesujący Cię kalkulator, aby rozpocząć analizę
      </p>

      <div className="grid md:grid-cols-3 gap-8">
        {kalkulatory.map((item, idx) => (
          <div
            key={idx}
            className="rounded-2xl p-6 shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col"
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

            <p className="text-gray-200 mb-6 flex-grow">
              {item.desc}
            </p>

            <div className="flex items-center justify-between mt-auto">
              <Link
                href={item.href}
                className="
                  inline-flex items-center justify-center
                  px-6 py-2 rounded-lg
                  font-semibold text-green-100
                  transition duration-200
                  border
                "
                style={{
                  borderColor: "#3f7a59",
                  background: "rgba(168,203,176,0.12)",
                }}
              >
                Uruchom
              </Link>

              {item.free && (
                <span
                  className="text-sm font-semibold tracking-wide"
                  style={{ color: "#ff6b6b" }}
                >
                  &gt;&gt; dostęp bezpłatny
                </span>
              )}
            </div>
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
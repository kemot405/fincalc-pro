import Link from "next/link";

export default function AktualnosciPage() {
  const updates = [
    {
      date: "Lipiec 2025",
      title: "Rozbudowa kalkulatorów inwestycyjnych",
      content:
        "Trwają prace nad nowymi kalkulatorami wspierającymi analizę inwestycji, nieruchomości oraz działalności gospodarczej.",
    },
    {
      date: "Lipiec 2025",
      title: "Rozwój danych rynkowych",
      content:
        "Rozszerzamy bazę danych o prognozy inflacji, stóp procentowych, cen nieruchomości oraz innych wskaźników wykorzystywanych w modelach.",
    },
    {
      date: "W przygotowaniu",
      title: "Raporty PDF",
      content:
        "Planowane jest rozszerzenie eksportu PDF o bardziej szczegółowe raporty zawierające wykresy, tabele oraz interpretację wyników.",
    },
    {
      date: "W przygotowaniu",
      title: "Konta użytkowników",
      content:
        "W przyszłości użytkownicy będą mogli zapisywać swoje analizy, wyniki oraz korzystać z dodatkowych funkcji premium.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="mb-3 inline-flex items-center rounded-full border border-yellow-600/40 bg-yellow-400/10 px-4 py-1 text-sm font-semibold text-yellow-300">
            Aktualności FinCalc Pro
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-green-200 mb-6">
            Aktualności i rozwój projektu
          </h1>

          <p className="text-gray-300 max-w-3xl mx-auto leading-relaxed">
            W tym miejscu publikowane są informacje o nowych funkcjach,
            planowanych kalkulatorach, zmianach w modelach oraz dalszym
            rozwoju platformy FinCalc Pro.
          </p>
        </div>

        <div className="space-y-6">
          {updates.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-yellow-600/30 bg-[#34241b] p-6 shadow-lg"
            >
              <div className="text-sm text-yellow-300 mb-2">
                {item.date}
              </div>

              <h2 className="text-2xl font-semibold text-green-200 mb-3">
                {item.title}
              </h2>

              <p className="text-gray-300 leading-relaxed">
                {item.content}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-green-500/30 bg-green-900/20 p-8">
          <h2 className="text-2xl font-semibold text-green-200 mb-4">
            O projekcie FinCalc Pro
          </h2>

          <p className="text-gray-300 leading-relaxed">
            FinCalc Pro powstaje jako platforma wspierająca podejmowanie
            decyzji finansowych i inwestycyjnych. Celem projektu jest
            dostarczenie praktycznych narzędzi pozwalających szybko
            analizować inwestycje, działalność gospodarczą oraz różne
            scenariusze finansowe.
          </p>
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/"
            className="inline-block rounded-xl border border-green-400 px-8 py-3 font-semibold text-green-200 transition hover:bg-green-400/10"
          >
            Powrót do strony głównej
          </Link>
        </div>
      </div>
    </div>
  );
}


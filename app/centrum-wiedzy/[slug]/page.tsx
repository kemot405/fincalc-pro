import { notFound } from "next/navigation";

const articles = [
  {
    slug: "jak-obliczyc-npv-w-praktyce",
    title: "Jak obliczyć NPV w praktyce",
    content: `
      <p>Wartość bieżąca netto (NPV) to jedno z kluczowych narzędzi analizy inwestycji.</p>
      <p>Aby ją obliczyć, należy zsumować wszystkie przyszłe przepływy pieniężne zdyskontowane do wartości dzisiejszej i odjąć koszt początkowy inwestycji.</p>
      <p>Jeśli NPV > 0, inwestycja jest opłacalna.</p>
    `,
  },
  {
    slug: "porownanie-wskaznikow-irr-roi",
    title: "Porównanie wskaźników IRR i ROI",
    content: `
      <p>ROI (Return on Investment) to prosty wskaźnik zyskowności, IRR (Internal Rate of Return) uwzględnia czas wartości pieniądza.</p>
      <p>IRR jest bardziej precyzyjny w analizie długoterminowych projektów inwestycyjnych.</p>
    `,
  },
  {
    slug: "jak-wyznaczyc-okres-zwrotu-inwestycji",
    title: "Jak wyznaczyć okres zwrotu inwestycji (PB)",
    content: `
      <p>Okres zwrotu (Payback Period) określa, po ilu latach odzyskasz zainwestowany kapitał.</p>
      <p>To proste, ale mało dokładne narzędzie, bo nie uwzględnia wartości pieniądza w czasie.</p>
    `,
  },
];

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = articles.find((a) => a.slug === params.slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-green-400">{article?.title}</h1>
        <article
          className="prose prose-invert prose-green"
          dangerouslySetInnerHTML={{ __html: article?.content || "" }}
        />
      </div>
    </main>
  );
}

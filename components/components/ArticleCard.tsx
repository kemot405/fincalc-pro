"use client";
import Link from "next/link";

interface ArticleCardProps {
  title: string;
  excerpt: string;
  slug: string;
}

export default function ArticleCard({ title, excerpt, slug }: ArticleCardProps) {
  return (
    <div className="bg-[#1a1a1a] text-white rounded-2xl p-6 shadow-md hover:shadow-xl transition">
      <h3 className="text-xl font-semibold mb-3 text-green-400">{title}</h3>
      <p className="text-gray-300 mb-4">{excerpt}</p>
      <Link
        href={`/centrum-wiedzy/${slug}`}
        className="text-orange-400 hover:underline"
      >
        Czytaj więcej →
      </Link>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";

export default function KontaktPage() {
  const [form, setForm] = useState({
    email: "",
    subject: "",
    message: "",
  });

  const mailtoHref = `mailto:alchemiadzialania@gmail.com?subject=${encodeURIComponent(
    form.subject
  )}&body=${encodeURIComponent(
    `E-mail nadawcy: ${form.email}\n\n${form.message}`
  )}`;

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center rounded-full border border-yellow-600/40 bg-yellow-400/10 px-4 py-1 text-sm font-semibold text-yellow-300">
            Formularz kontaktowy
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-green-200 mb-4">
            Kontakt z FinCalc <span style={{ color: "#d98947" }}>Pro</span>
          </h1>

          <p className="text-gray-300 leading-relaxed">
            Masz pytanie, sugestię lub pomysł na nowy kalkulator? Wypełnij
            formularz, a wiadomość zostanie przygotowana do wysłania na adres
            FinCalc Pro.
          </p>
        </div>

        <div className="rounded-2xl border border-yellow-600/30 bg-[#34241b] p-8 shadow-lg">
          <div className="mb-5">
            <label className="block mb-2 text-yellow-200 font-semibold">
              Twój adres e-mail
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, email: e.target.value }))
              }
              className="w-full rounded-lg border border-yellow-700/25 bg-[#eef1f4] px-4 py-3 text-black font-semibold"
              placeholder="twoj@email.pl"
            />
          </div>

          <div className="mb-5">
            <label className="block mb-2 text-yellow-200 font-semibold">
              Temat
            </label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, subject: e.target.value }))
              }
              className="w-full rounded-lg border border-yellow-700/25 bg-[#eef1f4] px-4 py-3 text-black font-semibold"
              placeholder="Temat wiadomości"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-yellow-200 font-semibold">
              Wiadomość
            </label>
            <textarea
              rows={8}
              value={form.message}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, message: e.target.value }))
              }
              className="w-full rounded-lg border border-yellow-700/25 bg-[#eef1f4] px-4 py-3 text-black font-semibold"
              placeholder="Treść wiadomości..."
            />
          </div>

          <a
            href={mailtoHref}
            className="inline-block w-full rounded-xl bg-green-600 hover:bg-green-700 px-8 py-3 text-center font-semibold text-white transition"
          >
            Wyślij wiadomość
          </a>
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/faq"
            className="inline-block rounded-xl border border-green-400 px-8 py-3 font-semibold text-green-200 transition hover:bg-green-400/10"
          >
            Powrót do FAQ
          </Link>
        </div>
      </div>
    </div>
  );
}
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Proste zamienniki komponentów Card i Button
const Card = ({ children, className }: any) => (
  <div className={`rounded-2xl shadow-md ${className}`}>{children}</div>
);

const CardContent = ({ children }: any) => (
  <div className="p-4">{children}</div>
);

const Button = ({ children, onClick, className }: any) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg font-semibold transition ${className}`}
  >
    {children}
  </button>
);


// Typ danych wejściowych
type InvestmentInputs = {
  purchasePrice: number;
  rent: number;
  costs: number;
  loan: number;
  interestRate: number;
  years: number;
};

// Typ danych wynikowych dla tabeli
type YearlyResult = {
  year: number;
  cashflow: number;
  cumulative: number;
};

// Komponent KPI
type KpiProps = {
  label: string;
  value: string | number;
  subtitle?: string;
};

const Kpi: React.FC<KpiProps> = ({ label, value, subtitle }) => {
  return (
    <div className="flex flex-col items-start p-4 bg-[#1d2b1d] rounded-2xl shadow-md w-full border border-yellow-600/30">
      <span className="text-sm text-gray-300">{label}</span>
      <span className="text-2xl font-bold text-yellow-400">{value}</span>
      {subtitle && <div className="text-sm text-gray-400">{subtitle}</div>}
    </div>
  );
};

export default function ZwrotInwestycji() {
  const [inputs, setInputs] = useState<InvestmentInputs>({
    purchasePrice: 500000,
    rent: 3000,
    costs: 800,
    loan: 400000,
    interestRate: 5,
    years: 10,
  });

  const [results, setResults] = useState<YearlyResult[]>([]);
  const [kpis, setKpis] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs({
      ...inputs,
      [e.target.name]: parseFloat(e.target.value),
    });
  };

  const calculate = () => {
    const yearlyResults: YearlyResult[] = [];
    let cumulative = 0;

    for (let year = 1; year <= inputs.years; year++) {
      const annualIncome = inputs.rent * 12;
      const annualCosts = inputs.costs * 12;
      const cashflow =
        annualIncome - annualCosts - inputs.loan * (inputs.interestRate / 100);
      cumulative += cashflow;

      yearlyResults.push({
        year,
        cashflow,
        cumulative,
      });
    }

    setResults(yearlyResults);

    setKpis({
      npv: cumulative - inputs.purchasePrice,
      irr: "—",
      mirr: "—",
      pb:
        yearlyResults.find((r) => r.cumulative > inputs.purchasePrice)?.year ||
        "—",
      roi: ((cumulative / inputs.purchasePrice) * 100).toFixed(1) + "%",
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <motion.h1
        className="text-3xl font-bold mb-6 text-center text-yellow-400"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Kalkulator do prognozowania stopy zwrotu z Inwestycji
      </motion.h1>

      {/* Formularz + wykres i tabela */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Panel boczny */}
        <Card className="bg-[#2b1e17] rounded-2xl p-6 shadow-lg border border-yellow-600/30">
          <CardContent>
            <div className="flex flex-col gap-3">
              {Object.entries(inputs).map(([key, value]) => (
                <input
                  key={key}
                  type="number"
                  name={key}
                  value={value}
                  onChange={handleChange}
                  placeholder={key}
                  className="p-2 border border-yellow-700/40 rounded-md bg-[#fefce8] text-black text-sm"
                />
              ))}
            </div>
            <Button
              onClick={calculate}
              className="mt-4 bg-green-600 hover:bg-green-700 w-full"
            >
              Oblicz
            </Button>
          </CardContent>
        </Card>

        {/* Tabela i wykres */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {kpis && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-2">
              <Kpi label="NPV" value={kpis.npv} />
              <Kpi label="IRR" value={kpis.irr} />
              <Kpi label="MIRR" value={kpis.mirr} />
              <Kpi label="Payback" value={kpis.pb} subtitle="lat" />
              <Kpi label="ROI" value={kpis.roi} />
            </div>
          )}

          {results.length > 0 && (
            <>
              <Card className="bg-[#2b1e17] rounded-2xl p-6 border border-yellow-600/30">
                <CardContent>
                  <table className="w-full text-left border-collapse text-white text-sm">
                    <thead>
                      <tr className="border-b border-yellow-500">
                        <th className="p-2">Rok</th>
                        <th className="p-2">Cashflow</th>
                        <th className="p-2">Skumulowany</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r) => (
                        <tr
                          key={r.year}
                          className="border-b border-gray-700 text-white"
                        >
                          <td className="p-2">{r.year}</td>
                          <td className="p-2">{r.cashflow.toFixed(0)}</td>
                          <td className="p-2">{r.cumulative.toFixed(0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              <Card className="bg-[#2b1e17] rounded-2xl p-6 border border-yellow-600/30">
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={results}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffaa00" />
                      <XAxis
                        dataKey="year"
                        stroke="#fff"
                        tick={{ fill: "#fff" }}
                      />
                      <YAxis stroke="#fff" tick={{ fill: "#fff" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#333",
                          color: "#fff",
                        }}
                      />
                      <Legend wrapperStyle={{ color: "#fff" }} />
                      <Line
                        type="monotone"
                        dataKey="cashflow"
                        stroke="#ff9900"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="cumulative"
                        stroke="#00cc66"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

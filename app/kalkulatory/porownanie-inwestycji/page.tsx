"use client";

import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  LabelList,
  Tooltip,
} from "recharts";

const MAX_INVESTMENTS = 6;

const Card = ({ children, className }: any) => (
  <div className={`rounded-2xl shadow-md ${className}`}>{children}</div>
);

const CardContent = ({ children }: any) => <div className="p-4">{children}</div>;

const Button = ({ children, onClick, className, disabled }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);

type InvestmentInput = {
  id: number;
  name: string;
  investmentValue: number;
  riskFreeRate: number;
  propertyGrowthRate: number;
  years: number;
  monthlyRevenue: number;
  monthlyCosts: number;
  taxRate: number;
  reinvestedPercent: number;
  acquisitionCostPercent: number;
  exitCostPercent: number;
};

type InvestmentRow = {
  year: number;
  investmentId: number;
  investmentName: string;
  netCashflow: number;
  cumulativeCashflow: number;
  assetValue: number;
  reinvestedPortfolioValue: number;
  reinvestedPrincipal: number;
  reinvestmentGain: number;
  totalGain: number;
  finalValue: number;
  returnPercent: number;
};

type InvestmentResult = {
  id: number;
  name: string;
  initialOutlay: number;
  finalValue: number;
  totalGain: number;
  returnPercent: number;
  avgAnnualReturn: number;
  paybackYear: number | null;
  yearlyRows: InvestmentRow[];
};

const investmentColors = [
  "#00cc66",
  "#66ccff",
  "#ffaa00",
  "#ff5c5c",
  "#c084fc",
  "#f472b6",
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatShortCurrency(value: number): string {
  return `${new Intl.NumberFormat("pl-PL", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)} zł`;
}

function formatPercent(value: number, digits = 2): string {
  return `${value.toFixed(digits)}%`;
}

function formatShortPercent(value: number): string {
  return `${Number(value).toFixed(1)}%`;
}

function parseLocalizedNumber(value: string): number | null {
  const cleaned = value.replace(/\s/g, "").replace(",", ".");
  if (cleaned === "" || cleaned === "-" || cleaned === "." || cleaned === "-.") {
    return null;
  }
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatLocalizedNumber(value: number): string {
  const hasDecimals = !Number.isInteger(value);
  return new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  }).format(value);
}

function shouldShowLabel(index: number, dataLength: number) {
  if (dataLength <= 6) return true;
  if (dataLength <= 12) return index % 2 === 0 || index === dataLength - 1;
  return index % 5 === 0 || index === dataLength - 1;
}

function CustomBarCurrencyLabel({ x, y, width, value, index, dataLength }: any) {
  if (value === null || value === undefined || !shouldShowLabel(index, dataLength)) return null;

  return (
    <text
      x={x + width / 2}
      y={y - 6}
      fill="#f9fafb"
      fontSize={11}
      fontWeight={700}
      textAnchor="middle"
    >
      {formatShortCurrency(Number(value))}
    </text>
  );
}

function CustomBarPercentLabel({ x, y, width, value, index, dataLength }: any) {
  if (value === null || value === undefined || !shouldShowLabel(index, dataLength)) return null;

  return (
    <text
      x={x + width / 2}
      y={y - 6}
      fill="#f9fafb"
      fontSize={11}
      fontWeight={700}
      textAnchor="middle"
    >
      {formatShortPercent(Number(value))}
    </text>
  );
}

function CustomBarYearsLabel({ x, y, width, value, index, dataLength }: any) {
  if (value === null || value === undefined || !shouldShowLabel(index, dataLength)) return null;

  return (
    <text
      x={x + width / 2}
      y={y - 6}
      fill="#f9fafb"
      fontSize={11}
      fontWeight={700}
      textAnchor="middle"
    >
      {Number(value) > 0 ? `${Number(value).toFixed(0)} lat` : "—"}
    </text>
  );
}

function CustomLineLabel({ x, y, value, index, dataLength }: any) {
  if (value === null || value === undefined || !shouldShowLabel(index, dataLength)) return null;

  return (
    <text
      x={x}
      y={y - 10}
      fill="#f9fafb"
      fontSize={10}
      fontWeight={700}
      textAnchor="middle"
    >
      {formatShortCurrency(Number(value))}
    </text>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-xl border border-green-300 bg-gray-200 px-4 py-3 text-sm font-semibold text-black shadow-xl">
      <div className="mb-2 text-base font-bold">{label}</div>
      <div className="flex flex-col gap-1">
        {payload.map((item: any, index: number) => {
          const key = String(item.dataKey);
          const isPercent = key.includes("Percent") || key.includes("return");
          const isYears = key.includes("payback");
          return (
            <div key={index} className="flex items-center justify-between gap-4">
              <span>{item.name}</span>
              <span className="font-bold">
                {isYears
                  ? Number(item.value) > 0
                    ? `${Number(item.value).toFixed(0)} lat`
                    : "—"
                  : isPercent
                    ? formatPercent(Number(item.value))
                    : formatCurrency(Number(item.value))}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InfoHint({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement | null>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        event.target instanceof Node &&
        !wrapperRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <span ref={wrapperRef} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-5 w-5 items-center justify-center rounded-full bg-[#cfe8c9] text-[12px] font-bold text-black hover:bg-[#bddbb7] transition"
        aria-label="Pokaż opis"
      >
        ?
      </button>
      {open && (
        <div className="absolute right-0 top-7 z-30 w-80 rounded-xl border border-green-700/30 bg-[#cfe8c9] px-4 py-3 text-left text-sm text-black shadow-xl leading-relaxed">
          {text}
        </div>
      )}
    </span>
  );
}

function KpiBox({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="relative flex flex-col items-start p-4 bg-[#243424] rounded-2xl shadow-md w-full border border-yellow-600/30">
      <div className="absolute right-3 top-3">
        <InfoHint text={hint} />
      </div>
      <span className="text-sm text-gray-300 pr-8">{label}</span>
      <span className="text-2xl font-bold text-yellow-400">{value}</span>
    </div>
  );
}

function createDefaultInvestment(id: number): InvestmentInput {
  return {
    id,
    name: `Inwestycja ${id}`,
    investmentValue: 500000,
    riskFreeRate: 5,
    propertyGrowthRate: 4.5,
    years: 10,
    monthlyRevenue: 3000,
    monthlyCosts: 800,
    taxRate: 8.5,
    reinvestedPercent: 100,
    acquisitionCostPercent: 3,
    exitCostPercent: 2,
  };
}

function calculateInvestment(input: InvestmentInput): InvestmentResult {
  const years = Math.min(Math.max(Math.floor(input.years), 1), 40);
  const investmentValue = Math.max(input.investmentValue, 0);
  const acquisitionCost = investmentValue * (Math.max(input.acquisitionCostPercent, 0) / 100);
  const initialOutlay = investmentValue + acquisitionCost;
  const annualRevenue = input.monthlyRevenue * 12;
  const annualCosts = input.monthlyCosts * 12;
  const taxRate = Math.max(input.taxRate, 0) / 100;
  const reinvestedShare = Math.min(Math.max(input.reinvestedPercent / 100, 0), 1);
  const belkaTaxRate = 0.19;
  const reinvestRateAfterTax = (Math.max(input.riskFreeRate, 0) / 100) * (1 - belkaTaxRate);
  const growthRate = input.propertyGrowthRate / 100;
  const exitCostPercent = Math.max(input.exitCostPercent, 0) / 100;

  const yearlyRows: InvestmentRow[] = [];
  let cumulativeCashflow = 0;
  let assetValue = investmentValue;
  let reinvestedPortfolioValue = 0;
  let reinvestedPrincipal = 0;
  let paybackYear: number | null = null;

  for (let year = 1; year <= years; year++) {
    const taxableProfit = annualRevenue - annualCosts;
    const operatingTax = taxableProfit > 0 ? taxableProfit * taxRate : 0;
    const netCashflow = taxableProfit - operatingTax;

    cumulativeCashflow += netCashflow;
    assetValue = assetValue * (1 + growthRate);
    reinvestedPortfolioValue = reinvestedPortfolioValue * (1 + reinvestRateAfterTax);

    const reinvestedAmount = netCashflow > 0 ? netCashflow * reinvestedShare : 0;
    reinvestedPortfolioValue += reinvestedAmount;
    reinvestedPrincipal += reinvestedAmount;

    const reinvestmentGain = reinvestedPortfolioValue - reinvestedPrincipal;
    const saleCost = assetValue * exitCostPercent;
    const netAssetValue = assetValue - saleCost;
    const finalValue = netAssetValue + cumulativeCashflow + reinvestmentGain;
    const totalGain = finalValue - initialOutlay;
    const returnPercent = initialOutlay > 0 ? (totalGain / initialOutlay) * 100 : 0;

    if (paybackYear === null && totalGain >= initialOutlay) {
      paybackYear = year;
    }

    yearlyRows.push({
      year,
      investmentId: input.id,
      investmentName: input.name,
      netCashflow,
      cumulativeCashflow,
      assetValue: netAssetValue,
      reinvestedPortfolioValue,
      reinvestedPrincipal,
      reinvestmentGain,
      totalGain,
      finalValue,
      returnPercent,
    });
  }

  const finalRow = yearlyRows[yearlyRows.length - 1];
  const finalValue = finalRow?.finalValue ?? initialOutlay;
  const totalGain = finalValue - initialOutlay;
  const returnPercent = initialOutlay > 0 ? (totalGain / initialOutlay) * 100 : 0;
  const avgAnnualReturn =
    initialOutlay > 0 && finalValue > 0
      ? (Math.pow(finalValue / initialOutlay, 1 / years) - 1) * 100
      : 0;

  return {
    id: input.id,
    name: input.name,
    initialOutlay,
    finalValue,
    totalGain,
    returnPercent,
    avgAnnualReturn,
    paybackYear,
    yearlyRows,
  };
}

export default function PorownanieInwestycjiPremium() {
  const reportRef = useRef<HTMLDivElement | null>(null);
  const [investments, setInvestments] = useState<InvestmentInput[]>([createDefaultInvestment(1)]);
  const [inputValues, setInputValues] = useState<Record<string, string>>(() => {
    const first = createDefaultInvestment(1);
    return Object.fromEntries(
      Object.entries(first).map(([key, value]) => [
        `1.${key}`,
        typeof value === "number" ? formatLocalizedNumber(value) : String(value),
      ])
    );
  });
  const [expandedPanels, setExpandedPanels] = useState<Record<number, boolean>>({ 1: true });
  const [calculated, setCalculated] = useState(false);

  const results = useMemo(() => investments.map(calculateInvestment), [investments]);

  const bestFinalValue = useMemo(() => {
    if (!results.length) return null;
    return results.reduce((best, item) => (item.finalValue > best.finalValue ? item : best), results[0]);
  }, [results]);

  const bestReturn = useMemo(() => {
    if (!results.length) return null;
    return results.reduce((best, item) => (item.returnPercent > best.returnPercent ? item : best), results[0]);
  }, [results]);

  const fastestPayback = useMemo(() => {
    const withPayback = results.filter((item) => item.paybackYear !== null);
    if (!withPayback.length) return null;
    return withPayback.reduce((best, item) =>
      Number(item.paybackYear) < Number(best.paybackYear) ? item : best
    );
  }, [results]);

  const comparisonData = useMemo(
    () =>
      results.map((result) => ({
        name: result.name,
        finalValue: result.finalValue,
        returnPercent: result.returnPercent,
        paybackYear: result.paybackYear ?? 0,
        avgAnnualReturn: result.avgAnnualReturn,
      })),
    [results]
  );

  const trendData = useMemo(() => {
    const maxYears = Math.max(...results.map((result) => result.yearlyRows.length), 1);
    return Array.from({ length: maxYears }, (_, index) => {
      const year = index + 1;
      const row: Record<string, number | string> = { year };
      results.forEach((result) => {
        const yearRow = result.yearlyRows.find((item) => item.year === year);
        row[result.name] = yearRow?.finalValue ?? null as any;
      });
      return row;
    });
  }, [results]);

  const inputConfig = [
    {
      key: "investmentValue",
      label: "Wartość inwestycji / aktywa (zł)",
      hint: "Cena lub wartość początkowa aktywa, projektu albo inwestycji.",
    },
    {
      key: "riskFreeRate",
      label: "Stopa wolna od ryzyka (%)",
      hint: "Stopa używana do oprocentowania reinwestowanych przepływów. W modelu zysk z reinwestycji liczony jest po podatku Belki 19%.",
    },
    {
      key: "propertyGrowthRate",
      label: "Roczna zmiana wartości aktywa (%)",
      hint: "Zakładany średnioroczny wzrost lub spadek wartości inwestycji.",
    },
    {
      key: "years",
      label: "Okres inwestycji (lata)",
      hint: "Okres analizy. Maksymalnie 40 lat dla czytelności wykresów.",
    },
    {
      key: "monthlyRevenue",
      label: "Przychody miesięczne (zł)",
      hint: "Średnie miesięczne wpływy generowane przez inwestycję.",
    },
    {
      key: "monthlyCosts",
      label: "Koszty miesięczne (zł)",
      hint: "Średnie miesięczne koszty operacyjne związane z inwestycją.",
    },
    {
      key: "taxRate",
      label: "Podatek od dochodu operacyjnego (%)",
      hint: "Stawka podatku od dodatniego wyniku operacyjnego: przychody minus koszty.",
    },
    {
      key: "reinvestedPercent",
      label: "Procent reinwestowanych przepływów (%)",
      hint: "Część dodatnich przepływów, która ma być reinwestowana według stopy wolnej od ryzyka po podatku Belki.",
    },
    {
      key: "acquisitionCostPercent",
      label: "Koszty wejścia / zakupu (%)",
      hint: "Dodatkowe koszty ponoszone na starcie, np. prowizja, PCC, notariusz, opłata przygotowawcza, koszty transakcyjne.",
    },
    {
      key: "exitCostPercent",
      label: "Koszty wyjścia / sprzedaży (%)",
      hint: "Koszty ponoszone przy zakończeniu inwestycji, np. prowizja sprzedaży, opłaty, koszty transakcyjne.",
    },
  ] as const;

  const updateInvestment = (id: number, key: keyof InvestmentInput, value: string) => {
    setInputValues((prev) => ({ ...prev, [`${id}.${key}`]: value }));

    setInvestments((prev) =>
      prev.map((investment) => {
        if (investment.id !== id) return investment;

        if (key === "name") {
          return { ...investment, name: value };
        }

        const parsed = parseLocalizedNumber(value);
        return { ...investment, [key]: parsed ?? 0 };
      })
    );

    setCalculated(false);
  };

  const handleBlur = (id: number, key: keyof InvestmentInput) => {
    if (key === "name") return;
    const investment = investments.find((item) => item.id === id);
    if (!investment) return;
    const currentValue = investment[key];
    if (typeof currentValue !== "number") return;

    setInputValues((prev) => ({
      ...prev,
      [`${id}.${key}`]: formatLocalizedNumber(currentValue),
    }));
  };

  const addInvestment = () => {
    if (investments.length >= MAX_INVESTMENTS) return;

    const nextId = Math.max(...investments.map((item) => item.id)) + 1;
    const newInvestment = createDefaultInvestment(nextId);

    setInvestments((prev) => [...prev, newInvestment]);
    setExpandedPanels((prev) => ({ ...prev, [nextId]: true }));
    setInputValues((prev) => ({
      ...prev,
      ...Object.fromEntries(
        Object.entries(newInvestment).map(([key, value]) => [
          `${nextId}.${key}`,
          typeof value === "number" ? formatLocalizedNumber(value) : String(value),
        ])
      ),
    }));
    setCalculated(false);
  };

  const removeInvestment = (id: number) => {
    if (investments.length === 1) return;
    setInvestments((prev) => prev.filter((item) => item.id !== id));
    setCalculated(false);
  };

  const togglePanel = (id: number) => {
    setExpandedPanels((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;

    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");

    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      backgroundColor: "#111827",
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save("porownanie-inwestycji-premium-fincalc-pro.pdf");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div ref={reportRef}>
        <div className="relative mb-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mb-3 inline-flex items-center rounded-full border border-yellow-600/40 bg-yellow-400/10 px-4 py-1 text-sm font-semibold text-yellow-300">
              Kalkulator premium dla inwestora
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 flex items-center justify-center gap-2">
              Porównanie do 6 inwestycji
              <InfoHint text="Model pozwala zestawić kilka inwestycji według tych samych parametrów: wartość końcowa, stopa zwrotu, okres zwrotu oraz trend wartości w czasie." />
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-gray-300 leading-relaxed">
              Zmieniaj parametry każdej inwestycji, dodawaj kolejne warianty i porównuj, który projekt daje najlepszy wynik finansowy w czasie.
            </p>
          </motion.div>

          <button
            type="button"
            onClick={handleDownloadPdf}
            className="absolute right-0 top-0 hidden md:flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-500 transition"
          >
            <span className="text-xs font-bold">PDF</span>
            <span>Eksport</span>
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_1.85fr] gap-6">
          <Card className="bg-[#34241b] rounded-2xl p-6 shadow-lg border border-yellow-600/30">
            <CardContent>
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-yellow-300">Dane inwestycji</h2>
                  <p className="text-sm text-gray-300">
                    Dodaj od 1 do 6 wariantów inwestycyjnych.
                  </p>
                </div>
                <Button
                  onClick={addInvestment}
                  disabled={investments.length >= MAX_INVESTMENTS}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  + Dodaj
                </Button>
              </div>

              <div className="flex flex-col gap-4">
                {investments.map((investment, investmentIndex) => (
                  <div
                    key={investment.id}
                    className="rounded-2xl border border-yellow-600/30 bg-gray-900/25 overflow-hidden"
                  >
                    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-[#243424]">
                      <button
                        type="button"
                        onClick={() => togglePanel(investment.id)}
                        className="flex items-center gap-3 text-left"
                      >
                        <span
                          className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-black"
                          style={{ backgroundColor: investmentColors[investmentIndex] }}
                        >
                          {investmentIndex + 1}
                        </span>
                        <span>
                          <span className="block text-sm text-gray-300">Wariant</span>
                          <span className="block font-bold text-yellow-300">{investment.name}</span>
                        </span>
                      </button>

                      <div className="flex items-center gap-2">
                        {investments.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeInvestment(investment.id)}
                            className="rounded-lg border border-red-400/40 px-3 py-1 text-sm font-semibold text-red-200 hover:bg-red-400/10 transition"
                          >
                            Usuń
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => togglePanel(investment.id)}
                          className="rounded-lg bg-gray-600 px-3 py-1 text-sm font-semibold text-white hover:bg-gray-500 transition"
                        >
                          {expandedPanels[investment.id] ? "Zwiń" : "Rozwiń"}
                        </button>
                      </div>
                    </div>

                    {expandedPanels[investment.id] && (
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative pt-1 md:col-span-2">
                          <label className="text-sm text-yellow-200 leading-tight">
                            Nazwa inwestycji
                          </label>
                          <input
                            type="text"
                            value={investment.name}
                            onChange={(e) => updateInvestment(investment.id, "name", e.target.value)}
                            className="mt-1 w-full px-3 py-1.5 border border-yellow-700/25 rounded-md bg-[#eef1f4] text-black text-lg font-semibold"
                          />
                        </div>

                        {inputConfig.map((field) => (
                          <div key={field.key} className="relative pt-1">
                            <div className="absolute right-2 -top-[3px]">
                              <InfoHint text={field.hint} />
                            </div>
                            <label className="text-sm text-yellow-200 pr-8 leading-tight block">
                              {field.label}
                            </label>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={inputValues[`${investment.id}.${field.key}`] ?? ""}
                              onChange={(e) =>
                                updateInvestment(
                                  investment.id,
                                  field.key as keyof InvestmentInput,
                                  e.target.value
                                )
                              }
                              onBlur={() => handleBlur(investment.id, field.key as keyof InvestmentInput)}
                              className={`mt-1 w-full px-3 py-1.5 border border-yellow-700/25 rounded-md text-black text-lg font-semibold ${
                                ["riskFreeRate", "propertyGrowthRate", "taxRate"].includes(field.key)
                                  ? "bg-[#b8c1cc]"
                                  : "bg-[#eef1f4]"
                              }`}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Button
                onClick={() => setCalculated(true)}
                className="mt-5 bg-green-600 hover:bg-green-700 w-full"
              >
                Porównaj inwestycje
              </Button>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6">
            {calculated && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <KpiBox
                    label="Najwyższa wartość końcowa"
                    value={bestFinalValue ? `${bestFinalValue.name}: ${formatCurrency(bestFinalValue.finalValue)}` : "—"}
                    hint="Inwestycja z najwyższą końcową wartością modelową po uwzględnieniu przepływów, wzrostu wartości aktywa, reinwestycji oraz kosztów wyjścia."
                  />
                  <KpiBox
                    label="Najwyższa stopa zwrotu"
                    value={bestReturn ? `${bestReturn.name}: ${formatPercent(bestReturn.returnPercent)}` : "—"}
                    hint="Inwestycja z najwyższym całkowitym wynikiem procentowym względem nakładu początkowego wraz z kosztami wejścia."
                  />
                  <KpiBox
                    label="Najszybszy okres zwrotu"
                    value={fastestPayback ? `${fastestPayback.name}: ${fastestPayback.paybackYear} lat` : "Brak zwrotu"}
                    hint="Pierwszy rok, w którym zysk modelowy osiąga lub przekracza początkowy nakład inwestycyjny."
                  />
                </div>

                <Card className="bg-[#3c2a20] rounded-2xl p-6 border border-yellow-600/30">
                  <CardContent>
                    <h3 className="text-lg font-semibold text-yellow-300 mb-4">
                      Porównanie wartości końcowej inwestycji
                    </h3>
                    <ResponsiveContainer width="100%" height={330}>
                      <BarChart data={comparisonData} margin={{ top: 34, right: 20, left: 0, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffaa00" />
                        <Tooltip content={<CustomTooltip />} />
                        <XAxis dataKey="name" stroke="#fff" tick={{ fill: "#fff", fontSize: 12 }} />
                        <YAxis stroke="#fff" tick={{ fill: "#fff", fontSize: 12 }} />
                        <Legend wrapperStyle={{ color: "#fff", fontSize: 12 }} />
                        <Bar dataKey="finalValue" fill="#66ccff" name="Wartość końcowa">
                          <LabelList
                            content={(props) => (
                              <CustomBarCurrencyLabel {...props} dataLength={comparisonData.length} />
                            )}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-[#3c2a20] rounded-2xl p-6 border border-yellow-600/30">
                  <CardContent>
                    <h3 className="text-lg font-semibold text-yellow-300 mb-4">
                      Porównanie wyniku procentowego
                    </h3>
                    <ResponsiveContainer width="100%" height={330}>
                      <BarChart data={comparisonData} margin={{ top: 34, right: 20, left: 0, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffaa00" />
                        <Tooltip content={<CustomTooltip />} />
                        <XAxis dataKey="name" stroke="#fff" tick={{ fill: "#fff", fontSize: 12 }} />
                        <YAxis stroke="#fff" tick={{ fill: "#fff", fontSize: 12 }} />
                        <Legend wrapperStyle={{ color: "#fff", fontSize: 12 }} />
                        <Bar dataKey="returnPercent" fill="#00cc66" name="Całkowita stopa zwrotu">
                          <LabelList
                            content={(props) => (
                              <CustomBarPercentLabel {...props} dataLength={comparisonData.length} />
                            )}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-[#3c2a20] rounded-2xl p-6 border border-yellow-600/30">
                  <CardContent>
                    <h3 className="text-lg font-semibold text-yellow-300 mb-4">
                      Porównanie okresu zwrotu
                    </h3>
                    <ResponsiveContainer width="100%" height={330}>
                      <BarChart data={comparisonData} margin={{ top: 34, right: 20, left: 0, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffaa00" />
                        <Tooltip content={<CustomTooltip />} />
                        <XAxis dataKey="name" stroke="#fff" tick={{ fill: "#fff", fontSize: 12 }} />
                        <YAxis stroke="#fff" tick={{ fill: "#fff", fontSize: 12 }} />
                        <Legend wrapperStyle={{ color: "#fff", fontSize: 12 }} />
                        <Bar dataKey="paybackYear" fill="#ffaa00" name="Okres zwrotu">
                          <LabelList
                            content={(props) => (
                              <CustomBarYearsLabel {...props} dataLength={comparisonData.length} />
                            )}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <p className="mt-3 text-sm text-gray-300">
                      Wartość 0 oznacza, że inwestycja nie osiągnęła pełnego zwrotu w zadanym okresie.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-[#3c2a20] rounded-2xl p-6 border border-yellow-600/30">
                  <CardContent>
                    <h3 className="text-lg font-semibold text-yellow-300 mb-4">
                      Trend liniowy wartości inwestycji w czasie
                    </h3>
                    <ResponsiveContainer width="100%" height={380}>
                      <LineChart data={trendData} margin={{ top: 34, right: 28, left: 0, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffaa00" />
                        <Tooltip content={<CustomTooltip />} />
                        <XAxis dataKey="year" stroke="#fff" tick={{ fill: "#fff", fontSize: 12 }} />
                        <YAxis stroke="#fff" tick={{ fill: "#fff", fontSize: 12 }} />
                        <Legend wrapperStyle={{ color: "#fff", fontSize: 12 }} />
                        {results.map((result, index) => (
                          <Line
                            key={result.id}
                            type="monotone"
                            dataKey={result.name}
                            stroke={investmentColors[index]}
                            strokeWidth={2}
                            name={result.name}
                            dot={{ r: 3 }}
                            activeDot={{
                              r: 6,
                              fill: "#e5e7eb",
                              stroke: "#86efac",
                              strokeWidth: 2,
                            }}
                          >
                            <LabelList
                              content={(props) => (
                                <CustomLineLabel {...props} dataLength={trendData.length} />
                              )}
                            />
                          </Line>
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-[#3c2a20] rounded-2xl p-6 border border-yellow-600/30">
                  <CardContent>
                    <h3 className="text-lg font-semibold text-yellow-300 mb-4">
                      Tabela porównawcza
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[900px] table-fixed text-left border-collapse text-white text-sm">
                        <thead>
                          <tr>
                            <th className="w-[160px] p-2 border border-dashed border-[#ffaa00]">Inwestycja</th>
                            <th className="w-[140px] p-2 border border-dashed border-[#ffaa00]">Nakład początkowy</th>
                            <th className="w-[140px] p-2 border border-dashed border-[#ffaa00]">Wartość końcowa</th>
                            <th className="w-[140px] p-2 border border-dashed border-[#ffaa00]">Zysk całkowity</th>
                            <th className="w-[120px] p-2 border border-dashed border-[#ffaa00]">Stopa zwrotu</th>
                            <th className="w-[120px] p-2 border border-dashed border-[#ffaa00]">Śr. roczna</th>
                            <th className="w-[120px] p-2 border border-dashed border-[#ffaa00]">Okres zwrotu</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.map((result) => (
                            <tr key={result.id}>
                              <td className="p-2 border border-dashed border-[#ffaa00] font-bold text-yellow-300">{result.name}</td>
                              <td className="p-2 border border-dashed border-[#ffaa00]">{formatCurrency(result.initialOutlay)}</td>
                              <td className="p-2 border border-dashed border-[#ffaa00]">{formatCurrency(result.finalValue)}</td>
                              <td className="p-2 border border-dashed border-[#ffaa00]">{formatCurrency(result.totalGain)}</td>
                              <td className="p-2 border border-dashed border-[#ffaa00]">{formatPercent(result.returnPercent)}</td>
                              <td className="p-2 border border-dashed border-[#ffaa00]">{formatPercent(result.avgAnnualReturn)}</td>
                              <td className="p-2 border border-dashed border-[#ffaa00]">{result.paybackYear ? `${result.paybackYear} lat` : "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {!calculated && (
              <Card className="bg-[#3c2a20] rounded-2xl p-6 border border-yellow-600/30">
                <CardContent>
                  <h3 className="text-xl font-bold text-yellow-300 mb-3">
                    Gotowy model porównawczy
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    Wprowadź dane pierwszej inwestycji, dodaj kolejne warianty przyciskiem <span className="font-bold text-green-300">+ Dodaj</span>, a następnie kliknij <span className="font-bold text-green-300">Porównaj inwestycje</span>. Wyniki pokażą wartość końcową, wynik procentowy, okres zwrotu oraz trend wartości każdej inwestycji w czasie.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <div className="mt-12 flex justify-center">
        <Link
          href="/kalkulatory"
          className="inline-block border border-green-400 text-green-200 hover:bg-green-400/10 font-semibold px-8 py-3 rounded-xl transition"
        >
          Wróć do kalkulatorów
        </Link>
      </div>
    </div>
  );
}

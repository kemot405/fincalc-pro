"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
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

const Card = ({ children, className }: any) => (
  <div className={`rounded-2xl shadow-md ${className}`}>{children}</div>
);

const CardContent = ({ children }: any) => <div className="p-4">{children}</div>;

const Button = ({ children, onClick, className }: any) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg font-semibold transition ${className}`}
  >
    {children}
  </button>
);

type InvestmentInputs = {
  investmentValue: number;
  riskFreeRate: number;
  propertyGrowthRate: number;
  years: number;
  monthlyRevenue: number;
  monthlyCosts: number;
  taxRate: number;
  reinvestedPercent: number;
};

type DefaultsResponse = {
  inflation?: {
    latest: number | null;
    avg10y: number | null;
    avg5y: number | null;
  };
  riskFreeRate?: {
    latest: number | null;
    avg10y: number | null;
    avg5y: number | null;
  };
  realEstateGrowth?: {
    latest: number | null;
    avg10y: number | null;
    avg5y: number | null;
  };
  tax?: {
    default: number | null;
  };
};

type ForecastResponse = {
  metric: string;
  scenario: string;
  data: { year: number; value: number }[];
};

type YearlyRow = {
  year: number;
  revenue: number;
  costs: number;
  tax: number;
  netCashflow: number;
  discountedCashflow: number;
  cumulativeCashflow: number;
  cumulativeNpv: number;
  runningIrr: number | null;
  runningMirr: number | null;
  avgReturnToDate: number | null;
  avgInflationToDate: number;
  propertyValue: number;
  totalInvestmentValue: number;
  propertyGrowthApplied: number;
};

type KpiData = {
  npv: string;
  irr: string;
  mirr: string;
  roi: string;
  pb: string;
  returnVsInflation: string;
};

function calculateNPV(rate: number, cashflows: number[]): number {
  return cashflows.reduce((acc, cf, index) => {
    return acc + cf / Math.pow(1 + rate, index);
  }, 0);
}

function calculateIRR(cashflows: number[]): number | null {
  const hasPositive = cashflows.some((v) => v > 0);
  const hasNegative = cashflows.some((v) => v < 0);

  if (!hasPositive || !hasNegative) return null;

  let low = -0.9999;
  let high = 5;
  let npvLow = calculateNPV(low, cashflows);
  let npvHigh = calculateNPV(high, cashflows);

  if (npvLow * npvHigh > 0) return null;

  for (let i = 0; i < 200; i++) {
    const mid = (low + high) / 2;
    const npvMid = calculateNPV(mid, cashflows);

    if (Math.abs(npvMid) < 0.000001) return mid;

    if (npvLow * npvMid < 0) {
      high = mid;
      npvHigh = npvMid;
    } else {
      low = mid;
      npvLow = npvMid;
    }
  }

  return (low + high) / 2;
}

function calculateMIRR(
  cashflows: number[],
  financeRate: number,
  reinvestRate: number,
  reinvestedShare: number
): number | null {
  const n = cashflows.length - 1;
  if (n <= 0) return null;

  let pvNegative = 0;
  let fvPositive = 0;

  for (let t = 0; t < cashflows.length; t++) {
    const cf = cashflows[t];

    if (cf < 0) {
      pvNegative += cf / Math.pow(1 + financeRate, t);
    } else if (cf > 0) {
      const reinvestedPart = cf * reinvestedShare;
      const nonReinvestedPart = cf * (1 - reinvestedShare);
      fvPositive += reinvestedPart * Math.pow(1 + reinvestRate, n - t);
      fvPositive += nonReinvestedPart;
    }
  }

  if (pvNegative === 0 || fvPositive <= 0) return null;

  return Math.pow(fvPositive / Math.abs(pvNegative), 1 / n) - 1;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number, digits = 2): string {
  return `${value.toFixed(digits)}%`;
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

function InfoHint({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
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
        <div className="absolute right-0 top-7 z-30 w-72 rounded-xl border border-green-700/30 bg-[#cfe8c9] px-4 py-3 text-left text-sm text-black shadow-xl leading-relaxed">
          {text}
        </div>
      )}
    </span>
  );
}

function DefaultSourceHint() {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
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
        className="flex h-5 w-5 items-center justify-center rounded-full bg-[#cfe8c9] text-black hover:bg-[#bddbb7] transition"
        aria-label="Pokaż źródło wartości domyślnej"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <ellipse cx="12" cy="5" rx="7" ry="3" />
          <path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5" />
          <path d="M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-7 z-30 w-80 rounded-xl border border-green-700/30 bg-[#cfe8c9] px-4 py-3 text-left text-sm text-black shadow-xl leading-relaxed">
          Wartość domyślna przyjęta do modelu na podstawie danych NBP / prognozy rynkowej zapisanej w bazie strony.
        </div>
      )}
    </span>
  );
}

function KpiBox({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
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

export default function ZwrotInwestycji() {
  const [inputs, setInputs] = useState<InvestmentInputs>({
    investmentValue: 500000,
    riskFreeRate: 5,
    propertyGrowthRate: 4.5,
    years: 10,
    monthlyRevenue: 3000,
    monthlyCosts: 800,
    taxRate: 8.5,
    reinvestedPercent: 100,
  });

  const [inputValues, setInputValues] = useState<Record<string, string>>({
    investmentValue: formatLocalizedNumber(500000),
    riskFreeRate: formatLocalizedNumber(5),
    propertyGrowthRate: formatLocalizedNumber(4.5),
    years: formatLocalizedNumber(10),
    monthlyRevenue: formatLocalizedNumber(3000),
    monthlyCosts: formatLocalizedNumber(800),
    taxRate: formatLocalizedNumber(8.5),
    reinvestedPercent: formatLocalizedNumber(100),
  });

  const [inflationAvg, setInflationAvg] = useState<number>(4);
  const [rows, setRows] = useState<YearlyRow[]>([]);
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [propertyForecast, setPropertyForecast] = useState<
    { year: number; value: number }[]
  >([]);

  useEffect(() => {
    window.scrollTo(0, 0);

    async function loadDefaults() {
      try {
        const res = await fetch("/api/market-data/defaults");
        const json: DefaultsResponse = await res.json();

        const rate = json.riskFreeRate?.avg10y ?? 5;
        const growth = json.realEstateGrowth?.avg10y ?? 4.5;
        const tax = json.tax?.default ?? 8.5;
        const inflation = json.inflation?.avg10y ?? 4;

        const forecastRes = await fetch(
          "/api/market-data/forecasts?metric=realEstateGrowth&yearsAhead=30"
        );
        const forecastJson: ForecastResponse = await forecastRes.json();

        setInputs((prev) => ({
          ...prev,
          riskFreeRate: rate,
          propertyGrowthRate: growth,
          taxRate: tax,
        }));

        setInputValues((prev) => ({
          ...prev,
          riskFreeRate: formatLocalizedNumber(rate),
          propertyGrowthRate: formatLocalizedNumber(growth),
          taxRate: formatLocalizedNumber(tax),
        }));

        setInflationAvg(inflation);
        setPropertyForecast(forecastJson.data || []);
      } catch (error) {
        console.error("Nie udało się pobrać danych domyślnych:", error);
      }
    }

    loadDefaults();
  }, []);

  const inputConfig = [
    {
      key: "investmentValue",
      label: "Wartość inwestycji (zł)",
      hint: "Łączna wartość kapitału początkowego zaangażowanego w inwestycję.",
      isDefault: false,
    },
    {
      key: "riskFreeRate",
      label: "Stopa wolna od ryzyka (%)",
      hint: "Domyślnie pobierana z danych rynkowych. Używana do dyskontowania przepływów i obliczania MIRR.",
      isDefault: true,
    },
    {
      key: "propertyGrowthRate",
      label: "Stopa wzrostu/spadku cen nieruchomości",
      hint: "Średnioroczna zmiana wartości nieruchomości. Domyślnie pobierana z danych rynkowych.",
      isDefault: true,
    },
    {
      key: "years",
      label: "Okres inwestycji (lata)",
      hint: "Liczba lat przyjęta do obliczeń przepływów i wskaźników.",
      isDefault: false,
    },
    {
      key: "monthlyRevenue",
      label: "Przychody miesięczne (zł)",
      hint: "Łączny miesięczny przychód generowany przez inwestycję.",
      isDefault: false,
    },
    {
      key: "monthlyCosts",
      label: "Koszty miesięczne (zł)",
      hint: "Łączne miesięczne koszty związane z inwestycją.",
      isDefault: false,
    },
    {
      key: "taxRate",
      label: "Podatek (%)",
      hint: "Stawka podatku naliczana od dodatniego rocznego wyniku operacyjnego. Domyślnie pobierana z danych strony.",
      isDefault: true,
    },
    {
      key: "reinvestedPercent",
      label: "Procent reinwestowanych przepływów rocznie (%)",
      hint: "Jaka część dodatnich przepływów ma być reinwestowana według stopy wolnej od ryzyka przy obliczaniu MIRR.",
      isDefault: false,
    },
  ] as const;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setInputValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    const parsedValue = parseLocalizedNumber(value);

    setInputs((prev) => ({
      ...prev,
      [name]: parsedValue ?? 0,
    }));
  };

  const handleBlur = (fieldKey: string) => {
    const currentValue = inputs[fieldKey as keyof InvestmentInputs];
    setInputValues((prev) => ({
      ...prev,
      [fieldKey]: formatLocalizedNumber(Number(currentValue)),
    }));
  };

  const calculate = () => {
    const annualRevenue = inputs.monthlyRevenue * 12;
    const annualCosts = inputs.monthlyCosts * 12;
    const discountRate = inputs.riskFreeRate / 100;
    const taxRate = inputs.taxRate / 100;
    const reinvestedShare = Math.min(Math.max(inputs.reinvestedPercent / 100, 0), 1);

    const cashflows: number[] = [-inputs.investmentValue];
    const yearlyRows: YearlyRow[] = [];

    let cumulativeCashflow = 0;
    let cumulativeNpv = -inputs.investmentValue;
    let propertyValue = inputs.investmentValue;

    for (let year = 1; year <= inputs.years; year++) {
      const taxableProfit = annualRevenue - annualCosts;
      const tax = taxableProfit > 0 ? taxableProfit * taxRate : 0;
      const netCashflow = taxableProfit - tax;
      const discountedCashflow = netCashflow / Math.pow(1 + discountRate, year);

      cumulativeCashflow += netCashflow;
      cumulativeNpv += discountedCashflow;
      cashflows.push(netCashflow);

      const forecastGrowth = propertyForecast[year - 1]?.value ?? inputs.propertyGrowthRate;
      propertyValue = propertyValue * (1 + forecastGrowth / 100);

      const runningCashflows = cashflows.slice(0, year + 1);
      const runningIrr = calculateIRR(runningCashflows);
      const runningMirr = calculateMIRR(
        runningCashflows,
        discountRate,
        discountRate,
        reinvestedShare
      );

      const avgReturnToDate =
        inputs.investmentValue > 0
          ? (Math.pow(
              (inputs.investmentValue + cumulativeCashflow) /
                inputs.investmentValue,
              1 / year
            ) -
              1) *
            100
          : null;

      yearlyRows.push({
        year,
        revenue: annualRevenue,
        costs: annualCosts,
        tax,
        netCashflow,
        discountedCashflow,
        cumulativeCashflow,
        cumulativeNpv,
        runningIrr: runningIrr !== null ? runningIrr * 100 : null,
        runningMirr: runningMirr !== null ? runningMirr * 100 : null,
        avgReturnToDate: Number.isFinite(avgReturnToDate) ? avgReturnToDate : null,
        avgInflationToDate: inflationAvg,
        propertyValue,
        totalInvestmentValue: cumulativeCashflow + propertyValue,
        propertyGrowthApplied: forecastGrowth,
      });
    }

    const irr = calculateIRR(cashflows);
    const mirr = calculateMIRR(cashflows, discountRate, discountRate, reinvestedShare);
    const npv = calculateNPV(discountRate, cashflows);
    const roi =
      ((cashflows.slice(1).reduce((acc, cf) => acc + cf, 0) -
        inputs.investmentValue) /
        inputs.investmentValue) *
      100;

    const paybackYear =
      yearlyRows.find((row) => row.cumulativeCashflow >= inputs.investmentValue)
        ?.year ?? "—";

    const avgAnnualReturn = mirr !== null ? mirr * 100 : 0;

    setRows(yearlyRows);
    setKpis({
      npv: formatCurrency(npv),
      irr: irr !== null ? formatPercent(irr * 100) : "—",
      mirr: mirr !== null ? formatPercent(mirr * 100) : "—",
      roi: formatPercent(roi),
      pb: String(paybackYear),
      returnVsInflation: `${avgAnnualReturn.toFixed(1)}% / ${inflationAvg.toFixed(
        1
      )}%`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <motion.h1
        className="text-3xl font-bold mb-6 text-center text-yellow-400 flex items-center justify-center gap-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Policz stopę zwrotu z Twojej inwestycji
        <InfoHint text="To narzędzie służy do analizy opłacalności inwestycji na podstawie rocznych przepływów pieniężnych, podatku, stopy wolnej od ryzyka oraz reinwestycji przepływów do obliczenia MIRR." />
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-[1.15fr_1.85fr] gap-6">
        <Card className="bg-[#34241b] rounded-2xl p-6 shadow-lg border border-yellow-600/30">
          <CardContent>
            <div className="flex flex-col gap-4">
              {inputConfig.map((field) => (
                <div key={field.key} className="relative pt-1">
                  <div className="absolute right-2 -top-[3px] flex items-center gap-2">
                    {field.isDefault && <DefaultSourceHint />}
                    <InfoHint text={field.hint} />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-yellow-200 pr-16 leading-tight">
                      {field.label}
                    </label>

                    <input
                      type="text"
                      inputMode="decimal"
                      name={field.key}
                      value={inputValues[field.key]}
                      onChange={handleChange}
                      onBlur={() => handleBlur(field.key)}
                      className={`w-full px-3 py-1.5 border border-yellow-700/25 rounded-md text-black text-lg font-semibold ${
                        ["riskFreeRate", "propertyGrowthRate", "taxRate"].includes(field.key)
                          ? "bg-[#b8c1cc]"
                          : "bg-[#eef1f4]"
                      }`}
                    />
                  </div>
                </div>
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

        <div className="flex flex-col gap-6">
          {kpis && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-2">
              <KpiBox
                label="NPV"
                value={kpis.npv}
                hint="Wartość bieżąca netto inwestycji po zdyskontowaniu przyszłych przepływów stopą wolną od ryzyka."
              />
              <KpiBox
                label="IRR"
                value={kpis.irr}
                hint="Wewnętrzna stopa zwrotu inwestycji."
              />
              <KpiBox
                label="MIRR"
                value={kpis.mirr}
                hint="Zmodyfikowana wewnętrzna stopa zwrotu z reinwestycją dodatnich przepływów według stopy wolnej od ryzyka."
              />
              <KpiBox
                label="ROI"
                value={kpis.roi}
                hint="Procentowy zwrot z inwestycji względem kapitału początkowego."
              />
              <KpiBox
                label="PB"
                value={kpis.pb}
                hint="Liczba lat potrzebnych do odzyskania wartości inwestycji z przepływów netto."
              />
              <KpiBox
                label="Stopa zwrotu / inflacja"
                value={kpis.returnVsInflation}
                hint="Średnia roczna stopa zwrotu z przyjętego okresu obliczeń zestawiona ze średnią roczną inflacją."
              />
            </div>
          )}

          {rows.length > 0 && (
            <>
              <Card className="bg-[#3c2a20] rounded-2xl p-6 border border-yellow-600/30">
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left border-collapse text-white text-sm">
                      <thead>
                        <tr className="border-b border-yellow-500">
                          <th className="p-2">Rok</th>
                          <th className="p-2">Przychody</th>
                          <th className="p-2">Koszty</th>
                          <th className="p-2">Podatek</th>
                          <th className="p-2">Netto</th>
                          <th className="p-2">NPV roczne</th>
                          <th className="p-2">Wartość nieruchomości</th>
                          <th className="p-2">Skumulowany cash flow</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r) => (
                          <tr key={r.year} className="border-b border-gray-700">
                            <td className="p-2">{r.year}</td>
                            <td className="p-2">{formatCurrency(r.revenue)}</td>
                            <td className="p-2">{formatCurrency(r.costs)}</td>
                            <td className="p-2">{formatCurrency(r.tax)}</td>
                            <td className="p-2">{formatCurrency(r.netCashflow)}</td>
                            <td className="p-2">{formatCurrency(r.discountedCashflow)}</td>
                            <td className="p-2">{formatCurrency(r.propertyValue)}</td>
                            <td className="p-2">{formatCurrency(r.cumulativeCashflow)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#3c2a20] rounded-2xl p-6 border border-yellow-600/30">
                <CardContent>
                  <h3 className="text-lg font-semibold text-yellow-300 mb-4">
                    Wykres NPV
                  </h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={rows}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffaa00" />
                      <XAxis dataKey="year" stroke="#fff" tick={{ fill: "#fff" }} />
                      <YAxis stroke="#fff" tick={{ fill: "#fff" }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#444", color: "#fff" }}
                        formatter={(value: any) => formatCurrency(Number(value))}
                      />
                      <Legend wrapperStyle={{ color: "#fff" }} />
                      <Line
                        type="monotone"
                        dataKey="cumulativeNpv"
                        stroke="#ff9900"
                        strokeWidth={2}
                        name="Skumulowane NPV"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-[#3c2a20] rounded-2xl p-6 border border-yellow-600/30">
                <CardContent>
                  <h3 className="text-lg font-semibold text-yellow-300 mb-4">
                    Wykres IRR
                  </h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={rows}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffaa00" />
                      <XAxis dataKey="year" stroke="#fff" tick={{ fill: "#fff" }} />
                      <YAxis stroke="#fff" tick={{ fill: "#fff" }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#444", color: "#fff" }}
                        formatter={(value: any) =>
                          value === null ? "—" : formatPercent(Number(value))
                        }
                      />
                      <Legend wrapperStyle={{ color: "#fff" }} />
                      <Line
                        type="monotone"
                        dataKey="runningIrr"
                        stroke="#66ccff"
                        strokeWidth={2}
                        name="IRR"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-[#3c2a20] rounded-2xl p-6 border border-yellow-600/30">
                <CardContent>
                  <h3 className="text-lg font-semibold text-yellow-300 mb-4">
                    Wykres MIRR
                  </h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={rows}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffaa00" />
                      <XAxis dataKey="year" stroke="#fff" tick={{ fill: "#fff" }} />
                      <YAxis stroke="#fff" tick={{ fill: "#fff" }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#444", color: "#fff" }}
                        formatter={(value: any) =>
                          value === null ? "—" : formatPercent(Number(value))
                        }
                      />
                      <Legend wrapperStyle={{ color: "#fff" }} />
                      <Line
                        type="monotone"
                        dataKey="runningMirr"
                        stroke="#00cc66"
                        strokeWidth={2}
                        name="MIRR"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-[#3c2a20] rounded-2xl p-6 border border-yellow-600/30">
                <CardContent>
                  <h3 className="text-lg font-semibold text-yellow-300 mb-4">
                    Wykres stopy zwrotu vs inflacja
                  </h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={rows}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffaa00" />
                      <XAxis dataKey="year" stroke="#fff" tick={{ fill: "#fff" }} />
                      <YAxis stroke="#fff" tick={{ fill: "#fff" }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#444", color: "#fff" }}
                        formatter={(value: any) =>
                          value === null ? "—" : formatPercent(Number(value))
                        }
                      />
                      <Legend wrapperStyle={{ color: "#fff" }} />
                      <Line
                        type="monotone"
                        dataKey="avgReturnToDate"
                        stroke="#ff9900"
                        strokeWidth={2}
                        name="Średnia roczna stopa zwrotu"
                      />
                      <Line
                        type="monotone"
                        dataKey="avgInflationToDate"
                        stroke="#ff5c5c"
                        strokeWidth={2}
                        name="Średnia roczna inflacja"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      <div className="mt-12 flex justify-center">
        <Link
          href="/"
          className="inline-block border border-green-400 text-green-200 hover:bg-green-400/10 font-semibold px-8 py-3 rounded-xl transition"
        >
          Powrót do strony głównej
        </Link>
      </div>
    </div>
  );
}


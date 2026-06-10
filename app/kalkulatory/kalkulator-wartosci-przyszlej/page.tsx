"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  LabelList,
} from "recharts";
import inflationForecastData from "../../../data/market-data/inflation-forecast.json";

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

type DepositInputs = {
  capitalValue: number;
  interestRate: number;
  compoundingFrequency: number;
  years: number;
  timeUnit: "lata" | "miesiące";
  reinvestInterest: "TAK" | "NIE";
};

type DefaultsResponse = {
  inflation?: {
    latest: number | null;
    avg10y: number | null;
    avg5y: number | null;
  };
  tax?: {
    belka?: number | null;
    capitalGains?: number | null;
    default?: number | null;
  };
  deposit?: {
    defaultRate?: number | null;
  };
};

type InflationForecastRow = {
  year: number;
  value: number;
};

type PeriodRow = {
  period: number;
  label: string;
  year: number;
  month: number;
  openingCapital: number;
  grossInterest: number;
  tax: number;
  netInterest: number;
  paidOutInterest: number;
  reinvestedInterest: number;
  closingCapital: number;
  totalValue: number;
  cumulativeNetInterest: number;
  netInterestPercent: number;
  cumulativeInflationPercent: number;
  avgAnnualNetReturnToDate: number;
  realTotalValue: number;
};

type ChartRow = {
  label: string;
  grossInterest: number;
  netInterest: number;
  cumulativeNetInterest: number;
  totalValue: number;
  netInterestPercent: number;
};

type KpiData = {
  netInterestFinal: string;
  annualInterest: string;
  monthlyInterest: string;
  netInterestPercent: string;
  annualInterestPercent: string;
  realAnnualNetRate: string;
  returnVsInflation: string;
};

function formatCurrency(value: number): string {
  return `${new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0)} zł`;
}

function formatShortCurrency(value: number): string {
  return `${new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0)} zł`;
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

function normalizeInflationForecast(data: any): InflationForecastRow[] {
  const source = Array.isArray(data)
    ? data
    : Array.isArray(data?.forecast)
      ? data.forecast
      : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.values)
          ? data.values
          : typeof data === "object" && data !== null
            ? Object.entries(data).map(([year, value]) => ({ year, value }))
            : [];

  return source
    .map((item: any) => {
      const year = Number(item?.year ?? item?.date ?? item?.rok);
      const value = Number(
        item?.value ??
          item?.inflation ??
          item?.rate ??
          item?.forecast ??
          item?.avg ??
          item?.[1]
      );

      return { year, value };
    })
    .filter((item: InflationForecastRow) => Number.isFinite(item.year) && Number.isFinite(item.value))
    .sort((a: InflationForecastRow, b: InflationForecastRow) => a.year - b.year);
}

function getAverageInflationFromForecast(years: number, fallback: number): number {
  const currentYear = new Date().getFullYear();
  const investmentYears = Math.max(Math.floor(years), 1);
  const endYear = currentYear + investmentYears;
  const forecast = normalizeInflationForecast(inflationForecastData);

  const selected = forecast.filter(
    (item) => item.year >= currentYear && item.year <= endYear
  );

  if (!selected.length) return fallback;

  const sum = selected.reduce((acc, item) => acc + item.value, 0);
  return sum / selected.length;
}

function getInflationForElapsedYears(yearsElapsed: number, fallback: number): number {
  const currentYear = new Date().getFullYear();
  const fullYears = Math.max(Math.ceil(yearsElapsed), 1);
  const endYear = currentYear + fullYears;
  const forecast = normalizeInflationForecast(inflationForecastData);
  const selected = forecast.filter(
    (item) => item.year >= currentYear && item.year <= endYear
  );

  if (!selected.length) return fallback;

  return selected.reduce((acc, item) => acc + item.value, 0) / selected.length;
}

function shouldShowLabel(index: number, dataLength: number) {
  if (dataLength <= 12) return true;
  if (dataLength <= 24) return index % 2 === 0 || index === dataLength - 1;
  return index % 5 === 0 || index === dataLength - 1;
}

function CustomBarCurrencyLabel({ x, y, width, value, index, dataLength }: any) {
  if (
    value === null ||
    value === undefined ||
    !shouldShowLabel(index, dataLength)
  ) {
    return null;
  }

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
          Wartość domyślna przyjęta do modelu na podstawie danych zapisanych w bazie strony.
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

export default function KalkulatorPrzyszlejWartosciLokaty() {
  const reportRef = useRef<HTMLDivElement | null>(null);

  const [inputs, setInputs] = useState<DepositInputs>({
    capitalValue: 100000,
    interestRate: 5,
    compoundingFrequency: 1,
    years: 10,
    timeUnit: "lata",
    reinvestInterest: "NIE",
  });

  const [inputValues, setInputValues] = useState<Record<string, string>>({
    capitalValue: formatLocalizedNumber(100000),
    interestRate: formatLocalizedNumber(5),
    compoundingFrequency: formatLocalizedNumber(1),
    years: formatLocalizedNumber(10),
  });

  const [inflationAvg, setInflationAvg] = useState<number>(4);
  const [defaultsInflationFallback, setDefaultsInflationFallback] = useState<number>(4);
  const [belkaTaxRate, setBelkaTaxRate] = useState<number>(19);
  const [periodRows, setPeriodRows] = useState<PeriodRow[]>([]);
  const [chartRows, setChartRows] = useState<ChartRow[]>([]);
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [showYearsLimitHint, setShowYearsLimitHint] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    async function loadDefaults() {
      try {
        const res = await fetch("/api/market-data/defaults");
        const json: DefaultsResponse = await res.json();

        const rate = json.deposit?.defaultRate ?? 5;
        const fallbackInflation = json.inflation?.avg10y ?? 4;
        const belka = json.tax?.belka ?? 19;
        const forecastAverage = getAverageInflationFromForecast(inputs.years, fallbackInflation);

        setInputs((prev) => ({
          ...prev,
          interestRate: rate,
        }));

        setInputValues((prev) => ({
          ...prev,
          interestRate: formatLocalizedNumber(rate),
        }));

        setDefaultsInflationFallback(fallbackInflation);
        setInflationAvg(forecastAverage);
        setBelkaTaxRate(belka);
      } catch (error) {
        console.error("Nie udało się pobrać danych domyślnych:", error);
      }
    }

    loadDefaults();
  }, []);

  const inputConfig = [
    {
      key: "capitalValue",
      label: "Wartość kapitału (zł)",
      hint: "Kwota początkowa lokaty, obligacji lub innego papieru depozytowego.",
      isDefault: false,
    },
    {
      key: "interestRate",
      label: "Oprocentowanie roczne (%)",
      hint: "Nominalne oprocentowanie w skali roku przed podatkiem Belki.",
      isDefault: false,
    },
    {
      key: "compoundingFrequency",
      label: "Częstotliwość kapitalizacji w okresie lokaty",
      hint: "Ile razy w całym okresie lokaty lub obligacji odsetki będą naliczane. Jeśli odsetki są naliczane tylko raz na koniec okresu, wpisz 1.",
      isDefault: false,
    },
    {
      key: "years",
      label: inputs.timeUnit === "lata"
        ? "Okres lokaty / obligacji (inne) - lata"
        : "Okres lokaty / obligacji (inne) - miesiące",
      hint: inputs.timeUnit === "lata"
        ? "Podaj okres inwestycji w latach. Maksymalny okres dla wykresów i tabeli wynosi 40 lat."
        : "Podaj okres inwestycji w miesiącach. Na przykład 36 miesięcy oznacza 3 lata. Maksymalny okres dla wykresów i tabeli wynosi 480 miesięcy.",
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

    if (name === "years") {
      const rawPeriodValue = parsedValue ?? 0;
      const periodInYears =
        inputs.timeUnit === "miesiące" ? rawPeriodValue / 12 : rawPeriodValue;

      setShowYearsLimitHint(periodInYears > 40);
      setInflationAvg(getAverageInflationFromForecast(periodInYears, defaultsInflationFallback));
    }
  };

  const handleBlur = (fieldKey: string) => {
    const currentValue = inputs[fieldKey as keyof DepositInputs];
    if (typeof currentValue !== "number") return;

    setInputValues((prev) => ({
      ...prev,
      [fieldKey]: formatLocalizedNumber(Number(currentValue)),
    }));
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

    pdf.save("wyniki-kalkulatora-lokaty-obligacji-fincalc-pro.pdf");
  };

  const calculate = () => {
    const rawPeriod = Math.max(inputs.years, 0);
    const yearsExact = inputs.timeUnit === "miesiące" ? rawPeriod / 12 : rawPeriod;
    const months = inputs.timeUnit === "miesiące"
      ? Math.max(Math.floor(rawPeriod), 0)
      : Math.max(Math.round(rawPeriod * 12), 0);

    if (yearsExact > 40 || months > 480) {
      setShowYearsLimitHint(true);
      setPeriodRows([]);
      setChartRows([]);
      setKpis(null);
      return;
    }

    setShowYearsLimitHint(false);

    const capital = Math.max(inputs.capitalValue, 0);
    const nominalRate = Math.max(inputs.interestRate, 0) / 100;
    const frequency = Math.max(Math.floor(inputs.compoundingFrequency), 1);
    const years = Math.max(yearsExact, 0);
    const totalPeriods = years > 0 ? frequency : 0;
    const taxRate = Math.max(belkaTaxRate, 0) / 100;
    const isReinvested = inputs.reinvestInterest === "TAK";
    const forecastInflationAvg = getAverageInflationFromForecast(years, defaultsInflationFallback);

    const generatedRows: PeriodRow[] = [];
    let workingCapital = capital;
    let paidOutInterestCumulative = 0;
    let reinvestedInterestCumulative = 0;
    let cumulativeNetInterest = 0;

    for (let period = 1; period <= totalPeriods; period++) {
      const periodStartYears = years * ((period - 1) / frequency);
      const periodEndYears = years * (period / frequency);
      const periodFractionOfYear = Math.max(periodEndYears - periodStartYears, 0);
      const year = Math.ceil(periodEndYears);
      const month = Math.min(12, Math.ceil(periodEndYears * 12));
      const openingCapital = workingCapital;
      const grossInterest = openingCapital * nominalRate * periodFractionOfYear;
      const tax = grossInterest > 0 ? grossInterest * taxRate : 0;
      const netInterest = grossInterest - tax;

      if (isReinvested) {
        workingCapital += netInterest;
        reinvestedInterestCumulative += netInterest;
      } else {
        paidOutInterestCumulative += netInterest;
      }

      cumulativeNetInterest += netInterest;

      const closingCapital = workingCapital;
      const totalValue = isReinvested
        ? closingCapital
        : closingCapital + paidOutInterestCumulative;
      const netInterestPercent = capital > 0 ? (cumulativeNetInterest / capital) * 100 : 0;
      const timeInYears = periodEndYears;
      const inflationForElapsedYears = getInflationForElapsedYears(timeInYears, defaultsInflationFallback);
      const cumulativeInflationPercent =
        (Math.pow(1 + inflationForElapsedYears / 100, timeInYears) - 1) * 100;
      const avgAnnualNetReturnToDate =
        capital > 0 && totalValue > 0 && timeInYears > 0
          ? isReinvested
            ? (Math.pow(totalValue / capital, 1 / timeInYears) - 1) * 100
            : (cumulativeNetInterest / capital / timeInYears) * 100
          : 0;
      const realTotalValue = totalValue / Math.pow(1 + inflationForElapsedYears / 100, timeInYears);

      generatedRows.push({
        period,
        label: `Rok ${year}`,
        year,
        month,
        openingCapital,
        grossInterest,
        tax,
        netInterest,
        paidOutInterest: paidOutInterestCumulative,
        reinvestedInterest: reinvestedInterestCumulative,
        closingCapital,
        totalValue,
        cumulativeNetInterest,
        netInterestPercent,
        cumulativeInflationPercent,
        avgAnnualNetReturnToDate,
        realTotalValue,
      });
    }

    const chartData: ChartRow[] = [];

    if (years < 1) {
      const finalRowForShortPeriod = generatedRows[generatedRows.length - 1];
      const grossInterestForShortPeriod = generatedRows.reduce((sum, row) => sum + row.grossInterest, 0);
      const netInterestForShortPeriod = generatedRows.reduce((sum, row) => sum + row.netInterest, 0);

      chartData.push({
        label: "Po okresie lokaty",
        grossInterest: grossInterestForShortPeriod,
        netInterest: netInterestForShortPeriod,
        cumulativeNetInterest: finalRowForShortPeriod?.cumulativeNetInterest ?? 0,
        totalValue: finalRowForShortPeriod?.totalValue ?? capital,
        netInterestPercent: finalRowForShortPeriod?.netInterestPercent ?? 0,
      });
    } else {
      const chartYears = Math.max(Math.ceil(years), 0);

      for (let year = 1; year <= chartYears; year++) {
        const yearStart = year - 1;
        const yearEnd = Math.min(year, years);
        const matchingRows = generatedRows.filter((row) => {
          const rowEndYears = years * (row.period / frequency);
          const rowStartYears = years * ((row.period - 1) / frequency);
          return rowEndYears > yearStart && rowStartYears < yearEnd;
        });
        const lastRow = matchingRows[matchingRows.length - 1];
        const yearlyGrossInterest = matchingRows.reduce((sum, row) => sum + row.grossInterest, 0);
        const yearlyNetInterest = matchingRows.reduce((sum, row) => sum + row.netInterest, 0);
        const label =
          yearEnd - yearStart < 1
            ? `Okres końcowy (${Math.round((yearEnd - yearStart) * 12)} mies.)`
            : `Rok ${year}`;

        chartData.push({
          label,
          grossInterest: yearlyGrossInterest,
          netInterest: yearlyNetInterest,
          cumulativeNetInterest: lastRow?.cumulativeNetInterest ?? 0,
          totalValue: lastRow?.totalValue ?? capital,
          netInterestPercent: lastRow?.netInterestPercent ?? 0,
        });
      }
    }

    const finalRow = generatedRows[generatedRows.length - 1];
    const finalNetInterest = finalRow?.cumulativeNetInterest ?? 0;
    const finalNetInterestPercent = finalRow?.netInterestPercent ?? 0;
    const finalTotalValue = finalRow?.totalValue ?? capital;
    const finalMonthlyInterest = months > 0 ? finalNetInterest / months : 0;
    const finalAnnualInterest = years > 0 ? finalNetInterest / years : 0;
    const finalAnnualInterestPercent =
      capital > 0 && years > 0 ? (finalAnnualInterest / capital) * 100 : 0;
    const realAnnualNetRate =
      ((1 + finalAnnualInterestPercent / 100) / (1 + forecastInflationAvg / 100) - 1) * 100;
    const finalAvgAnnualReturn =
      capital > 0 && years > 0 && finalTotalValue > 0
        ? isReinvested
          ? (Math.pow(finalTotalValue / capital, 1 / years) - 1) * 100
          : (finalNetInterest / capital / years) * 100
        : 0;

    setInflationAvg(forecastInflationAvg);
    setPeriodRows(generatedRows);
    setChartRows(chartData);
    setKpis({
      netInterestFinal: formatCurrency(finalNetInterest),
      annualInterest: years >= 1 ? formatCurrency(finalAnnualInterest) : "—",
      monthlyInterest: formatCurrency(finalMonthlyInterest),
      netInterestPercent: formatPercent(finalNetInterestPercent, 2),
      annualInterestPercent: years > 0 ? formatPercent(finalAnnualInterestPercent, 2) : "—",
      realAnnualNetRate: years > 0 ? formatPercent(realAnnualNetRate, 2) : "—",
      returnVsInflation: years > 0
        ? `${finalAnnualInterestPercent.toFixed(2)}% / ${forecastInflationAvg.toFixed(2)}%`
        : `— / ${forecastInflationAvg.toFixed(2)}%`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div ref={reportRef}>
        <div className="relative">
          <motion.h1
            className="text-3xl font-bold mb-6 text-center text-yellow-400 flex items-center justify-center gap-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Policz przyszłą wartość lokaty lub obligacji
            <InfoHint text="Kalkulator pokazuje przyszłą wartość kapitału oraz odsetki po podatku Belki. Uwzględnia częstotliwość kapitalizacji, okres inwestycji, reinwestowanie lub wypłatę odsetek oraz porównanie ze średnią inflacją." />
          </motion.h1>

          <button
            type="button"
            onClick={handleDownloadPdf}
            className="absolute right-0 top-0 flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-500 transition"
          >
            <span className="text-xs font-bold">PDF</span>
            <span>Eksport</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1.15fr_1.85fr] gap-6">
          <Card className="bg-[#34241b] rounded-2xl p-6 shadow-lg border border-yellow-600/30">
            <CardContent>
              <div className="flex flex-col gap-4">
                {inputConfig.map((field) => (
                  <React.Fragment key={field.key}>
                    <div className="relative pt-1">
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
                          className="w-full px-3 py-1.5 border border-yellow-700/25 rounded-md text-black text-lg font-semibold bg-[#eef1f4]"
                        />

                        {field.key === "years" && showYearsLimitHint && (
                          <div className="absolute left-0 top-full z-40 mt-2 w-full rounded-xl border-2 border-green-300 bg-gray-200 px-4 py-3 text-sm font-bold text-black shadow-xl">
                            Maksymalny okres inwestycji to 40 lat, czyli 480 miesięcy. Wprowadź właściwą wartość.
                          </div>
                        )}
                      </div>
                    </div>

                    {field.key === "compoundingFrequency" && (
                      <div className="relative pt-1">
                        <div className="absolute right-2 -top-[3px] flex items-center gap-2">
                          <InfoHint text="Wybierz, czy okres inwestycji w kolejnym polu podajesz w latach czy w miesiącach. Jeśli wybierzesz miesiące i wpiszesz 36, kalkulator policzy okres jako 3 lata." />
                        </div>
                        <label className="text-sm text-yellow-200 pr-16 leading-tight">
                          Inwestycja: lata czy miesiące?
                        </label>
                        <select
                          value={inputs.timeUnit}
                          onChange={(e) => {
                            const nextUnit = e.target.value as "lata" | "miesiące";
                            setInputs((prev) => {
                              const nextYearsValue =
                                nextUnit === prev.timeUnit
                                  ? prev.years
                                  : nextUnit === "miesiące"
                                    ? prev.years * 12
                                    : prev.years / 12;

                              setInputValues((current) => ({
                                ...current,
                                years: formatLocalizedNumber(nextYearsValue),
                              }));

                              const nextYearsExact =
                                nextUnit === "miesiące" ? nextYearsValue / 12 : nextYearsValue;

                              setShowYearsLimitHint(nextYearsExact > 40);
                              setInflationAvg(
                                getAverageInflationFromForecast(nextYearsExact, defaultsInflationFallback)
                              );

                              return {
                                ...prev,
                                timeUnit: nextUnit,
                                years: nextYearsValue,
                              };
                            });
                          }}
                          className="mt-1 w-full px-3 py-1.5 border border-yellow-700/25 rounded-md bg-[#eef1f4] text-black text-lg font-semibold"
                        >
                          <option value="lata">Lata</option>
                          <option value="miesiące">Miesiące</option>
                        </select>
                      </div>
                    )}
                  </React.Fragment>
                ))}

                <div className="relative pt-1">
                  <div className="absolute right-2 -top-[3px] flex items-center gap-2">
                    <InfoHint text="Wybierz TAK, jeśli odsetki po podatku mają zwiększać kapitał i dalej pracować. Wybierz NIE, jeśli odsetki są wypłacane i nie zwiększają kolejnej podstawy naliczania odsetek." />
                  </div>
                  <label className="text-sm text-yellow-200 pr-16 leading-tight">
                    Czy odsetki będą reinwestowane?
                  </label>
                  <select
                    value={inputs.reinvestInterest}
                    onChange={(e) =>
                      setInputs((prev) => ({
                        ...prev,
                        reinvestInterest: e.target.value as "TAK" | "NIE",
                      }))
                    }
                    className="mt-1 w-full px-3 py-1.5 border border-yellow-700/25 rounded-md bg-[#eef1f4] text-black text-lg font-semibold"
                  >
                    <option value="TAK">TAK</option>
                    <option value="NIE">NIE</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-yellow-600/30 bg-gray-900/30 px-4 py-3 text-sm text-gray-200 leading-relaxed">
                W obliczeniach uwzględniono podatek Belki: <span className="font-bold text-yellow-300">{formatPercent(belkaTaxRate, 2)}</span>. Uwaga: Na stronach poglądowych Ministerstwa Finansów, dla Obligacji Skarbowych, często pokazywane są wartości odsetkowe bez potrącenia podatku.
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
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-2">
                <KpiBox
                  label="Odsetki po okresie lokaty"
                  value={kpis.netInterestFinal}
                  hint="Suma odsetek netto po całym okresie, czyli po odjęciu podatku Belki od naliczonych odsetek."
                />
                <KpiBox
                  label="Odsetki rocznie"
                  value={kpis.annualInterest}
                  hint="Średnia roczna wartość odsetek netto w całym okresie inwestycji."
                />
                <KpiBox
                  label="Odsetki miesięcznie"
                  value={kpis.monthlyInterest}
                  hint="Średnia miesięczna wartość odsetek netto w całym okresie inwestycji."
                />
                <KpiBox
                  label="Odsetki po okresie lokaty %"
                  value={kpis.netInterestPercent}
                  hint="Odsetki netto po zakończeniu lokaty odniesione procentowo do kapitału początkowego."
                />
                <KpiBox
                  label="Odsetki rocznie %"
                  value={kpis.annualInterestPercent}
                  hint="Średnia roczna wartość odsetek netto wyrażona procentowo względem kapitału początkowego."
                />
                <KpiBox
                  label="średnia roczna stopa zwrotu % / średnioroczna inflacja %"
                  value={kpis.returnVsInflation}
                  hint="Średnia roczna wartość odsetek netto wyrażona procentowo względem kapitału początkowego, zestawiona ze średnioroczną inflacją z pliku inflation-forecast.json."
                />
              </div>
            )}

            {chartRows.length > 0 && (
              <>
                <Card className="bg-[#3c2a20] rounded-2xl p-6 border border-yellow-600/30">
                  <CardContent>
                    <h3 className="text-lg font-semibold text-yellow-300 mb-4">
                      {inputs.timeUnit === "miesiące" && inputs.years < 12
                        ? "Odsetki po okresie lokaty"
                        : "Rozkład zysku po latach"}
                    </h3>
                    <ResponsiveContainer width="100%" height={340}>
                      <BarChart
                        data={chartRows}
                        margin={{ top: 34, right: 20, left: 0, bottom: 8 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffaa00" />
                        <XAxis
                          dataKey="label"
                          stroke="#fff"
                          tick={{ fill: "#fff", fontSize: 12 }}
                        />
                        <YAxis
                          stroke="#fff"
                          tick={{ fill: "#fff", fontSize: 12 }}
                        />
                        <Legend wrapperStyle={{ color: "#fff", fontSize: 12 }} />
                        <Bar
                          dataKey="netInterest"
                          fill="#66ccff"
                          name={inputs.timeUnit === "miesiące" && inputs.years < 12
                            ? "Odsetki netto po okresie"
                            : "Odsetki netto w roku"}
                          maxBarSize={52}
                        >
                          <LabelList
                            content={(props) => (
                              <CustomBarCurrencyLabel {...props} dataLength={chartRows.length} />
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
                      {inputs.timeUnit === "miesiące" && inputs.years < 12
                        ? "Tabela wyników po okresie lokaty"
                        : "Tabela wyników rocznych"}
                    </h3>

                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full min-w-[760px] table-fixed text-left border-collapse text-white text-sm">
                        <thead>
                          <tr>
                            <th className="w-[100px] p-2 border border-dashed border-[#ffaa00] whitespace-normal break-words">
                              {inputs.timeUnit === "miesiące" && inputs.years < 12 ? "Okres" : "Rok"}
                            </th>
                            <th className="w-[160px] p-2 border border-dashed border-[#ffaa00] whitespace-normal break-words leading-tight">
                              {inputs.timeUnit === "miesiące" && inputs.years < 12
                                ? "Odsetki przed podatkiem Belki"
                                : "Odsetki brutto w roku"}
                            </th>
                            <th className="w-[160px] p-2 border border-dashed border-[#ffaa00] whitespace-normal break-words leading-tight">
                              {inputs.timeUnit === "miesiące" && inputs.years < 12
                                ? "Odsetki po podatku Belki"
                                : "Odsetki netto w roku"}
                            </th>
                            <th className="w-[180px] p-2 border border-dashed border-[#ffaa00] whitespace-normal break-words leading-tight">
                              Odsetki netto narastająco
                            </th>
                            <th className="w-[160px] p-2 border border-dashed border-[#ffaa00] whitespace-normal break-words leading-tight">
                              Wartość razem
                            </th>
                            <th className="w-[140px] p-2 border border-dashed border-[#ffaa00] whitespace-normal break-words leading-tight">
                              Odsetki %
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {chartRows.map((r) => (
                            <tr key={r.label}>
                              <td className="w-[100px] p-2 border border-dashed border-[#ffaa00]">
                                {r.label}
                              </td>
                              <td className="w-[160px] p-2 border border-dashed border-[#ffaa00]">
                                {formatCurrency(r.grossInterest)}
                              </td>
                              <td className="w-[160px] p-2 border border-dashed border-[#ffaa00]">
                                {formatCurrency(r.netInterest)}
                              </td>
                              <td className="w-[180px] p-2 border border-dashed border-[#ffaa00]">
                                {formatCurrency(r.cumulativeNetInterest)}
                              </td>
                              <td className="w-[160px] p-2 border border-dashed border-[#ffaa00]">
                                {formatCurrency(r.totalValue)}
                              </td>
                              <td className="w-[140px] p-2 border border-dashed border-[#ffaa00]">
                                {formatPercent(r.netInterestPercent)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="md:hidden grid gap-3">
                      {chartRows.map((r) => (
                        <div
                          key={r.label}
                          className="rounded-xl border border-dashed border-[#ffaa00] bg-gray-900/30 p-4 text-sm"
                        >
                          <div className="mb-3 text-lg font-bold text-yellow-300">
                            {r.label}
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            <div className="flex justify-between gap-4">
                              <span className="text-gray-300">
                                {inputs.timeUnit === "miesiące" && inputs.years < 12
                                  ? "Odsetki przed podatkiem Belki"
                                  : "Odsetki brutto w roku"}
                              </span>
                              <span className="font-semibold text-white text-right">{formatCurrency(r.grossInterest)}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-gray-300">
                                {inputs.timeUnit === "miesiące" && inputs.years < 12
                                  ? "Odsetki po podatku Belki"
                                  : "Odsetki netto w roku"}
                              </span>
                              <span className="font-semibold text-white text-right">{formatCurrency(r.netInterest)}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-gray-300">Odsetki narastająco</span>
                              <span className="font-semibold text-white text-right">{formatCurrency(r.cumulativeNetInterest)}</span>
                            </div>
                            <div className="flex justify-between gap-4 border-t border-yellow-600/30 pt-2">
                              <span className="text-gray-300">Wartość razem</span>
                              <span className="font-bold text-yellow-300 text-right">{formatCurrency(r.totalValue)}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-gray-300">Odsetki %</span>
                              <span className="font-semibold text-white text-right">{formatPercent(r.netInterestPercent)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
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

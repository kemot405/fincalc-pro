"use client";

import React, { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ComposedChart,
  ReferenceLine,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  LabelList,
  Tooltip,
} from "recharts";
import inflationForecastData from "../../../data/market-data/inflation-forecast.json";

const MAX_INVESTMENTS = 5;

const Card = ({ children, className }: any) => (
  <div className={`pdf-section rounded-2xl shadow-md break-inside-avoid-page ${className}`}>{children}</div>
);

const CardContent = ({ children }: any) => <div className="p-4">{children}</div>;

const Button = ({ children, onClick, className, disabled }: any) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);

type InvestmentType =
  | "shortTermRental"
  | "longTermRental"
  | "mobileAssetRental"
  | "equipmentRental"
  | "dailyServices"
  | "monthlyServices"
  | "trade";

type TaxMode = "rentalLumpSum" | "generalRules" | "linear";
type ViewMode = "chart" | "table";

type InflationForecastRow = {
  year: number;
  value: number;
};

type DefaultsResponse = {
  inflation?: {
    latest: number | null;
    avg10y: number | null;
    avg5y: number | null;
  };
  tax?: {
    belka?: number | null;
    rentalPrivateBase?: number | null;
    rentalPrivateHigh?: number | null;
    rentalPrivateThreshold?: number | null;
    generalRulesBase?: number | null;
    generalRulesHigh?: number | null;
    generalRulesThreshold?: number | null;
    linear?: number | null;
    businessDefault?: number | null;
    default?: number | null;
  };
};

type InvestmentInput = {
  id: number;
  type: InvestmentType;
  name: string;
  taxMode: TaxMode;
  investmentValue: number;
  assetCount: number;
  monthlyRevenue: number;
  annualCosts: number;
  dailyPrice: number;
  occupancyRate: number;
  averageRentalDays: number;
  variableCostPerRental: number;
  dailyCustomers: number;
  monthlyCustomers: number;
  averagePrice: number;
  workingDaysPerMonth: number;
  variableCostPerUnit: number;
  basketValue: number;
  marginPercent: number;
  fixedMonthlyCosts: number;
};

type YearlyResult = {
  year: number;
  netProfit: number;
  cumulativeNetProfit: number;
  cumulativeReturnPercent: number;
  revenue: number;
  fixedCosts: number;
};

type InvestmentResult = {
  id: number;
  name: string;
  type: InvestmentType;
  finalNetProfit: number;
  finalReturnPercent: number;
  paybackYear: number | null;
  avgAnnualReturn: number;
  avgInflation: number;
  monthBreakEvenPercent: number;
  fixedCostsToRevenuePercent: number;
  fixedCostsToGrossProfitPercent: number;
  operatingMarginPercent: number;
  monthlyNetProfit: number;
  yearlyResults: YearlyResult[];
};

type TaxDefaults = {
  rentalPrivateBase: number;
  rentalPrivateHigh: number;
  rentalPrivateThreshold: number;
  generalRulesBase: number;
  generalRulesHigh: number;
  generalRulesThreshold: number;
  linear: number;
};

const typeLabels: Record<InvestmentType, string> = {
  shortTermRental: "Wynajem krótkoterminowy",
  longTermRental: "Wynajem długoterminowy",
  mobileAssetRental: "Wynajem aktywów ruchomych (współczynnik wykorzystania m-c %)",
  equipmentRental: "Wynajem sprzętu, narzędzi (dzienna ilość urządzeń w wynajmie)",
  dailyServices: "Usługi - dzienna ilość klientów",
  monthlyServices: "Usługi - miesięczna ilość klientów",
  trade: "Handel",
};

const chartColors = ["#00cc66", "#66ccff", "#ffaa00", "#ff5c5c", "#c084fc"];

const typeHelp: Record<InvestmentType, { description: string; fields: string[] }> = {
  shortTermRental: {
    description: "Najlepsze do analizy apartamentów, mieszkań i lokali wynajmowanych na doby.",
    fields: [
      "Nazwa inwestycji",
      "Wartość początkowa inwestycji",
      "Ilość mieszkań",
      "Średnia cena najmu na dobę",
      "Ilość dni aktywnych biznesowo",
      "Współczynnik wykorzystania m-c (%)",
      "Średnia ilość dób pojedynczego wynajmu",
      "Średni koszt obsługi wynajmu",
      "Koszty stałe miesięczne",
      "Rodzaj opodatkowania",
    ],
  },
  longTermRental: {
    description: "Najlepsze do analizy klasycznego najmu mieszkań, lokali lub powierzchni w dłuższym okresie.",
    fields: [
      "Nazwa inwestycji",
      "Wartość początkowa inwestycji",
      "Ilość mieszkań",
      "Przychody miesięczne z najmu",
      "Koszty roczne",
      "Koszty stałe miesięczne",
      "Rodzaj opodatkowania",
    ],
  },
  mobileAssetRental: {
    description: "Najlepsze do analizy wynajmu samochodów, przyczep, łodzi, maszyn lub innych aktywów ruchomych.",
    fields: [
      "Nazwa inwestycji",
      "Wartość początkowa inwestycji",
      "Ilość aktywów ruchomych",
      "Średnia cena wynajmu",
      "Ilość dni w miesiącu aktywnych dla biznesu",
      "Współczynnik wykorzystania m-c (%)",
      "Średnia ilość dób pojedynczego wynajmu",
      "Średni koszt obsługi wynajmu",
      "Koszty stałe miesięczne",
      "Rodzaj opodatkowania",
    ],
  },
  equipmentRental: {
    description: "Najlepsze do analizy wynajmu sprzętu, narzędzi, maszyn i wyposażenia na krótkie okresy.",
    fields: [
      "Nazwa inwestycji",
      "Wartość początkowa inwestycji",
      "Średnia dzienna ilość urządzeń w wynajmie",
      "Średnia cena pojedynczego wynajmu na dobę",
      "Ilość dni w miesiącu aktywnych dla biznesu",
      "Średnia ilość dób pojedynczego wynajmu",
      "Średni koszt obsługi pojedynczego wynajmu",
      "Koszty stałe miesięczne",
      "Rodzaj opodatkowania",
    ],
  },
  dailyServices: {
    description: "Najlepsze do analizy usług sprzedawanych codziennie, np. salonów, punktów usługowych i działalności lokalnych.",
    fields: [
      "Nazwa inwestycji",
      "Wartość początkowa inwestycji",
      "Dzienna ilość usług",
      "Średnia cena usługi",
      "Ilość dni w miesiącu aktywnych dla biznesu",
      "Średni koszt usługi",
      "Koszty stałe miesięczne",
      "Rodzaj opodatkowania",
    ],
  },
  monthlyServices: {
    description: "Najlepsze do analizy usług rozliczanych miesięcznie, abonamentów lub stałych kontraktów.",
    fields: [
      "Nazwa inwestycji",
      "Wartość początkowa inwestycji",
      "Miesięczna ilość usług",
      "Średnia cena usługi",
      "Średni koszt usługi",
      "Koszty stałe miesięczne",
      "Rodzaj opodatkowania",
    ],
  },
  trade: {
    description: "Najlepsze do analizy handlu, sklepu, e-commerce lub punktu sprzedaży z marżą na koszyku.",
    fields: [
      "Nazwa inwestycji",
      "Wartość początkowa inwestycji",
      "Dzienna ilość klientów",
      "Średnia wartość koszyka",
      "Ilość dni w miesiącu aktywnych dla biznesu",
      "Średnia marża (%)",
      "Koszty stałe miesięczne",
      "Rodzaj opodatkowania",
    ],
  },
};

function buildTypeHelpText(type: InvestmentType): string {
  const item = typeHelp[type];

  return `${item.description}\n\nPola w tym schemacie:\n${item.fields
    .map((field) => `• ${field}`)
    .join("\n")}`;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function formatPercent(value: number, digits = 2): string {
  return `${(Number.isFinite(value) ? value : 0).toFixed(digits)}%`;
}

function formatShortCurrency(value: number): string {
  return `${new Intl.NumberFormat("pl-PL", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number.isFinite(value) ? value : 0)} zł`;
}

function formatShortPercent(value: number): string {
  return `${(Number.isFinite(value) ? value : 0).toFixed(1)}%`;
}

function parseLocalizedNumber(value: string): number | null {
  const cleaned = value.replace(/\s/g, "").replace(",", ".");
  if (cleaned === "" || cleaned === "-" || cleaned === "." || cleaned === "-.") return null;
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
  if (dataLength <= 10) return true;
  if (dataLength <= 20) return index % 2 === 0 || index === dataLength - 1;
  return index % 5 === 0 || index === dataLength - 1;
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

function getWorkingDaysForRisk(input: InvestmentInput): number {
  if (
    input.type === "shortTermRental" ||
    input.type === "mobileAssetRental" ||
    input.type === "equipmentRental" ||
    input.type === "dailyServices" ||
    input.type === "trade"
  ) {
    return Math.max(input.workingDaysPerMonth, 1);
  }

  return 30;
}


function riskTone(value: number, type: "breakEven" | "fixedCost" | "operatingMargin") {
  if (!Number.isFinite(value)) {
    return "border-green-500/35 bg-green-900/45 text-gray-100";
  }

  if (type === "operatingMargin") {
    if (value >= 40) {
      return "border-green-500/35 bg-green-900/45 text-green-100";
    }

    if (value >= 20) {
      return "border-green-500/35 bg-green-900/45 text-yellow-300";
    }

    return "border-green-500/35 bg-green-900/45 text-red-300";
  }

  const greenLimit = type === "breakEven" ? 35 : 60;
  const yellowLimit = type === "breakEven" ? 60 : 90;

  if (value <= greenLimit) {
    return "border-green-500/35 bg-green-900/45 text-green-100";
  }

  if (value <= yellowLimit) {
    return "border-green-500/35 bg-green-900/45 text-yellow-300";
  }

  return "border-green-500/35 bg-green-900/45 text-red-300";
}

function CustomLineLabel({ x, y, value, index, dataLength, mode }: any) {
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
      {mode === "percent" ? formatShortPercent(Number(value)) : formatShortCurrency(Number(value))}
    </text>
  );
}

function CustomBarLabel({ x, y, width, height, value, type = "amount", layout }: any) {
  if (value === null || value === undefined) return null;

  const isVertical = layout === "vertical";

  return (
    <text
      x={isVertical ? x + width + 8 : x + width / 2}
      y={isVertical ? y + height / 2 + 4 : y - 6}
      fill="#f9fafb"
      fontSize={11}
      fontWeight={700}
      textAnchor={isVertical ? "start" : "middle"}
    >
      {type === "percent"
        ? formatShortPercent(Number(value))
        : type === "number"
          ? String(Math.round(Number(value)))
          : formatShortCurrency(Number(value))}
    </text>
  );
}


function CustomTooltip({ active, payload, label, mode }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-xl border border-green-300 bg-gray-200 px-4 py-3 text-sm font-semibold text-black shadow-xl">
      <div className="mb-2 text-base font-bold">Rok {label}</div>
      <div className="flex flex-col gap-1">
        {payload.map((item: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <span>{item.name}</span>
            <span className="font-bold">
              {mode === "percent" ? formatPercent(Number(item.value)) : formatCurrency(Number(item.value))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoHint({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
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

  const toggleOpen = () => {
    if (!open && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const tooltipWidth = 360;
      const padding = 16;
      const left = Math.min(
        Math.max(rect.right - tooltipWidth, padding),
        window.innerWidth - tooltipWidth - padding
      );
      const top = Math.min(rect.bottom + 8, window.innerHeight - 180);
      setPosition({ top, left });
    }

    setOpen((prev) => !prev);
  };

  return (
    <span ref={wrapperRef} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={toggleOpen}
        className="flex h-5 w-5 items-center justify-center rounded-full bg-[#cfe8c9] text-[12px] font-bold text-black transition hover:bg-[#bddbb7]"
        aria-label="Pokaż opis"
      >
        ?
      </button>
      {open && (
        <div
          className="fixed z-[9999] max-h-[70vh] w-[360px] overflow-y-auto rounded-xl border border-green-700/30 bg-[#cfe8c9] px-4 py-3 text-left text-sm text-black shadow-2xl leading-relaxed"
          style={{ top: position.top, left: position.left }}
        >
          {text}
        </div>
      )}
    </span>
  );
}

function createDefaultInvestment(id: number, type: InvestmentType = "dailyServices"): InvestmentInput {
  return {
    id,
    type,
    name: `Inwestycja ${id}`,
    taxMode: type === "longTermRental" ? "rentalLumpSum" : "generalRules",
    investmentValue: 100000,
    assetCount: 1,
    monthlyRevenue: 5000,
    annualCosts: 6000,
    dailyPrice: 250,
    occupancyRate: 60,
    averageRentalDays: 2,
    variableCostPerRental: 80,
    dailyCustomers: 5,
    monthlyCustomers: 100,
    averagePrice: 150,
    workingDaysPerMonth: 22,
    variableCostPerUnit: 40,
    basketValue: 120,
    marginPercent: 35,
    fixedMonthlyCosts: 3000,
  };
}

function calculateTax(income: number, taxMode: TaxMode, taxDefaults: TaxDefaults): number {
  if (income <= 0) return 0;

  if (taxMode === "rentalLumpSum") {
    const basePart = Math.min(income, taxDefaults.rentalPrivateThreshold);
    const highPart = Math.max(income - taxDefaults.rentalPrivateThreshold, 0);
    return basePart * (taxDefaults.rentalPrivateBase / 100) + highPart * (taxDefaults.rentalPrivateHigh / 100);
  }

  if (taxMode === "generalRules") {
    const basePart = Math.min(income, taxDefaults.generalRulesThreshold);
    const highPart = Math.max(income - taxDefaults.generalRulesThreshold, 0);
    return basePart * (taxDefaults.generalRulesBase / 100) + highPart * (taxDefaults.generalRulesHigh / 100);
  }

  return income * (taxDefaults.linear / 100);
}

function calculateMonthlyModel(input: InvestmentInput) {
  const assetCount = Math.max(input.assetCount, 1);
  const activeDays = Math.max(input.workingDaysPerMonth, 1);
  const utilization = Math.max(input.occupancyRate, 0) / 100;
  const averageRentalDays = Math.max(input.averageRentalDays, 1);

  switch (input.type) {
    case "shortTermRental": {
      const rentedDays = activeDays * utilization * assetCount;
      const rentalsCount = rentedDays / averageRentalDays;
      const revenue = rentedDays * input.dailyPrice;
      const variableCosts = rentalsCount * input.variableCostPerRental;
      return { revenue, variableCosts, fixedCosts: input.fixedMonthlyCosts };
    }

    case "longTermRental": {
      // Wynajem długoterminowy jest liczony jako pełny miesięczny czynsz za lokal.
      // Nie stosujemy współczynnika wykorzystania ani dni aktywnych biznesowo.
      const revenue = input.monthlyRevenue * assetCount;
      const variableCosts = Math.max(input.annualCosts, 0) / 12;
      return { revenue, variableCosts, fixedCosts: input.fixedMonthlyCosts };
    }

    case "mobileAssetRental": {
      const rentedDays = assetCount * activeDays * utilization;
      const rentalsCount = rentedDays / averageRentalDays;
      const revenue = rentedDays * input.averagePrice;
      const variableCosts = rentalsCount * input.variableCostPerRental;
      return { revenue, variableCosts, fixedCosts: input.fixedMonthlyCosts };
    }

    case "equipmentRental": {
      // dailyCustomers = średnia dzienna liczba urządzeń aktywnie będących w wynajmie.
      // averageRentalDays służy tu wyłącznie do oszacowania liczby obsług po zakończonym wynajmie.
      const activeRentedUnitsPerDay = Math.max(input.dailyCustomers, 0);
      const rentedDays = activeRentedUnitsPerDay * activeDays;
      const rentalsCount = rentedDays / averageRentalDays;
      const revenue = rentedDays * input.averagePrice;
      const variableCosts = rentalsCount * input.variableCostPerRental;
      return { revenue, variableCosts, fixedCosts: input.fixedMonthlyCosts };
    }

    case "dailyServices": {
      const services = input.dailyCustomers * activeDays;
      const revenue = services * input.averagePrice;
      const variableCosts = services * input.variableCostPerUnit;
      return { revenue, variableCosts, fixedCosts: input.fixedMonthlyCosts };
    }

    case "monthlyServices": {
      const services = input.monthlyCustomers;
      const revenue = services * input.averagePrice;
      const variableCosts = services * input.variableCostPerUnit;
      return { revenue, variableCosts, fixedCosts: input.fixedMonthlyCosts };
    }

    case "trade": {
      const customers = input.dailyCustomers * activeDays;
      const revenue = customers * input.basketValue;
      const grossMargin = revenue * (Math.max(input.marginPercent, 0) / 100);
      const variableCosts = Math.max(revenue - grossMargin, 0);
      return { revenue, variableCosts, fixedCosts: input.fixedMonthlyCosts };
    }

    default:
      return { revenue: 0, variableCosts: 0, fixedCosts: 0 };
  }
}

function calculateInvestment(
  input: InvestmentInput,
  globalYears: number,
  inflationAvg: number,
  taxDefaults: TaxDefaults
): InvestmentResult {
  const years = Math.min(Math.max(Math.floor(globalYears), 1), 40);
  const investmentValue = Math.max(input.investmentValue, 0);
  const { revenue, variableCosts, fixedCosts } = calculateMonthlyModel(input);

  const monthlyGrossProfitBeforeFixedCosts = revenue - variableCosts;
  const monthlyProfitBeforeTax = revenue - variableCosts - fixedCosts;
  const annualRevenue = revenue * 12;
  const annualProfitBeforeTax = monthlyProfitBeforeTax * 12;
  const annualTax = calculateTax(annualProfitBeforeTax, input.taxMode, taxDefaults);
  const annualNetProfit = annualProfitBeforeTax - annualTax;
  const monthlyNetProfit = annualNetProfit / 12;

  const yearlyResults: YearlyResult[] = [];
  let cumulativeNetProfit = 0;
  const paybackYear =
    investmentValue > 0 && annualNetProfit > 0
      ? Math.ceil(investmentValue / annualNetProfit)
      : null;

  for (let year = 1; year <= years; year++) {
    cumulativeNetProfit += annualNetProfit;

    yearlyResults.push({
      year,
      netProfit: annualNetProfit,
      cumulativeNetProfit,
      cumulativeReturnPercent: investmentValue > 0 ? (cumulativeNetProfit / investmentValue) * 100 : 0,
      revenue: annualRevenue,
      fixedCosts: fixedCosts * 12,
    });
  }

  const finalReturnPercent = investmentValue > 0 ? (cumulativeNetProfit / investmentValue) * 100 : 0;
  const avgAnnualReturn = years > 0 ? finalReturnPercent / years : 0;

  const workingDaysForRisk = getWorkingDaysForRisk(input);
  const dailyGrossProfitBeforeFixedCosts =
    workingDaysForRisk > 0 ? monthlyGrossProfitBeforeFixedCosts / workingDaysForRisk : 0;
  const daysToCoverFixedCosts =
    dailyGrossProfitBeforeFixedCosts > 0 ? fixedCosts / dailyGrossProfitBeforeFixedCosts : workingDaysForRisk;
  const monthBreakEvenPercent =
    workingDaysForRisk > 0
      ? Math.min(Math.max((daysToCoverFixedCosts / workingDaysForRisk) * 100, 0), 999)
      : 0;
  const fixedCostsToRevenuePercent = revenue > 0 ? (fixedCosts / revenue) * 100 : 0;
  const fixedCostsToGrossProfitPercent =
    monthlyGrossProfitBeforeFixedCosts > 0 ? (fixedCosts / monthlyGrossProfitBeforeFixedCosts) * 100 : 999;
  const operatingMarginPercent =
    revenue > 0 ? (monthlyProfitBeforeTax / revenue) * 100 : 0;

  return {
    id: input.id,
    name: input.name || `Inwestycja ${input.id}`,
    type: input.type,
    finalNetProfit: cumulativeNetProfit,
    finalReturnPercent,
    paybackYear,
    avgAnnualReturn,
    avgInflation: inflationAvg,
    monthBreakEvenPercent,
    fixedCostsToRevenuePercent,
    fixedCostsToGrossProfitPercent,
    operatingMarginPercent,
    monthlyNetProfit,
    yearlyResults,
  };
}

function KpiValue({
  value,
  hint,
  className = "border-yellow-600/30 bg-[#243424] text-yellow-400",
}: {
  value: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={`relative min-h-[82px] rounded-2xl border p-4 shadow-md ${className}`}>
      {hint && (
        <div className="absolute right-3 top-3">
          <InfoHint text={hint} />
        </div>
      )}
      <div className="pr-8 text-2xl font-bold">{value}</div>
    </div>
  );
}

export default function PorownanieInwestycji() {
  const reportRef = useRef<HTMLDivElement | null>(null);
  const [, startTransition] = useTransition();

  const [globalYears, setGlobalYears] = useState<number>(10);
  const [globalYearsValue, setGlobalYearsValue] = useState<string>(formatLocalizedNumber(10));
  const [inflationAvg, setInflationAvg] = useState<number>(4);
  const [defaultsInflationFallback, setDefaultsInflationFallback] = useState<number>(4);
  const [taxDefaults, setTaxDefaults] = useState<TaxDefaults>({
    rentalPrivateBase: 8.5,
    rentalPrivateHigh: 12.5,
    rentalPrivateThreshold: 100000,
    generalRulesBase: 12,
    generalRulesHigh: 32,
    generalRulesThreshold: 120000,
    linear: 19,
  });

  const [investments, setInvestments] = useState<InvestmentInput[]>([
    createDefaultInvestment(1, "dailyServices"),
  ]);
  const [calculatedInvestments, setCalculatedInvestments] = useState<InvestmentInput[]>([
    createDefaultInvestment(1, "dailyServices"),
  ]);
  const [calculatedYears, setCalculatedYears] = useState<number>(10);
  const [calculatedInflationAvg, setCalculatedInflationAvg] = useState<number>(4);
  const [inputValues, setInputValues] = useState<Record<string, string>>(() => {
    const first = createDefaultInvestment(1, "dailyServices");
    return Object.fromEntries(
      Object.entries(first).map(([key, value]) => [
        `1.${key}`,
        typeof value === "number" ? formatLocalizedNumber(value) : String(value),
      ])
    );
  });
  const [expandedPanels, setExpandedPanels] = useState<Record<number, boolean>>({ 1: true });
  const [showAddTypePicker, setShowAddTypePicker] = useState(false);
  const [valueViewMode, setValueViewMode] = useState<ViewMode>("chart");
  const [percentViewMode, setPercentViewMode] = useState<ViewMode>("chart");
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const updateMobileView = () => setIsMobileView(window.matchMedia("(max-width: 767px)").matches);

    updateMobileView();
    window.addEventListener("resize", updateMobileView);

    return () => window.removeEventListener("resize", updateMobileView);
  }, []);

  useEffect(() => {
    const menuLabelGroups = [["aktualnosci"], ["kalkulatory"], ["kursy"]];
    const mobileMenuBackground = "#17100c";
    const mobileMenuText = "#cfe8c9";
    let outsideClickOverlay: HTMLDivElement | null = null;
    let lastMobileMenuToggle: HTMLElement | null = null;
    let closingMainMenuFromOutside = false;

    const isMobileViewport = () => window.matchMedia("(max-width: 767px)").matches;

    const normalizeText = (value: string) =>
      value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim();

    const isVisible = (element: HTMLElement) => {
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();

      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        Number(style.opacity) !== 0 &&
        rect.width > 0 &&
        rect.height > 0
      );
    };

    const hasSolidBackground = (element: HTMLElement) => {
      const background = window.getComputedStyle(element).backgroundColor;
      return background !== "transparent" && background !== "rgba(0, 0, 0, 0)";
    };

    const getMobileMenuItems = (): HTMLElement[] => {
      if (!isMobileViewport()) return [];

      return menuLabelGroups
        .map((group) => {
          const candidates = Array.from(
            document.querySelectorAll<HTMLElement>("a[href], button, [role='menuitem']")
          ).filter((element) => {
            if (reportRef.current?.contains(element)) return false;
            if (!isVisible(element)) return false;

            const text = normalizeText(element.innerText || element.textContent || "");
            return group.some((label) => text === label || text.startsWith(`${label} `));
          });

          return candidates.sort((a, b) => {
            const aRect = a.getBoundingClientRect();
            const bRect = b.getBoundingClientRect();
            return aRect.width * aRect.height - bRect.width * bRect.height;
          })[0];
        })
        .filter((element): element is HTMLElement => Boolean(element));
    };

    const getMobileMenuToggleCandidates = (): HTMLElement[] => {
      if (!isMobileViewport()) return [];

      return Array.from(document.querySelectorAll<HTMLElement>("button, [role='button']"))
        .filter((element) => {
          if (reportRef.current?.contains(element)) return false;
          if (!isVisible(element)) return false;

          const rect = element.getBoundingClientRect();
          return (
            rect.top <= 190 &&
            rect.right >= window.innerWidth - 140 &&
            rect.width >= 36 &&
            rect.width <= 120 &&
            rect.height >= 36 &&
            rect.height <= 120
          );
        })
        .sort((a, b) => {
          const aRect = a.getBoundingClientRect();
          const bRect = b.getBoundingClientRect();
          return aRect.top - bRect.top || bRect.right - aRect.right;
        });
    };

    const getMobileMenuToggle = (): HTMLElement | null => {
      const toggles = getMobileMenuToggleCandidates();
      const rememberedToggle =
        lastMobileMenuToggle && isVisible(lastMobileMenuToggle) && toggles.includes(lastMobileMenuToggle)
          ? lastMobileMenuToggle
          : null;
      const expandedToggle = toggles.find((element) => element.getAttribute("aria-expanded") === "true");

      return expandedToggle ?? rememberedToggle ?? toggles[0] ?? null;
    };

    const getMobileMainMenuPanel = (): HTMLElement | null => {
      const items = getMobileMenuItems();
      if (items.length !== menuLabelGroups.length) return null;

      const toggle = getMobileMenuToggle();
      const ancestors: HTMLElement[] = [];
      let current = items[0].parentElement;

      while (current && current !== document.body && current !== document.documentElement) {
        ancestors.push(current);
        current = current.parentElement;
      }

      const candidates = ancestors.filter((element) => {
        if (reportRef.current?.contains(element)) return false;
        if (toggle && element.contains(toggle)) return false;
        if (!items.every((item) => element.contains(item))) return false;
        if (!isVisible(element)) return false;

        const rect = element.getBoundingClientRect();
        const text = normalizeText(element.innerText || element.textContent || "");

        return (
          rect.top > 70 &&
          rect.width >= 160 &&
          rect.width <= window.innerWidth - 16 &&
          rect.height >= 180 &&
          !text.includes("fincalc pro")
        );
      });

      if (!candidates.length) return null;

      const backgroundCandidates = candidates.filter(hasSolidBackground);
      const source = backgroundCandidates.length ? backgroundCandidates : candidates;

      return source.sort((a, b) => {
        const aRect = a.getBoundingClientRect();
        const bRect = b.getBoundingClientRect();
        const aArea = aRect.width * aRect.height;
        const bArea = bRect.width * bRect.height;

        return aArea - bArea;
      })[0];
    };

    const removeOutsideClickOverlay = () => {
      outsideClickOverlay?.remove();
      outsideClickOverlay = null;
    };

    const closeMobileMainMenu = () => {
      const toggle = getMobileMenuToggle();

      closingMainMenuFromOutside = true;
      removeOutsideClickOverlay();

      window.setTimeout(() => {
        if (toggle) {
          toggle.dispatchEvent(
            new MouseEvent("click", {
              bubbles: true,
              cancelable: true,
              view: window,
            })
          );
        } else {
          document.dispatchEvent(
            new KeyboardEvent("keydown", {
              key: "Escape",
              code: "Escape",
              bubbles: true,
            })
          );
        }

        window.setTimeout(() => {
          closingMainMenuFromOutside = false;
          scheduleStyleUpdate();
        }, 160);
      }, 0);
    };

    const showOutsideClickOverlay = (panel: HTMLElement) => {
      const closeFromOverlay = (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!closingMainMenuFromOutside) closeMobileMainMenu();
      };

      if (!outsideClickOverlay) {
        outsideClickOverlay = document.createElement("div");
        outsideClickOverlay.dataset.fincalcMobileMenuOutside = "true";
        outsideClickOverlay.setAttribute("aria-hidden", "true");

        ["top", "right", "bottom", "left"].forEach((zoneName) => {
          const zone = document.createElement("div");
          zone.dataset.fincalcMobileMenuOutsideZone = zoneName;
          zone.addEventListener("pointerdown", closeFromOverlay, true);
          zone.addEventListener("touchstart", closeFromOverlay, true);
          zone.addEventListener("click", closeFromOverlay, true);
          outsideClickOverlay?.appendChild(zone);
        });

        document.body.appendChild(outsideClickOverlay);
      }

      const rect = panel.getBoundingClientRect();
      outsideClickOverlay.style.setProperty("position", "fixed", "important");
      outsideClickOverlay.style.setProperty("inset", "0", "important");
      outsideClickOverlay.style.setProperty("z-index", "10010", "important");
      outsideClickOverlay.style.setProperty("background", "transparent", "important");
      outsideClickOverlay.style.setProperty("pointer-events", "none", "important");

      const zones = Array.from(outsideClickOverlay.children) as HTMLElement[];
      const commonZoneStyles = (zone: HTMLElement) => {
        zone.style.setProperty("position", "fixed", "important");
        zone.style.setProperty("background", "transparent", "important");
        zone.style.setProperty("pointer-events", "auto", "important");
      };

      zones.forEach(commonZoneStyles);

      const topZone = zones.find((zone) => zone.dataset.fincalcMobileMenuOutsideZone === "top");
      const rightZone = zones.find((zone) => zone.dataset.fincalcMobileMenuOutsideZone === "right");
      const bottomZone = zones.find((zone) => zone.dataset.fincalcMobileMenuOutsideZone === "bottom");
      const leftZone = zones.find((zone) => zone.dataset.fincalcMobileMenuOutsideZone === "left");

      if (topZone) {
        topZone.style.setProperty("left", "0", "important");
        topZone.style.setProperty("top", "0", "important");
        topZone.style.setProperty("width", "100vw", "important");
        topZone.style.setProperty("height", `${Math.max(rect.top, 0)}px`, "important");
      }

      if (bottomZone) {
        bottomZone.style.setProperty("left", "0", "important");
        bottomZone.style.setProperty("top", `${Math.max(rect.bottom, 0)}px`, "important");
        bottomZone.style.setProperty("width", "100vw", "important");
        bottomZone.style.setProperty("height", `${Math.max(window.innerHeight - rect.bottom, 0)}px`, "important");
      }

      if (leftZone) {
        leftZone.style.setProperty("left", "0", "important");
        leftZone.style.setProperty("top", `${Math.max(rect.top, 0)}px`, "important");
        leftZone.style.setProperty("width", `${Math.max(rect.left, 0)}px`, "important");
        leftZone.style.setProperty("height", `${Math.max(rect.height, 0)}px`, "important");
      }

      if (rightZone) {
        rightZone.style.setProperty("left", `${Math.max(rect.right, 0)}px`, "important");
        rightZone.style.setProperty("top", `${Math.max(rect.top, 0)}px`, "important");
        rightZone.style.setProperty("width", `${Math.max(window.innerWidth - rect.right, 0)}px`, "important");
        rightZone.style.setProperty("height", `${Math.max(rect.height, 0)}px`, "important");
      }

      const panelPosition = window.getComputedStyle(panel).position;
      if (panelPosition === "static") {
        panel.style.setProperty("position", "relative", "important");
      }
      panel.style.setProperty("z-index", "10020", "important");
    };

    const styleMobileMainMenuPanel = () => {
      if (!isMobileViewport()) {
        removeOutsideClickOverlay();
        return;
      }

      const panel = getMobileMainMenuPanel();
      if (!panel) {
        removeOutsideClickOverlay();
        return;
      }

      panel.dataset.fincalcMobileMainMenu = "true";
      panel.style.setProperty("background-color", mobileMenuBackground, "important");
      panel.style.setProperty("background", mobileMenuBackground, "important");
      showOutsideClickOverlay(panel);

      Array.from(panel.querySelectorAll<HTMLElement>("a, button, [role='menuitem'], li, span")).forEach((element) => {
        element.style.setProperty("color", mobileMenuText, "important");
        element.style.setProperty("font-weight", "700", "important");

        if (hasSolidBackground(element)) {
          element.style.setProperty("background-color", mobileMenuBackground, "important");
          element.style.setProperty("background", mobileMenuBackground, "important");
        }
      });
    };

    const scheduleStyleUpdate = () => {
      window.requestAnimationFrame(styleMobileMainMenuPanel);
      window.setTimeout(styleMobileMainMenuPanel, 80);
      window.setTimeout(styleMobileMainMenuPanel, 220);
    };

    const rememberMobileMenuToggle = (event: MouseEvent | PointerEvent | TouchEvent) => {
      if (!isMobileViewport()) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const toggle = target.closest<HTMLElement>("button, [role='button']");
      if (!toggle) return;
      if (!getMobileMenuToggleCandidates().includes(toggle)) return;

      lastMobileMenuToggle = toggle;
      scheduleStyleUpdate();
    };

    const handleOutsideMainMenuClick = (event: MouseEvent | PointerEvent | TouchEvent) => {
      if (!isMobileViewport() || closingMainMenuFromOutside) return;

      const panel =
        document.querySelector<HTMLElement>("[data-fincalc-mobile-main-menu='true']") ??
        getMobileMainMenuPanel();
      if (!panel || !isVisible(panel)) return;

      const target = event.target;
      if (!(target instanceof Node)) return;
      if (panel.contains(target)) return;

      const toggles = getMobileMenuToggleCandidates();
      if (toggles.some((toggle) => toggle.contains(target))) return;

      event.preventDefault();
      event.stopPropagation();
      closeMobileMainMenu();
    };

    scheduleStyleUpdate();

    const observer = new MutationObserver(scheduleStyleUpdate);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style", "aria-expanded"] });

    document.addEventListener("pointerdown", rememberMobileMenuToggle, true);
    document.addEventListener("touchstart", rememberMobileMenuToggle, true);
    document.addEventListener("click", rememberMobileMenuToggle, true);
    document.addEventListener("pointerdown", handleOutsideMainMenuClick, true);
    document.addEventListener("touchstart", handleOutsideMainMenuClick, true);
    document.addEventListener("click", handleOutsideMainMenuClick, true);
    document.addEventListener("click", scheduleStyleUpdate, true);
    window.addEventListener("resize", scheduleStyleUpdate);
    window.addEventListener("scroll", scheduleStyleUpdate, true);

    return () => {
      observer.disconnect();
      removeOutsideClickOverlay();
      document.removeEventListener("pointerdown", rememberMobileMenuToggle, true);
      document.removeEventListener("touchstart", rememberMobileMenuToggle, true);
      document.removeEventListener("click", rememberMobileMenuToggle, true);
      document.removeEventListener("pointerdown", handleOutsideMainMenuClick, true);
      document.removeEventListener("touchstart", handleOutsideMainMenuClick, true);
      document.removeEventListener("click", handleOutsideMainMenuClick, true);
      document.removeEventListener("click", scheduleStyleUpdate, true);
      window.removeEventListener("resize", scheduleStyleUpdate);
      window.removeEventListener("scroll", scheduleStyleUpdate, true);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);

    async function loadDefaults() {
      try {
        const res = await fetch("/api/market-data/defaults");
        const json: DefaultsResponse = await res.json();

        const fallbackInflation = json.inflation?.avg10y ?? 4;
        const forecastInflation = getAverageInflationFromForecast(globalYears, fallbackInflation);

        setDefaultsInflationFallback(fallbackInflation);
        setInflationAvg(forecastInflation);
        setCalculatedInflationAvg(forecastInflation);
        setTaxDefaults({
          rentalPrivateBase: json.tax?.rentalPrivateBase ?? 8.5,
          rentalPrivateHigh: json.tax?.rentalPrivateHigh ?? 12.5,
          rentalPrivateThreshold: json.tax?.rentalPrivateThreshold ?? 100000,
          generalRulesBase: json.tax?.generalRulesBase ?? 12,
          generalRulesHigh: json.tax?.generalRulesHigh ?? 32,
          generalRulesThreshold: json.tax?.generalRulesThreshold ?? 120000,
          linear: json.tax?.linear ?? json.tax?.businessDefault ?? 19,
        });
      } catch (error) {
        console.error("Nie udało się pobrać danych domyślnych:", error);
      }
    }

    loadDefaults();
  }, []);


  const results = useMemo(
    () => calculatedInvestments.map((investment) => calculateInvestment(investment, calculatedYears, calculatedInflationAvg, taxDefaults)),
    [calculatedInvestments, calculatedYears, calculatedInflationAvg, taxDefaults]
  );

  const valueTrendData = useMemo(() => {
    const years = Math.min(Math.max(Math.floor(calculatedYears), 1), 40);

    return Array.from({ length: years }, (_, index) => {
      const year = index + 1;
      const row: Record<string, number | string> = { year };

      results.forEach((result) => {
        const yearly = result.yearlyResults.find((item) => item.year === year);
        row[result.name] = yearly?.cumulativeNetProfit ?? 0;
      });

      return row;
    });
  }, [results, calculatedYears]);

  const percentTrendData = useMemo(() => {
    const years = Math.min(Math.max(Math.floor(calculatedYears), 1), 40);

    return Array.from({ length: years }, (_, index) => {
      const year = index + 1;
      const row: Record<string, number | string> = { year };

      results.forEach((result) => {
        const yearly = result.yearlyResults.find((item) => item.year === year);
        row[result.name] = yearly?.cumulativeReturnPercent ?? 0;
      });

      return row;
    });
  }, [results, calculatedYears]);

  const comparisonData = useMemo(
    () =>
      results.map((result) => ({
        name: result.name,
        paybackYear: result.paybackYear ?? 0,
        avgAnnualReturn: result.avgAnnualReturn,
        inflation: result.avgInflation,
        monthBreakEvenPercent: result.monthBreakEvenPercent,
        fixedCostsToRevenuePercent: result.fixedCostsToRevenuePercent,
        fixedCostsToGrossProfitPercent: result.fixedCostsToGrossProfitPercent,
        operatingMarginPercent: result.operatingMarginPercent,
        monthlyNetProfit: result.monthlyNetProfit,
      })),
    [results]
  );

  const updateInvestment = (id: number, key: keyof InvestmentInput, value: string) => {
    setInputValues((prev) => ({ ...prev, [`${id}.${key}`]: value }));

    startTransition(() => {
      setInvestments((prev) =>
        prev.map((investment) => {
          if (investment.id !== id) return investment;

          if (key === "name") return { ...investment, name: value };
          if (key === "type") {
            const nextType = value as InvestmentType;
            return {
              ...investment,
              type: nextType,
              taxMode: nextType === "longTermRental" ? "rentalLumpSum" : "generalRules",
            };
          }
          if (key === "taxMode") return { ...investment, taxMode: value as TaxMode };

          const parsed = parseLocalizedNumber(value);
          return { ...investment, [key]: parsed ?? 0 };
        })
      );
    });
  };

  const handleBlur = (id: number, key: keyof InvestmentInput) => {
    if (key === "name" || key === "type" || key === "taxMode") return;

    const investment = investments.find((item) => item.id === id);
    if (!investment) return;

    const currentValue = investment[key];
    if (typeof currentValue !== "number") return;

    setInputValues((prev) => ({
      ...prev,
      [`${id}.${key}`]: formatLocalizedNumber(currentValue),
    }));
  };

  const addInvestment = (type: InvestmentType) => {
    if (investments.length >= MAX_INVESTMENTS) return;

    const nextId = Math.max(...investments.map((item) => item.id)) + 1;
    const newInvestment = createDefaultInvestment(nextId, type);

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
    setShowAddTypePicker(false);
  };

  const removeInvestment = (id: number) => {
    if (investments.length === 1) return;
    setInvestments((prev) => prev.filter((item) => item.id !== id));
  };

  const handleGlobalYearsChange = (value: string) => {
    setGlobalYearsValue(value);
    const parsed = parseLocalizedNumber(value);
    setGlobalYears(parsed ?? 0);
  };

  const handleGlobalYearsBlur = () => {
    setGlobalYearsValue(formatLocalizedNumber(globalYears));
  };

  const handleCalculate = () => {
    const normalizedYears = Math.min(Math.max(Math.floor(globalYears), 1), 40);
    const forecastInflation = getAverageInflationFromForecast(normalizedYears, defaultsInflationFallback);

    setCalculatedYears(normalizedYears);
    setCalculatedInflationAvg(forecastInflation);
    setInflationAvg(forecastInflation);
    setCalculatedInvestments(
      investments.map((investment) => ({
        ...investment,
      }))
    );
  };

  const handleDownloadPdf = async () => {
    if (!reportRef.current || isExportingPdf) return;

    setIsExportingPdf(true);
    setPdfProgress(1);

    try {
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      setPdfProgress(15);

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 6;
      const availableWidth = pageWidth - margin * 2;
      const availableHeight = pageHeight - margin * 2;
      const sourceWidth = Math.max(reportRef.current.scrollWidth, reportRef.current.offsetWidth);
      const sourceHeight = Math.max(reportRef.current.scrollHeight, reportRef.current.offsetHeight);
      const exportViewportWidth = Math.max(sourceWidth, 1440);

      const canvas = await html2canvas(reportRef.current, {
        scale: 1.5,
        backgroundColor: "#111827",
        useCORS: true,
        windowWidth: exportViewportWidth,
        windowHeight: sourceHeight,
        scrollX: 0,
        scrollY: -window.scrollY,
        ignoreElements: (element) => element.classList?.contains("no-pdf-export") ?? false,
      });
      setPdfProgress(45);

      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      const imgWidth = availableWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let renderedHeight = 0;
      let pageIndex = 0;

      while (renderedHeight < imgHeight) {
        if (pageIndex > 0) pdf.addPage();

        pdf.addImage(imgData, "JPEG", margin, margin - renderedHeight, imgWidth, imgHeight);
        renderedHeight += availableHeight;
        pageIndex += 1;

        const progress = Math.min(95, 45 + Math.round((renderedHeight / imgHeight) * 50));
        setPdfProgress(progress);
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }

      pdf.save("porownanie-inwestycji-fincalc-pro.pdf");
      setPdfProgress(100);
    } catch (error) {
      console.error("Nie udało się wygenerować PDF:", error);
    } finally {
      window.setTimeout(() => {
        setIsExportingPdf(false);
        setPdfProgress(0);
      }, 900);
    }
  };

  const baseInput = (
    investment: InvestmentInput,
    key: keyof InvestmentInput,
    label: string,
    hint: string
  ) => (
    <div className="relative pt-1">
      <div className="absolute right-2 -top-[3px]">
        <InfoHint text={hint} />
      </div>
      <label className="block pr-10 text-sm leading-tight text-yellow-200">{label}</label>
      <input
        type="text"
        inputMode="decimal"
        value={inputValues[`${investment.id}.${key}`] ?? ""}
        onChange={(e) => updateInvestment(investment.id, key, e.target.value)}
        onBlur={() => handleBlur(investment.id, key)}
        className="mt-1 w-full rounded-md border border-yellow-700/25 bg-[#eef1f4] px-3 py-1.5 text-lg font-semibold text-black"
      />
    </div>
  );

  const renderFields = (investment: InvestmentInput) => {
    const percentHint =
      "Wartość możesz wprowadzać jako procent z dwiema cyframi po przecinku, np. 62,50.";

    const commonNameAndValue = (
      <>
        <div className="relative pt-1">
          <label className="block text-sm leading-tight text-yellow-200">Nazwa inwestycji</label>
          <input
            type="text"
            value={inputValues[`${investment.id}.name`] ?? investment.name}
            onChange={(e) => updateInvestment(investment.id, "name", e.target.value)}
            className="mt-1 w-full rounded-md border border-yellow-700/25 bg-[#eef1f4] px-3 py-1.5 text-lg font-semibold text-black"
          />
        </div>

        {baseInput(
          investment,
          "investmentValue",
          "Wartość początkowa inwestycji (zł)",
          "Kapitał początkowy potrzebny do uruchomienia inwestycji."
        )}
      </>
    );

    const taxSelect = (
      <div className="relative pt-1">
        <div className="absolute right-2 -top-[3px]">
          <InfoHint text="Podatek liczony jest w tle na podstawie stawek zapisanych w /api/market-data/defaults." />
        </div>
        <label className="block pr-10 text-sm leading-tight text-yellow-200">Rodzaj opodatkowania</label>
        <select
          value={investment.taxMode}
          onChange={(e) => updateInvestment(investment.id, "taxMode", e.target.value)}
          className="mt-1 w-full rounded-md border border-yellow-700/25 bg-[#eef1f4] px-3 py-1.5 text-lg font-semibold text-black"
        >
          <option value="rentalLumpSum">Ryczałt 8,5% / 12,5%</option>
          <option value="generalRules">Zasady ogólne 12% / 32%</option>
          <option value="linear">Liniowy 19%</option>
        </select>
      </div>
    );

    if (investment.type === "shortTermRental") {
      return (
        <>
          {commonNameAndValue}
          {baseInput(investment, "assetCount", "Ilość mieszkań", "Liczba mieszkań lub lokali objętych analizą.")}
          {baseInput(investment, "dailyPrice", "Średnia cena najmu na dobę", "Średnia cena brutto za jedną dobę najmu.")}
          {baseInput(investment, "workingDaysPerMonth", "Ilość dni aktywnych biznesowo", "Liczba dni w miesiącu, w których lokal jest dostępny i może generować przychód.")}
          {baseInput(investment, "occupancyRate", "Współczynnik wykorzystania m-c (%)", `Procent dostępnego czasu w miesiącu, w którym mieszkanie jest wynajęte. ${percentHint}`)}
          {baseInput(investment, "averageRentalDays", "Średnia ilość dób pojedynczego wynajmu", "Średni czas trwania jednej rezerwacji.")}
          {baseInput(investment, "variableCostPerRental", "Średni koszt obsługi wynajmu", "Koszt sprzątania, serwisu lub obsługi jednej rezerwacji.")}
          {baseInput(investment, "fixedMonthlyCosts", "Koszty stałe miesięczne", "Koszty niezależne od liczby rezerwacji.")}
          {taxSelect}
        </>
      );
    }

    if (investment.type === "longTermRental") {
      return (
        <>
          {commonNameAndValue}
          {baseInput(investment, "assetCount", "Ilość mieszkań", "Liczba mieszkań lub lokali objętych analizą.")}
          {baseInput(investment, "monthlyRevenue", "Przychody miesięczne z najmu", "Miesięczny czynsz lub średni przychód z najmu dla jednego mieszkania. W kalkulacji wynajem długoterminowy jest liczony za pełny miesiąc.")}
          {baseInput(investment, "annualCosts", "Koszty roczne", "Roczne koszty utrzymania, remontów, ubezpieczenia i administracji.")}
          {baseInput(investment, "fixedMonthlyCosts", "Koszty stałe miesięczne", "Stałe koszty miesięczne, jeśli nie są ujęte w kosztach rocznych.")}
          {taxSelect}
        </>
      );
    }

    if (investment.type === "mobileAssetRental") {
      return (
        <>
          {commonNameAndValue}
          {baseInput(investment, "assetCount", "Ilość aktywów ruchomych", "Liczba samochodów, przyczep, łodzi, maszyn lub innych aktywów.")}
          {baseInput(investment, "averagePrice", "Średnia cena wynajmu", "Cena za jedną dobę wynajmu jednego aktywa.")}
          {baseInput(investment, "workingDaysPerMonth", "Ilość dni w miesiącu aktywnych dla biznesu", "Liczba dni w miesiącu, w których aktywa mogą być wynajmowane.")}
          {baseInput(investment, "occupancyRate", "Współczynnik wykorzystania (m-c %)", `Procent dostępnego czasu w miesiącu, w którym aktywa są wynajęte. ${percentHint}`)}
          {baseInput(investment, "averageRentalDays", "Średnia ilość dób pojedynczego wynajmu", "Średni czas trwania jednego wynajmu.")}
          {baseInput(investment, "variableCostPerRental", "Średni koszt obsługi wynajmu", "Serwis, przygotowanie, obsługa lub przekazanie jednego wynajmu.")}
          {baseInput(investment, "fixedMonthlyCosts", "Koszty stałe miesięczne", "Stałe koszty utrzymania aktywów.")}
          {taxSelect}
        </>
      );
    }

    if (investment.type === "equipmentRental") {
      return (
        <>
          {commonNameAndValue}
          {baseInput(investment, "dailyCustomers", "Średnia dzienna ilość urządzeń w wynajmie", "Średnia liczba urządzeń lub sprzętów aktywnie wynajętych danego dnia.")}
          {baseInput(investment, "averagePrice", "Średnia cena pojedynczego wynajmu na dobę", "Cena za jedną dobę wynajmu jednego urządzenia, sprzętu lub narzędzia.")}
          {baseInput(investment, "workingDaysPerMonth", "Ilość dni w miesiącu aktywnych dla biznesu", "Liczba dni w miesiącu, w których biznes prowadzi wynajem.")}
          {baseInput(investment, "averageRentalDays", "Średnia ilość dób pojedynczego wynajmu", "Średni czas trwania jednego wynajmu. Pole służy do oszacowania liczby zakończonych wynajmów i kosztów obsługi sprzętu po wynajmie.")}
          {baseInput(investment, "variableCostPerRental", "Średni koszt obsługi pojedynczego wynajmu", "Serwis, przygotowanie, obsługa lub przekazanie sprzętu po jednym zakończonym wynajmie.")}
          {baseInput(investment, "fixedMonthlyCosts", "Koszty stałe miesięczne", "Stałe koszty miesięczne działalności.")}
          {taxSelect}
        </>
      );
    }

    if (investment.type === "dailyServices") {
      return (
        <>
          {commonNameAndValue}
          {baseInput(investment, "dailyCustomers", "Dzienna ilość usług", "Średnia liczba wykonanych usług dziennie.")}
          {baseInput(investment, "averagePrice", "Średnia cena usługi", "Średnia cena sprzedaży jednej usługi.")}
          {baseInput(investment, "workingDaysPerMonth", "Ilość dni w miesiącu aktywnych dla biznesu", "Ile dni w miesiącu usługa jest sprzedawana.")}
          {baseInput(investment, "variableCostPerUnit", "Średni koszt usługi", "Koszt materiałów, prowizji lub obsługi jednej usługi.")}
          {baseInput(investment, "fixedMonthlyCosts", "Koszty stałe miesięczne", "Stałe koszty miesięczne działalności.")}
          {taxSelect}
        </>
      );
    }

    if (investment.type === "monthlyServices") {
      return (
        <>
          {commonNameAndValue}
          {baseInput(investment, "monthlyCustomers", "Miesięczna ilość usług", "Liczba usług sprzedawanych miesięcznie.")}
          {baseInput(investment, "averagePrice", "Średnia cena usługi", "Średnia cena sprzedaży jednej usługi.")}
          {baseInput(investment, "variableCostPerUnit", "Średni koszt usługi", "Koszt materiałów, prowizji lub obsługi jednej usługi.")}
          {baseInput(investment, "fixedMonthlyCosts", "Koszty stałe miesięczne", "Stałe koszty miesięczne działalności.")}
          {taxSelect}
        </>
      );
    }

    return (
      <>
        {commonNameAndValue}
        {baseInput(investment, "dailyCustomers", "Dzienna ilość klientów", "Średnia liczba klientów dziennie.")}
        {baseInput(investment, "basketValue", "Średnia wartość koszyka", "Średnia wartość jednej transakcji.")}
        {baseInput(investment, "workingDaysPerMonth", "Ilość dni w miesiącu aktywnych dla biznesu", "Ile dni w miesiącu sklep prowadzi sprzedaż.")}
        {baseInput(investment, "marginPercent", "Średnia marża (%)", `Marża brutto na sprzedaży. ${percentHint}`)}
        {baseInput(investment, "fixedMonthlyCosts", "Koszty stałe miesięczne", "Stałe koszty miesięczne działalności.")}
        {taxSelect}
      </>
    );
  };

  const renderMetricRow = (
    label: string,
    hint: string,
    renderValue: (result: InvestmentResult) => string,
    riskType?: "breakEven" | "fixedCost" | "operatingMargin"
  ) => {
    const renderResultCard = (result: InvestmentResult) => {
      const riskValue = riskType === "breakEven"
        ? result.monthBreakEvenPercent
        : riskType === "fixedCost"
          ? result.fixedCostsToGrossProfitPercent
          : riskType === "operatingMargin"
            ? result.operatingMarginPercent
            : null;

      return (
        <KpiValue
          value={renderValue(result)}
          className={
            riskType && riskValue !== null
              ? riskTone(riskValue, riskType)
              : "border-yellow-600/30 bg-[#243424] text-yellow-400"
          }
        />
      );
    };

    if (isMobileView) {
      return (
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2 text-base font-bold text-yellow-300">
            {label}
            <InfoHint text={hint} />
          </div>
          <div className="flex flex-col gap-4">
            {results.map((result) => (
              <div key={`${result.id}-${label}`} className="flex flex-col gap-2">
                <div className="rounded-xl border border-green-500/25 bg-gray-900/30 px-3 py-2 text-sm font-bold text-[#cfe8c9]">
                  {result.name}
                </div>
                {renderResultCard(result)}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="mb-5">
        <div className="mb-2 flex items-center gap-2 text-sm font-bold text-yellow-300">
          {label}
          <InfoHint text={hint} />
        </div>
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${results.length}, minmax(180px, 1fr))` }}
        >
          {results.map((result) => (
            <div key={`${result.id}-${label}`}>{renderResultCard(result)}</div>
          ))}
        </div>
      </div>
    );
  };



  const renderSingleMetricBarChart = (
    title: string,
    dataKey: string,
    barName: string,
    valueType: "amount" | "percent" | "number"
  ) => {
    const isPaybackChart = dataKey === "paybackYear";
    const chartData = isPaybackChart
      ? [...comparisonData].sort((a, b) => {
          const aValue = a.paybackYear || Number.POSITIVE_INFINITY;
          const bValue = b.paybackYear || Number.POSITIVE_INFINITY;
          return aValue - bValue;
        })
      : comparisonData;
    const chartHeight = isPaybackChart
      ? Math.max(300, chartData.length * (isMobileView ? 76 : 62) + 96)
      : 340;
    const chartMargin = isPaybackChart
      ? {
          top: 34,
          right: isMobileView ? 58 : 90,
          left: isMobileView ? 4 : 90,
          bottom: 8,
        }
      : { top: 34, right: 28, left: 0, bottom: 8 };

    return (
      <Card className="rounded-2xl border border-yellow-600/30 bg-[#3c2a20] p-4 md:p-6">
        <CardContent>
          <h3 className="mb-4 text-lg font-semibold text-yellow-300">{title}</h3>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              data={chartData}
              layout={isPaybackChart ? "vertical" : "horizontal"}
              margin={chartMargin}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ffaa00" />
              {isPaybackChart ? (
                <>
                  <XAxis
                    type="number"
                    stroke="#fff"
                    tick={{ fill: "#fff", fontSize: 12 }}
                    domain={[0, "dataMax + 1"]}
                    tickFormatter={(value) => String(Math.round(Number(value)))}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#fff"
                    tick={{ fill: "#fff", fontSize: isMobileView ? 10 : 12 }}
                    width={isMobileView ? 92 : 130}
                    interval={0}
                  />
                </>
              ) : (
                <>
                  <XAxis dataKey="name" stroke="#fff" tick={{ fill: "#fff", fontSize: 12 }} />
                  <YAxis
                    stroke="#fff"
                    tick={{ fill: "#fff", fontSize: 12 }}
                    tickFormatter={(value) =>
                      valueType === "percent"
                        ? `${Number(value).toFixed(0)}%`
                        : valueType === "number"
                          ? String(Math.round(Number(value)))
                          : formatShortCurrency(Number(value))
                    }
                  />
                </>
              )}
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ color: "#fff", fontSize: 12 }} />
              <Bar
                dataKey={dataKey}
                fill="#66ccff"
                name={barName}
                maxBarSize={isPaybackChart && isMobileView ? 34 : 56}
                minPointSize={isPaybackChart ? 4 : 0}
                legendType="circle"
              >
                <LabelList
                content={(props) => (
                <CustomBarLabel
                {...props}
                type={valueType}
                layout={isPaybackChart ? "vertical" : "horizontal"}
                />
                 )}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const renderReturnVsInflationChart = () => (
    <Card className="rounded-2xl border border-yellow-600/30 bg-[#3c2a20] p-6">
      <CardContent>
        <h3 className="mb-4 text-lg font-semibold text-yellow-300">
          Średnia roczna stopa zwrotu vs inflacja
        </h3>
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart data={comparisonData} margin={{ top: 34, right: 28, left: 24, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffaa00" />
            <XAxis dataKey="name" stroke="#fff" tick={{ fill: "#fff", fontSize: 12 }} />
            <YAxis
              stroke="#fff"
              tick={{ fill: "#fff", fontSize: 12 }}
              tickFormatter={(value) => `${Number(value).toFixed(0)}%`}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ color: "#fff", fontSize: 12 }} />
            <Bar
              dataKey="avgAnnualReturn"
              fill="#66ccff"
              name="Średnia roczna stopa zwrotu"
              maxBarSize={56}
              legendType="circle"
            >
              <LabelList content={(props) => <CustomBarLabel {...props} type="percent" />} />
            </Bar>
            <ReferenceLine
              y={calculatedInflationAvg}
              stroke="#ff6b6b"
              strokeWidth={2}
              label={{
                value: `Inflacja ${formatPercent(calculatedInflationAvg)}`,
                position: "left",
                fill: "#ffb4b4",
                fontSize: 12,
                fontWeight: 700,
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white">
      <div ref={reportRef}>
        <div className="pdf-header relative mb-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mb-3 inline-flex items-center rounded-full border border-yellow-600/40 bg-yellow-400/10 px-4 py-1 text-sm font-semibold text-yellow-300">
              Kalkulator premium dla inwestora
            </div>
            <h1 className="text-3xl font-bold text-yellow-400 md:text-4xl">
              Porównanie inwestycji operacyjnych
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-gray-300 leading-relaxed">
              Porównaj do pięciu inwestycji według jednego okresu analizy, zysku netto,
              stopy zwrotu, okresu zwrotu i ryzyka kosztowego.
            </p>
          </motion.div>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className={`no-pdf-export absolute right-0 top-0 hidden min-w-[150px] flex-col items-stretch gap-1 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-md transition md:flex ${
              isExportingPdf ? "bg-gray-600 cursor-wait" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              {isExportingPdf ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <span className="text-xs font-bold">PDF</span>
              )}
              <span>{isExportingPdf ? `Eksport ${pdfProgress}%` : "Eksport PDF"}</span>
            </span>
            {isExportingPdf && (
              <span className="h-1.5 overflow-hidden rounded-full bg-white/25">
                <span
                  className="block h-full rounded-full bg-white transition-all duration-200"
                  style={{ width: `${pdfProgress}%` }}
                />
              </span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_1.95fr]">
          <Card className="rounded-2xl border border-yellow-600/30 bg-[#34241b] p-6 shadow-lg">
            <CardContent>
              <div className="mb-5 rounded-2xl border border-yellow-600/30 bg-gray-900/25 p-4">
                <div className="relative pt-1">
                  <div className="absolute right-2 -top-[3px]">
                    <InfoHint text="Wspólny okres dla wszystkich inwestycji. Dzięki temu wyniki są porównywalne." />
                  </div>
                  <label className="block pr-10 text-sm leading-tight text-yellow-200">
                    Okres inwestycji dla porównania (lata)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={globalYearsValue}
                    onChange={(e) => handleGlobalYearsChange(e.target.value)}
                    onBlur={handleGlobalYearsBlur}
                    className="mt-1 w-full rounded-md border border-yellow-700/25 bg-[#eef1f4] px-3 py-1.5 text-lg font-semibold text-black"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {investments.map((investment, index) => (
                  <div
                    key={investment.id}
                    className="overflow-hidden rounded-2xl border border-yellow-600/30 bg-gray-900/25"
                  >
                    <div className="flex items-center justify-between gap-3 bg-[#243424] px-4 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedPanels((prev) => ({
                            ...prev,
                            [investment.id]: !prev[investment.id],
                          }))
                        }
                        className="flex items-center gap-3 text-left"
                      >
                        <span
                          className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-black"
                          style={{ backgroundColor: chartColors[index] }}
                        >
                          {index + 1}
                        </span>
                        <span>
                          <span className="block text-sm text-gray-300">Inwestycja {index + 1}</span>
                          <span className="block font-bold text-yellow-300">{investment.name}</span>
                          <span className="block text-xs text-gray-300">{typeLabels[investment.type]}</span>
                        </span>
                      </button>

                      <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
                        {investments.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeInvestment(investment.id)}
                            className="hidden rounded-lg border border-red-400/40 px-3 py-1 text-sm font-semibold text-red-200 transition hover:bg-red-400/10 sm:inline-flex"
                          >
                            Usuń
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedPanels((prev) => ({
                              ...prev,
                              [investment.id]: !prev[investment.id],
                            }))
                          }
                          className="rounded-lg bg-gray-600 px-3 py-1 text-sm font-semibold text-white transition hover:bg-gray-500"
                        >
                          {expandedPanels[investment.id] ? "Zwiń" : "Rozwiń"}
                        </button>
                        {investments.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeInvestment(investment.id)}
                            className="rounded-lg border border-red-400/40 px-3 py-1 text-sm font-semibold text-red-200 transition hover:bg-red-400/10 sm:hidden"
                          >
                            Usuń
                          </button>
                        )}
                      </div>
                    </div>

                    {expandedPanels[investment.id] && (
                      <div className="grid grid-cols-1 gap-4 p-4">
                        {renderFields(investment)}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-5">
                {showAddTypePicker && (
                  <div className="mb-4 rounded-2xl border border-yellow-600/30 bg-gray-900/25 p-4">
                    <div className="mb-3 text-sm font-bold text-yellow-300">Wybierz rodzaj inwestycji</div>
                    <div className="grid grid-cols-1 gap-2">
                      {(Object.keys(typeLabels) as InvestmentType[]).map((type) => (
                        <div
                          key={type}
                          className="flex items-center justify-between gap-3 rounded-lg border border-green-400/40 px-4 py-2 text-left font-semibold text-green-100 transition hover:bg-green-400/10"
                        >
                          <button
                            type="button"
                            onClick={() => addInvestment(type)}
                            className="flex-1 text-left"
                          >
                            {typeLabels[type]}
                          </button>
                          <InfoHint text={buildTypeHelpText(type)} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => setShowAddTypePicker((prev) => !prev)}
                  disabled={investments.length >= MAX_INVESTMENTS}
                  className="w-full bg-gray-600 text-white hover:bg-gray-500"
                >
                  + Dodaj inwestycję
                </Button>

                <Button onClick={handleCalculate} className="mt-4 w-full bg-green-600 hover:bg-green-700">
                  Odśwież wyniki
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6">
            <Card className="rounded-2xl border border-yellow-600/30 bg-[#3c2a20] p-6">
              <CardContent>
                <h3 className="mb-4 text-lg font-semibold text-yellow-300">Porównanie wyników inwestycji</h3>

                <div className="overflow-x-auto">
                  <div className="min-w-0 md:min-w-[820px]">
                    {!isMobileView && (
                      <div
                        className="mb-5 grid gap-3"
                        style={{ gridTemplateColumns: `repeat(${results.length}, minmax(180px, 1fr))` }}
                      >
                        {results.map((result) => (
                          <div
                            key={result.id}
                            className="rounded-2xl border border-yellow-600/30 bg-gray-900/40 p-4 font-bold text-yellow-300"
                          >
                            {result.name}
                          </div>
                        ))}
                      </div>
                    )}

                    {renderMetricRow(
                      "Zysk netto na koniec okresu",
                      "Suma zysków netto po podatku w całym okresie analizy.",
                      (result) => formatCurrency(result.finalNetProfit)
                    )}

                    {renderMetricRow(
                      "% Stopa zwrotu z inwestycji na koniec okresu",
                      "Zysk netto z całego okresu podzielony przez wartość inwestycji.",
                      (result) => formatPercent(result.finalReturnPercent)
                    )}

                    {renderMetricRow(
                      "Okres zwrotu (lata)",
                      "Liczba lat potrzebna do odzyskania wartości początkowej inwestycji. Liczona niezależnie od okresu wybranego przez użytkownika.",
                      (result) => (result.paybackYear ? String(result.paybackYear) : "—")
                    )}

                    {renderMetricRow(
                      "Średnia roczna stopa zwrotu / inflacja",
                      "Średnia roczna stopa zwrotu liczona jako łączna stopa zwrotu podzielona przez okres inwestycji, zestawiona ze średnią inflacją z pliku inflation-forecast.json.",
                      (result) => `${formatPercent(result.avgAnnualReturn)} / ${formatPercent(result.avgInflation)}`
                    )}

                    {renderMetricRow(
                      "Zysk netto miesięczny",
                      "Średni miesięczny zysk netto po podatku.",
                      (result) => formatCurrency(result.monthlyNetProfit)
                    )}

                    {renderMetricRow(
                      "% miesiąca, po którym zysk pokrywa koszty stałe",
                      "Koszty stałe podzielone przez dzienny zysk po kosztach zmiennych, a następnie odniesione do liczby dni pracujących w miesiącu.",
                      (result) => formatPercent(result.monthBreakEvenPercent),
                      "breakEven"
                    )}


                    {renderMetricRow(
                      "Marża operacyjna",
                      "Zysk operacyjny przed podatkiem podzielony przez przychody.",
                      (result) => formatPercent(result.operatingMarginPercent),
                      "operatingMargin"
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-yellow-600/30 bg-[#3c2a20] p-6">
              <CardContent>
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <h3 className="text-lg font-semibold text-yellow-300">
                    Wartość inwestycji narastająco
                  </h3>
                  <button
                    type="button"
                    onClick={() => setValueViewMode((prev) => (prev === "chart" ? "table" : "chart"))}
                    className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-500"
                  >
                    {valueViewMode === "chart" ? "Tabela" : "Wykres"}
                  </button>
                </div>

                {valueViewMode === "chart" ? (
                  <ResponsiveContainer width="100%" height={380}>
                    <LineChart data={valueTrendData} margin={{ top: 34, right: 28, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffaa00" />
                      <Tooltip content={<CustomTooltip mode="amount" />} />
                      <XAxis dataKey="year" stroke="#fff" tick={{ fill: "#fff", fontSize: 12 }} />
                      <YAxis
                        stroke="#fff"
                        tick={{ fill: "#fff", fontSize: 12 }}
                        tickFormatter={(value) => formatShortCurrency(Number(value))}
                      />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ color: "#fff", fontSize: 12 }} />
                      {results.map((result, index) => (
                        <Line
                          key={result.id}
                          type="monotone"
                          dataKey={result.name}
                          stroke={chartColors[index]}
                          strokeWidth={2}
                          name={result.name}
                          dot={{ r: 3 }}
                          activeDot={{ r: 6, fill: "#e5e7eb", stroke: "#86efac", strokeWidth: 2 }}
                          legendType="circle"
                        >
                          <LabelList
                            content={(props) => (
                              <CustomLineLabel {...props} dataLength={valueTrendData.length} mode="amount" />
                            )}
                          />
                        </Line>
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] table-fixed border-collapse text-left text-sm text-white">
                      <thead>
                        <tr>
                          <th className="w-[80px] border border-dashed border-[#ffaa00] p-2">Rok</th>
                          {results.map((result) => (
                            <th key={result.id} className="w-[160px] border border-dashed border-[#ffaa00] p-2">
                              {result.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {valueTrendData.map((row) => (
                          <tr key={row.year}>
                            <td className="border border-dashed border-[#ffaa00] p-2">{row.year}</td>
                            {results.map((result) => (
                              <td key={result.id} className="border border-dashed border-[#ffaa00] p-2">
                                {formatCurrency(Number(row[result.name] ?? 0))}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-yellow-600/30 bg-[#3c2a20] p-6">
              <CardContent>
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <h3 className="text-lg font-semibold text-yellow-300">
                    Stopa zwrotu narastająco
                  </h3>
                  <button
                    type="button"
                    onClick={() => setPercentViewMode((prev) => (prev === "chart" ? "table" : "chart"))}
                    className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-500"
                  >
                    {percentViewMode === "chart" ? "Tabela" : "Wykres"}
                  </button>
                </div>

                {percentViewMode === "chart" ? (
                  <ResponsiveContainer width="100%" height={380}>
                    <LineChart data={percentTrendData} margin={{ top: 34, right: 28, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffaa00" />
                      <Tooltip content={<CustomTooltip mode="percent" />} />
                      <XAxis dataKey="year" stroke="#fff" tick={{ fill: "#fff", fontSize: 12 }} />
                      <YAxis
                        stroke="#fff"
                        tick={{ fill: "#fff", fontSize: 12 }}
                        tickFormatter={(value) => `${Number(value).toFixed(0)}%`}
                      />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ color: "#fff", fontSize: 12 }} />
                      {results.map((result, index) => (
                        <Line
                          key={result.id}
                          type="monotone"
                          dataKey={result.name}
                          stroke={chartColors[index]}
                          strokeWidth={2}
                          name={result.name}
                          dot={{ r: 3 }}
                          activeDot={{ r: 6, fill: "#e5e7eb", stroke: "#86efac", strokeWidth: 2 }}
                          legendType="circle"
                        >
                          <LabelList
                            content={(props) => (
                              <CustomLineLabel {...props} dataLength={percentTrendData.length} mode="percent" />
                            )}
                          />
                        </Line>
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] table-fixed border-collapse text-left text-sm text-white">
                      <thead>
                        <tr>
                          <th className="w-[80px] border border-dashed border-[#ffaa00] p-2">Rok</th>
                          {results.map((result) => (
                            <th key={result.id} className="w-[160px] border border-dashed border-[#ffaa00] p-2">
                              {result.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {percentTrendData.map((row) => (
                          <tr key={row.year}>
                            <td className="border border-dashed border-[#ffaa00] p-2">{row.year}</td>
                            {results.map((result) => (
                              <td key={result.id} className="border border-dashed border-[#ffaa00] p-2">
                                {formatPercent(Number(row[result.name] ?? 0))}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {renderSingleMetricBarChart(
              "Porównanie okresu zwrotu",
              "paybackYear",
              "Okres zwrotu",
              "number"
            )}

            {renderReturnVsInflationChart()}

            {renderSingleMetricBarChart(
              "% miesiąca, po którym zysk pokrywa koszty",
              "monthBreakEvenPercent",
              "% miesiąca",
              "percent"
            )}


            {renderSingleMetricBarChart(
              "Zysk netto miesięczny",
              "monthlyNetProfit",
              "Zysk netto miesięczny",
              "amount"
            )}

            {renderSingleMetricBarChart(
              "Marża operacyjna",
              "operatingMarginPercent",
              "Marża operacyjna",
              "percent"
            )}
          </div>
        </div>
      </div>

      <div className="mt-12 flex justify-center">
        <Link
          href="/kalkulatory"
          className="inline-block rounded-xl border border-green-400 px-8 py-3 font-semibold text-green-200 transition hover:bg-green-400/10"
        >
          Wróć do kalkulatorów
        </Link>
      </div>
    </div>
  );
}

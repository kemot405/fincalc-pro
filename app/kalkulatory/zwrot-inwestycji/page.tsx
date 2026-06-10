"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  LabelList,
  Tooltip,
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
  propertyGain: number;
  reinvestedAmount: number;
  reinvestedAmountCumulative: number;
  reinvestmentGainCumulative: number;
  totalGainCumulative: number;
  totalGainReturnPercent: number;
  rentReturnPercent: number;
  cumulativeInflationPercent: number;
};

type KpiData = {
  rentIncomeFinal: string;
  rentIncomeReturn: string;
  totalInvestmentGain: string;
  riskFreeGain: string;
  payback: string;
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
  if (dataLength <= 12) return true;
  if (dataLength <= 24) return index % 2 === 0 || index === dataLength - 1;
  return index % 5 === 0 || index === dataLength - 1;
}

function CustomLineLabel({
  x,
  y,
  value,
  index,
  dataLength,
  type,
  dy = -10,
}: any) {
  if (
    value === null ||
    value === undefined ||
    !shouldShowLabel(index, dataLength)
  ) {
    return null;
  }

  const text =
    type === "currency"
      ? formatShortCurrency(Number(value))
      : formatShortPercent(Number(value));

  return (
    <text
      x={x}
      y={y + dy}
      fill="#f9fafb"
      fontSize={11}
      fontWeight={700}
      textAnchor="middle"
    >
      {text}
    </text>
  );
}

function CustomBarLabel({ x, y, width, value, index, dataLength }: any) {
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
      {formatShortPercent(Number(value))}
    </text>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-xl border border-green-300 bg-gray-200 px-4 py-3 text-sm font-semibold text-black shadow-xl">
      <div className="mb-2 text-base font-bold">Rok {label}</div>

      <div className="flex flex-col gap-1">
        {payload.map((item: any, index: number) => {
          const isCurrency =
            item.dataKey === "cumulativeCashflow" ||
            item.dataKey === "totalGainCumulative";

          return (
            <div key={index} className="flex items-center justify-between gap-4">
              <span>{item.name}</span>
              <span className="font-bold">
                {isCurrency
                  ? formatCurrency(Number(item.value))
                  : formatPercent(Number(item.value))}
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
          Wartość domyślna przyjęta do modelu na podstawie danych NBP / prognozy
          rynkowej zapisanej w bazie strony.
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
  const reportRef = useRef<HTMLDivElement | null>(null);

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
  const [showYearsLimitHint, setShowYearsLimitHint] = useState(false);
  const [firstViewMode, setFirstViewMode] = useState<"chart" | "table">("chart");

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
      hint: "Oprocentowanie lokat depozytowych lub papierów wartościowych wolnych od ryzyka takich jak: obligacje i bony skarbowe",
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
      hint: "Maksymalny okres inwestycji dla wykresów i tabeli wynosi 40 lat.",
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

    if (name === "years") {
      const yearsValue = parsedValue ?? 0;
      setShowYearsLimitHint(yearsValue > 40);
    }
  };

  const handleBlur = (fieldKey: string) => {
    const currentValue = inputs[fieldKey as keyof InvestmentInputs];

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

    pdf.save("wyniki-kalkulatora-fincalc-pro.pdf");
  };

  const calculate = () => {
    if (inputs.years > 40) {
      setShowYearsLimitHint(true);
      setRows([]);
      setKpis(null);
      return;
    }

    setShowYearsLimitHint(false);

    const annualRevenue = inputs.monthlyRevenue * 12;
    const annualCosts = inputs.monthlyCosts * 12;
    const discountRate = inputs.riskFreeRate / 100;
    const taxRate = inputs.taxRate / 100;
    const reinvestedShare = Math.min(
      Math.max(inputs.reinvestedPercent / 100, 0),
      1
    );

    const belkaTaxRate = 0.19;
    const riskFreeNetRate = discountRate * (1 - belkaTaxRate);

    const cashflows: number[] = [-inputs.investmentValue];
    const yearlyRows: YearlyRow[] = [];

    let cumulativeCashflow = 0;
    let cumulativeNpv = -inputs.investmentValue;
    let propertyValue = inputs.investmentValue;
    let reinvestedPortfolioValue = 0;
    let reinvestedPrincipal = 0;
    let reinvestmentGain = 0;

    for (let year = 1; year <= inputs.years; year++) {
      const taxableProfit = annualRevenue - annualCosts;
      const tax = taxableProfit > 0 ? taxableProfit * taxRate : 0;
      const netCashflow = taxableProfit - tax;
      const discountedCashflow = netCashflow / Math.pow(1 + discountRate, year);

      cumulativeCashflow += netCashflow;
      cumulativeNpv += discountedCashflow;
      cashflows.push(netCashflow);

      const forecastGrowth = inputs.propertyGrowthRate;

      propertyValue = propertyValue * (1 + forecastGrowth / 100);

      reinvestedPortfolioValue =
        reinvestedPortfolioValue * (1 + riskFreeNetRate);

      const reinvestedAmount = netCashflow > 0 ? netCashflow * reinvestedShare : 0;

      reinvestedPortfolioValue += reinvestedAmount;
      reinvestedPrincipal += reinvestedAmount;
      reinvestmentGain = reinvestedPortfolioValue - reinvestedPrincipal;

      const propertyGain = propertyValue - inputs.investmentValue;

      const totalInvestmentGain =
        cumulativeCashflow + propertyGain + reinvestmentGain;

      const runningCashflows = cashflows.slice(0, year + 1);

      const runningIrr = calculateIRR(runningCashflows);

      const runningMirr = calculateMIRR(
        runningCashflows,
        discountRate,
        discountRate,
        reinvestedShare
      );

      const avgReturnToDate =
        inputs.investmentValue > 0 &&
        inputs.investmentValue + totalInvestmentGain > 0
          ? (Math.pow(
              (inputs.investmentValue + totalInvestmentGain) /
                inputs.investmentValue,
              1 / year
            ) -
              1) *
            100
          : null;

      const totalGainReturnPercent =
        inputs.investmentValue > 0
          ? (totalInvestmentGain / inputs.investmentValue) * 100
          : 0;

      const rentReturnPercent =
        inputs.investmentValue > 0
          ? (cumulativeCashflow / inputs.investmentValue) * 100
          : 0;

      const cumulativeInflationPercent =
        (Math.pow(1 + inflationAvg / 100, year) - 1) * 100;

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
        avgReturnToDate: Number.isFinite(avgReturnToDate)
          ? avgReturnToDate
          : null,
        avgInflationToDate: inflationAvg,
        propertyValue,
        totalInvestmentValue: inputs.investmentValue + totalInvestmentGain,
        propertyGrowthApplied: forecastGrowth,
        propertyGain,
        reinvestedAmount,
        reinvestedAmountCumulative: reinvestedPrincipal,
        reinvestmentGainCumulative: reinvestmentGain,
        totalGainCumulative: totalInvestmentGain,
        totalGainReturnPercent,
        rentReturnPercent,
        cumulativeInflationPercent,
      });
    }

    let paybackYear: number | string = "—";
    let paybackCumulativeCashflow = 0;
    let paybackPropertyValue = inputs.investmentValue;
    let paybackReinvestedPortfolioValue = 0;
    let paybackReinvestedPrincipal = 0;

    for (let year = 1; year <= 200; year++) {
      const taxableProfit = annualRevenue - annualCosts;
      const tax = taxableProfit > 0 ? taxableProfit * taxRate : 0;
      const netCashflow = taxableProfit - tax;

      paybackCumulativeCashflow += netCashflow;

      paybackPropertyValue =
        paybackPropertyValue * (1 + inputs.propertyGrowthRate / 100);

      paybackReinvestedPortfolioValue =
        paybackReinvestedPortfolioValue * (1 + riskFreeNetRate);

      const reinvestedAmount =
        netCashflow > 0 ? netCashflow * reinvestedShare : 0;

      paybackReinvestedPortfolioValue += reinvestedAmount;
      paybackReinvestedPrincipal += reinvestedAmount;

      const propertyGain = paybackPropertyValue - inputs.investmentValue;

      const paybackReinvestmentGain =
        paybackReinvestedPortfolioValue - paybackReinvestedPrincipal;

      const totalGain =
        paybackCumulativeCashflow + propertyGain + paybackReinvestmentGain;

      if (totalGain >= inputs.investmentValue) {
        paybackYear = year;
        break;
      }
    }

    const finalPropertyGain = propertyValue - inputs.investmentValue;

    const totalInvestmentGain =
      cumulativeCashflow + finalPropertyGain + reinvestmentGain;

    const rentIncomeReturn =
      inputs.investmentValue > 0
        ? (cumulativeCashflow / inputs.investmentValue) * 100
        : 0;

    const riskFreeGain =
      inputs.investmentValue *
      (Math.pow(1 + riskFreeNetRate, inputs.years) - 1);

    const avgAnnualReturn =
      inputs.investmentValue > 0 &&
      inputs.investmentValue + totalInvestmentGain > 0
        ? (Math.pow(
            (inputs.investmentValue + totalInvestmentGain) /
              inputs.investmentValue,
            1 / inputs.years
          ) -
            1) *
          100
        : 0;

    setRows(yearlyRows);
    setFirstViewMode("chart");

    setKpis({
      rentIncomeFinal: formatCurrency(cumulativeCashflow),
      rentIncomeReturn: formatPercent(rentIncomeReturn),
      totalInvestmentGain: formatCurrency(totalInvestmentGain),
      riskFreeGain: formatCurrency(riskFreeGain),
      payback: paybackYear === "—" ? "—" : `${paybackYear} lat`,
      returnVsInflation: `${avgAnnualReturn.toFixed(1)}% / ${inflationAvg.toFixed(
        1
      )}%`,
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
            Policz Twój zysk z inwestycji (wynajem)
            <InfoHint text="To narzędzie służy do analizy inwestycji na podstawie rocznych przepływów pieniężnych, po podatku, zmiany wartości aktywów oraz umożliwia analizę reinwestowanych środków do modelowania ostatecznego wyniku finansowego. Pola zostały zaprojektowane pod analizę zysku z wynajmu długoterminowego, ale kalkultor z powodzeniem można też wykorzystać do innych projektów" />
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
                          ["riskFreeRate", "propertyGrowthRate", "taxRate"].includes(
                            field.key
                          )
                            ? "bg-[#b8c1cc]"
                            : "bg-[#eef1f4]"
                        }`}
                      />

                      {field.key === "years" && showYearsLimitHint && (
                        <div className="absolute left-0 top-full z-40 mt-2 w-full rounded-xl border-2 border-green-300 bg-gray-200 px-4 py-3 text-sm font-bold text-black shadow-xl">
                          Maksymalny okres inwestycji to 40 lat.
                        </div>
                      )}
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
                  label="Zysk z najmu"
                  value={kpis.rentIncomeFinal}
                  hint="Suma dochodów netto z najmu za cały okres inwestycji, po odjęciu kosztów i podatku, bez dyskontowania i bez reinwestycji."
                />

                <KpiBox
                  label="Zysk z najmu / inwestycja"
                  value={kpis.rentIncomeReturn}
                  hint="Suma dochodów netto z najmu odniesiona procentowo do początkowej wartości inwestycji."
                />

                <KpiBox
                  label="Całkowity wynik inwestycji"
                  value={kpis.totalInvestmentGain}
                  hint="Łączny wynik z inwestycji: zysk z najmu, zmiana wartości nieruchomości oraz zysk z reinwestowanych przepływów."
                />

                <KpiBox
                  label="Zysk bez ryzyka"
                  value={kpis.riskFreeGain}
                  hint="Zysk, jaki inwestor mógłby uzyskać, lokując początkową wartość inwestycji po stopie wolnej od ryzyka, po podatku Belki 19%."
                />

                <KpiBox
                  label="Okres zwrotu"
                  value={kpis.payback}
                  hint="Liczba lat, po których suma zysków z najmu, zmiany wartości nieruchomości i reinwestowanych przepływów przewyższa nakłady początkowe."
                />

                <KpiBox
                  label="Stopa zwrotu / inflacja"
                  value={kpis.returnVsInflation}
                  hint="Średnia roczna stopa zwrotu z całej inwestycji zestawiona ze średnioroczną inflacją."
                />
              </div>
            )}

            {rows.length > 0 && (
              <>
                <Card className="bg-[#3c2a20] rounded-2xl p-6 border border-yellow-600/30">
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-yellow-300">
                        Wynik inwestycji w czasie
                      </h3>

                      <button
                        type="button"
                        onClick={() =>
                          setFirstViewMode((prev) =>
                            prev === "chart" ? "table" : "chart"
                          )
                        }
                        className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-500 transition"
                      >
                        {firstViewMode === "chart" ? "Tabela" : "Wykres"}
                      </button>
                    </div>

                    {firstViewMode === "chart" ? (
                      <ResponsiveContainer width="100%" height={320}>
                        <LineChart
                          data={rows}
                          margin={{ top: 34, right: 28, left: 0, bottom: 8 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffaa00" />

                          <Tooltip content={<CustomTooltip />} />

                          <XAxis
                            dataKey="year"
                            stroke="#fff"
                            tick={{ fill: "#fff", fontSize: 12 }}
                          />

                          <YAxis
                            stroke="#fff"
                            tick={{ fill: "#fff", fontSize: 12 }}
                          />

                          <Legend wrapperStyle={{ color: "#fff", fontSize: 12 }} />

                          <Line
                            type="monotone"
                            dataKey="cumulativeCashflow"
                            stroke="#00cc66"
                            strokeWidth={2}
                            name="Najem netto narastająco"
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
                                <CustomLineLabel
                                  {...props}
                                  dataLength={rows.length}
                                  type="currency"
                                  dy={-12}
                                />
                              )}
                            />
                          </Line>

                          <Line
                            type="monotone"
                            dataKey="totalGainCumulative"
                            stroke="#66ccff"
                            strokeWidth={2}
                            name="Suma zysków narastająco"
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
                                <CustomLineLabel
                                  {...props}
                                  dataLength={rows.length}
                                  type="currency"
                                  dy={18}
                                />
                              )}
                            />
                          </Line>
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <>
                        <div className="hidden md:block overflow-x-auto">
                          <table className="w-full min-w-[860px] table-fixed text-left border-collapse text-white text-sm">
                            <thead>
                              <tr>
                                <th className="w-[60px] p-2 border border-dashed border-[#ffaa00] whitespace-normal break-words">
                                  Rok
                                </th>
                                <th className="w-[115px] p-2 border border-dashed border-[#ffaa00] whitespace-normal break-words leading-tight">
                                  Zysk roczny z najmu
                                </th>
                                <th className="w-[115px] p-2 border border-dashed border-[#ffaa00] whitespace-normal break-words leading-tight">
                                  Zysk z najmu narastająco
                                </th>
                                <th className="w-[115px] p-2 border border-dashed border-[#ffaa00] whitespace-normal break-words leading-tight">
                                  Wartość nieruchomości
                                </th>
                                <th className="w-[115px] p-2 border border-dashed border-[#ffaa00] whitespace-normal break-words leading-tight">
                                  Reinwestowana kwota
                                </th>
                                <th className="w-[115px] p-2 border border-dashed border-[#ffaa00] whitespace-normal break-words leading-tight">
                                  Zysk z reinwestycji narastająco
                                </th>
                                <th className="w-[115px] p-2 border border-dashed border-[#ffaa00] whitespace-normal break-words leading-tight">
                                  Suma zysków narastająco
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {rows.map((r) => (
                                <tr key={r.year}>
                                  <td className="w-[60px] p-2 border border-dashed border-[#ffaa00]">
                                    {r.year}
                                  </td>
                                  <td className="w-[115px] p-2 border border-dashed border-[#ffaa00]">
                                    {formatCurrency(r.netCashflow)}
                                  </td>
                                  <td className="w-[115px] p-2 border border-dashed border-[#ffaa00]">
                                    {formatCurrency(r.cumulativeCashflow)}
                                  </td>
                                  <td className="w-[115px] p-2 border border-dashed border-[#ffaa00]">
                                    {formatCurrency(r.propertyValue)}
                                  </td>
                                  <td className="w-[115px] p-2 border border-dashed border-[#ffaa00]">
                                    {formatCurrency(r.reinvestedAmount)}
                                  </td>
                                  <td className="w-[115px] p-2 border border-dashed border-[#ffaa00]">
                                    {formatCurrency(r.reinvestmentGainCumulative)}
                                  </td>
                                  <td className="w-[115px] p-2 border border-dashed border-[#ffaa00]">
                                    {formatCurrency(r.totalGainCumulative)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="md:hidden grid gap-3">
                          {rows.map((r) => (
                            <div
                              key={r.year}
                              className="rounded-xl border border-dashed border-[#ffaa00] bg-gray-900/30 p-4 text-sm"
                            >
                              <div className="mb-3 text-lg font-bold text-yellow-300">
                                Rok {r.year}
                              </div>

                              <div className="grid grid-cols-1 gap-2">
                                <div className="flex justify-between gap-4">
                                  <span className="text-gray-300">
                                    Zysk roczny z najmu
                                  </span>
                                  <span className="font-semibold text-white text-right">
                                    {formatCurrency(r.netCashflow)}
                                  </span>
                                </div>

                                <div className="flex justify-between gap-4">
                                  <span className="text-gray-300">
                                    Zysk z najmu narastająco
                                  </span>
                                  <span className="font-semibold text-white text-right">
                                    {formatCurrency(r.cumulativeCashflow)}
                                  </span>
                                </div>

                                <div className="flex justify-between gap-4">
                                  <span className="text-gray-300">
                                    Wartość nieruchomości
                                  </span>
                                  <span className="font-semibold text-white text-right">
                                    {formatCurrency(r.propertyValue)}
                                  </span>
                                </div>

                                <div className="flex justify-between gap-4">
                                  <span className="text-gray-300">
                                    Reinwestowana kwota
                                  </span>
                                  <span className="font-semibold text-white text-right">
                                    {formatCurrency(r.reinvestedAmount)}
                                  </span>
                                </div>

                                <div className="flex justify-between gap-4">
                                  <span className="text-gray-300">
                                    Zysk z reinwestycji narastająco
                                  </span>
                                  <span className="font-semibold text-white text-right">
                                    {formatCurrency(r.reinvestmentGainCumulative)}
                                  </span>
                                </div>

                                <div className="flex justify-between gap-4 border-t border-yellow-600/30 pt-2">
                                  <span className="text-gray-300">
                                    Suma zysków narastająco
                                  </span>
                                  <span className="font-bold text-yellow-300 text-right">
                                    {formatCurrency(r.totalGainCumulative)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-[#3c2a20] rounded-2xl p-6 border border-yellow-600/30">
                  <CardContent>
                    <h3 className="text-lg font-semibold text-yellow-300 mb-4">
                      Stopa zwrotu narastająco
                    </h3>

                    <ResponsiveContainer width="100%" height={330}>
                      <BarChart
                        data={rows}
                        margin={{ top: 34, right: 20, left: 0, bottom: 8 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffaa00" />

                        <XAxis
                          dataKey="year"
                          stroke="#fff"
                          tick={{ fill: "#fff", fontSize: 12 }}
                        />

                        <YAxis
                          stroke="#fff"
                          tick={{ fill: "#fff", fontSize: 12 }}
                        />

                        <Legend wrapperStyle={{ color: "#fff", fontSize: 12 }} />

                        <Bar
                          dataKey="totalGainReturnPercent"
                          fill="#66ccff"
                          name="Stopa zwrotu z całej inwestycji narastająco"
                        >
                          <LabelList
                            content={(props) => (
                              <CustomBarLabel {...props} dataLength={rows.length} />
                            )}
                          />
                        </Bar>

                        <Bar
                          dataKey="rentReturnPercent"
                          fill="#00cc66"
                          name="Stopa zwrotu z najmu po podatku narastająco"
                        >
                          <LabelList
                            content={(props) => (
                              <CustomBarLabel {...props} dataLength={rows.length} />
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
                      Zysk z inwestycji vs inflacja
                    </h3>

                    <ResponsiveContainer width="100%" height={320}>
                      <LineChart
                        data={rows}
                        margin={{ top: 34, right: 28, left: 0, bottom: 8 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffaa00" />

                        <Tooltip content={<CustomTooltip />} />

                        <XAxis
                          dataKey="year"
                          stroke="#fff"
                          tick={{ fill: "#fff", fontSize: 12 }}
                        />

                        <YAxis
                          stroke="#fff"
                          tick={{ fill: "#fff", fontSize: 12 }}
                        />

                        <Legend wrapperStyle={{ color: "#fff", fontSize: 12 }} />

                        <Line
                          type="monotone"
                          dataKey="totalGainReturnPercent"
                          stroke="#66ccff"
                          strokeWidth={2}
                          name="Zysk z inwestycji narastająco"
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
                              <CustomLineLabel
                                {...props}
                                dataLength={rows.length}
                                type="percent"
                                dy={-12}
                              />
                            )}
                          />
                        </Line>

                        <Line
                          type="monotone"
                          dataKey="cumulativeInflationPercent"
                          stroke="#ff5c5c"
                          strokeWidth={2}
                          name="Inflacja narastająco"
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
                              <CustomLineLabel
                                {...props}
                                dataLength={rows.length}
                                type="percent"
                                dy={18}
                              />
                            )}
                          />
                        </Line>
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-[#3c2a20] rounded-2xl p-6 border border-yellow-600/30">
                  <CardContent>
                    <h3 className="text-lg font-semibold text-yellow-300 mb-4">
                      Zysk z najmu vs inflacja
                    </h3>

                    <ResponsiveContainer width="100%" height={320}>
                      <LineChart
                        data={rows}
                        margin={{ top: 34, right: 28, left: 0, bottom: 8 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffaa00" />

                        <Tooltip content={<CustomTooltip />} />

                        <XAxis
                          dataKey="year"
                          stroke="#fff"
                          tick={{ fill: "#fff", fontSize: 12 }}
                        />

                        <YAxis
                          stroke="#fff"
                          tick={{ fill: "#fff", fontSize: 12 }}
                        />

                        <Legend wrapperStyle={{ color: "#fff", fontSize: 12 }} />

                        <Line
                          type="monotone"
                          dataKey="rentReturnPercent"
                          stroke="#00cc66"
                          strokeWidth={2}
                          name="Zysk z najmu po podatku narastająco"
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
                              <CustomLineLabel
                                {...props}
                                dataLength={rows.length}
                                type="percent"
                                dy={-12}
                              />
                            )}
                          />
                        </Line>

                        <Line
                          type="monotone"
                          dataKey="cumulativeInflationPercent"
                          stroke="#ff5c5c"
                          strokeWidth={2}
                          name="Inflacja narastająco"
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
                              <CustomLineLabel
                                {...props}
                                dataLength={rows.length}
                                type="percent"
                                dy={18}
                              />
                            )}
                          />
                        </Line>
                      </LineChart>
                    </ResponsiveContainer>
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
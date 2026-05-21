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

type DepositInputs = {
  capitalValue: number;
  interestRate: number;
  compoundingFrequency: number;
  years: number;
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

type YearlyRow = {
  year: number;
  grossValue: number;
  netValue: number;
  grossInterestCumulative: number;
  taxCumulative: number;
  netInterestCumulative: number;
  netInterestPercent: number;
  averageMonthlyInterest: number;
  avgAnnualNetReturnToDate: number;
  avgInflationToDate: number;
  cumulativeInflationPercent: number;
  realNetValue: number;
};

type KpiData = {
  netInterestFinal: string;
  netInterestPercent: string;
  monthlyInterest: string;
  returnVsInflation: string;
};

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
            item.dataKey === "netValue" ||
            item.dataKey === "realNetValue" ||
            item.dataKey === "netInterestCumulative" ||
            item.dataKey === "averageMonthlyInterest";

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
  });

  const [inputValues, setInputValues] = useState<Record<string, string>>({
    capitalValue: formatLocalizedNumber(100000),
    interestRate: formatLocalizedNumber(5),
    compoundingFrequency: formatLocalizedNumber(1),
    years: formatLocalizedNumber(10),
  });

  const [inflationAvg, setInflationAvg] = useState<number>(4);
  const [belkaTaxRate, setBelkaTaxRate] = useState<number>(19);
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

        const rate = json.deposit?.defaultRate ?? 5;
        const inflation = json.inflation?.avg10y ?? 4;
        const belka =
          json.tax?.belka ?? json.tax?.capitalGains ?? json.tax?.default ?? 19;

        setInputs((prev) => ({
          ...prev,
          interestRate: rate,
        }));

        setInputValues((prev) => ({
          ...prev,
          interestRate: formatLocalizedNumber(rate),
        }));

        setInflationAvg(inflation);
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
      isDefault: true,
    },
    {
      key: "compoundingFrequency",
      label: "Częstotliwość kapitalizacji w roku",
      hint: "Ile razy w roku odsetki są dopisywane do kapitału. Dla kapitalizacji rocznej wpisz 1, kwartalnej 4, miesięcznej 12.",
      isDefault: false,
    },
    {
      key: "years",
      label: "Okres lokaty / inwestycji (lata)",
      hint: "Maksymalny okres dla wykresów i tabeli wynosi 40 lat.",
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
    const currentValue = inputs[fieldKey as keyof DepositInputs];
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
    if (inputs.years > 40) {
      setShowYearsLimitHint(true);
      setRows([]);
      setKpis(null);
      return;
    }

    setShowYearsLimitHint(false);

    const capital = Math.max(inputs.capitalValue, 0);
    const nominalRate = inputs.interestRate / 100;
    const frequency = Math.max(Math.floor(inputs.compoundingFrequency), 1);
    const years = Math.max(Math.floor(inputs.years), 0);
    const taxRate = Math.max(belkaTaxRate, 0) / 100;

    const yearlyRows: YearlyRow[] = [];
    let netValue = capital;
    let grossValue = capital;
    let grossInterestCumulative = 0;
    let taxCumulative = 0;

    for (let year = 1; year <= years; year++) {
      for (let period = 1; period <= frequency; period++) {
        const grossInterest = netValue * (nominalRate / frequency);
        const tax = grossInterest > 0 ? grossInterest * taxRate : 0;
        const netInterest = grossInterest - tax;

        netValue += netInterest;
        grossInterestCumulative += grossInterest;
        taxCumulative += tax;
      }

      grossValue = capital * Math.pow(1 + nominalRate / frequency, frequency * year);

      const netInterestCumulative = netValue - capital;
      const netInterestPercent = capital > 0 ? (netInterestCumulative / capital) * 100 : 0;
      const averageMonthlyInterest = year > 0 ? netInterestCumulative / (year * 12) : 0;
      const avgAnnualNetReturnToDate =
        capital > 0 && netValue > 0
          ? (Math.pow(netValue / capital, 1 / year) - 1) * 100
          : 0;
      const cumulativeInflationPercent =
        (Math.pow(1 + inflationAvg / 100, year) - 1) * 100;
      const realNetValue = netValue / Math.pow(1 + inflationAvg / 100, year);

      yearlyRows.push({
        year,
        grossValue,
        netValue,
        grossInterestCumulative,
        taxCumulative,
        netInterestCumulative,
        netInterestPercent,
        averageMonthlyInterest,
        avgAnnualNetReturnToDate,
        avgInflationToDate: inflationAvg,
        cumulativeInflationPercent,
        realNetValue,
      });
    }

    const finalRow = yearlyRows[yearlyRows.length - 1];
    const finalNetInterest = finalRow?.netInterestCumulative ?? 0;
    const finalNetInterestPercent = finalRow?.netInterestPercent ?? 0;
    const finalMonthlyInterest = years > 0 ? finalNetInterest / (years * 12) : 0;
    const finalAvgAnnualReturn = finalRow?.avgAnnualNetReturnToDate ?? 0;

    setRows(yearlyRows);
    setFirstViewMode("chart");
    setKpis({
      netInterestFinal: formatCurrency(finalNetInterest),
      netInterestPercent: formatPercent(finalNetInterestPercent),
      monthlyInterest: formatCurrency(finalMonthlyInterest),
      returnVsInflation: `${finalAvgAnnualReturn.toFixed(1)}% / ${inflationAvg.toFixed(1)}%`,
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
            <InfoHint text="Kalkulator pokazuje przyszłą wartość kapitału oraz odsetki po podatku Belki. Uwzględnia częstotliwość kapitalizacji, okres inwestycji oraz porównanie ze średnią inflacją." />
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
                          ["interestRate"].includes(field.key)
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

              <div className="mt-4 rounded-xl border border-yellow-600/30 bg-gray-900/30 px-4 py-3 text-sm text-gray-200 leading-relaxed">
                Podatek Belki: <span className="font-bold text-yellow-300">{formatPercent(belkaTaxRate, 2)}</span>. Wartość jest pobierana z danych strony, aby w razie zmiany stawki nie poprawiać ręcznie każdego kalkulatora.
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                <KpiBox
                  label="Odsetki po okresie lokaty"
                  value={kpis.netInterestFinal}
                  hint="Suma odsetek netto po całym okresie, czyli po odjęciu podatku Belki od naliczonych odsetek."
                />
                <KpiBox
                  label="Odsetki procentowo"
                  value={kpis.netInterestPercent}
                  hint="Odsetki netto odniesione procentowo do kapitału początkowego."
                />
                <KpiBox
                  label="Odsetki na miesiąc"
                  value={kpis.monthlyInterest}
                  hint="Średnia miesięczna wartość odsetek netto w całym okresie inwestycji."
                />
                <KpiBox
                  label="Śr. roczna stopa / inflacja"
                  value={kpis.returnVsInflation}
                  hint="Średnioroczna stopa odsetek netto zestawiona ze średnioroczną inflacją przyjętą w danych strony."
                />
              </div>
            )}

            {rows.length > 0 && (
              <>
                <Card className="bg-[#3c2a20] rounded-2xl p-6 border border-yellow-600/30">
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-yellow-300">
                        Wartość w czasie
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
                            dataKey="netValue"
                            stroke="#00cc66"
                            strokeWidth={2}
                            name="Wartość netto po podatku"
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
                            dataKey="realNetValue"
                            stroke="#66ccff"
                            strokeWidth={2}
                            name="Wartość realna po inflacji"
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
                                <th className="w-[130px] p-2 border border-dashed border-[#ffaa00] whitespace-normal break-words leading-tight">
                                  Wartość netto
                                </th>
                                <th className="w-[130px] p-2 border border-dashed border-[#ffaa00] whitespace-normal break-words leading-tight">
                                  Odsetki netto
                                </th>
                                <th className="w-[130px] p-2 border border-dashed border-[#ffaa00] whitespace-normal break-words leading-tight">
                                  Podatek narastająco
                                </th>
                                <th className="w-[130px] p-2 border border-dashed border-[#ffaa00] whitespace-normal break-words leading-tight">
                                  Odsetki %
                                </th>
                                <th className="w-[130px] p-2 border border-dashed border-[#ffaa00] whitespace-normal break-words leading-tight">
                                  Śr. odsetki miesięczne
                                </th>
                                <th className="w-[130px] p-2 border border-dashed border-[#ffaa00] whitespace-normal break-words leading-tight">
                                  Wartość realna
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {rows.map((r) => (
                                <tr key={r.year}>
                                  <td className="w-[60px] p-2 border border-dashed border-[#ffaa00]">
                                    {r.year}
                                  </td>
                                  <td className="w-[130px] p-2 border border-dashed border-[#ffaa00]">
                                    {formatCurrency(r.netValue)}
                                  </td>
                                  <td className="w-[130px] p-2 border border-dashed border-[#ffaa00]">
                                    {formatCurrency(r.netInterestCumulative)}
                                  </td>
                                  <td className="w-[130px] p-2 border border-dashed border-[#ffaa00]">
                                    {formatCurrency(r.taxCumulative)}
                                  </td>
                                  <td className="w-[130px] p-2 border border-dashed border-[#ffaa00]">
                                    {formatPercent(r.netInterestPercent)}
                                  </td>
                                  <td className="w-[130px] p-2 border border-dashed border-[#ffaa00]">
                                    {formatCurrency(r.averageMonthlyInterest)}
                                  </td>
                                  <td className="w-[130px] p-2 border border-dashed border-[#ffaa00]">
                                    {formatCurrency(r.realNetValue)}
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
                                  <span className="text-gray-300">Wartość netto</span>
                                  <span className="font-semibold text-white text-right">
                                    {formatCurrency(r.netValue)}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-gray-300">Odsetki netto</span>
                                  <span className="font-semibold text-white text-right">
                                    {formatCurrency(r.netInterestCumulative)}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-gray-300">Podatek narastająco</span>
                                  <span className="font-semibold text-white text-right">
                                    {formatCurrency(r.taxCumulative)}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-gray-300">Odsetki %</span>
                                  <span className="font-semibold text-white text-right">
                                    {formatPercent(r.netInterestPercent)}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-4 border-t border-yellow-600/30 pt-2">
                                  <span className="text-gray-300">Wartość realna</span>
                                  <span className="font-bold text-yellow-300 text-right">
                                    {formatCurrency(r.realNetValue)}
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
                      Wartość procentowa w czasie
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
                          dataKey="netInterestPercent"
                          fill="#66ccff"
                          name="Odsetki netto narastająco"
                        >
                          <LabelList
                            content={(props) => (
                              <CustomBarLabel {...props} dataLength={rows.length} />
                            )}
                          />
                        </Bar>
                        <Bar
                          dataKey="cumulativeInflationPercent"
                          fill="#ff5c5c"
                          name="Inflacja narastająco"
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
                      Średnia wartość vs inflacja
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
                          dataKey="avgAnnualNetReturnToDate"
                          stroke="#00cc66"
                          strokeWidth={2}
                          name="Średnia roczna stopa odsetek netto"
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
                          dataKey="avgInflationToDate"
                          stroke="#ff5c5c"
                          strokeWidth={2}
                          name="Średnia roczna inflacja"
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

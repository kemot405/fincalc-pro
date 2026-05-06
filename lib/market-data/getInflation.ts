import inflationData from "../../data/market-data/inflation.json";
import type { MarketSeries } from "../../types/market-data";

const series = inflationData as MarketSeries;

export function getInflationSeries(): MarketSeries {
  return series;
}

export function getLatestInflation(): number | null {
  const last = series.data[series.data.length - 1];
  return last ? last.value : null;
}

export function getAverageInflation(years = 10): number | null {
  if (!series.data.length) return null;

  const sliced = series.data.slice(-years);
  if (!sliced.length) return null;

  const sum = sliced.reduce((acc, item) => acc + item.value, 0);
  return Number((sum / sliced.length).toFixed(2));
}
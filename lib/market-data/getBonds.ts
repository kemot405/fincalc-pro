import bondsData from "../../data/market-data/bonds.json";
import type { MarketSeries } from "../../types/market-data";

const series = bondsData as MarketSeries;

export function getLatestBondYield(): number | null {
  const last = series.data[series.data.length - 1];
  return last ? last.value : null;
}

export function getAverageBondYield(years = 10): number | null {
  if (!series.data.length) return null;

  const sliced = series.data.slice(-years);
  const sum = sliced.reduce((acc, item) => acc + item.value, 0);

  return Number((sum / sliced.length).toFixed(2));
}
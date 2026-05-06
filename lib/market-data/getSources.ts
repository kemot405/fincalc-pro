import sourcesData from "../../data/market-data/sources.json";
import type { DataSource } from "../../types/market-data";

const sources = sourcesData as DataSource[];

export function getSources(): DataSource[] {
  return sources;
}
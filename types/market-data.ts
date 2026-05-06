export type MarketDataPoint = {
  year: number;
  value: number;
};

export type MarketSeries = {
  key: string;
  name: string;
  unit: string;
  data: MarketDataPoint[];
};

export type ForecastPoint = {
  year: number;
  value: number;
};

export type ScenarioKey = "low" | "base" | "high";

export type DataSource = {
  key: string;
  name: string;
  url: string;
  description: string;
  lastUpdated: string;
};

export type ForecastConfig = {
  inflation: Record<ScenarioKey, number>;
  riskFreeRate: Record<ScenarioKey, number>;
  realEstateGrowth: Record<ScenarioKey, number>;
};
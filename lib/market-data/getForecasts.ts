import forecastConfigData from "../../data/market-data/forecast-config.json";
import type { ForecastConfig, ForecastPoint, ScenarioKey } from "../../types/market-data";

const config = forecastConfigData as ForecastConfig;

export function buildFlatForecast(
  startYear: number,
  yearsAhead: number,
  value: number
): ForecastPoint[] {
  return Array.from({ length: yearsAhead }, (_, index) => ({
    year: startYear + index,
    value,
  }));
}

export function getForecastSeries(
  metric: keyof ForecastConfig,
  scenario: ScenarioKey = "base",
  startYear = new Date().getFullYear() + 1,
  yearsAhead = 30
): ForecastPoint[] {
  const value = config[metric][scenario];
  return buildFlatForecast(startYear, yearsAhead, value);
}

export function getForecastConfig(): ForecastConfig {
  return config;
}
import forecastData from "../../data/market-data/real-estate-forecast.json";

type ForecastPoint = {
  year: number;
  value: number;
};

type ForecastSeries = {
  key: string;
  name: string;
  unit: string;
  data: ForecastPoint[];
};

const series = forecastData as ForecastSeries;

export function getRealEstateForecastSeries(): ForecastSeries {
  return series;
}

export function getRealEstateForecastValue(year: number): number | null {
  const point = series.data.find((item) => item.year === year);
  return point ? point.value : null;
}
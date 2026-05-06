import { NextRequest, NextResponse } from "next/server";
import { getForecastSeries } from "../../../../lib/market-data/getForecasts";
import { getRealEstateForecastSeries } from "../../../../lib/market-data/getRealEstateForecast";
import type { ScenarioKey } from "../../../../types/market-data";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const metric = searchParams.get("metric") as
    | "inflation"
    | "riskFreeRate"
    | "realEstateGrowth"
    | null;

  const scenario = (searchParams.get("scenario") || "base") as ScenarioKey;
  const yearsAhead = Number(searchParams.get("yearsAhead") || 30);

  if (!metric) {
    return NextResponse.json(
      { error: "Brak parametru metric" },
      { status: 400 }
    );
  }

  if (metric === "realEstateGrowth") {
    const series = getRealEstateForecastSeries();
    return NextResponse.json({
      metric,
      scenario: "manual",
      data: series.data.slice(0, yearsAhead),
    });
  }

  return NextResponse.json({
    metric,
    scenario,
    data: getForecastSeries(metric, scenario, new Date().getFullYear() + 1, yearsAhead),
  });
}
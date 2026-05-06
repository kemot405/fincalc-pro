import { NextResponse } from "next/server";
import {
  getAverageInflation,
  getLatestInflation,
} from "../../../../lib/market-data/getInflation";
import {
  getAverageBonds10y,
  getLatestBonds10y,
} from "../../../../lib/market-data/getBonds10y";
import {
  getAverageRealEstateGrowth,
  getLatestRealEstateGrowth,
} from "../../../../lib/market-data/getRealEstate";

export async function GET() {
  return NextResponse.json({
    inflation: {
      latest: getLatestInflation(),
      avg10y: getAverageInflation(10),
      avg5y: getAverageInflation(5),
    },
    riskFreeRate: {
      latest: getLatestBonds10y(),
      avg10y: getAverageBonds10y(10),
      avg5y: getAverageBonds10y(5),
    },
    realEstateGrowth: {
      latest: getLatestRealEstateGrowth(),
      avg10y: getAverageRealEstateGrowth(10),
      avg5y: getAverageRealEstateGrowth(5),
    },
    tax: {
      default: 8.5,
    },
  });
}
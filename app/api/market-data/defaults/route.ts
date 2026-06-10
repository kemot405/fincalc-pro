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
      // Podatek Belki
      belka: 19,

      // Najem prywatny / ryczałt
      rentalPrivateBase: 8.5,
      rentalPrivateHigh: 12.5,
      rentalPrivateThreshold: 100000,

      // Zasady ogólne działalności gospodarczej
      generalRulesBase: 12,
      generalRulesHigh: 32,
      generalRulesThreshold: 120000,

      // Podatek liniowy
      linear: 19,

      // Domyślny podatek dla działalności operacyjnej
      businessDefault: 19,

      // Fallback
      default: 8.5,
    },
  });
}
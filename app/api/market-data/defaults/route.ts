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
      belka: 19,

      rentalPrivateBase: 8.5,
      rentalPrivateHigh: 12.5,
      rentalPrivateThreshold: 100000,

      generalRulesBase: 12,
      generalRulesHigh: 32,
      generalRulesThreshold: 120000,

      linear: 19,
      businessDefault: 19,
      default: 8.5,
    },

    riskThresholds: {
      monthBreakEvenPercent: {
        low: {
          max: 60,
          label: "Niskie ryzyko",
          tone: "green",
        },
        medium: {
          minExclusive: 60,
          max: 85,
          label: "Średnie ryzyko",
          tone: "yellow",
        },
        high: {
          minExclusive: 85,
          label: "Wysokie ryzyko",
          tone: "red",
        },
      },

      operatingMarginPercent: {
        good: {
          min: 20,
          label: "Dobrze",
          tone: "green",
        },
        medium: {
          min: 15,
          maxExclusive: 20,
          label: "Średnio",
          tone: "yellow",
        },
        weak: {
          maxExclusive: 15,
          label: "Słabo",
          tone: "red",
        },
      },
    },
  });
}
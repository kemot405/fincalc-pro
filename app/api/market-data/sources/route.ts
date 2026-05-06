import { NextResponse } from "next/server";
import { getSources } from "../../../../lib/market-data/getSources";

export async function GET() {
  return NextResponse.json({
    sources: getSources(),
  });
}
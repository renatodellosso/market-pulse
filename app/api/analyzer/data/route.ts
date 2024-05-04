import { NextRequest, NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

export type Holding = {
    category?: string;
    holdings: { symbol: string; percentage: number }[];
};

export async function POST(req: NextRequest) {
    const body = await req.json();

    if (!Array.isArray(body))
        return NextResponse.json(
            { error: "Body is not an array" },
            { status: 400 }
        );

    const results: {
        [symbol: string]: Holding;
    } = {};

    for (const symbol of body) {
        try {
            const data = await yahooFinance.quoteSummary(symbol, {
                modules: ["assetProfile", "summaryProfile", "topHoldings"],
            });
            results[symbol] = {
                category: data.assetProfile?.category,
                holdings:
                    data.topHoldings?.holdings.map((holding) => ({
                        symbol: holding.symbol,
                        percentage: holding.holdingPercent,
                    })) ?? [],
            };
        } catch (error) {
            results[symbol] = {
                holdings: [],
            };
        }
    }

    return NextResponse.json({ status: 200, results: results });
}

import { NextRequest, NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

export type Holding = {
    sector?: string;
    holdings: { symbol: string; percentage: number; category?: string }[];
};

export async function POST(req: NextRequest) {
    const body = await req.json();

    if (!Array.isArray(body))
        return NextResponse.json(
            { error: "Body is not an array" },
            { status: 400 }
        );

    const individualHoldings: {
        [symbol: string]: Holding;
    } = {};

    for (const symbol of body) {
        try {
            const data = await yahooFinance.quoteSummary(symbol, {
                modules: ["assetProfile", "summaryProfile", "topHoldings"],
            });

            let holdings;
            if (data.topHoldings?.holdings) {
                const holdingsPromises = data.topHoldings.holdings.map(
                    async (holding) => ({
                        symbol: holding.symbol,
                        percentage: holding.holdingPercent,
                        category: await yahooFinance
                            .quoteSummary(holding.symbol, {
                                modules: ["assetProfile"],
                            })
                            .then((data) => data.assetProfile?.sector),
                    })
                );

                holdings = await Promise.all(holdingsPromises);
            }

            individualHoldings[symbol] = {
                sector: data.assetProfile?.category,
                holdings: holdings ?? [],
            };
        } catch (error) {
            individualHoldings[symbol] = {
                holdings: [],
            };
        }
    }

    return NextResponse.json({ status: 200, individualHoldings });
}

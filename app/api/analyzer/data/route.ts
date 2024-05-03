import { NextRequest, NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

export async function POST(req: NextRequest) {
    const body = await req.json();

    if (!Array.isArray(body))
        return NextResponse.json(
            { error: "Body is not an array" },
            { status: 400 }
        );

    const results: { [symbol: string]: {} } = {};

    return NextResponse.json({ status: 200 });
}

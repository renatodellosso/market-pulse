import next, { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getUser, newWatchlist } from "@/lib/db/users";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "next-auth/react";
import { updateName, updateSymbols } from "@/lib/db/watchlists";
import { ObjectId } from "mongodb";

export async function GET(req: NextApiRequest) {
    const session = await getServerSession(authOptions);

    if(!session)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    // Read query params
    const params = new URL(req.url!).searchParams;
    let id: ObjectId | string = params.get("id")!;
    const symbols = JSON.parse(params.get("symbols")!);

    console.log("Updating watchlist symbols: " + symbols);

    id = new ObjectId(id!);
    updateSymbols(id, symbols!);

    return NextResponse.json({ id: id, symbols: symbols });
}
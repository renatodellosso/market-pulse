import { newWatchlist } from "@/lib/db/users";
import { NextApiRequest } from "next";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { getWatchlist } from "@/lib/db/watchlists";

export async function GET(req: NextApiRequest) {
    const session = await getServerSession(authOptions);

    if(!session)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    //Extract the query parameter from the request
    const {searchParams: query} = new URL(req.url!, "http://localhost");
    const queryId = query.get("id");

    const watchlist = await getWatchlist(queryId as string);

    if(!watchlist)
        return NextResponse.json({ error: "Watchlist not found" }, { status: 404 });

    return NextResponse.json(watchlist);
}
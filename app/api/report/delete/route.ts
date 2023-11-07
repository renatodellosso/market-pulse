import next, { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getUser, newWatchlist } from "@/lib/db/users";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "next-auth/react";
import { deleteWatchlist, getWatchlist, updateName, updateSymbols } from "@/lib/db/watchlists";
import { ObjectId } from "mongodb";
import { deleteReport } from "@/lib/db/reports";

export async function GET(req: NextApiRequest) {
    const session = await getServerSession(authOptions);

    if(!session)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    // Read query params
    const params = new URL(req.url!).searchParams;
    let id: ObjectId | string = params.get("id")!;

    const watchlist = await getWatchlist(id);

    // Make sure to verify report exists and user has permissions!
    if(!watchlist)
        return NextResponse.json({ error: "Report not found" }, { status: 404 });
    if(watchlist.ownerEmail != session.user.email)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    console.log("Deleting report", id);

    id = new ObjectId(id!);
    await deleteReport(session.user.email, id as ObjectId);

    return NextResponse.json({ id: id });
}
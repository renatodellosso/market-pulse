import next, { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getUser, getUserByEmail, newReport, newWatchlist } from "@/lib/db/users";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "next-auth/react";
import { ObjectId } from "mongodb";

export async function GET(req: NextApiRequest) {
    const session = await getServerSession(authOptions);

    if(!session)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    console.log("Creating new report...");

    // Find the user, so we can pass the first watchlist id to newReport
    const user = await getUserByEmail(session.user.email!);

    if(!user)
        return NextResponse.json({ error: "Failed to find user" }, { status: 500 });

    let watchlist = user.watchlists.length > 0 ? user.watchlists[0] : null;
 
    // If the user doesn't have any watchlists, create a new one
    if(user.watchlists.length == 0) {
        console.log("Creating new watchlist...");
        watchlist = {
            _id: await newWatchlist(session.user.email!) as ObjectId,
            name: "New Watchlist",
        };
    }

    if(!watchlist)
        return NextResponse.json({ error: "Failed to find or create a watchlist" }, { status: 500 });

    const reportId = await newReport(session.user.email!, watchlist);

    if(!reportId)
        return NextResponse.json({ error: "Failed to create report" }, { status: 500 });

    console.log("New report created");

    return NextResponse.json({ id: reportId });
}
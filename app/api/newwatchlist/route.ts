import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { getUser, newWatchlist } from "@/lib/db/users";
import { NextResponse } from "next/server";
import { getSession } from "next-auth/react";

export async function GET(req: NextApiRequest) {
    const session = await getServerSession(req);

    console.log(session);

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // if(!session)
    //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // console.log("Creating new watchlist...");

    // const watchlistId = await newWatchlist(session.user.id);

    // if(!watchlistId)
    //     return NextResponse.json({ error: "Failed to create watchlist" }, { status: 500 });

    // console.log("New watchlist created");
    // return NextResponse.redirect(`/watchlist/${watchlistId}`);
}
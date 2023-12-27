import next, { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import authOptions from "../../auth/authoptions";
import { getUser, newWatchlist } from "@/lib/db/users";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "next-auth/react";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  console.log("Creating new watchlist...");

  const watchlistId = await newWatchlist(session.user.email!);

  if (!watchlistId)
    return NextResponse.json(
      { error: "Failed to create watchlist" },
      { status: 500 }
    );

  console.log("New watchlist created");

  return NextResponse.json({ id: watchlistId });
}

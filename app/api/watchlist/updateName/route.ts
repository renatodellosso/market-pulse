import next, { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import authOptions from "../../auth/authoptions";
import { getUser, newWatchlist } from "@/lib/db/users";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "next-auth/react";
import { getWatchlist, updateName } from "@/lib/db/watchlists";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Read query params
  const params = new URL(req.url!).searchParams;
  let id: ObjectId | string = params.get("id")!;
  const name = params.get("name");

  console.log("Updating watchlist name: " + name);

  const watchlist = await getWatchlist(id);

  if (!watchlist)
    return NextResponse.json({ error: "Watchlist not found" }, { status: 404 });
  if (watchlist.ownerEmail != session.user.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  id = new ObjectId(id!);

  updateName(session.user.email, id, name!);

  return NextResponse.json({ id: id, name: name });
}

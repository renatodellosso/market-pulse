import { NextApiRequest } from "next";
import { getServerSession } from "next-auth";
import authOptions from "../../auth/authoptions";
import { ObjectId } from "mongodb";
import { getReport, setWatchlist, updateName } from "@/lib/db/reports";
import { NextRequest, NextResponse } from "next/server";
import { getWatchlist } from "@/lib/db/watchlists";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Read query params
  const params = new URL(req.url!).searchParams;
  let id: ObjectId | string = params.get("id")!;
  const watchlistId = params.get("watchlist");

  console.log("Setting report watchlist... Watchlist: " + watchlistId);

  const report = await getReport(id);

  if (!report)
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  if (report.ownerEmail != session.user.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const watchlist = await getWatchlist(watchlistId!);
  if (!watchlist)
    return NextResponse.json({ error: "Watchlist not found" }, { status: 404 });
  if (watchlist.ownerEmail != session.user.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  id = new ObjectId(id!);

  await setWatchlist(id, {
    _id: watchlist._id,
    name: watchlist.name,
  });

  return NextResponse.json({ id: id });
}

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import { newWatchlist } from "@/lib/db/users";
import { getWatchlist, updateName, updateSymbols } from "@/lib/db/watchlists";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Read params
  const params = new URL(req.url!).searchParams;
  const id = params.get("id");

  const original = await getWatchlist(id as string);

  if (!original)
    return NextResponse.json({ error: "Report not found" }, { status: 404 });

  const copy = await newWatchlist(session.user.email!);

  if (!copy)
    return NextResponse.json(
      { error: "Failed to create watchlist" },
      { status: 500 }
    );

  const copyId = ObjectId.createFromHexString(copy.toString());

  const promises = [
    updateName(session.user.email!, copyId, `${original?.name} (Copy)`),
    updateSymbols(copyId, original?.symbols || []),
  ];

  await Promise.all(promises);

  return NextResponse.json({ id: copy });
}

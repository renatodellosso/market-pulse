import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import {
  getFirstWatchlistId,
  newReport,
  updateReportName,
} from "@/lib/db/users";
import { ObjectId } from "mongodb";
import { getReport, setData, setFrequency, updateName } from "@/lib/db/reports";
import { ReportFrequency } from "@/lib/types";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Read params
  const params = new URL(req.url!).searchParams;
  const id = params.get("id");

  const original = await getReport(id as string);
  if (!original)
    return NextResponse.json({ error: "Report not found" }, { status: 404 });

  const watchlistId = await getFirstWatchlistId(session.user.email!);

  if (!watchlistId)
    return NextResponse.json(
      { error: "Failed to create watchlist" },
      { status: 500 }
    );

  const copy = await newReport(session.user.email!, watchlistId);

  if (!copy)
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    );

  const copyId = ObjectId.createFromHexString(copy.toString());

  const promises = [
    updateName(session.user.email!, copyId, `${original?.name} (Copy)`),
    setData(copyId, original?.data || []),
    setFrequency(copyId, original?.frequency || ReportFrequency.DAILY),
  ];

  await Promise.all(promises);

  return NextResponse.json({ id: copy });
}

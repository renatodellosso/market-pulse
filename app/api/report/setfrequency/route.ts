import { NextApiRequest } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { ObjectId } from "mongodb";
import {
  getReport,
  setFrequency,
  setWatchlist,
  updateName,
} from "@/lib/db/reports";
import { NextRequest, NextResponse } from "next/server";
import { getWatchlist } from "@/lib/db/watchlists";
import { ReportFrequency } from "@/lib/types";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Read query params
  const params = new URL(req.url!).searchParams;
  let id: ObjectId | string = params.get("id")!;
  const frequency = params.get("frequency");

  console.log("Setting report frequency... Frequency: " + frequency);

  const report = await getReport(id);

  if (!report)
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  if (report.ownerEmail != session.user.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  id = new ObjectId(id!);

  if (!frequency || !ReportFrequency.frequencies.includes(frequency))
    return NextResponse.json({ error: "Invalid frequency" }, { status: 400 });

  await setFrequency(id, frequency ?? ReportFrequency.DAILY);

  return NextResponse.json({ id: id });
}

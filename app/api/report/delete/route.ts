import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { deleteReport, getReport } from "@/lib/db/reports";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Read query params
  const params = new URL(req.url!).searchParams;
  let id: ObjectId | string = params.get("id")!;

  const report = await getReport(id);

  // Make sure to verify report exists and user has permissions!
  if (!report)
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  if (report.ownerEmail != session.user.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  console.log("Deleting report", id);

  id = new ObjectId(id!);
  await deleteReport(session.user.email, id as ObjectId);

  return NextResponse.json({ id: id });
}
